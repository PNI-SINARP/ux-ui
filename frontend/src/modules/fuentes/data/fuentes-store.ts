"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FuenteDatos,
  FUENTES_INICIALES,
  EstadoFuente,
  ClasificacionCampo,
  CampoFuente,
  ParametroConsulta,
  ConfiguracionConexion,
  TrazabilidadEvento,
} from "./fuentes-data";

const STORAGE_KEY = "dinarp_fuentes_v1";
const EVENT_CHANGE = "dinarp_fuentes_changed";

export function getStoredFuentes(): FuenteDatos[] {
  if (typeof window === "undefined") return FUENTES_INICIALES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(FUENTES_INICIALES));
      return FUENTES_INICIALES;
    }
    return JSON.parse(raw) as FuenteDatos[];
  } catch (err) {
    console.error("Error reading fuentes from localStorage:", err);
    return FUENTES_INICIALES;
  }
}

export function saveStoredFuentes(data: FuenteDatos[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_CHANGE));
  } catch (err) {
    console.error("Error saving fuentes to localStorage:", err);
  }
}

export interface CrearFuenteInput {
  nombre: string;
  descripcion_fuente: string;
  version_propuesta: string;
  id_institucion_proveedora: string;
  institucion_proveedora_nombre: string;
  id_coordinador_registrador: string;
  coordinador_nombre: string;
  disponibilidad_objetivo: number;
  tiempo_maximo_respuesta_ms: number;
  modalidades_soportadas: "API individual" | "API masiva" | "Ambas modalidades";
  formato_respuesta: "application/json" | "application/xml";
  tipo_dato_pruebas: "Sintético" | "Anonimizado" | "Real" | "Indeterminado";
  parametros_consulta: ParametroConsulta[];
  conexion: ConfiguracionConexion;
  campos: CampoFuente[];
  enviarInmediato?: boolean;
}

