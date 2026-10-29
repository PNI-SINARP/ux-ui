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
  Briefcase,
  Paperclip,
  UploadCloud,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
  Settings2,
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
import {
  INITIAL_INSTITUCIONES,
  applyCatalogoOverridesToInstituciones,
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
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
import {
  useSolicitudesStore,
  SolicitudAcceso,
  FuenteDetalle,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { INITIAL_PROYECTOS } from "@/modules/proyectos/data/proyectos-store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { InteractiveCard } from "@/components/ui/data-display";
import {
  ViewModeToggle,
  type ViewMode,
} from "@/components/shared/view-mode-toggle";
import {
  useConfiguracionAyudaBN07,
  resolverAyudaParaCampo,
} from "@/modules/acceso-interoperabilidad/data/ayuda-justificacion-store";
import { AyudaPermanenteCampoBN07 } from "@/modules/acceso-interoperabilidad/components/ayuda-permanente-campo-bn07";

export interface AccesoSolicitudNuevaViewProps {
  initialSolicitudId?: string;
  solicitud?: SolicitudAcceso;
  isSubsanacion?: boolean;
  initialStep?: number;
  onCancel?: () => void;
  onReenviar?: (comentario: string, nuevasFuentes: FuenteDetalle[]) => void;
}

export function AccesoSolicitudNuevaView({
  initialSolicitudId,
  solicitud: propSolicitud,
  isSubsanacion = false,
  initialStep,
  onCancel,
  onReenviar,
}: AccesoSolicitudNuevaViewProps = {}) {
  const router = useRouter();
  const {
    solicitudes,
    getSolicitudById,
    crearNuevaSolicitud,
    subsanarYReenviar,
    reenviarSolicitud,
  } = useSolicitudesStore();
  const { config: configAyudaBN07 } = useConfiguracionAyudaBN07();

  const targetSolicitud = useMemo(() => {
    if (propSolicitud) return propSolicitud;
    if (initialSolicitudId) {
      return (
        solicitudes.find((s) => s.id === initialSolicitudId) ||
        getSolicitudById(initialSolicitudId)
      );
    }
    return undefined;
  }, [propSolicitud, initialSolicitudId, solicitudes, getSolicitudById]);

  const esModoSubsanacion =
    isSubsanacion ||
    Boolean(
      targetSolicitud &&
        (targetSolicitud.estado === "Observada" ||
          targetSolicitud.estado === "Requiere corrección" ||
          targetSolicitud.estado === "Rechazada" ||
          targetSolicitud.estado === "Con observaciones")
    );

  const [step, setStep] = useState<number>(() => {
    if (initialStep && initialStep >= 1 && initialStep <= 4) return initialStep;
    return 1;
  });
  const [isModalConfirmacionOpen, setIsModalConfirmacionOpen] = useState(false);
  const [comentarioSubsanacion, setComentarioSubsanacion] = useState(
    "Se subsanaron las observaciones del expediente conforme a los requerimientos de Gestión."
  );

  // Step 1 State - Proyecto, Modalidad, Cupo y Documentos
  const [selectedProyectoId, setSelectedProyectoId] = useState<string>(() => {
    return targetSolicitud?.proyectoId || "PRJ-2026-001";
  });

  const activeProyecto = useMemo(() => {
    return (
      INITIAL_PROYECTOS.find((p) => p.id === selectedProyectoId) ||
      INITIAL_PROYECTOS[0]
    );
  }, [selectedProyectoId]);

  const proyectoOptions = useMemo(() => {
    return INITIAL_PROYECTOS.map((p) => ({
      value: p.id,
      label: `${p.id} - ${p.nombre}`,
    }));
  }, []);
  const [modalidadSolicitada, setModalidadSolicitada] = useState<"API individual" | "API masiva" | "Ambas">(() => {
    if (targetSolicitud?.modalidad) {
      return targetSolicitud.modalidad as "API individual" | "API masiva" | "Ambas";
    }
    return "API individual";
  });
  const [cupoSolicitado, setCupoSolicitado] = useState<number>(() => {
    return targetSolicitud?.cupo || 50000;
  });
  const [documentosAdjuntos, setDocumentosAdjuntos] = useState<
    {
      id: string;
      nombre: string;
      tipo: "PDF" | "ZIP" | "DOCX";
      tamano: string;
      fechaCarga: string;
      categoria: "Oficio Formal" | "Justificación Legal" | "Anexo Técnico" | "Certificado Digital";
      fecha?: string;
    }[]
  >(() => {
    if (targetSolicitud?.documentos && targetSolicitud.documentos.length > 0) {
      return targetSolicitud.documentos.map((d, idx) => ({
        id: d.id || `doc-sub-${idx}`,
        nombre: d.nombre,
        tipo: (d.tipo as "PDF" | "ZIP" | "DOCX") || "PDF",
        tamano: d.tamano || "1.8 MB",
        fechaCarga: d.fechaCarga || "2026-09-24",
        categoria: (d.categoria as any) || "Oficio Formal",
        fecha: d.fechaCarga || "2026-09-24",
      }));
    }
    return [
      {
        id: "doc-1",
        nombre: "Oficio_Solicitud_Interoperabilidad_Firmado.pdf",
        tipo: "PDF",
        tamano: "1.8 MB",
        fechaCarga: "2026-09-24",
        categoria: "Oficio Formal",
        fecha: "2026-09-24",
      },
    ];
  });
  const [nuevoDocInput, setNuevoDocInput] = useState("");

  // Step 2 State - Filtros y Vista de Catálogo (Tabla / Cards)
  const [searchTerm, setSearchTerm] = useState("");
  const [institucionFilter, setInstitucionFilter] = useState("ALL");
  const [clasificacionFilter, setClasificacionFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [expandedInstituciones, setExpandedInstituciones] = useState<Record<string, boolean>>({});
  const [expandedFuentes, setExpandedFuentes] = useState<Record<string, boolean>>({
    "FNT-001": true,
  });
  const [selectedCampos, setSelectedCampos] = useState<Record<string, boolean>>(() => {
    if (targetSolicitud?.fuentes && targetSolicitud.fuentes.length > 0) {
      const map: Record<string, boolean> = {};
      targetSolicitud.fuentes.forEach((f) => {
        f.campos?.forEach((c) => {
          map[c.id] = true;
        });
      });
      if (Object.keys(map).length > 0) return map;
    }
    return {};
  });

  // Step 3 State
  const [justificaciones, setJustificaciones] = useState<Record<string, { finalidad: string; fundamento: string }>>(() => {
    if (targetSolicitud?.fuentes && targetSolicitud.fuentes.length > 0) {
      const map: Record<string, { finalidad: string; fundamento: string }> = {};
      targetSolicitud.fuentes.forEach((f) => {
        f.campos?.forEach((c) => {
          map[c.id] = {
            finalidad: c.finalidad || c.finalidadUso || "",
            fundamento: c.fundamento || c.justificacionConfidencial || "",
          };
        });
      });
      if (Object.keys(map).length > 0) return map;
    }
    return {};
  });
  const [expandedCamposJustificacion, setExpandedCamposJustificacion] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (targetSolicitud) {
      if (targetSolicitud.proyectoId) setSelectedProyectoId(targetSolicitud.proyectoId);
      if (targetSolicitud.modalidad) setModalidadSolicitada(targetSolicitud.modalidad as any);
      if (targetSolicitud.cupo) setCupoSolicitado(targetSolicitud.cupo);
      if (targetSolicitud.documentos && targetSolicitud.documentos.length > 0) {
        setDocumentosAdjuntos(
          targetSolicitud.documentos.map((d, idx) => ({
            id: d.id || `doc-sub-${idx}`,
            nombre: d.nombre,
            tipo: (d.tipo as "PDF" | "ZIP" | "DOCX") || "PDF",
            tamano: d.tamano || "1.8 MB",
            fechaCarga: d.fechaCarga || "2026-09-24",
            categoria: (d.categoria as any) || "Oficio Formal",
            fecha: d.fechaCarga || "2026-09-24",
          }))
        );
      }
      if (targetSolicitud.fuentes && targetSolicitud.fuentes.length > 0) {
        const camposMap: Record<string, boolean> = {};
        const justMap: Record<string, { finalidad: string; fundamento: string }> = {};
        targetSolicitud.fuentes.forEach((f) => {
          f.campos?.forEach((c) => {
            camposMap[c.id] = true;
            justMap[c.id] = {
              finalidad: c.finalidad || c.finalidadUso || "",
              fundamento: c.fundamento || c.justificacionConfidencial || "",
            };
          });
        });
        setSelectedCampos(camposMap);
        setJustificaciones(justMap);
      }
    }
  }, [targetSolicitud?.id]);

  const toggleInstitucion = (id: string) =>
    setExpandedInstituciones((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
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

  const [catalogoInstituciones, setCatalogoInstituciones] = useState(INITIAL_INSTITUCIONES);
  const [fuenteFilter, setFuenteFilter] = useState<string>("ALL");
  const [pendingCambioFuente, setPendingCambioFuente] = useState<{
    fuenteActual: string;
    fuenteNueva: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const loaded = applyCatalogoOverridesToInstituciones(INITIAL_INSTITUCIONES);
    setCatalogoInstituciones(loaded);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qFuente = params.get("fuente");
      if (qFuente) {
        for (const inst of loaded) {
          const found = inst.fuentes.find((f) => f.id === qFuente && f.estado === "PUBLICADO");
          if (found) {
            setInstitucionFilter(inst.id);
            setFuenteFilter(found.id);
            setExpandedInstituciones((prev) => ({ ...prev, [inst.id]: true }));
            setExpandedFuentes({ [found.id]: true });
            break;
          }
        }
      }
    }
  }, []);

  const institucionesPublicadas = useMemo(() => {
    return catalogoInstituciones.map(inst => ({
      ...inst,
      fuentes: inst.fuentes.filter(f => f.estado === "PUBLICADO")
    })).filter(inst => inst.fuentes.length > 0);
  }, [catalogoInstituciones]);

  const institucionOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Todas las instituciones" },
      ...institucionesPublicadas.map(inst => ({
        value: inst.id,
        label: inst.sigla ? `${inst.sigla} - ${inst.nombre}` : inst.nombre
      }))
    ];
  }, [institucionesPublicadas]);

  const fuenteOptions = useMemo(() => {
    const insts =
      institucionFilter === "ALL"
        ? institucionesPublicadas
        : institucionesPublicadas.filter((i) => i.id === institucionFilter);
    return [
      { value: "ALL", label: "Todas las fuentes publicadas" },
      ...insts.flatMap((inst) =>
        inst.fuentes.map((f) => ({
          value: f.id,
          label: `${f.codigoServicio} — ${f.nombre}`,
          instId: inst.id,
        }))
      ),
    ];
  }, [institucionesPublicadas, institucionFilter]);

  const clasificacionOptions = useMemo(() => [
    { value: "ALL", label: "Todas las clasificaciones" },
    { value: "Accesible", label: "Accesible" },
    { value: "Confidencial", label: "Confidencial (Todos)" },
    { value: "Confidencial_Sensible", label: "↳ Confidencial sensible (tratamiento especial LOPDP)" },
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
          .filter(fuente => fuenteFilter === "ALL" || fuente.id === fuenteFilter)
          .map(fuente => {
            const matchingCampos = fuente.campos.filter(campo => {
              if (clasificacionFilter === "Accesible" && campo.clasificacion !== "Accesible") {
                return false;
              }
              if (clasificacionFilter === "Confidencial" && campo.clasificacion !== "Confidencial") {
                return false;
              }
              if (
                clasificacionFilter === "Confidencial_Sensible" &&
                !(campo.clasificacion === "Confidencial" && campo.esSensible)
              ) {
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

  const flattenedFuentes = useMemo(() => {
    const list: {
      fuente: (typeof institucionesPublicadas)[0]["fuentes"][0];
      institucion: (typeof institucionesPublicadas)[0];
      camposAccesibles: number;
      camposConfidenciales: number;
      camposSensibles: number;
    }[] = [];

    filteredInstituciones.forEach((inst) => {
      inst.fuentes.forEach((f) => {
        const accesibles = f.campos.filter((c) => c.clasificacion === "Accesible").length;
        const confidenciales = f.campos.filter((c) => c.clasificacion === "Confidencial").length;
        const sensibles = f.campos.filter(
          (c) => c.clasificacion === "Confidencial" && c.esSensible
        ).length;
        list.push({
          fuente: f,
          institucion: inst,
          camposAccesibles: accesibles,
          camposConfidenciales: confidenciales,
          camposSensibles: sensibles,
        });
      });
    });

    return list;
  }, [filteredInstituciones]);

  // Agrupación obligatoria: Institución proveedora → Fuente de información → Campos disponibles
  const groupedFuentesPorInstitucion = useMemo(() => {
    const map = new Map<
      string,
      {
        institucion: (typeof institucionesPublicadas)[0];
        items: typeof flattenedFuentes;
      }
    >();
    for (const item of flattenedFuentes) {
      const instId = item.institucion.id;
      if (!map.has(instId)) {
        map.set(instId, { institucion: item.institucion, items: [] });
      }
      map.get(instId)!.items.push(item);
    }
    return Array.from(map.values());
  }, [flattenedFuentes]);

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
      id: selectedCamposDetails[0].servicioId,
      instId: selectedCamposDetails[0].fuenteId,
      nombre: selectedCamposDetails[0].fuenteNombre,
      servicioNombre: selectedCamposDetails[0].servicioNombre,
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
      const currentLabel = activeFuente.servicioNombre
        ? `${activeFuente.servicioNombre} (${activeFuente.nombre})`
        : activeFuente.nombre;
      const nextLabel = fuenteNombre || "otra fuente";
      setRestrictionAlert({
        fuenteActual: currentLabel,
        fuenteIntentada: nextLabel,
      });
      setPendingCambioFuente({
        fuenteActual: currentLabel,
        fuenteNueva: nextLabel,
        onConfirm: () => {
          setSelectedCampos({ [campoId]: true });
          setRestrictionAlert(null);
          setPendingCambioFuente(null);
        },
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

  const handleToggleAllFuente = (
    fuente: (typeof institucionesPublicadas)[0]["fuentes"][0],
    institucion: (typeof institucionesPublicadas)[0],
    selectAll: boolean
  ) => {
    const fuenteLabel = `${fuente.nombre} (${institucion.sigla || institucion.nombre})`;
    if (selectAll && activeFuente && activeFuente.id !== fuente.id) {
      const currentLabel = activeFuente.servicioNombre
        ? `${activeFuente.servicioNombre} (${activeFuente.nombre})`
        : activeFuente.nombre;
      setRestrictionAlert({
        fuenteActual: currentLabel,
        fuenteIntentada: fuenteLabel,
      });
      setPendingCambioFuente({
        fuenteActual: currentLabel,
        fuenteNueva: fuenteLabel,
        onConfirm: () => {
          const next: Record<string, boolean> = {};
          fuente.campos.forEach((c) => {
            next[c.id] = true;
          });
          setSelectedCampos(next);
          setRestrictionAlert(null);
          setPendingCambioFuente(null);
        },
      });
      return;
    }

    if (selectAll && restrictionAlert) {
      setRestrictionAlert(null);
    }

    setSelectedCampos((prev) => {
      const next = { ...prev };
      fuente.campos.forEach((c) => {
        if (selectAll) {
          next[c.id] = true;
        } else {
          delete next[c.id];
        }
      });
      return next;
    });
  };

  const selectedCount = Object.values(selectedCampos).filter(Boolean).length;

  const isStep1Valid = Boolean(selectedProyectoId && modalidadSolicitada && cupoSolicitado >= 100 && documentosAdjuntos.length > 0);

  const isStep3Valid = selectedCamposDetails.every(c => {
    const j = justificaciones[c.campo.id];
    if (!j) return false;
    if (!j.finalidad) return false;
    if (c.campo.clasificacion === "Confidencial" && !j.fundamento) return false;
    return true;
  });

  const nextStep = () => setStep(prev => (prev < 4 ? prev + 1 : prev));
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
      description: "Esta solicitud se completa en 4 pasos: Proyecto y modalidad, Selección de información, Justificación de campos y Revisión."
    },
    {
      id: "step2",
      target: "#proyecto-modalidad-step",
      title: "Proyecto y modalidad (Paso 1)",
      description: "Seleccione primero el proyecto institucional activo, la modalidad de consulta, el cupo mensual y adjunte la documentación de respaldo.",
      onBeforeStep: () => setStep(1)
    },
    {
      id: "step3",
      target: "#seleccion-info",
      title: "Selección de información (Paso 2)",
      description: "Explore las instituciones fuente del catálogo y seleccione los campos deseados de una única fuente.",
      onBeforeStep: () => setStep(2)
    },
    {
      id: "step4",
      target: "#justificacion-step",
      title: "Justificación de campos (Paso 3)",
      description: "Cada campo seleccionado debe quedar asociado a una finalidad de uso. Los campos confidenciales requieren justificación jurídica.",
      onBeforeStep: () => setStep(3)
    },
    {
      id: "step5",
      target: "#resumen-step",
      title: "Revisar y enviar (Paso 4)",
      description: "Antes de enviar, verifique el resumen completo de la solicitud.",
      onBeforeStep: () => setStep(4)
    },
    {
      id: "step6",
      target: "#btn-enviar-solicitud",
      title: "Enviar solicitud",
      description: "Al enviar, la solicitud pasa a la Dirección de Gestión DINARP para asignación y revisión.",
      onBeforeStep: () => setStep(4)
    }
  ];

  const handleGuardarBorrador = () => {
    const fuenteNombre = activeFuente
      ? activeFuente.nombre
      : selectedCamposDetails[0]?.fuenteNombre ||
        "Dirección General de Registro Civil, Identificación y Cedulación";
    const servicioNombre =
      selectedCamposDetails[0]?.servicioNombre ||
      "Consulta de Datos de Identidad";

    crearNuevaSolicitud({
      institucion: "Ministerio de Salud Pública",
      tipoInstitucion: "Pública",
      estado: "Borrador",
      proyectoId: activeProyecto.id,
      proyectoNombre: activeProyecto.nombre,
      modalidad: modalidadSolicitada,
      cupo: cupoSolicitado,
      documentos: documentosAdjuntos,
      fuentePrincipal: fuenteNombre,
      servicioPrincipal: servicioNombre,
      camposCount: Math.max(1, selectedCamposDetails.length),
      fuentes: [
        {
          id: activeFuente?.id || "f-regciv",
          nombre: fuenteNombre,
          institucion: fuenteNombre,
          campos:
            selectedCamposDetails.length > 0
              ? selectedCamposDetails.map((c) => ({
                  id: c.campo.id,
                  nombre: c.campo.nombre,
                  descripcion: c.campo.descripcion || "",
                  tipo: c.campo.tipo,
                  clasificacion: (c.campo.clasificacion === "Confidencial"
                    ? "Confidencial"
                    : "Accesible") as "Accesible" | "Confidencial",
                  esSensible: Boolean(c.campo.esSensible),
                  etiquetaSensibilidad: c.campo.esSensible ? "Sensible" : undefined,
                  finalidad:
                    justificaciones[c.campo.id]?.finalidad ||
                    "Borrador pendiente de completar finalidad.",
                  fundamento:
                    justificaciones[c.campo.id]?.fundamento ||
                    "Borrador pendiente de completar justificación jurídica.",
                }))
              : [
                  {
                    id: "c-borrador-1",
                    nombre: "cedula_identidad",
                    descripcion: "Número único de identificación ciudadana",
                    tipo: "Alfanumérico",
                    clasificacion: "Accesible",
                    finalidad: "Borrador en edición.",
                  },
                ],
        },
      ],
    });

    toast.success("Solicitud guardada como borrador (SOL-01)", {
      description:
        "Puede retomar su edición y enviarla a Gestión desde Mis solicitudes.",
    });
    router.push("/acceso-interoperabilidad/solicitudes");
  };

  const stepperSteps: Step[] = [
    { id: "1", title: "Proyecto y modalidad", icon: Briefcase },
    { id: "2", title: "Seleccionar información", icon: Database },
    { id: "3", title: "Justificar campos", icon: FileText },
    { id: "4", title: "Revisar y enviar", icon: Send },
  ];

  return (
    <TooltipProvider>
      <WireframeDashboardLayout
        activeMenu="nueva-solicitud-acceso"
        currentRole="COORDINADOR_SINARP"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Solicitudes de acceso a fuentes", href: "/acceso-interoperabilidad/solicitudes" },
          {
            label: esModoSubsanacion
              ? `Subsanación de solicitud ${targetSolicitud?.id || initialSolicitudId || ""}`
              : "Nueva solicitud de acceso",
          },
        ]}
      >
        <WireframeTour
          isOpen={tourOpen}
          onClose={() => setTourOpen(false)}
          steps={tourSteps}
          currentStep={currentTourStep}
          onStepChange={setCurrentTourStep}
        />

        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Contenedor principal */}
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 w-full"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col items-stretch gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {/* Cabecera Superior */}
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild={!onCancel}
                        variant="ghost"
                        size="icon-sm"
                        onClick={onCancel ? onCancel : undefined}
                        className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        {onCancel ? (
                          <span className="flex items-center justify-center">
                            <ArrowLeft className="size-4" />
                          </span>
                        ) : (
                          <Link
                            href="/acceso-interoperabilidad/solicitudes"
                            aria-label="Volver a Mis solicitudes de acceso"
                          >
                            <ArrowLeft className="size-4" />
                          </Link>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Volver a Mis solicitudes de acceso
                    </TooltipContent>
                  </Tooltip>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                    {esModoSubsanacion
                      ? `Subsanación de solicitud ${targetSolicitud?.id || initialSolicitudId || ""}`
                      : "Nueva solicitud de acceso"}
                  </h1>
                </div>
                {esModoSubsanacion && targetSolicitud && (
                  <div className="flex items-center gap-2">
                    <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-xs">
                      Expediente v{targetSolicitud.versionExpediente || 1} → v{(targetSolicitud.versionExpediente || 1) + 1} (SOL-05)
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground w-full leading-relaxed">
                {esModoSubsanacion
                  ? "Revisa y ajusta los 4 pasos del expediente según las observaciones de la Dirección de Gestión para subsanar y reenviar la solicitud dentro del plazo reglamentario."
                  : "Selecciona un proyecto institucional activo y una fuente publicada del catálogo, define los campos requeridos con su finalidad de uso y justificación jurídica para enviar tu solicitud."}
              </p>
            </div>

            {/* Banner de Observaciones en modo Subsanación */}
            {esModoSubsanacion && targetSolicitud && (
              <div className="p-4 sm:p-5 rounded-2xl border border-warning/40 bg-warning/10 flex flex-col gap-3 w-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground">
                          Observaciones de Gestión ({targetSolicitud.responsable || "Revisor"})
                        </h3>
                        <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-xs">
                          Requiere subsanación (SOL-05)
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium leading-relaxed bg-surface/80 p-3 rounded-xl border border-warning/30">
                        {targetSolicitud.motivoRechazo ||
                          targetSolicitud.observaciones ||
                          "Se requiere ajustar la finalidad de uso o justificación jurídica en campos observados."}
                      </p>
                    </div>
                  </div>
                  {typeof targetSolicitud.diasRestantesSubsanacion === "number" && (
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Badge tone="warning" appearance="outline" size="sm" className="font-mono text-xs">
                        <Clock className="size-3 mr-1" />
                        {targetSolicitud.diasRestantesSubsanacion} días restantes
                      </Badge>
                      {targetSolicitud.fechaLimiteSubsanacion && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Límite: {targetSolicitud.fechaLimiteSubsanacion}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {targetSolicitud.observacionesEstructuradas &&
                  targetSolicitud.observacionesEstructuradas.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-warning/20">
                      {targetSolicitud.observacionesEstructuradas.map((obs, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-surface/60 border border-warning/20 text-xs space-y-0.5"
                        >
                          <span className="font-semibold text-warning block">{obs.tipo}</span>
                          <p className="text-muted-foreground text-[11px]">{obs.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* Contenedor Unificado del Proceso (Stepper + Contenido del Paso + Footer en un solo contenedor sin cortes) */}
            <div className="w-full rounded-2xl border border-border/80 bg-surface shadow-xs flex flex-col">
              {/* Stepper Oficial Integrado en Cabecera del Contenedor */}
              <div id="stepper-container" className="p-4 sm:p-6 bg-muted/15 border-b border-border/80 w-full overflow-x-auto">
                <Stepper
                  steps={stepperSteps}
                  activeStep={step - 1}
                  variant="default"
                  stepPrefix="PASO"
                  showBadge={true}
                  onStepClick={(index) => setStep(index + 1)}
                />
              </div>

              {/* PASO 1: PROYECTO Y MODALIDAD */}
              {step === 1 && (
                <div className="flex flex-col w-full animate-in fade-in duration-200" id="proyecto-modalidad-step">
                  {/* Cabecera Sección I al ras */}
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Briefcase className="size-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300">
                          Sección I — Proyecto Institucional, Modalidad y Documentación Habilitante
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Seleccione el proyecto activo al que se vinculará la solicitud (SOL-01), la modalidad técnica de consumo y adjunte el respaldo legal (SOL-02).
                        </p>
                      </div>
                    </div>
                    <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                      PASO 1 DE 4
                    </Badge>
                  </div>

                  {/* Cuerpo del Paso 1 aprovechando laterales (2 columnas en desktop) */}
                  <div className="p-5 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                    {/* Columna Izquierda (7 cols): Selección de Proyecto, Modalidad, Cupo y Documentación */}
                    <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                      {/* Sub-sección 1.1 */}
                      <div className="space-y-4 w-full">
                        <div className="bg-primary/5 dark:bg-primary-950/20 p-3.5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Briefcase className="size-4 text-primary dark:text-primary-300 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold font-heading text-primary dark:text-primary-300 leading-snug">
                                1.1 Vinculación de Proyecto y Modalidad Técnica
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Asocie el proyecto institucional autorizado y defina la capacidad operativa requerida.
                              </p>
                            </div>
                          </div>
                          <Badge tone="primary" appearance="soft" size="sm" className="shrink-0">
                            SOL-01
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                          <div className="sm:col-span-12 space-y-1.5">
                            <label className="text-caption font-semibold text-foreground flex items-center gap-1.5">
                              <span>Proyecto institucional activo</span>
                              <span className="text-danger">*</span>
                            </label>
                            <Combobox
                              items={proyectoOptions}
                              value={
                                proyectoOptions.find(
                                  (p) => p.value === selectedProyectoId
                                ) || proyectoOptions[0]
                              }
                              onValueChange={(val: any) => {
                                if (val) {
                                  setSelectedProyectoId(
                                    typeof val === "string" ? val : val.value
                                  );
                                }
                              }}
                            >
                              <ComboboxSelectTrigger className="w-full h-10 justify-between text-caption bg-background rounded-xl border-border px-3.5 shadow-none">
                                <span className="truncate">
                                  {(proyectoOptions.find((p) => p.value === selectedProyectoId) || proyectoOptions[0])?.label}
                                </span>
                              </ComboboxSelectTrigger>
                              <ComboboxContent align="start" className="w-[460px] max-w-[90vw]">
                                <ComboboxList>
                                  {proyectoOptions.map((opt) => (
                                    <ComboboxItem
                                      key={opt.value}
                                      value={opt}
                                      className="text-caption"
                                    >
                                      {opt.label}
                                    </ComboboxItem>
                                  ))}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          <div className="sm:col-span-7 space-y-1.5">
                            <label className="text-caption font-semibold text-foreground block">
                              Modalidad de consulta solicitada <span className="text-danger">*</span>
                            </label>
                            <Combobox
                              items={[
                                { value: "API individual", label: "API individual (Tiempo real)" },
                                { value: "API masiva", label: "API masiva (Por lotes)" },
                                { value: "Ambas", label: "Ambas (Individual y Masiva)" },
                              ]}
                              value={{
                                value: modalidadSolicitada,
                                label:
                                  modalidadSolicitada === "API individual"
                                    ? "API individual (Tiempo real)"
                                    : modalidadSolicitada === "API masiva"
                                    ? "API masiva (Por lotes)"
                                    : "Ambas (Individual y Masiva)",
                              }}
                              onValueChange={(val: any) => {
                                if (val) {
                                  const next = typeof val === "string" ? val : val.value;
                                  setModalidadSolicitada(
                                    next as "API individual" | "API masiva" | "Ambas"
                                  );
                                }
                              }}
                            >
                              <ComboboxSelectTrigger className="w-full h-10 justify-between text-caption bg-background rounded-xl border-border px-3.5 shadow-none">
                                <span className="truncate">
                                  {modalidadSolicitada === "API individual"
                                    ? "API individual (Tiempo real)"
                                    : modalidadSolicitada === "API masiva"
                                    ? "API masiva (Por lotes)"
                                    : "Ambas (Individual y Masiva)"}
                                </span>
                              </ComboboxSelectTrigger>
                              <ComboboxContent align="start" className="w-72">
                                <ComboboxList>
                                  {[
                                    { value: "API individual", label: "API individual (Tiempo real)" },
                                    { value: "API masiva", label: "API masiva (Por lotes)" },
                                    { value: "Ambas", label: "Ambas (Individual y Masiva)" },
                                  ].map((opt) => (
                                    <ComboboxItem
                                      key={opt.value}
                                      value={opt}
                                      className="text-caption"
                                    >
                                      {opt.label}
                                    </ComboboxItem>
                                  ))}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          <div className="sm:col-span-5 space-y-1.5">
                            <label className="text-caption font-semibold text-foreground block">
                              Cupo mensual (reg.) <span className="text-danger">*</span>
                            </label>
                            <Input
                              type="number"
                              min={100}
                              value={cupoSolicitado}
                              onChange={(e) =>
                                setCupoSolicitado(Math.max(100, Number(e.target.value) || 0))
                              }
                              className="h-10 bg-background rounded-xl border-border text-caption font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sub-sección 1.2: Documentación habilitante */}
                      <div className="space-y-4 w-full">
                        <div className="bg-primary/5 dark:bg-primary-950/20 p-3.5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Paperclip className="size-4 text-primary dark:text-primary-300 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold font-heading text-primary dark:text-primary-300 leading-snug">
                                1.2 Documentación Habilitante Adjunta
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Oficio formal firmado y anexos jurídicos o técnicos que respaldan la solicitud.
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const fechaHoy = new Date().toISOString().substring(0, 10);
                              const nuevo = {
                                id: `doc-${Date.now()}`,
                                nombre: `Anexo_Soporte_Juridico_${documentosAdjuntos.length + 1}.pdf`,
                                tipo: "PDF" as const,
                                tamano: "1.2 MB",
                                fechaCarga: fechaHoy,
                                categoria: "Justificación Legal" as const,
                                fecha: fechaHoy,
                              };
                              setDocumentosAdjuntos((prev) => [...prev, nuevo]);
                              toast.info("Documento adjuntado al expediente", {
                                description: nuevo.nombre,
                              });
                            }}
                            className="h-8 text-caption gap-1.5 bg-background shrink-0"
                          >
                            <UploadCloud className="size-3.5 text-primary" />
                            <span>Adjuntar documento</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {documentosAdjuntos.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <FileText className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate" title={doc.nombre}>
                                    {doc.nombre}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {doc.categoria} · {doc.tamano}
                                  </p>
                                </div>
                              </div>
                              {documentosAdjuntos.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setDocumentosAdjuntos((prev) =>
                                      prev.filter((d) => d.id !== doc.id)
                                    )
                                  }
                                  aria-label="Eliminar documento"
                                  className="size-7 text-muted-foreground hover:text-danger shrink-0"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Columna Derecha Lateral (5 cols): Ficha Técnica del Proyecto Seleccionado y Resumen Operativo */}
                    <div className="lg:col-span-5 flex flex-col gap-4 w-full">
                      <div className="rounded-2xl border border-border bg-muted/15 p-5 space-y-4 shadow-2xs">
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/70">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                              Ficha del Proyecto Seleccionado
                            </span>
                            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground mt-0.5">
                              {activeProyecto.nombre}
                            </h3>
                          </div>
                          <Badge tone="success" appearance="soft" size="sm" className="font-semibold shrink-0">
                            Activo (v{activeProyecto.version})
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold text-muted-foreground block">
                            Propósito y alcance institucional:
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed bg-background p-3 rounded-xl border border-border/60">
                            {activeProyecto.proposito}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-background border border-border/60">
                            <span className="text-[11px] text-muted-foreground block">Código de proyecto</span>
                            <strong className="font-mono text-xs text-foreground mt-0.5 block">
                              {activeProyecto.id}
                            </strong>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border/60">
                            <span className="text-[11px] text-muted-foreground block">Fecha de registro</span>
                            <strong className="text-xs text-foreground mt-0.5 block">
                              {activeProyecto.fechaCreacion}
                            </strong>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border/60">
                            <span className="text-[11px] text-muted-foreground block">Responsable</span>
                            <strong className="text-xs text-foreground mt-0.5 block truncate" title={activeProyecto.creadoPor}>
                              {activeProyecto.creadoPor}
                            </strong>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border/60">
                            <span className="text-[11px] text-muted-foreground block">Solicitudes vinculadas</span>
                            <strong className="text-xs text-primary mt-0.5 block">
                              {activeProyecto.solicitudes.length} solicitud(es)
                            </strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Capacidad configurada:</span>
                          <div className="flex items-center gap-2">
                            <Badge tone="info" appearance="soft" size="sm">
                              {modalidadSolicitada}
                            </Badge>
                            <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
                              {cupoSolicitado.toLocaleString()} reg./mes
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Unificado del Paso 1 */}
                  <div className="p-4 sm:p-6 bg-muted/20 border-t border-border flex flex-wrap justify-between items-center gap-3 w-full rounded-b-2xl">
                    <Button asChild variant="neutral" size="default" className="gap-2 text-xs font-semibold">
                      <Link href="/acceso-interoperabilidad/solicitudes">
                        <ArrowLeft className="size-4" />
                        <span>Cancelar</span>
                      </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        variant="secondary"
                        size="default"
                        onClick={handleGuardarBorrador}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <FileText className="size-4" />
                        <span>Guardar como borrador</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="default"
                        onClick={nextStep}
                        disabled={!isStep1Valid}
                        className="gap-2 text-xs font-semibold"
                      >
                        <span>Siguiente: Seleccionar información</span>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: SELECCIONAR INFORMACIÓN */}
              {step === 2 && (
                <div className="flex flex-col w-full">
                  {/* Cabecera de Sección II */}
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                        <Database className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-heading text-base font-bold text-primary leading-snug">
                            Sección II — Selección de Fuente e Información del Catálogo
                          </h2>
                          <Badge tone="primary" appearance="soft" size="sm" className="text-[10px] font-semibold">
                            Fuente única por solicitud
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Seleccione los campos requeridos de una fuente del catálogo nacional de interoperabilidad.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge tone={selectedCount > 0 ? "primary" : "neutral"} appearance="soft" size="sm" className="font-semibold px-2.5 py-1">
                        {selectedCount} {selectedCount === 1 ? "campo seleccionado" : "campos seleccionados"}
                      </Badge>
                    </div>
                  </div>

                  {/* Cuerpo del Paso 2 */}
                  <div className="p-4 sm:p-6 flex flex-col gap-5 w-full">
                    {/* Resumen compacto del Paso 1 + Selección actual (Proyecto → Institución → Fuente → Campos) */}
                    <div className="p-3.5 rounded-xl bg-muted/20 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge tone="neutral" appearance="soft" size="sm" className="gap-1.5 font-semibold">
                          <Briefcase className="size-3 text-primary" />
                          <span>{activeProyecto.id} — {activeProyecto.nombre}</span>
                        </Badge>
                        {activeFuente ? (
                          <>
                            <Badge tone="primary" appearance="soft" size="sm" className="gap-1.5 font-semibold">
                              <Building2 className="size-3 text-primary" />
                              <span>{activeFuente.nombre}</span>
                            </Badge>
                            <Badge tone="info" appearance="soft" size="sm" className="gap-1.5 font-semibold">
                              <Database className="size-3 text-primary" />
                              <span>{activeFuente.servicioNombre}</span>
                            </Badge>
                            <Badge tone="success" appearance="soft" size="sm" className="font-semibold">
                              {selectedCount} {selectedCount === 1 ? "campo seleccionado" : "campos seleccionados"}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Badge tone="info" appearance="soft" size="sm">
                              {modalidadSolicitada}
                            </Badge>
                            <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
                              Cupo: {cupoSolicitado.toLocaleString()} reg./mes
                            </Badge>
                          </>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(1)}
                        className="h-7 px-2.5 text-caption text-primary hover:text-primary shrink-0 self-start sm:self-center"
                      >
                        Editar proyecto y modalidad
                      </Button>
                    </div>

                    {/* Barra de herramientas y Filtros (Catálogo de Fuentes: Tabla / Cards) */}
                    <div className="pb-4 border-b border-border w-full" id="datos-documentos">
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3.5 w-full">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 flex-1 items-end">
                            <div className="sm:col-span-12 lg:col-span-3 space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">
                                Búsqueda general
                              </label>
                              <SearchInput
                                placeholder="Buscar por institución, fuente o campo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClear={() => setSearchTerm("")}
                                className="w-full h-10 bg-background rounded-xl border-border/80"
                              />
                            </div>

                            <div className="sm:col-span-6 lg:col-span-3 space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">
                                Institución proveedora
                              </label>
                              <Combobox
                                items={institucionOptions}
                                value={
                                  institucionOptions.find((opt) => opt.value === institucionFilter) ||
                                  institucionOptions[0]
                                }
                                onValueChange={(val: any) => {
                                  if (val) {
                                    const selected = typeof val === "string" ? val : val.value;
                                    if (
                                      selected !== "ALL" &&
                                      activeFuente &&
                                      activeFuente.instId !== selected &&
                                      selectedCount > 0
                                    ) {
                                      const targetInst = institucionesPublicadas.find((i) => i.id === selected);
                                      setPendingCambioFuente({
                                        fuenteActual: `${activeFuente.servicioNombre} (${activeFuente.nombre})`,
                                        fuenteNueva: targetInst?.nombre || "otra institución",
                                        onConfirm: () => {
                                          setSelectedCampos({});
                                          setRestrictionAlert(null);
                                          setInstitucionFilter(selected);
                                          setFuenteFilter("ALL");
                                          setPendingCambioFuente(null);
                                        },
                                      });
                                      return;
                                    }
                                    setInstitucionFilter(selected);
                                    setFuenteFilter("ALL");
                                  }
                                }}
                              >
                                <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 shadow-none">
                                  <span className="truncate">
                                    {institucionOptions.find((opt) => opt.value === institucionFilter)?.label ||
                                      "Todas las instituciones"}
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
                              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">
                                Fuente de información
                              </label>
                              <Combobox
                                items={fuenteOptions}
                                value={
                                  fuenteOptions.find((opt) => opt.value === fuenteFilter) ||
                                  fuenteOptions[0]
                                }
                                onValueChange={(val: any) => {
                                  if (val) {
                                    const selected = typeof val === "string" ? val : val.value;
                                    if (
                                      selected !== "ALL" &&
                                      activeFuente &&
                                      activeFuente.id !== selected &&
                                      selectedCount > 0
                                    ) {
                                      const targetOpt = fuenteOptions.find((o) => o.value === selected);
                                      setPendingCambioFuente({
                                        fuenteActual: `${activeFuente.servicioNombre} (${activeFuente.nombre})`,
                                        fuenteNueva: targetOpt?.label || "otra fuente",
                                        onConfirm: () => {
                                          setSelectedCampos({});
                                          setRestrictionAlert(null);
                                          setFuenteFilter(selected);
                                          setExpandedFuentes((prev) => ({ ...prev, [selected]: true }));
                                          setPendingCambioFuente(null);
                                        },
                                      });
                                      return;
                                    }
                                    setFuenteFilter(selected);
                                    if (selected !== "ALL") {
                                      setExpandedFuentes((prev) => ({ ...prev, [selected]: true }));
                                    }
                                  }
                                }}
                              >
                                <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 shadow-none">
                                  <span className="truncate">
                                    {fuenteOptions.find((opt) => opt.value === fuenteFilter)?.label ||
                                      "Todas las fuentes publicadas"}
                                  </span>
                                </ComboboxSelectTrigger>
                                <ComboboxContent align="start" className="w-80 max-w-[90vw]">
                                  <ComboboxList>
                                    {fuenteOptions.map((opt) => (
                                      <ComboboxItem key={opt.value} value={opt} className="text-xs">
                                        {opt.label}
                                      </ComboboxItem>
                                    ))}
                                  </ComboboxList>
                                </ComboboxContent>
                              </Combobox>
                            </div>

                            <div className="sm:col-span-6 lg:col-span-3 space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">
                                Clasificación del campo
                              </label>
                              <Combobox
                                items={clasificacionOptions}
                                value={
                                  clasificacionOptions.find((opt) => opt.value === clasificacionFilter) ||
                                  clasificacionOptions[0]
                                }
                                onValueChange={(val: any) => {
                                  if (val) {
                                    const selected = typeof val === "string" ? val : val.value;
                                    setClasificacionFilter(selected);
                                  }
                                }}
                              >
                                <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 shadow-none">
                                  <span className="truncate">
                                    {clasificacionOptions.find((opt) => opt.value === clasificacionFilter)?.label ||
                                      "Todas las clasificaciones"}
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

                          <div className="flex items-center justify-end gap-2 shrink-0">
                            {(searchTerm || institucionFilter !== "ALL" || clasificacionFilter !== "ALL") && (
                              <Button
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm("");
                                  setInstitucionFilter("ALL");
                                  setClasificacionFilter("ALL");
                                }}
                                className="h-10 px-3 text-xs gap-1.5"
                              >
                                <RotateCcw className="size-3.5" />
                                <span>Restablecer</span>
                              </Button>
                            )}
                            <ViewModeToggle value={viewMode} onChange={setViewMode} />
                          </div>
                        </div>

                        {/* Píldoras de Filtros Activos */}
                        {(searchTerm || institucionFilter !== "ALL" || clasificacionFilter !== "ALL") && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 w-full">
                            <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                              Filtros aplicados:
                            </span>

                            {searchTerm && (
                              <Badge
                                tone="neutral"
                                appearance="soft"
                                size="sm"
                                className="gap-1.5 text-[11px]"
                              >
                                <span>
                                  Búsqueda: <strong className="font-semibold text-foreground">&ldquo;{searchTerm}&rdquo;</strong>
                                </span>
                                <Button
                                  variant="ghost"
                                  type="button"
                                  onClick={() => setSearchTerm("")}
                                  className="h-auto p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                                  aria-label="Eliminar filtro de búsqueda"
                                >
                                  <X className="size-3" />
                                </Button>
                              </Badge>
                            )}

                            {institucionFilter !== "ALL" && (
                              <Badge
                                tone="primary"
                                appearance="soft"
                                size="sm"
                                className="gap-1.5 text-[11px]"
                              >
                                <span className="flex items-center gap-1">
                                  <Building2 className="size-3" />
                                  {institucionOptions.find((i) => i.value === institucionFilter)?.label || institucionFilter}
                                </span>
                                <Button
                                  variant="ghost"
                                  type="button"
                                  onClick={() => setInstitucionFilter("ALL")}
                                  className="h-auto p-0.5 rounded-full hover:bg-foreground/10"
                                  aria-label="Eliminar filtro de institución"
                                >
                                  <X className="size-3" />
                                </Button>
                              </Badge>
                            )}

                            {clasificacionFilter !== "ALL" && (
                              <Badge
                                tone={clasificacionFilter === "Accesible" ? "success" : "warning"}
                                appearance="soft"
                                size="sm"
                                className="gap-1.5 text-[11px]"
                              >
                                <span className="flex items-center gap-1">
                                  {clasificacionFilter === "Accesible" ? (
                                    <Unlock className="size-3" />
                                  ) : (
                                    <Lock className="size-3" />
                                  )}
                                  {clasificacionFilter}
                                </span>
                                <Button
                                  variant="ghost"
                                  type="button"
                                  onClick={() => setClasificacionFilter("ALL")}
                                  className="h-auto p-0.5 rounded-full hover:bg-foreground/10"
                                  aria-label="Eliminar filtro de clasificación"
                                >
                                  <X className="size-3" />
                                </Button>
                              </Badge>
                            )}
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
                        <div className="text-xs sm:text-sm text-foreground leading-relaxed flex flex-wrap items-center justify-between gap-2">
                          <div>
                            Para esta solicitud solo puedes seleccionar campos pertenecientes a una misma fuente.
                            {activeFuente && (
                              <span className="text-muted-foreground ml-1.5">
                                (Fuente activa:{" "}
                                <strong className="text-foreground font-semibold">
                                  &ldquo;{activeFuente.servicioNombre || activeFuente.nombre}&rdquo;
                                </strong>{" "}
                                — {activeFuente.nombre})
                              </span>
                            )}
                          </div>
                          {activeFuente && (
                            <Button
                              type="button"
                              variant="neutral"
                              size="sm"
                              onClick={() => {
                                setPendingCambioFuente({
                                  fuenteActual: `${activeFuente.servicioNombre || activeFuente.nombre} (${activeFuente.nombre})`,
                                  fuenteNueva: "una nueva fuente del catálogo",
                                  onConfirm: () => {
                                    setSelectedCampos({});
                                    setRestrictionAlert(null);
                                    setFuenteFilter("ALL");
                                    setPendingCambioFuente(null);
                                  },
                                });
                              }}
                              className="h-7 px-2.5 text-[11px] gap-1"
                            >
                              <RotateCcw className="size-3" />
                              <span>Cambiar de fuente</span>
                            </Button>
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
                            Actualmente tu solicitud contiene campos de{" "}
                            <strong className="font-semibold text-foreground">
                              &ldquo;{restrictionAlert.fuenteActual}&rdquo;
                            </strong>
                            . Para consultar campos de{" "}
                            <strong className="font-semibold text-foreground">
                              &ldquo;{restrictionAlert.fuenteIntentada}&rdquo;
                            </strong>
                            , debes tramitarlos en una solicitud independiente o reiniciar tu selección.
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <Button
                              type="button"
                              variant="neutral"
                              size="sm"
                              onClick={() => {
                                setSelectedCampos({});
                                setRestrictionAlert(null);
                                toast.info("Selección reiniciada", {
                                  description: "Ahora puede seleccionar campos de cualquier otra fuente.",
                                });
                              }}
                              className="text-xs h-7 px-2.5 gap-1.5"
                            >
                              <RotateCcw className="size-3" />
                              <span>Cambiar de fuente (limpiar selección actual)</span>
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    )}

                    {/* Catálogo de Fuentes (Tabla o Cards igual a Catálogo de Fuentes) */}
                    <div className="w-full" id="seleccion-info">
                      {flattenedFuentes.length === 0 ? (
                        <div className="p-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl bg-muted/15">
                          No se encontraron fuentes o campos con los filtros aplicados.
                        </div>
                      ) : (
                        <div className="space-y-4 w-full">
                          {/* 1. VISTA TABULAR CON FILA EXPANDIBLE */}
                          <div
                            className={cn(
                              "w-full",
                              viewMode === "table" ? "hidden md:block" : "hidden"
                            )}
                          >
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="w-12 text-center"></TableHead>
                                  <TableHead>Fuente de Información</TableHead>
                                  <TableHead>Institución Proveedora</TableHead>
                                  <TableHead>Base Legal y Vigencia</TableHead>
                                  <TableHead>Campos y Requisitos</TableHead>
                                  <TableHead className="text-center">Selección</TableHead>
                                  <TableHead className="w-20 text-center">Acciones</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {groupedFuentesPorInstitucion.map(
                                  ({ institucion: groupInst, items: groupItems }) => {
                                    const isInstExpanded =
                                      expandedInstituciones[groupInst.id] ?? true;
                                    const totalInstCampos = groupItems.reduce(
                                      (acc, it) => acc + it.fuente.campos.length,
                                      0
                                    );
                                    return (
                                      <React.Fragment key={`bn07-inst-group-${groupInst.id}`}>
                                        <TableRow
                                          onClick={() => toggleInstitucion(groupInst.id)}
                                          className="cursor-pointer bg-muted/40 hover:bg-muted/65 border-y border-border transition-colors"
                                        >
                                          <TableCell
                                            className="text-center py-2.5"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon-sm"
                                              onClick={() => toggleInstitucion(groupInst.id)}
                                              aria-expanded={isInstExpanded}
                                              className="size-7 rounded-lg text-primary hover:bg-primary/15"
                                            >
                                              <ChevronRight
                                                className={cn(
                                                  "size-4 transition-transform duration-200",
                                                  isInstExpanded && "rotate-90"
                                                )}
                                              />
                                            </Button>
                                          </TableCell>
                                          <TableCell colSpan={6} className="py-2.5">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                              <div className="flex items-center gap-2.5 flex-wrap">
                                                <Building2 className="size-4 text-primary shrink-0" />
                                                <Badge
                                                  tone="primary"
                                                  appearance="solid"
                                                  size="sm"
                                                  className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs"
                                                >
                                                  {groupInst.sigla}
                                                </Badge>
                                                <span className="font-heading font-bold text-xs sm:text-sm text-foreground">
                                                  {groupInst.nombre}
                                                </span>
                                                <span className="text-[11px] font-mono text-muted-foreground">
                                                  RUC: {groupInst.codigoInstitucion}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Badge
                                                  tone="primary"
                                                  appearance="soft"
                                                  size="sm"
                                                  className="text-[11px] font-semibold"
                                                >
                                                  {groupItems.length}{" "}
                                                  {groupItems.length === 1
                                                    ? "fuente publicada"
                                                    : "fuentes publicadas"}
                                                </Badge>
                                                <Badge
                                                  tone="neutral"
                                                  appearance="outline"
                                                  size="sm"
                                                  className="text-[11px] font-semibold"
                                                >
                                                  {totalInstCampos} campos
                                                </Badge>
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                        {isInstExpanded &&
                                          groupItems.map(
                                  ({
                                    fuente,
                                    institucion,
                                    camposAccesibles,
                                    camposConfidenciales,
                                    camposSensibles,
                                  }) => {
                                    const isExpanded = expandedFuentes[fuente.id] ?? false;
                                    const rowContentId = `expandable-fuente-${fuente.id}`;
                                    const listaAccesibles = fuente.campos.filter(
                                      (c) => c.clasificacion === "Accesible"
                                    );
                                    const listaConfidenciales = fuente.campos.filter(
                                      (c) => c.clasificacion === "Confidencial"
                                    );
                                    const selectedInFuente = selectedCamposDetails.filter(
                                      (d) => d.servicioId === fuente.id
                                    ).length;
                                    const isCurrentActiveFuente = activeFuente?.id === fuente.id;
                                    const isDifferentFromActive = Boolean(
                                      activeFuente && !isCurrentActiveFuente
                                    );
                                    const allSelectedInFuente =
                                      fuente.campos.length > 0 &&
                                      fuente.campos.every((c) => !!selectedCampos[c.id]);
                                    const fuenteDisplayLabel = `${fuente.nombre} (${
                                      institucion.sigla || institucion.nombre
                                    })`;

                                    return (
                                      <React.Fragment key={fuente.id}>
                                        <TableRow
                                          id={`row-${fuente.id}`}
                                          onClick={() => toggleFuente(fuente.id)}
                                          className={cn(
                                            "group cursor-pointer transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/15",
                                            isExpanded && "bg-primary/10 dark:bg-primary/15 font-medium",
                                            isCurrentActiveFuente && "bg-primary/5",
                                            isDifferentFromActive && "opacity-75"
                                          )}
                                        >
                                          {/* Botón Expandir */}
                                          <TableCell
                                            className="text-center"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon-sm"
                                              onClick={() => toggleFuente(fuente.id)}
                                              aria-expanded={isExpanded}
                                              aria-controls={rowContentId}
                                              className="size-8 rounded-lg group-hover:bg-primary/15 hover:bg-primary/25 text-primary transition-all duration-200"
                                            >
                                              <ChevronRight
                                                className={cn(
                                                  "size-4 transition-transform duration-300",
                                                  isExpanded && "rotate-90 text-primary"
                                                )}
                                              />
                                            </Button>
                                          </TableCell>

                                          {/* Fuente de Información */}
                                          <TableCell>
                                            <div className="space-y-1 max-w-md">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                  {fuente.codigoServicio}
                                                </span>
                                                <Badge
                                                  tone="neutral"
                                                  appearance="outline"
                                                  size="sm"
                                                  className="text-[10px] font-mono"
                                                >
                                                  v{fuente.version}
                                                </Badge>
                                              </div>
                                              <p className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                                                {fuente.nombre}
                                              </p>
                                              <p className="text-xs text-muted-foreground line-clamp-1">
                                                {fuente.descripcion}
                                              </p>
                                            </div>
                                          </TableCell>

                                          {/* Institución Proveedora */}
                                          <TableCell>
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-1.5">
                                                <Badge
                                                  tone="primary"
                                                  appearance="solid"
                                                  size="sm"
                                                  className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs"
                                                >
                                                  {institucion.sigla}
                                                </Badge>
                                                <span className="text-[11px] font-mono text-muted-foreground">
                                                  RUC: {institucion.codigoInstitucion}
                                                </span>
                                              </div>
                                              <p className="text-xs font-semibold text-foreground leading-snug">
                                                {institucion.nombre}
                                              </p>
                                              <p className="text-[11px] text-muted-foreground">
                                                {institucion.sector}
                                              </p>
                                            </div>
                                          </TableCell>

                                          {/* Base Legal y Vigencia */}
                                          <TableCell>
                                            <div className="space-y-1 text-xs">
                                              <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                <Scale className="size-3.5 text-primary shrink-0" />
                                                <span
                                                  className="line-clamp-1"
                                                  title={fuente.baseLegal}
                                                >
                                                  {fuente.baseLegal}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                <Clock className="size-3 shrink-0" />
                                                <span>Actualizado: {fuente.ultimaActualizacion}</span>
                                              </div>
                                            </div>
                                          </TableCell>

                                          {/* Campos y Requisitos */}
                                          <TableCell>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                              {camposAccesibles > 0 && (
                                                <Badge
                                                  tone="success"
                                                  appearance="soft"
                                                  size="sm"
                                                  className="gap-1 font-semibold text-[10px]"
                                                >
                                                  <Unlock className="size-3" />
                                                  <span>{camposAccesibles} ACCESIBLES</span>
                                                </Badge>
                                              )}
                                              {camposConfidenciales > 0 && (
                                                <Badge
                                                  tone="warning"
                                                  appearance="soft"
                                                  size="sm"
                                                  className="gap-1 font-semibold text-[10px]"
                                                >
                                                  <Lock className="size-3" />
                                                  <span>{camposConfidenciales} CONFIDENCIALES</span>
                                                </Badge>
                                              )}
                                              {camposSensibles > 0 && (
                                                <Badge
                                                  tone="danger"
                                                  appearance="soft"
                                                  size="sm"
                                                  className="gap-1 font-semibold text-[10px]"
                                                >
                                                  <ShieldAlert className="size-3" />
                                                  <span>{camposSensibles} SENSIBLE{camposSensibles === 1 ? "" : "S"} · LOPDP</span>
                                                </Badge>
                                              )}
                                            </div>
                                          </TableCell>

                                          {/* Selección */}
                                          <TableCell className="text-center">
                                            {selectedInFuente > 0 ? (
                                              <Badge
                                                tone="primary"
                                                appearance="soft"
                                                size="sm"
                                                className="gap-1 font-semibold text-[10px]"
                                              >
                                                <Check className="size-3" />
                                                <span>
                                                  {selectedInFuente} / {fuente.campos.length}
                                                </span>
                                              </Badge>
                                            ) : isDifferentFromActive ? (
                                              <Badge
                                                tone="neutral"
                                                appearance="outline"
                                                size="sm"
                                                className="text-[10px] text-muted-foreground gap-1"
                                              >
                                                <Lock className="size-2.5" />
                                                <span>Otra fuente</span>
                                              </Badge>
                                            ) : (
                                              <span className="text-xs text-muted-foreground">
                                                0 / {fuente.campos.length}
                                              </span>
                                            )}
                                          </TableCell>

                                          {/* Acciones */}
                                          <TableCell
                                            className="text-center"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="flex items-center justify-center">
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => toggleFuente(fuente.id)}
                                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    aria-label={
                                                      isExpanded
                                                        ? "Ocultar campos de la fuente"
                                                        : "Ver y seleccionar campos"
                                                    }
                                                  >
                                                    {isExpanded ? (
                                                      <EyeOff className="size-4" />
                                                    ) : (
                                                      <Eye className="size-4 text-primary" />
                                                    )}
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs">
                                                  {isExpanded
                                                    ? "Ocultar campos"
                                                    : `Seleccionar entre ${fuente.campos.length} campos`}
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </TableCell>
                                        </TableRow>

                                        {/* FILA EXPANDIBLE CON SELECCIÓN DE CAMPOS */}
                                        <TableRow className="bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent">
                                          <TableCell colSpan={7} className="p-0 border-0 h-auto">
                                            <div
                                              id={rowContentId}
                                              role="region"
                                              aria-labelledby={`row-${fuente.id}`}
                                              className={cn(
                                                "grid transition-all duration-300 ease-in-out overflow-hidden",
                                                isExpanded
                                                  ? "grid-rows-[1fr] opacity-100 py-3"
                                                  : "grid-rows-[0fr] opacity-0 py-0"
                                              )}
                                            >
                                              <div className="min-h-0 px-4 pb-2">
                                                <div className="p-5 rounded-2xl border border-border/60 bg-surface shadow-sm space-y-5 text-xs text-left">
                                                  {/* Cabecera del Expandable Row */}
                                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                                                    <div className="space-y-1">
                                                      <span className="font-bold text-foreground text-sm flex items-center gap-2">
                                                        <Database className="size-4 text-primary" />
                                                        Seleccione los campos requeridos de {fuente.nombre} (
                                                        {selectedInFuente} de {fuente.campos.length} seleccionados)
                                                      </span>
                                                      <p className="text-xs text-muted-foreground">
                                                        {institucion.nombre} ({institucion.sigla}) • Modalidad:{" "}
                                                        <strong className="text-foreground">
                                                          {fuente.tipoConsumo}
                                                        </strong>
                                                      </p>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                      <Button
                                                        type="button"
                                                        variant="neutral"
                                                        size="sm"
                                                        onClick={() =>
                                                          handleToggleAllFuente(
                                                            fuente,
                                                            institucion,
                                                            !allSelectedInFuente
                                                          )
                                                        }
                                                        className="gap-1.5 text-xs h-8"
                                                      >
                                                        <ListChecks className="size-3.5" />
                                                        <span>
                                                          {allSelectedInFuente
                                                            ? "Quitar selección de esta fuente"
                                                            : "Seleccionar todos los campos"}
                                                        </span>
                                                      </Button>
                                                    </div>
                                                  </div>

                                                  {/* Sub-sección 1: Campos Accesibles */}
                                                  {listaAccesibles.length > 0 && (
                                                    <div className="space-y-2.5">
                                                      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/25">
                                                        <span className="font-bold text-xs text-success flex items-center gap-1.5">
                                                          <Unlock className="size-3.5" />
                                                          Campos Accesibles ({listaAccesibles.length})
                                                        </span>
                                                        <span className="text-[11px] font-medium text-success">
                                                          Requisito: Solo finalidad de uso (PAR-11)
                                                        </span>
                                                      </div>

                                                      <div
                                                        className={cn(
                                                          "grid gap-3 w-full",
                                                          listaAccesibles.length === 1
                                                            ? "grid-cols-1"
                                                            : listaAccesibles.length === 2
                                                            ? "grid-cols-1 sm:grid-cols-2"
                                                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                                        )}
                                                      >
                                                        {listaAccesibles.map((campo) => {
                                                          const isSelected = !!selectedCampos[campo.id];
                                                          return (
                                                            <div
                                                              key={campo.id}
                                                              onClick={() =>
                                                                handleSelectCampo(
                                                                  campo.id,
                                                                  !isSelected,
                                                                  fuente.id,
                                                                  fuenteDisplayLabel
                                                                )
                                                              }
                                                              className={cn(
                                                                "p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 cursor-pointer transition-all w-full",
                                                                isSelected
                                                                  ? "bg-primary/5 border-primary/50 shadow-2xs"
                                                                  : isDifferentFromActive
                                                                  ? "bg-muted/15 border-border/50 opacity-75 hover:border-warning/50"
                                                                  : "bg-muted/35 border-border/60 hover:border-success/40"
                                                              )}
                                                            >
                                                              <div className="space-y-1.5">
                                                                <div className="flex items-start justify-between gap-2">
                                                                  <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div
                                                                      onClick={(e) => e.stopPropagation()}
                                                                      className="shrink-0 flex items-center"
                                                                    >
                                                                      <Checkbox
                                                                        checked={isSelected}
                                                                        variant="primary"
                                                                        size="md"
                                                                        onCheckedChange={(checked) =>
                                                                          handleSelectCampo(
                                                                            campo.id,
                                                                            !!checked,
                                                                            fuente.id,
                                                                            fuenteDisplayLabel
                                                                          )
                                                                        }
                                                                      />
                                                                    </div>
                                                                    <span className="font-mono font-bold text-xs text-foreground break-all">
                                                                      {campo.nombre}
                                                                    </span>
                                                                  </div>
                                                                  <Badge
                                                                    tone="success"
                                                                    appearance="soft"
                                                                    size="sm"
                                                                    className="gap-1 text-[10px] font-semibold shrink-0"
                                                                  >
                                                                    <Unlock className="size-3" />
                                                                    ACCESIBLE
                                                                  </Badge>
                                                                </div>
                                                                <p className="text-muted-foreground text-[11px] leading-relaxed pl-6">
                                                                  {campo.descripcion}
                                                                </p>
                                                              </div>

                                                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-[10px] pl-6">
                                                                <span className="text-muted-foreground font-mono">
                                                                  Tipo: {campo.tipo}
                                                                </span>
                                                                <span className="font-semibold text-success">
                                                                  Solo finalidad (PAR-11)
                                                                </span>
                                                              </div>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* Sub-sección 2: Campos Confidenciales */}
                                                  {listaConfidenciales.length > 0 && (
                                                    <div className="space-y-2.5">
                                                      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/25">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                          <span className="font-bold text-xs text-warning flex items-center gap-1.5">
                                                            <Lock className="size-3.5" />
                                                            Campos Confidenciales ({listaConfidenciales.length})
                                                          </span>
                                                          {camposSensibles > 0 && (
                                                            <Badge
                                                              tone="danger"
                                                              appearance="soft"
                                                              size="sm"
                                                              className="gap-1 font-semibold text-[10px]"
                                                            >
                                                              <ShieldAlert className="size-3" />
                                                              <span>
                                                                Incluye {camposSensibles} Confidencial{camposSensibles === 1 ? "" : "es"} Sensible{camposSensibles === 1 ? "" : "s"} (LOPDP)
                                                              </span>
                                                            </Badge>
                                                          )}
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-warning-700 dark:text-warning-400">
                                                          Requisito: Finalidad de uso + Justificación jurídica — Revisión DPI (PAR-12)
                                                        </span>
                                                      </div>

                                                      <div
                                                        className={cn(
                                                          "grid gap-3 w-full",
                                                          listaConfidenciales.length === 1
                                                            ? "grid-cols-1"
                                                            : listaConfidenciales.length === 2
                                                            ? "grid-cols-1 sm:grid-cols-2"
                                                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                                        )}
                                                      >
                                                        {listaConfidenciales.map((campo) => {
                                                          const isSelected = !!selectedCampos[campo.id];
                                                          const isSensible = Boolean(campo.esSensible);
                                                          return (
                                                            <div
                                                              key={campo.id}
                                                              onClick={() =>
                                                                handleSelectCampo(
                                                                  campo.id,
                                                                  !isSelected,
                                                                  fuente.id,
                                                                  fuenteDisplayLabel
                                                                )
                                                              }
                                                              className={cn(
                                                                "p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 cursor-pointer transition-all w-full",
                                                                isSelected
                                                                  ? "bg-primary/5 border-primary/50 shadow-2xs"
                                                                  : isDifferentFromActive
                                                                  ? "bg-muted/15 border-border/50 opacity-75 hover:border-warning/50"
                                                                  : isSensible
                                                                  ? "bg-danger/10 dark:bg-danger-900/25 border-2 border-danger/55 hover:border-danger shadow-2xs"
                                                                  : "bg-warning-50/60 dark:bg-warning-900/10 border-warning-300/80 hover:border-warning"
                                                              )}
                                                            >
                                                              <div className="space-y-1.5">
                                                                <div className="flex items-start justify-between gap-2">
                                                                  <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div
                                                                      onClick={(e) => e.stopPropagation()}
                                                                      className="shrink-0 flex items-center"
                                                                    >
                                                                      <Checkbox
                                                                        checked={isSelected}
                                                                        variant="primary"
                                                                        size="md"
                                                                        onCheckedChange={(checked) =>
                                                                          handleSelectCampo(
                                                                            campo.id,
                                                                            !!checked,
                                                                            fuente.id,
                                                                            fuenteDisplayLabel
                                                                          )
                                                                        }
                                                                      />
                                                                    </div>
                                                                    <span className="font-mono font-bold text-xs text-foreground break-all">
                                                                      {campo.nombre}
                                                                    </span>
                                                                  </div>
                                                                  <div className="flex items-center gap-1 flex-wrap justify-end shrink-0">
                                                                    <Badge
                                                                      tone="warning"
                                                                      appearance="soft"
                                                                      size="sm"
                                                                      className="gap-1 text-[10px] font-semibold shrink-0"
                                                                    >
                                                                      <Lock className="size-3" />
                                                                      CONFIDENCIAL
                                                                    </Badge>
                                                                    {isSensible && (
                                                                      <Badge
                                                                        tone="danger"
                                                                        appearance="solid"
                                                                        size="sm"
                                                                        className="gap-1 text-[10px] font-bold shrink-0"
                                                                      >
                                                                        <ShieldAlert className="size-3" />
                                                                        SENSIBLE · LOPDP
                                                                      </Badge>
                                                                    )}
                                                                  </div>
                                                                </div>
                                                                <p className="text-muted-foreground text-[11px] leading-relaxed pl-6">
                                                                  {campo.descripcion}
                                                                </p>
                                                                {isSensible && (
                                                                  <div className="ml-6 px-2.5 py-1.5 rounded-lg bg-danger/15 border border-danger/35 flex items-center gap-1.5 text-[10px] text-danger font-bold">
                                                                    <ShieldAlert className="size-3 shrink-0" />
                                                                    <span>
                                                                      Dato confidencial sensible con tratamiento especial según la Ley de Protección de Datos (Revisión DPI).
                                                                    </span>
                                                                  </div>
                                                                )}
                                                              </div>

                                                              <div className={cn("flex items-center justify-between gap-2 pt-2 border-t text-[10px] pl-6", isSensible ? "border-danger/30" : "border-border/40")}>
                                                                <span className="text-muted-foreground font-mono">
                                                                  Tipo: {campo.tipo}
                                                                </span>
                                                                <span className={cn("font-bold", isSensible ? "text-danger" : "text-warning-700 dark:text-warning-400")}>
                                                                  {isSensible
                                                                    ? "Finalidad + Jurídica · Tratamiento especial LOPDP"
                                                                    : "Finalidad + Jurídica (PAR-12)"}
                                                                </span>
                                                              </div>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      </React.Fragment>
                                    );
                                  }
                                )}
                                      </React.Fragment>
                                    );
                                  }
                                )}
                              </TableBody>
                            </Table>
                          </div>

                          {/* 2. VISTA DE TARJETAS AGRUPADA POR INSTITUCIÓN (viewMode === "cards" o Mobile <md) */}
                          <div
                            className={cn(
                              "w-full space-y-4",
                              viewMode === "cards" ? "block" : "block md:hidden"
                            )}
                          >
                            {groupedFuentesPorInstitucion.map(
                              ({ institucion: groupInst, items: groupItems }) => {
                                const isInstExpanded =
                                  expandedInstituciones[groupInst.id] ?? true;
                                const totalInstCampos = groupItems.reduce(
                                  (acc, it) => acc + it.fuente.campos.length,
                                  0
                                );
                                return (
                                  <div
                                    key={`bn07-card-inst-${groupInst.id}`}
                                    className="rounded-xl border border-border bg-muted/15 overflow-hidden"
                                  >
                                    <div
                                      onClick={() => toggleInstitucion(groupInst.id)}
                                      className="cursor-pointer px-4 py-3 bg-muted/35 hover:bg-muted/55 flex flex-wrap items-center justify-between gap-2 transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 flex-wrap">
                                        <ChevronRight
                                          className={cn(
                                            "size-4 text-primary transition-transform duration-200",
                                            isInstExpanded && "rotate-90"
                                          )}
                                        />
                                        <Building2 className="size-4 text-primary shrink-0" />
                                        <Badge
                                          tone="primary"
                                          appearance="solid"
                                          size="sm"
                                          className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs"
                                        >
                                          {groupInst.sigla}
                                        </Badge>
                                        <span className="font-heading font-bold text-xs sm:text-sm text-foreground">
                                          {groupInst.nombre}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          tone="primary"
                                          appearance="soft"
                                          size="sm"
                                          className="text-[11px] font-semibold"
                                        >
                                          {groupItems.length}{" "}
                                          {groupItems.length === 1 ? "fuente" : "fuentes"}
                                        </Badge>
                                        <Badge
                                          tone="neutral"
                                          appearance="outline"
                                          size="sm"
                                          className="text-[11px] font-semibold"
                                        >
                                          {totalInstCampos} campos
                                        </Badge>
                                      </div>
                                    </div>
                                    {isInstExpanded && (
                                      <div
                                        className={cn(
                                          "p-3 sm:p-4 border-t border-border/60",
                                          groupItems.length === 1
                                            ? "grid grid-cols-1 gap-4"
                                            : "grid grid-cols-1 lg:grid-cols-2 gap-4"
                                        )}
                                      >
                                        {groupItems.map(
                              ({
                                fuente,
                                institucion,
                                camposAccesibles,
                                camposConfidenciales,
                                camposSensibles,
                              }) => {
                                const isExpanded = expandedFuentes[fuente.id] ?? false;
                                const listaAccesibles = fuente.campos.filter(
                                  (c) => c.clasificacion === "Accesible"
                                );
                                const listaConfidenciales = fuente.campos.filter(
                                  (c) => c.clasificacion === "Confidencial"
                                );
                                const tieneConfidenciales = camposConfidenciales > 0;
                                const selectedInFuente = selectedCamposDetails.filter(
                                  (d) => d.servicioId === fuente.id
                                ).length;
                                const isCurrentActiveFuente = activeFuente?.id === fuente.id;
                                const isDifferentFromActive = Boolean(
                                  activeFuente && !isCurrentActiveFuente
                                );
                                const allSelectedInFuente =
                                  fuente.campos.length > 0 &&
                                  fuente.campos.every((c) => !!selectedCampos[c.id]);
                                const fuenteDisplayLabel = `${fuente.nombre} (${
                                  institucion.sigla || institucion.nombre
                                })`;

                                return (
                                  <InteractiveCard
                                    key={fuente.id}
                                    color="default"
                                    decorativeIcon={<Database className="size-full stroke-[0.8]" />}
                                    decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-25 dark:opacity-15 group-hover:opacity-40"
                                    className={cn(
                                      "p-4 sm:p-5 bg-surface hover:bg-surface border-border shadow-xs hover:border-primary/40 flex flex-col justify-between gap-4 w-full",
                                      isExpanded && "lg:col-span-2",
                                      isCurrentActiveFuente && "border-primary/50",
                                      isDifferentFromActive && "opacity-80"
                                    )}
                                  >
                                    <div className="space-y-3.5 w-full">
                                      {/* Cabecera de la Card */}
                                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
                                        <div className="min-w-0 flex-1 space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge
                                              tone="primary"
                                              appearance="solid"
                                              size="sm"
                                              className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs"
                                            >
                                              {institucion.sigla}
                                            </Badge>
                                            <span className="text-[11px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                              {fuente.codigoServicio}
                                            </span>
                                            <Badge
                                              tone="neutral"
                                              appearance="outline"
                                              size="sm"
                                              className="text-[10px] font-mono"
                                            >
                                              v{fuente.version}
                                            </Badge>
                                            {selectedInFuente > 0 && (
                                              <Badge
                                                tone="primary"
                                                appearance="soft"
                                                size="sm"
                                                className="gap-1 font-semibold text-[10px]"
                                              >
                                                <Check className="size-3" />
                                                <span>{selectedInFuente} seleccionados</span>
                                              </Badge>
                                            )}
                                          </div>
                                          <h3 className="font-heading text-sm sm:text-base font-bold text-foreground leading-snug pt-0.5">
                                            {fuente.nombre}
                                          </h3>
                                        </div>

                                        <Badge
                                          tone={tieneConfidenciales ? "warning" : "success"}
                                          appearance="soft"
                                          size="sm"
                                          className="shrink-0 font-semibold text-[10px] gap-1"
                                        >
                                          {tieneConfidenciales ? (
                                            <>
                                              <Lock className="size-3" />
                                              <span>Con Reserva</span>
                                            </>
                                          ) : (
                                            <>
                                              <Unlock className="size-3" />
                                              <span>100% Accesible</span>
                                            </>
                                          )}
                                        </Badge>
                                      </div>

                                      {/* Descripción */}
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {fuente.descripcion}
                                      </p>

                                      {/* Metadatos en 2 bloques */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs w-full">
                                        <div className="p-2.5 rounded-lg bg-muted/25 border border-border/50 space-y-1">
                                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Building2 className="size-3 text-primary" />
                                            Institución Proveedora
                                          </span>
                                          <span className="text-xs font-semibold text-foreground block leading-tight">
                                            {institucion.nombre}
                                          </span>
                                          <span className="text-[11px] text-muted-foreground font-mono block">
                                            RUC: {institucion.codigoInstitucion}
                                          </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-muted/25 border border-border/50 space-y-1">
                                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Scale className="size-3 text-primary" />
                                            Base Legal y Modalidad
                                          </span>
                                          <span
                                            className="text-xs font-medium text-foreground block line-clamp-1"
                                            title={fuente.baseLegal}
                                          >
                                            {fuente.baseLegal}
                                          </span>
                                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="size-3 shrink-0" />
                                            Actualizado: {fuente.ultimaActualizacion}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Resumen de Clasificación de Campos */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                                        <span className="text-[11px] font-semibold text-muted-foreground">
                                          Desglose de {fuente.campos.length} campos:
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2">
                                          {camposAccesibles > 0 && (
                                            <Badge
                                              tone="success"
                                              appearance="soft"
                                              size="sm"
                                              className="gap-1 font-semibold text-[10px]"
                                            >
                                              <Unlock className="size-3" />
                                              <span>{camposAccesibles} ACCESIBLES</span>
                                            </Badge>
                                          )}
                                          {camposConfidenciales > 0 && (
                                            <Badge
                                              tone="warning"
                                              appearance="soft"
                                              size="sm"
                                              className="gap-1 font-semibold text-[10px]"
                                            >
                                              <Lock className="size-3" />
                                              <span>{camposConfidenciales} CONFIDENCIALES</span>
                                            </Badge>
                                          )}
                                          {camposSensibles > 0 && (
                                            <Badge
                                              tone="danger"
                                              appearance="soft"
                                              size="sm"
                                              className="gap-1 font-semibold text-[10px]"
                                            >
                                              <ShieldAlert className="size-3" />
                                              <span>{camposSensibles} SENSIBLE{camposSensibles === 1 ? "" : "S"} · LOPDP</span>
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      {/* Sección Expandible de Selección de Campos dentro de la Card */}
                                      <div
                                        className={cn(
                                          "grid transition-all duration-300 ease-in-out overflow-hidden",
                                          isExpanded
                                            ? "grid-rows-[1fr] opacity-100 pt-1"
                                            : "grid-rows-[0fr] opacity-0 pt-0"
                                        )}
                                      >
                                        <div className="min-h-0">
                                          <div className="p-3.5 rounded-xl border border-border/60 bg-surface space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                                              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                                <FileText className="size-3.5 text-primary" />
                                                Seleccione campos ({selectedInFuente}/{fuente.campos.length})
                                              </span>
                                              <Button
                                                type="button"
                                                variant="neutral"
                                                size="sm"
                                                onClick={() =>
                                                  handleToggleAllFuente(
                                                    fuente,
                                                    institucion,
                                                    !allSelectedInFuente
                                                  )
                                                }
                                                className="h-7 px-2.5 text-[11px] gap-1"
                                              >
                                                <ListChecks className="size-3" />
                                                <span>
                                                  {allSelectedInFuente
                                                    ? "Quitar todos"
                                                    : "Seleccionar todos"}
                                                </span>
                                              </Button>
                                            </div>

                                            <div className="space-y-3">
                                              {/* Bloque 1: Campos Accesibles */}
                                              {listaAccesibles.length > 0 && (
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-success/10 border border-success/25">
                                                    <span className="text-[11px] font-bold text-success flex items-center gap-1.5">
                                                      <Unlock className="size-3.5" />
                                                      Campos Accesibles ({listaAccesibles.length})
                                                    </span>
                                                    <span className="text-[10px] font-medium text-success">
                                                      Solo finalidad de uso (PAR-11)
                                                    </span>
                                                  </div>
                                                  <div
                                                    className={cn(
                                                      "grid gap-2.5 w-full",
                                                      listaAccesibles.length === 1
                                                        ? "grid-cols-1"
                                                        : listaAccesibles.length === 2
                                                        ? "grid-cols-1 sm:grid-cols-2"
                                                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                                    )}
                                                  >
                                                    {listaAccesibles.map((campo) => {
                                                      const isSelected = !!selectedCampos[campo.id];
                                                      return (
                                                        <div
                                                          key={campo.id}
                                                          onClick={() =>
                                                            handleSelectCampo(
                                                              campo.id,
                                                              !isSelected,
                                                              fuente.id,
                                                              fuenteDisplayLabel
                                                            )
                                                          }
                                                          className={cn(
                                                            "p-2.5 rounded-lg border flex flex-col justify-between gap-1.5 cursor-pointer transition-all w-full",
                                                            isSelected
                                                              ? "bg-primary/5 border-primary/50 shadow-2xs"
                                                              : "bg-muted/35 border-border/60 hover:border-success/40"
                                                          )}
                                                        >
                                                          <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                              <div
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="shrink-0 flex items-center"
                                                              >
                                                                <Checkbox
                                                                  checked={isSelected}
                                                                  variant="primary"
                                                                  size="sm"
                                                                  onCheckedChange={(checked) =>
                                                                    handleSelectCampo(
                                                                      campo.id,
                                                                      !!checked,
                                                                      fuente.id,
                                                                      fuenteDisplayLabel
                                                                    )
                                                                  }
                                                                />
                                                              </div>
                                                              <span className="font-mono font-bold text-xs text-foreground truncate">
                                                                {campo.nombre}
                                                              </span>
                                                            </div>
                                                            <Badge
                                                              tone="success"
                                                              appearance="soft"
                                                              size="sm"
                                                              className="gap-1 text-[10px] font-semibold shrink-0"
                                                            >
                                                              <Unlock className="size-2.5" />
                                                              ACCESIBLE
                                                            </Badge>
                                                          </div>
                                                          <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                                                            {campo.descripcion}
                                                          </p>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Bloque 2: Campos Confidenciales */}
                                              {listaConfidenciales.length > 0 && (
                                                <div className="space-y-2">
                                                  <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-warning/10 border border-warning/25">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                      <span className="text-[11px] font-bold text-warning flex items-center gap-1.5">
                                                        <Lock className="size-3.5" />
                                                        Campos Confidenciales ({listaConfidenciales.length})
                                                      </span>
                                                      {camposSensibles > 0 && (
                                                        <Badge
                                                          tone="danger"
                                                          appearance="soft"
                                                          size="sm"
                                                          className="gap-1 font-semibold text-[10px]"
                                                        >
                                                          <ShieldAlert className="size-2.5" />
                                                          <span>{camposSensibles} Sensible{camposSensibles === 1 ? "" : "s"} · LOPDP</span>
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <span className="text-[10px] font-medium text-warning">
                                                      Finalidad + Base jurídica (PAR-12)
                                                    </span>
                                                  </div>
                                                  <div
                                                    className={cn(
                                                      "grid gap-2.5 w-full",
                                                      listaConfidenciales.length === 1
                                                        ? "grid-cols-1"
                                                        : listaConfidenciales.length === 2
                                                        ? "grid-cols-1 sm:grid-cols-2"
                                                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                                    )}
                                                  >
                                                    {listaConfidenciales.map((campo) => {
                                                      const isSelected = !!selectedCampos[campo.id];
                                                      const isSensible = Boolean(campo.esSensible);
                                                      return (
                                                        <div
                                                          key={campo.id}
                                                          onClick={() =>
                                                            handleSelectCampo(
                                                              campo.id,
                                                              !isSelected,
                                                              fuente.id,
                                                              fuenteDisplayLabel
                                                            )
                                                          }
                                                          className={cn(
                                                            "p-2.5 rounded-lg border flex flex-col justify-between gap-1.5 cursor-pointer transition-all w-full",
                                                            isSelected
                                                              ? "bg-primary/5 border-primary/50 shadow-2xs"
                                                              : isSensible
                                                              ? "bg-danger/10 dark:bg-danger-900/25 border-2 border-danger/55 hover:border-danger shadow-2xs"
                                                              : "bg-warning-50/60 dark:bg-warning-900/10 border-warning-300/80 hover:border-warning"
                                                          )}
                                                        >
                                                          <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                              <div
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="shrink-0 flex items-center"
                                                              >
                                                                <Checkbox
                                                                  checked={isSelected}
                                                                  variant="primary"
                                                                  size="sm"
                                                                  onCheckedChange={(checked) =>
                                                                    handleSelectCampo(
                                                                      campo.id,
                                                                      !!checked,
                                                                      fuente.id,
                                                                      fuenteDisplayLabel
                                                                    )
                                                                  }
                                                                />
                                                              </div>
                                                              <span className="font-mono font-bold text-xs text-foreground truncate">
                                                                {campo.nombre}
                                                              </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 flex-wrap justify-end shrink-0">
                                                              <Badge
                                                                tone="warning"
                                                                appearance="soft"
                                                                size="sm"
                                                                className="gap-1 text-[10px] font-semibold shrink-0"
                                                              >
                                                                <Lock className="size-2.5" />
                                                                CONFIDENCIAL
                                                              </Badge>
                                                              {isSensible && (
                                                                <Badge
                                                                  tone="danger"
                                                                  appearance="solid"
                                                                  size="sm"
                                                                  className="gap-1 text-[10px] font-bold shrink-0"
                                                                >
                                                                  <ShieldAlert className="size-2.5" />
                                                                  SENSIBLE · LOPDP
                                                                </Badge>
                                                              )}
                                                            </div>
                                                          </div>
                                                          <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                                                            {campo.descripcion}
                                                          </p>
                                                          {isSensible && (
                                                            <div className="ml-6 px-2 py-1 rounded-md bg-danger/15 border border-danger/35 flex items-center gap-1 text-[10px] text-danger font-bold">
                                                              <ShieldAlert className="size-3 shrink-0" />
                                                              <span>Tratamiento especial según Ley de Protección de Datos (Revisión DPI).</span>
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Acciones de la Card */}
                                    <div className="pt-2 border-t border-border/60 w-full flex flex-wrap items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="neutral"
                                        size="sm"
                                        onClick={() => toggleFuente(fuente.id)}
                                        className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <EyeOff className="size-3.5 text-muted-foreground" />
                                            <span>Ocultar campos ({fuente.campos.length})</span>
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="size-3.5 text-primary" />
                                            <span>
                                              Seleccionar campos ({selectedInFuente}/{fuente.campos.length})
                                            </span>
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </InteractiveCard>
                                );
                              }
                            )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal de confirmación al cambiar de fuente después de haber seleccionado campos */}
                    <Dialog
                      open={Boolean(pendingCambioFuente)}
                      onOpenChange={(open) => {
                        if (!open) setPendingCambioFuente(null);
                      }}
                    >
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-base font-heading font-bold">
                            <AlertTriangle className="size-5 text-warning" />
                            <span>¿Confirmar cambio de fuente?</span>
                          </DialogTitle>
                          <DialogDescription className="text-xs sm:text-sm leading-relaxed pt-1">
                            No se permite combinar campos de fuentes distintas en una misma solicitud. Actualmente tiene{" "}
                            <strong className="text-foreground font-semibold">
                              {selectedCount} {selectedCount === 1 ? "campo seleccionado" : "campos seleccionados"}
                            </strong>{" "}
                            de <strong className="text-foreground font-semibold">{pendingCambioFuente?.fuenteActual}</strong>. Si cambia a{" "}
                            <strong className="text-foreground font-semibold">{pendingCambioFuente?.fuenteNueva}</strong>, se descartará la selección actual.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-2 pt-2">
                          <Button
                            type="button"
                            variant="neutral"
                            size="sm"
                            onClick={() => setPendingCambioFuente(null)}
                          >
                            Conservar selección actual
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              pendingCambioFuente?.onConfirm();
                              toast.info("Selección anterior descartada");
                            }}
                          >
                            Confirmar y cambiar de fuente
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                  </div>

                  {/* Barra de navegación inferior del Paso 2 */}
                  <div className="p-4 sm:p-6 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="neutral"
                        size="sm"
                        onClick={prevStep}
                        className="gap-1.5"
                      >
                        <ArrowLeft className="size-3.5" />
                        <span>Atrás</span>
                      </Button>
                      <span className="font-bold text-foreground text-xs sm:text-sm">
                        Campos seleccionados: {selectedCount}
                      </span>
                      {selectedCount > 0 && (
                        <span className="text-xs text-muted-foreground hidden lg:inline">
                          ({selectedCamposDetails.filter(c => c.campo.clasificacion === "Accesible").length} accesibles · {selectedCamposDetails.filter(c => c.campo.clasificacion === "Confidencial").length} confidenciales)
                        </span>
                      )}
                      {activeFuente && (
                        <Badge tone="neutral" appearance="soft" size="sm" className="hidden sm:inline-flex text-xs gap-1.5 bg-muted text-foreground border border-border">
                          <Database className="size-3 text-muted-foreground" />
                          <span>Fuente: {activeFuente.nombre}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGuardarBorrador}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <FileText className="size-3.5" />
                        <span>Guardar como borrador</span>
                      </Button>
                      <Button
                        variant="primary"
                        onClick={nextStep}
                        disabled={selectedCount === 0}
                        size="sm"
                        className="gap-2 text-xs font-semibold shrink-0"
                      >
                        <span>Siguiente: Justificar campos</span>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: JUSTIFICAR CAMPOS */}
              {step === 3 && (
                <div className="flex flex-col w-full" id="justificacion-step">
                  {/* Cabecera de Sección III */}
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                        <Scale className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-heading text-base font-bold text-primary leading-snug">
                            Sección III — Finalidad de Uso y Justificación Jurídica de Campos
                          </h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Declare la finalidad institucional de cada campo y la base legal habilitante para datos confidenciales.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground bg-surface gap-1.5"
                      >
                        <Link href="/parametros-ayuda-bn07">
                          <Settings2 className="size-3.5 text-primary" />
                          Configurar textos de ayuda (DPI)
                        </Link>
                      </Button>
                      {selectedCamposDetails.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={expandAllJustificaciones}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground bg-surface"
                          >
                            Expandir todos
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={collapseAllJustificaciones}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground bg-surface"
                          >
                            Colapsar todos
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo del Paso 3 */}
                  <div className="p-4 sm:p-6 flex flex-col gap-5 w-full">
                    {/* Nota de distinción en 2 columnas laterales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
                      <div className="p-3.5 rounded-xl border border-success/25 bg-success/5 flex items-start gap-3">
                        <Unlock className="size-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-foreground">Campos Accesibles (Evaluación Gestión)</p>
                          <p className="text-muted-foreground leading-relaxed">
                            Requieren únicamente declarar la <strong className="text-foreground font-medium">Finalidad de uso</strong> indicando el campo, el proceso institucional y la necesidad específica.
                          </p>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-warning/30 bg-warning/5 flex items-start gap-3">
                        <Lock className="size-4 text-warning shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">Campos Confidenciales (Evaluación Gestión + DPI)</p>
                            <Badge tone="danger" appearance="soft" size="sm" className="gap-1 text-[10px] font-semibold">
                              <ShieldAlert className="size-3" /> Incluye subclasificación Sensible · LOPDP
                            </Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            Requieren <strong className="text-foreground font-medium">Finalidad de uso</strong> y <strong className="text-foreground font-medium">Justificación jurídica</strong> relacionando la norma aplicable con el acceso solicitado. Los campos <strong className="text-danger font-medium">Confidenciales sensibles</strong> pertenecen a esta categoría y mantienen la revisión por DPI bajo tratamiento especial LOPDP.
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedCamposDetails.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl w-full">
                        No hay campos seleccionados. Vuelva al paso anterior para seleccionar campos.
                      </div>
                    ) : (
                      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs w-full">
                        {/* Nivel 1: Institución / Fuente */}
                        <div className="p-4 sm:p-5 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border w-full">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="size-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 shadow-2xs">
                              <Building2 className="size-4.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-heading text-base font-bold text-foreground">
                                  {activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Dirección General de Registro Civil, Identificación y Cedulación")}
                                </h3>
                                <Badge tone="primary" appearance="soft" size="sm" className="gap-1 text-[10px] font-semibold">
                                  <Check className="size-2.5" /> Fuente en uso
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {selectedCamposDetails.length} {selectedCamposDetails.length === 1 ? "campo seleccionado para justificar" : "campos seleccionados para justificar"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Nivel 2 y 3: Fuentes y Campos dentro del Contenedor */}
                        <div className="p-4 sm:p-6 flex flex-col gap-6 bg-card divide-y divide-border/60 w-full">
                          {selectedCamposByServicio.map((group, groupIdx) => (
                            <div key={group.servicioId} className={`flex flex-col gap-4 w-full ${groupIdx > 0 ? "pt-6" : ""}`}>
                              {/* Identificador de Fuente */}
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Fuente
                                  </Badge>
                                  <h4 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                                    <Database className="size-4 text-primary" />
                                    {group.servicioNombre}
                                  </h4>
                                  <span className="text-xs text-muted-foreground">
                                    ({group.items.length} {group.items.length === 1 ? "campo" : "campos"})
                                  </span>
                                </div>
                              </div>

                              {/* Lista de campos a justificar de este servicio */}
                              <div className="flex flex-col gap-3 w-full">
                                {group.items.map((item) => {
                                  const isExpanded = expandedCamposJustificacion[item.campo.id] ?? true;
                                  const isFinalidadFilled = Boolean(justificaciones[item.campo.id]?.finalidad?.trim());
                                  const isFundamentoFilled = item.campo.clasificacion === "Confidencial"
                                    ? Boolean(justificaciones[item.campo.id]?.fundamento?.trim())
                                    : true;
                                  const isCompleted = isFinalidadFilled && isFundamentoFilled;
                                  const ayudaCampo = resolverAyudaParaCampo(configAyudaBN07, item.campo);

                                  return (
                                    <div
                                      key={item.campo.id}
                                      className={cn(
                                        "rounded-xl overflow-hidden shadow-2xs transition-all w-full",
                                        item.campo.clasificacion === "Confidencial" && item.campo.esSensible
                                          ? "border-2 border-danger/55 bg-danger/5 dark:bg-danger-900/15"
                                          : "border border-border/80 bg-surface/50"
                                      )}
                                    >
                                      {/* Fila del campo: click expande / colapsa */}
                                      <div
                                        onClick={() => toggleCampoJustificacion(item.campo.id)}
                                        className="p-4 hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none w-full"
                                      >
                                        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                                          <span className="font-mono font-bold text-sm text-foreground">{item.campo.nombre}</span>
                                          {item.campo.clasificacion === "Accesible" ? (
                                            <Badge
                                              tone="success"
                                              appearance="soft"
                                              size="sm"
                                              className="gap-1 inline-flex font-semibold"
                                            >
                                              <Unlock className="size-3" /> ACCESIBLE
                                            </Badge>
                                          ) : (
                                            <div className="inline-flex items-center gap-1.5 flex-wrap">
                                              <Badge
                                                tone="warning"
                                                appearance="soft"
                                                size="sm"
                                                className="gap-1 inline-flex font-semibold"
                                              >
                                                <Lock className="size-3" /> CONFIDENCIAL
                                              </Badge>
                                              {item.campo.esSensible && (
                                                <Badge
                                                  tone="danger"
                                                  appearance="solid"
                                                  size="sm"
                                                  className="gap-1 inline-flex font-bold"
                                                >
                                                  <ShieldAlert className="size-3" /> SENSIBLE · LOPDP
                                                </Badge>
                                              )}
                                            </div>
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
                                            {isExpanded ? "Ocultar" : "Desplegar"}
                                          </span>

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
                                        </div>
                                      </div>

                                      {/* Contenido colapsable: aprovecha laterales en 2 columnas si es Confidencial */}
                                      {isExpanded && (
                                        <div
                                          className={cn(
                                            "border-t border-border/70 p-4 sm:p-5 bg-muted/10 animate-in fade-in-50 duration-150 w-full",
                                            item.campo.clasificacion === "Confidencial"
                                              ? "grid grid-cols-1 lg:grid-cols-2 gap-4 items-start"
                                              : "flex flex-col gap-4"
                                          )}
                                        >
                                          <div className="flex flex-col gap-2 w-full">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                                                Finalidad de uso <span className="text-destructive">*</span>
                                              </label>
                                            </div>
                                            <Textarea
                                              className="w-full rounded-xl min-h-[95px] text-xs sm:text-sm bg-background border-border"
                                              placeholder={`Indique el proceso institucional y la necesidad específica para el campo ${item.campo.nombre}...`}
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
                                            <AyudaPermanenteCampoBN07
                                              tipoCampoFormulario="finalidad"
                                              clasificacion={item.campo.clasificacion}
                                              esSensible={item.campo.esSensible}
                                              codigoParametro={ayudaCampo.finalidad.codigoParametro}
                                              titulo={ayudaCampo.finalidad.titulo}
                                              criterioOrientacion={ayudaCampo.finalidad.criterioOrientacion}
                                              instruccion={ayudaCampo.finalidad.instruccion}
                                              ejemploReferencial={ayudaCampo.finalidad.ejemploReferencial}
                                              mostrarEjemplo={configAyudaBN07.mostrarEjemplosReferenciales}
                                              esProvisional={ayudaCampo.finalidad.esProvisional}
                                              etiquetaProvisional={ayudaCampo.finalidad.etiquetaProvisional}
                                              tieneOverrideCampo={ayudaCampo.finalidad.tieneOverrideCampo}
                                              campoNombre={item.campo.nombre}
                                            />
                                          </div>

                                          {item.campo.clasificacion === "Confidencial" && ayudaCampo.justificacion && (
                                            <div className="flex flex-col gap-2 w-full">
                                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                                                  Justificación jurídica <span className="text-destructive">*</span>
                                                </label>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  {item.campo.esSensible && (
                                                    <Badge tone="danger" appearance="soft" size="sm" className="text-[10px] gap-1 font-semibold">
                                                      <ShieldAlert className="size-3" /> Tratamiento especial LOPDP
                                                    </Badge>
                                                  )}
                                                  <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                                                    Revisión DPI
                                                  </Badge>
                                                </div>
                                              </div>
                                              <Textarea
                                                className={cn(
                                                  "w-full rounded-xl min-h-[95px] text-xs sm:text-sm bg-background",
                                                  item.campo.esSensible ? "border-danger/40" : "border-warning/40"
                                                )}
                                                placeholder={`Indique la norma aplicable y su relación con el acceso al campo ${item.campo.nombre}...`}
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
                                              <AyudaPermanenteCampoBN07
                                                tipoCampoFormulario="justificacion"
                                                clasificacion={item.campo.clasificacion}
                                                esSensible={item.campo.esSensible}
                                                codigoParametro={ayudaCampo.justificacion.codigoParametro}
                                                titulo={ayudaCampo.justificacion.titulo}
                                                criterioOrientacion={ayudaCampo.justificacion.criterioOrientacion}
                                                instruccion={ayudaCampo.justificacion.instruccion}
                                                ejemploReferencial={ayudaCampo.justificacion.ejemploReferencial}
                                                mostrarEjemplo={configAyudaBN07.mostrarEjemplosReferenciales}
                                                esProvisional={ayudaCampo.justificacion.esProvisional}
                                                etiquetaProvisional={ayudaCampo.justificacion.etiquetaProvisional}
                                                tieneOverrideCampo={ayudaCampo.justificacion.tieneOverrideCampo}
                                                campoNombre={item.campo.nombre}
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
                  </div>

                  {/* Barra de navegación inferior del Paso 3 */}
                  <div className="p-4 sm:p-6 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                    <Button variant="neutral" size="sm" onClick={prevStep} className="gap-2">
                      <ArrowLeft className="size-4" />
                      Atrás
                    </Button>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGuardarBorrador}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <FileText className="size-4" />
                        <span>Guardar como borrador</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={nextStep}
                        disabled={!isStep3Valid}
                        className="gap-2 text-xs font-semibold"
                      >
                        <span>Siguiente: Revisar y enviar</span>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4: REVISAR Y ENVIAR */}
              {step === 4 && (
                <div className="flex flex-col w-full" id="resumen-step">
                  {/* Cabecera de Sección IV */}
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-heading text-base font-bold text-primary leading-snug">
                            Sección IV — Revisión Integral y Envío de la Solicitud
                          </h2>
                          <Badge tone="info" appearance="soft" size="sm" className="font-semibold text-[10px]">
                            Trámite de Interoperabilidad
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Verifique toda la información y justificaciones ingresadas antes del envío formal a Gestión DINARP.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge tone="success" appearance="soft" size="sm" className="font-semibold px-2.5 py-1 gap-1">
                        <Check className="size-3" /> Lista para envío
                      </Badge>
                    </div>
                  </div>

                  {/* Cuerpo del Paso 4 */}
                  <div className="p-4 sm:p-6 flex flex-col gap-6 w-full">
                    {/* 4.1 Proyecto, modalidad, cupo y documentos */}
                    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-bold text-xs shrink-0">
                            4.1
                          </span>
                          <div>
                            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">
                              Proyecto institucional, modalidad y respaldo
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Datos institucionales consolidados para emisión y revisión en Gestión y DPI
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep(1)}
                          className="h-7 px-2.5 text-caption text-primary hover:text-primary shrink-0 w-fit"
                        >
                          Editar paso 1
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs w-full">
                        <div className="p-3.5 rounded-xl bg-muted/25 border border-border/60">
                          <span className="text-muted-foreground block text-[11px] mb-0.5">Proyecto institucional:</span>
                          <strong className="text-foreground text-xs sm:text-sm truncate block" title={activeProyecto.nombre}>
                            {activeProyecto.nombre}
                          </strong>
                          <span className="text-[10px] text-muted-foreground">Ministerio de Salud Pública ({activeProyecto.id})</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/25 border border-border/60">
                          <span className="text-muted-foreground block text-[11px] mb-0.5">Fuente seleccionada:</span>
                          <strong className="text-foreground text-xs sm:text-sm truncate block" title={activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}>
                            {activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}
                          </strong>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {selectedCamposDetails[0]?.servicioNombre || "Consulta de Datos de Identidad"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/25 border border-border/60">
                          <span className="text-muted-foreground block text-[11px] mb-0.5">Modalidad y cupo:</span>
                          <strong className="text-foreground text-xs sm:text-sm truncate block">
                            {modalidadSolicitada}
                          </strong>
                          <span className="text-[10px] text-muted-foreground">Cupo: {cupoSolicitado} reg./mes</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/25 border border-border/60">
                          <span className="text-muted-foreground block text-[11px] mb-0.5">Documentos adjuntos ({documentosAdjuntos.length}):</span>
                          <div className="flex items-center gap-1.5 text-foreground font-semibold">
                            <FileText className="size-3.5 text-primary shrink-0" />
                            <span className="truncate">{documentosAdjuntos[0]?.nombre || "Oficio_Solicitud_Acceso.pdf"}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Respaldo técnico-jurídico</span>
                        </div>
                      </div>
                    </div>

                    {/* 4.2 Campos seleccionados */}
                    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-bold text-xs shrink-0">
                            4.2
                          </span>
                          <div>
                            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">
                              Fuente y campos seleccionados ({selectedCamposDetails.length})
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Institución: <strong className="text-foreground font-semibold">{activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}</strong>
                              {selectedCamposDetails[0]?.servicioNombre && (
                                <span className="text-muted-foreground font-normal"> · Fuente: <strong className="text-foreground font-semibold">{selectedCamposDetails[0].servicioNombre}</strong></span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep(2)}
                          className="h-7 px-2.5 text-caption text-primary hover:text-primary shrink-0 w-fit"
                        >
                          Editar paso 2
                        </Button>
                      </div>

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
                            className={cn(
                              "flex items-center justify-between p-3.5 rounded-xl border gap-3",
                              item.campo.clasificacion === "Confidencial" && item.campo.esSensible
                                ? "border-2 border-danger/55 bg-danger/10 dark:bg-danger-900/20"
                                : "border-border/80 bg-muted/20"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-mono font-bold text-xs text-foreground truncate">
                                {item.campo.nombre}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {item.campo.descripcion}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap justify-end shrink-0">
                              <Badge
                                tone={item.campo.clasificacion === "Confidencial" ? "warning" : "success"}
                                appearance="soft"
                                size="sm"
                                className="gap-1 inline-flex font-semibold shrink-0"
                              >
                                {item.campo.clasificacion === "Confidencial" ? (
                                  <Lock className="size-3" />
                                ) : (
                                  <Unlock className="size-3" />
                                )}
                                {item.campo.clasificacion.toUpperCase()}
                              </Badge>
                              {item.campo.clasificacion === "Confidencial" && item.campo.esSensible && (
                                <Badge
                                  tone="danger"
                                  appearance="solid"
                                  size="sm"
                                  className="gap-1 inline-flex font-bold shrink-0"
                                >
                                  <ShieldAlert className="size-3" />
                                  SENSIBLE · LOPDP
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4.3 Justificaciones declaradas */}
                    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-bold text-xs shrink-0">
                            4.3
                          </span>
                          <div>
                            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">
                              Finalidad de uso y justificación jurídica declaradas ({selectedCamposDetails.length})
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Finalidad de uso (campos accesibles) y justificación jurídica (campos confidenciales)
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep(3)}
                          className="h-7 px-2.5 text-caption text-primary hover:text-primary shrink-0 w-fit"
                        >
                          Editar paso 3
                        </Button>
                      </div>

                      <div className="flex flex-col gap-3.5 w-full">
                        {selectedCamposDetails.map((item) => (
                          <div
                            key={`p2-res-${item.fuenteId}-${item.campo.id}`}
                            className={cn(
                              "p-4 space-y-3 rounded-xl w-full",
                              item.campo.clasificacion === "Confidencial" && item.campo.esSensible
                                ? "border-2 border-danger/55 bg-danger/5 dark:bg-danger-900/15"
                                : "border border-border/80 bg-muted/10"
                            )}
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
                              <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                                <Badge
                                  tone={item.campo.clasificacion === "Confidencial" ? "warning" : "success"}
                                  appearance="soft"
                                  size="sm"
                                  className="gap-1 inline-flex font-semibold shrink-0"
                                >
                                  {item.campo.clasificacion === "Confidencial" ? (
                                    <Lock className="size-3" />
                                  ) : (
                                    <Unlock className="size-3" />
                                  )}
                                  {item.campo.clasificacion.toUpperCase()}
                                </Badge>
                                {item.campo.clasificacion === "Confidencial" && item.campo.esSensible && (
                                  <Badge
                                    tone="danger"
                                    appearance="solid"
                                    size="sm"
                                    className="gap-1 inline-flex font-bold shrink-0"
                                  >
                                    <ShieldAlert className="size-3" />
                                    SENSIBLE · LOPDP
                                  </Badge>
                                )}
                              </div>
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
                                    <Scale className="size-3.5 text-warning" />
                                    Justificación jurídica requerida
                                  </label>
                                  <Textarea
                                    disabled
                                    className="w-full rounded-xl min-h-[75px] text-xs sm:text-sm bg-background border-warning/30 opacity-90 cursor-not-allowed"
                                    value={justificaciones[item.campo.id]?.fundamento || "Art. 89 del Código Orgánico de la Economía Social de los Conocimientos y Ley Orgánica de Protección de Datos Personales."}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4.4 Resumen de la subsanación (Solo modo Subsanación) */}
                    {esModoSubsanacion && (
                      <div className="w-full rounded-2xl border-2 border-warning/40 bg-warning/5 dark:bg-warning-950/20 p-4 sm:p-5 shadow-2xs flex flex-col gap-4 animate-in fade-in duration-150">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-warning/20 gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center justify-center size-6 rounded-md bg-warning/20 text-warning font-bold text-xs shrink-0">
                              4.4
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">
                                  Resumen de la subsanación realizada para el Revisor (SOL-05)
                                </h3>
                                <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-[10px]">
                                  Obligatorio
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Describa las correcciones aplicadas en el expediente en respuesta a las observaciones de Gestión y DPI
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recordatorio de observaciones previas */}
                        {targetSolicitud && (
                          <div className="p-3.5 rounded-xl bg-surface/80 border border-warning/30 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-warning">
                              <AlertTriangle className="size-3.5 shrink-0" />
                              <span>Observación a subsanar:</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] leading-relaxed">
                              {targetSolicitud.motivoRechazo || targetSolicitud.observaciones || "Ajuste de justificaciones o campos observados."}
                            </p>
                          </div>
                        )}

                        <div className="space-y-1.5 w-full">
                          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                            <span>Detalle de correcciones realizadas <span className="text-destructive">*</span></span>
                            <span className="text-[11px] text-muted-foreground font-normal">
                              {comentarioSubsanacion.length} caracteres
                            </span>
                          </label>
                          <Textarea
                            className="w-full rounded-xl min-h-[100px] text-xs sm:text-sm bg-background border-warning/40 focus-visible:ring-warning"
                            placeholder="Ej: Se ajustó la finalidad de uso para el campo cedulaCiudadania especificando el proceso institucional de registro de matrículas y se fundamentó el campo confidencial con el Art. 47 LOEI..."
                            value={comentarioSubsanacion}
                            onChange={(e) => setComentarioSubsanacion(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Barra de navegación inferior del Paso 4 */}
                  <div className="p-4 sm:p-6 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                    <Button variant="neutral" size="sm" onClick={prevStep} className="gap-2">
                      <ArrowLeft className="size-4" />
                      Volver a editar
                    </Button>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      {esModoSubsanacion ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              if (onCancel) {
                                onCancel();
                              } else if (targetSolicitud?.id) {
                                router.push(`/acceso-interoperabilidad/solicitudes/${targetSolicitud.id}`);
                              } else {
                                router.push("/acceso-interoperabilidad/solicitudes");
                              }
                            }}
                            className="gap-1.5 text-xs font-semibold"
                          >
                            <X className="size-4" />
                            <span>Cancelar subsanación</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsModalConfirmacionOpen(true)}
                            id="btn-subsanar-reenviar"
                            disabled={!comentarioSubsanacion.trim()}
                            className="gap-2 text-xs font-semibold shadow-sm"
                          >
                            <RotateCcw className="size-4" />
                            <span>Subsanar y reenviar a Gestión (SOL-05)</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleGuardarBorrador}
                            className="gap-1.5 text-xs font-semibold"
                          >
                            <FileText className="size-4" />
                            <span>Guardar como borrador</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsModalConfirmacionOpen(true)}
                            id="btn-enviar-solicitud"
                            className="gap-2 text-xs font-semibold shadow-sm"
                          >
                            <Send className="size-4" />
                            <span>Crear y enviar solicitud</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* MODAL DE CONFIRMACIÓN: ENVÍO / SUBSANACIÓN */}
                  <Dialog open={isModalConfirmacionOpen} onOpenChange={setIsModalConfirmacionOpen}>
                    <DialogContent
                      variant="success"
                      size="lg"
                      className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                      icon={<Check className="size-10 text-success stroke-[2px]" />}
                    >
                      <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
                        <DialogTitle className="font-heading text-xl font-bold text-foreground">
                          {esModoSubsanacion
                            ? "Confirmar reenvío de expediente subsanado (SOL-05)"
                            : "Solicitud lista para enviarse a Gestión"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                          {esModoSubsanacion
                            ? `El expediente pasará a la versión v${(targetSolicitud?.versionExpediente || 1) + 1} y retornará a la bandeja de Gestión DINARP para validación y reasignación de revisión.`
                            : "Tu solicitud será radicada y enviada formalmente a la bandeja de la Dirección de Gestión DINARP para su asignación y revisión (SOL-01)."}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3 w-full flex-1 min-h-0 text-left">
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Proyecto activo:</span>
                            <strong className="text-foreground truncate max-w-[200px]">{activeProyecto.nombre}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fuente:</span>
                            <strong className="text-foreground truncate max-w-[200px]">
                              {activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Modalidad / Cupo:</span>
                            <strong className="text-foreground truncate max-w-[200px]">
                              {modalidadSolicitada} · {cupoSolicitado} reg./mes
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Campos solicitados:</span>
                            <strong className="text-foreground">{selectedCamposDetails.length} campo(s)</strong>
                          </div>
                          {esModoSubsanacion && targetSolicitud && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nueva versión:</span>
                              <Badge tone="warning" appearance="soft" size="sm" className="font-semibold">
                                v{(targetSolicitud.versionExpediente || 1) + 1} (Subsanación)
                              </Badge>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estado resultante:</span>
                            <Badge tone="info" appearance="soft" size="sm">
                              {esModoSubsanacion ? "Pendiente de nueva asignación en Gestión" : "Pendiente de asignación en Gestión"}
                            </Badge>
                          </div>
                        </div>

                        {esModoSubsanacion && comentarioSubsanacion && (
                          <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs space-y-1">
                            <span className="font-semibold text-warning block">Comentario de subsanación:</span>
                            <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-3">
                              {comentarioSubsanacion}
                            </p>
                          </div>
                        )}
                      </div>

                      <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
                        <Button
                          variant="ghost"
                          onClick={() => setIsModalConfirmacionOpen(false)}
                          className="w-full sm:w-1/2 font-semibold"
                        >
                          Seguir revisando
                        </Button>
                        <Button
                          variant={esModoSubsanacion ? "primary" : "success"}
                          onClick={() => {
                            const fuenteNombre = activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Dirección General de Registro Civil, Identificación y Cedulación");
                            const servicioNombre = selectedCamposDetails[0]?.servicioNombre || "Consulta de Datos de Identidad";
                            const fuentesActualizadas: FuenteDetalle[] = [
                              {
                                id: activeFuente?.id || targetSolicitud?.fuentes?.[0]?.id || "f-regciv",
                                nombre: fuenteNombre,
                                institucion: fuenteNombre,
                                campos: selectedCamposDetails.map(c => ({
                                  id: c.campo.id,
                                  nombre: c.campo.nombre,
                                  descripcion: c.campo.descripcion || "",
                                  tipo: c.campo.tipo,
                                  clasificacion: (c.campo.clasificacion === "Confidencial" ? "Confidencial" : "Accesible") as "Accesible" | "Confidencial",
                                  esSensible: Boolean(c.campo.esSensible),
                                  etiquetaSensibilidad: c.campo.esSensible ? "Sensible" : undefined,
                                  finalidad: justificaciones[c.campo.id]?.finalidad || "Finalidad institucional requerida.",
                                  fundamento: justificaciones[c.campo.id]?.fundamento || (c.campo.clasificacion === "Confidencial" ? "Base legal de interoperabilidad." : undefined)
                                }))
                              }
                            ];

                            if (esModoSubsanacion) {
                              if (onReenviar) {
                                onReenviar(comentarioSubsanacion, fuentesActualizadas);
                              } else if (targetSolicitud?.id) {
                                subsanarYReenviar(targetSolicitud.id, {
                                  comentario: comentarioSubsanacion,
                                  fuentesActualizadas,
                                  modalidad: modalidadSolicitada,
                                  cupo: cupoSolicitado,
                                  documentos: documentosAdjuntos,
                                });
                              }
                              setIsModalConfirmacionOpen(false);
                              toast.success(`Expediente subsanado y reenviado exitosamente a Gestión DINARP (v${(targetSolicitud?.versionExpediente || 1) + 1})`);
                              router.push("/acceso-interoperabilidad/solicitudes");
                            } else {
                              crearNuevaSolicitud({
                                institucion: "Ministerio de Salud Pública",
                                tipoInstitucion: "Pública",
                                proyectoId: activeProyecto.id,
                                proyectoNombre: activeProyecto.nombre,
                                modalidad: modalidadSolicitada,
                                cupo: cupoSolicitado,
                                estado: "Por revisar",
                                documentos: documentosAdjuntos,
                                fuentePrincipal: fuenteNombre,
                                servicioPrincipal: servicioNombre,
                                camposCount: selectedCamposDetails.length,
                                fuentes: fuentesActualizadas,
                              });
                              setIsModalConfirmacionOpen(false);
                              toast.success("Solicitud creada y enviada exitosamente a Gestión DINARP");
                              router.push("/acceso-interoperabilidad/solicitudes");
                            }
                          }}
                          className="w-full sm:w-1/2 font-bold shadow-xs"
                        >
                          {esModoSubsanacion ? "Subsanar y reenviar" : "Confirmar y Enviar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </Card>
        </main>
      </WireframeDashboardLayout>
    </TooltipProvider>
  );
}
