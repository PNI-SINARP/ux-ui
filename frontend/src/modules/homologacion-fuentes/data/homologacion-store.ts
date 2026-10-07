"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HomologacionCaso,
  CASOS_HOMOLOGACION_INICIALES,
  EstadoHomologacion,
} from "@/modules/fuentes/data/fuentes-data";
import { getStoredFuentes, saveStoredFuentes } from "@/modules/fuentes/data/fuentes-store";

const STORAGE_KEY = "dinarp_homologaciones_v1";
const EVENT_CHANGE = "dinarp_homologaciones_changed";

export function getStoredCasos(): HomologacionCaso[] {
  if (typeof window === "undefined") return CASOS_HOMOLOGACION_INICIALES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CASOS_HOMOLOGACION_INICIALES));
      return CASOS_HOMOLOGACION_INICIALES;
    }
    return JSON.parse(raw) as HomologacionCaso[];
  } catch (err) {
    console.error("Error reading homologaciones from localStorage:", err);
    return CASOS_HOMOLOGACION_INICIALES;
  }
}

export function saveStoredCasos(data: HomologacionCaso[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_CHANGE));
  } catch (err) {
    console.error("Error saving homologaciones to localStorage:", err);
  }
}

export function useHomologacionStore() {
  const [casos, setCasos] = useState<HomologacionCaso[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(() => {
    setCasos(getStoredCasos());
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

  const getCasoById = useCallback(
    (id: string): HomologacionCaso | undefined => {
      return casos.find((c) => c.id_caso.toLowerCase() === id.toLowerCase());
    },
    [casos]
  );

  const crearCaso = useCallback(
    (input: {
      fuenteId?: string;
      fuenteNombre: string;
      institucionNombre: string;
      tecnologia: string;
      protocolo?: string;
      diagnostico?: string;
    }): HomologacionCaso => {
      const current = getStoredCasos();
      const codeNum = current.length + 1;
      const idCaso = `HOM-2026-${String(codeNum).padStart(3, "0")}`;
      const now = new Date().toISOString();

      const nuevoCaso: HomologacionCaso = {
        id_caso: idCaso,
        id_fuente: input.fuenteId,
        fuente_nombre: input.fuenteNombre,
        institucion_nombre: input.institucionNombre,
        tecnologia_solicitada: input.tecnologia,
        protocolo: input.protocolo || "Protocolo TCP/IP propietario",
        diagnostico:
          input.diagnostico ||
          `Solicitud de homologación FUE-12 ingresada por la institución proveedora para tecnología ${input.tecnologia}. Pendiente asignación técnica en laboratorio DINARP.`,
        responsable_ti: "Ing. Gabriel Flores (Equipo TI DINARP)",
        estado: "En homologación",
        fecha_solicitud: now,
        fecha_actualizacion: now,
        evidencias_pruebas: [
          `Solicitud registrada automáticamente desde el asistente FUE-12.`,
          `Asignada al pool de homologación de conectores CNX-01/02.`,
        ],
      };

      const updated = [nuevoCaso, ...current];
      saveStoredCasos(updated);
      setCasos(updated);
      return nuevoCaso;
    },
    []
  );

  const aprobarHomologacion = useCallback(
    (casoId: string, tipoConectorGenerado: string, responsable: string) => {
      const current = getStoredCasos();
      const idx = current.findIndex((c) => c.id_caso.toLowerCase() === casoId.toLowerCase());
      if (idx === -1) return { success: false, error: "Caso no encontrado." };

      const target = current[idx];
      const now = new Date().toISOString();

      const updatedCaso: HomologacionCaso = {
        ...target,
        estado: "Homologado",
        responsable_ti: responsable,
        tipo_conector_generado: tipoConectorGenerado,
        fecha_actualizacion: now,
        evidencias_pruebas: [
          ...(target.evidencias_pruebas || []),
          `Homologación técnica Aprobada por ${responsable}. Conector homologado registrado: ${tipoConectorGenerado} (CNX-01/02).`,
        ],
      };

      const updatedCasos = [...current];
      updatedCasos[idx] = updatedCaso;
      saveStoredCasos(updatedCasos);
      setCasos(updatedCasos);

      // Si tiene fuente vinculada, actualizar el estado de la fuente a CONEXION_PENDIENTE
      if (target.id_fuente) {
        const fuentes = getStoredFuentes();
        const fIdx = fuentes.findIndex((f) => f.id.toLowerCase() === target.id_fuente?.toLowerCase());
        if (fIdx !== -1) {
          const f = fuentes[fIdx];
          const updatedF = {
            ...f,
            estado: "CONEXION_PENDIENTE" as const,
            caso_homologacion: {
              id_caso: target.id_caso,
              tecnologia: target.tecnologia_solicitada,
              fecha_solicitud: target.fecha_solicitud,
              estado: "Homologado" as EstadoHomologacion,
              responsable_ti: responsable,
            },
            historial: [
              ...f.historial,
              {
                id_evento: `EVT-${Date.now()}-HOM`,
                fecha: now,
                actor: responsable,
                rol: "Equipo TI DINARP",
                accion: "Aprobación de homologación técnica (FUE-12 / CNX-01)",
                estado_resultante: "CONEXION_PENDIENTE" as const,
                observaciones: `Conector ${tipoConectorGenerado} homologado exitosamente. Se desbloquea la configuración de conexión.`,
              },
            ],
            fecha_actualizacion: now,
          };
          fuentes[fIdx] = updatedF;
          saveStoredFuentes(fuentes);
        }
      }

      return { success: true };
    },
    []
  );

  const rechazarHomologacion = useCallback(
    (casoId: string, motivo: string, responsable: string) => {
      const current = getStoredCasos();
      const idx = current.findIndex((c) => c.id_caso.toLowerCase() === casoId.toLowerCase());
      if (idx === -1) return { success: false, error: "Caso no encontrado." };

      const target = current[idx];
      const now = new Date().toISOString();

      const updatedCaso: HomologacionCaso = {
        ...target,
        estado: "No homologado",
        motivo_rechazo: motivo,
        responsable_ti: responsable,
        fecha_actualizacion: now,
        evidencias_pruebas: [
          ...(target.evidencias_pruebas || []),
          `Homologación rechazada por ${responsable}. Motivo: ${motivo}`,
        ],
      };

      const updatedCasos = [...current];
      updatedCasos[idx] = updatedCaso;
      saveStoredCasos(updatedCasos);
      setCasos(updatedCasos);

      return { success: true };
    },
    []
  );

  const reintentarHomologacion = useCallback((casoId: string) => {
    const current = getStoredCasos();
    const idx = current.findIndex((c) => c.id_caso.toLowerCase() === casoId.toLowerCase());
    if (idx === -1) return { success: false, error: "Caso no encontrado." };

    const target = current[idx];
    const now = new Date().toISOString();

    const updatedCaso: HomologacionCaso = {
      ...target,
      estado: "En homologación",
      fecha_actualizacion: now,
      evidencias_pruebas: [
        ...(target.evidencias_pruebas || []),
        `Reapertura de pruebas técnicas de homologación solicitada el ${new Date().toLocaleDateString()}.`,
      ],
    };

    const updatedCasos = [...current];
    updatedCasos[idx] = updatedCaso;
    saveStoredCasos(updatedCasos);
    setCasos(updatedCasos);

    return { success: true };
  }, []);

  const restablecerDatosDemo = useCallback(() => {
    saveStoredCasos(CASOS_HOMOLOGACION_INICIALES);
    setCasos(CASOS_HOMOLOGACION_INICIALES);
  }, []);

  return {
    casos,
    isLoaded,
    getCasoById,
    crearCaso,
    aprobarHomologacion,
    rechazarHomologacion,
    reintentarHomologacion,
    restablecerDatosDemo,
  };
}