export function useFuentesStore() {
  const [fuentes, setFuentes] = useState<FuenteDatos[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(() => {
    setFuentes(getStoredFuentes());
  }, []);

  useEffect(() => {
    reload();
    setIsLoaded(true);

    const handleStorageChange = () => {
      reload();
    };

    window.addEventListener(EVENT_CHANGE, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_CHANGE, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [reload]);

  const getFuentesPorInstitucion = useCallback(
    (institucion?: string): FuenteDatos[] => {
      if (!institucion || institucion === "ALL" || institucion.toLowerCase() === "dinarp") {
        return fuentes;
      }
      return fuentes.filter(
        (f) => f.institucion_proveedora_nombre.toLowerCase() === institucion.toLowerCase()
      );
    },
    [fuentes]
  );

  const getFuenteById = useCallback(
    (id: string): FuenteDatos | undefined => {
      return fuentes.find((f) => f.id.toLowerCase() === id.toLowerCase());
    },
    [fuentes]
  );

  const crearFuente = useCallback(
    (input: CrearFuenteInput): FuenteDatos => {
      const current = getStoredFuentes();
      const codeNumber = current.length + 1;
      const id = `FUE-2026-${String(codeNumber).padStart(3, "0")}`;
      const now = new Date().toISOString();

      const estadoInicial: EstadoFuente = input.enviarInmediato ? "EN_REVISION" : "BORRADOR";

      const eventos: TrazabilidadEvento[] = [
        {
          id_evento: `EVT-${Date.now()}-01`,
          fecha: now,
          actor: input.coordinador_nombre,
          rol: "Coordinador SINARP",
          accion: "Registro y configuración de fuente (FUE-01/FUE-02/FUE-03)",
          estado_resultante: input.enviarInmediato ? "EN_REVISION" : "BORRADOR",
          observaciones: input.enviarInmediato
            ? "Configuración técnica completada y enviada a revisión de Gestión."
            : "Borrador de fuente guardado en configuración.",
        },
      ];

      const nuevaFuente: FuenteDatos = {
        id,
        nombre: input.nombre.trim(),
        descripcion_fuente: input.descripcion_fuente.trim(),
        version_propuesta: input.version_propuesta.trim() || "v1.0.0",
        id_institucion_proveedora: input.id_institucion_proveedora,
        institucion_proveedora_nombre: input.institucion_proveedora_nombre,
        id_coordinador_registrador: input.id_coordinador_registrador,
        coordinador_nombre: input.coordinador_nombre,
        estado: estadoInicial,
        sla_fuente: {
          disponibilidad_objetivo: Number(input.disponibilidad_objetivo) || 99.5,
          tiempo_maximo_respuesta_ms: Number(input.tiempo_maximo_respuesta_ms) || 300,
        },
        modalidades_soportadas: input.modalidades_soportadas,
        formato_respuesta: input.formato_respuesta,
        tipo_dato_pruebas: input.tipo_dato_pruebas,
        parametros_consulta: input.parametros_consulta,
        conexion: input.conexion,
        campos: input.campos,
        historial: eventos,
        fecha_creacion: now,
        fecha_actualizacion: now,
      };

      const updated = [nuevaFuente, ...current];
      saveStoredFuentes(updated);
      setFuentes(updated);
      return nuevaFuente;
    },
    []
  );

  const actualizarFuente = useCallback(
    (id: string, updates: Partial<FuenteDatos>, eventoLog?: { actor: string; accion: string; rol?: string; observaciones?: string }) => {
      const current = getStoredFuentes();
      const index = current.findIndex((f) => f.id.toLowerCase() === id.toLowerCase());
      if (index === -1) return false;

      const now = new Date().toISOString();
      const target = current[index];

      const updatedHistorial = [...target.historial];
      if (eventoLog) {
        updatedHistorial.push({
          id_evento: `EVT-${Date.now()}`,
          fecha: now,
          actor: eventoLog.actor,
          rol: eventoLog.rol || "Coordinador SINARP",
          accion: eventoLog.accion,
          estado_resultante: updates.estado || target.estado,
          observaciones: eventoLog.observaciones,
        });
      }

      const updatedFuente: FuenteDatos = {
        ...target,
        ...updates,
        historial: updatedHistorial,
        fecha_actualizacion: now,
      };

      const updatedList = [...current];
      updatedList[index] = updatedFuente;
      saveStoredFuentes(updatedList);
      setFuentes(updatedList);
      return true;
    },
    []
  );

  const enviarARevision = useCallback(
    (id: string, actor: string, rol = "Coordinador SINARP") => {
      return actualizarFuente(
        id,
        { estado: "EN_REVISION" },
        {
          actor,
          rol,
          accion: "Envío a revisión de Gestión (FUE-03)",
          observaciones: "Configuración corregida/actualizada y reenviada para clasificación de campos.",
        }
      );
    },
    [actualizarFuente]
  );

  const clasificarCampo = useCallback(
    (fuenteId: string, campoId: string, clasificacion: ClasificacionCampo) => {
      const current = getStoredFuentes();
      const fIndex = current.findIndex((f) => f.id.toLowerCase() === fuenteId.toLowerCase());
      if (fIndex === -1) return false;

      const fuente = current[fIndex];
      const updatedCampos = fuente.campos.map((c) =>
        c.id_campo === campoId ? { ...c, clasificacion } : c
      );

      const updatedFuente = {
        ...fuente,
        campos: updatedCampos,
        fecha_actualizacion: new Date().toISOString(),
      };

      const updatedList = [...current];
      updatedList[fIndex] = updatedFuente;
      saveStoredFuentes(updatedList);
      setFuentes(updatedList);
      return true;
    },
    []
  );

  const clasificarTodosCampos = useCallback(
    (fuenteId: string, clasificaciones: Record<string, ClasificacionCampo>) => {
      const current = getStoredFuentes();
      const fIndex = current.findIndex((f) => f.id.toLowerCase() === fuenteId.toLowerCase());
      if (fIndex === -1) return false;

      const fuente = current[fIndex];
      const updatedCampos = fuente.campos.map((c) => ({
        ...c,
        clasificacion: clasificaciones[c.id_campo] || c.clasificacion || null,
      }));

      const updatedFuente = {
        ...fuente,
        campos: updatedCampos,
        fecha_actualizacion: new Date().toISOString(),
      };

      const updatedList = [...current];
      updatedList[fIndex] = updatedFuente;
      saveStoredFuentes(updatedList);
      setFuentes(updatedList);
      return true;
    },
    []
  );

  const aprobarFuente = useCallback(
    (fuenteId: string, revisor: string, observaciones?: string) => {
      const current = getStoredFuentes();
      const fIndex = current.findIndex((f) => f.id.toLowerCase() === fuenteId.toLowerCase());
      if (fIndex === -1) return { success: false, error: "Fuente no encontrada." };

      const fuente = current[fIndex];
      // Validar que todos los campos incluidos tengan clasificación
      const camposSinClasificar = fuente.campos.filter(
        (c) => c.incluido && (!c.clasificacion || (c.clasificacion !== "Accesible" && c.clasificacion !== "Confidencial"))
      );

      if (camposSinClasificar.length > 0) {
        return {
          success: false,
          error: `Existen ${camposSinClasificar.length} campo(s) sin clasificar. Conforme a FUE-04, ningún campo puede quedar sin clasificación antes de aprobar.`,
        };
      }

      const now = new Date().toISOString();
      const obsTexto =
        observaciones?.trim() ||
        "Revisión aprobada por el Área de Gestión. Todos los campos clasificados de conformidad con la normativa de protección de datos.";

      const updatedHistorial: TrazabilidadEvento[] = [
        ...fuente.historial,
        {
          id_evento: `EVT-${Date.now()}`,
          fecha: now,
          actor: revisor,
          rol: "Equipo de Gestión",
          accion: "Aprobación de fuente y clasificación de campos (FUE-04)",
          estado_resultante: "APROBADA",
          observaciones: obsTexto,
        },
      ];

      const updatedFuente: FuenteDatos = {
        ...fuente,
        estado: "APROBADA",
        observaciones_gestion: obsTexto,
        fecha_observacion: now,
        revisor_gestion: revisor,
        historial: updatedHistorial,
        fecha_actualizacion: now,
      };

      const updatedList = [...current];
      updatedList[fIndex] = updatedFuente;
      saveStoredFuentes(updatedList);
      setFuentes(updatedList);
      return { success: true };
    },
    []
  );

  const devolverFuente = useCallback(
    (fuenteId: string, revisor: string, observaciones: string) => {
      if (!observaciones || !observaciones.trim()) {
        return {
          success: false,
          error: "Debe registrar obligatoriamente una observación antes de devolver la fuente (PAR-07).",
        };
      }

      const current = getStoredFuentes();
      const fIndex = current.findIndex((f) => f.id.toLowerCase() === fuenteId.toLowerCase());
      if (fIndex === -1) return { success: false, error: "Fuente no encontrada." };

      const fuente = current[fIndex];
      const now = new Date().toISOString();

      const updatedHistorial: TrazabilidadEvento[] = [
        ...fuente.historial,
        {
          id_evento: `EVT-${Date.now()}`,
          fecha: now,
          actor: revisor,
          rol: "Equipo de Gestión",
          accion: "Devolución con observaciones (FUE-04)",
          estado_resultante: "DEVUELTA",
          observaciones: observaciones.trim(),
        },
      ];

      const updatedFuente: FuenteDatos = {
        ...fuente,
        estado: "DEVUELTA",
        observaciones_gestion: observaciones.trim(),
        fecha_observacion: now,
        revisor_gestion: revisor,
        historial: updatedHistorial,
        fecha_actualizacion: now,
      };

      const updatedList = [...current];
      updatedList[fIndex] = updatedFuente;
      saveStoredFuentes(updatedList);
      setFuentes(updatedList);
      return { success: true };
    },
    []
  );

  const publicarFuente = useCallback(
    (fuenteId: string, actor: string) => {
      const current = getStoredFuentes();
      const fIndex = current.findIndex((f) => f.id.toLowerCase() === fuenteId.toLowerCase());
      if (fIndex === -1) return { success: false, error: "Fuente no encontrada." };

      const fuente = current[fIndex];
      if (fuente.estado !== "APROBADA") {
        return {
          success: false,
          error: "Solo una fuente en estado 'Aprobada' por Gestión puede ser publicada en el catálogo.",
        };
      }

      const now = new Date().toISOString();
      const slug = fuente.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const versionApi = "v1.0.0";
      const idDespliegue = `DSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const urlPublica = `https://api.dinarp.gob.ec/v1/${slug}`;
      const proxyEndpoint = `https://gateway.dinarp.gob.ec/proxy/${slug}-${versionApi}`;

      const updatedHistorial: TrazabilidadEvento[] = [
        ...fuente.historial,
        {
          id_evento: `EVT-${Date.now()}`,
          fecha: now,
          actor,
          rol: "Coordinador SINARP",
          accion: "Publicación de versión en catálogo y proxy Apigee (FUE-05)",
          estado_resultante: "PUBLICADA",
          observaciones: `Versión ${versionApi} publicada con éxito. Endpoint: ${urlPublica}`,
        },
      ];

      const updatedFuente: FuenteDatos = {
        ...fuente,
        estado: "PUBLICADA",
        version_api: versionApi,
        despliegue: {
          id_despliegue: idDespliegue,
          url_publica: urlPublica,
          version_api: versionApi,
          fecha_publicacion: now,
          ambiente: "Producción",
          proxy_endpoint: proxyEndpoint,
        },
        historial: updatedHistorial,
        fecha_actualizacion: now,
      };

      const updatedList = [...current];
      updatedList[fIndex] = updatedFuente;
      saveStoredFuentes(updatedList);
      setFuentes(updatedList);
      return { success: true, despliegue: updatedFuente.despliegue };
    },
    []
  );

  const restablecerDatosDemo = useCallback(() => {
    saveStoredFuentes(FUENTES_INICIALES);
    setFuentes(FUENTES_INICIALES);
  }, []);

  return {
    fuentes,
    isLoaded,
    getFuentesPorInstitucion,
    getFuenteById,
    crearFuente,
    actualizarFuente,
    enviarARevision,
    clasificarCampo,
    clasificarTodosCampos,
    aprobarFuente,
    devolverFuente,
    publicarFuente,
    restablecerDatosDemo,
  };
}
