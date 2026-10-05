"use client";

import { useState, useEffect, useCallback } from "react";

export interface SolicitudVinculada {
  id: string;
  fuentePrincipal: string;
  servicioPrincipal: string;
  estado: string;
  fecha: string;
  coordinador?: string;
  camposCount?: number;
}

export interface HistorialVersionProyecto {
  version: number;
  fecha: string;
  nombre: string;
  proposito: string;
  modificadoPor: string;
}

export interface ProyectoInstitucional {
  id: string;
  nombre: string;
  proposito: string;
  institucion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  version: number;
  creadoPor: string;
  solicitudes: SolicitudVinculada[];
  historialVersiones: HistorialVersionProyecto[];
}

const STORAGE_KEY = "dinarp_proyectos_v1";

export const INITIAL_PROYECTOS: ProyectoInstitucional[] = [
  {
    id: "PRJ-2026-001",
    nombre: "Sistema Único de Registro y Matrícula Estudiantil",
    proposito: "Integración e interoperabilidad de registros de identidad civil y validación de filiación con el Registro Civil para automatizar el proceso de matrícula escolar a nivel nacional y reducir trámites presenciales.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-08-14 09:30",
    fechaActualizacion: "2026-08-14 09:30",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-001",
        fuentePrincipal: "Registro Civil de Ciudadanos",
        servicioPrincipal: "Validación de Identidad y Filiación",
        estado: "Acceso generado",
        fecha: "2026-08-15 09:00",
        camposCount: 3,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-08-14 09:30",
        nombre: "Sistema Único de Registro y Matrícula Estudiantil",
        proposito: "Integración e interoperabilidad de registros de identidad civil y validación de filiación con el Registro Civil para automatizar el proceso de matrícula escolar a nivel nacional y reducir trámites presenciales.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-002",
    nombre: "Plataforma Nacional de Validación de Títulos y Certificaciones",
    proposito: "Habilitar la consulta automatizada y verificación en tiempo real de títulos de bachillerato y actas de grado para instituciones de educación superior y empleadores públicos del sector productivo.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-09-02 11:20",
    fechaActualizacion: "2026-09-18 16:45",
    version: 2,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-09-02 11:20",
        nombre: "Plataforma Nacional de Validación de Títulos",
        proposito: "Habilitar la consulta automatizada y verificación de títulos de bachillerato.",
        modificadoPor: "Mariana Almeida",
      },
      {
        version: 2,
        fecha: "2026-09-18 16:45",
        nombre: "Plataforma Nacional de Validación de Títulos y Certificaciones",
        proposito: "Habilitar la consulta automatizada y verificación en tiempo real de títulos de bachillerato y actas de grado para instituciones de educación superior y empleadores públicos del sector productivo.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-003",
    nombre: "Interoperabilidad de Datos para Alimentación Escolar y Salud Preventiva",
    proposito: "Cruce interinstitucional de datos antropométricos y de salud con el Ministerio de Salud Pública para focalización oportuna de programas de nutrición en unidades educativas rurales y urbano marginales.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-09-25 15:00",
    fechaActualizacion: "2026-09-25 15:00",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-09-25 15:00",
        nombre: "Interoperabilidad de Datos para Alimentación Escolar y Salud Preventiva",
        proposito: "Cruce interinstitucional de datos antropométricos y de salud con el Ministerio de Salud Pública para focalización oportuna de programas de nutrición en unidades educativas rurales y urbano marginales.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-004",
    nombre: "Modernización de Identificación Digital Ciudadana",
    proposito: "Proveer servicios interoperables de cotejo de identidad y verificación de defunciones a entidades públicas autorizadas del sector social y financiero.",
    institucion: "Dirección General de Registro Civil",
    fechaCreacion: "2026-09-10 08:45",
    fechaActualizacion: "2026-09-10 08:45",
    version: 1,
    creadoPor: "Andrea López",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-09-10 08:45",
        nombre: "Modernización de Identificación Digital Ciudadana",
        proposito: "Proveer servicios interoperables de cotejo de identidad y verificación de defunciones a entidades públicas autorizadas del sector social y financiero.",
        modificadoPor: "Andrea López",
      },
    ],
  },
];

export function getStoredProyectos(): ProyectoInstitucional[] {
  if (typeof window === "undefined") return INITIAL_PROYECTOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROYECTOS));
      return INITIAL_PROYECTOS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading proyectos from localStorage:", err);
    return INITIAL_PROYECTOS;
  }
}

export function saveStoredProyectos(data: ProyectoInstitucional[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving proyectos to localStorage:", err);
  }
}

export interface CrearProyectoPayload {
  nombre: string;
  proposito: string;
  institucion: string;
  creadoPor: string;
}

export interface ActualizarProyectoPayload {
  nombre: string;
  proposito: string;
  modificadoPor: string;
}

export interface StoreResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useProyectosStore() {
  const [proyectos, setProyectos] = useState<ProyectoInstitucional[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredProyectos();
    setProyectos(stored);
    setIsLoaded(true);
  }, []);

  const getProyectosPorInstitucion = useCallback(
    (institucion?: string): ProyectoInstitucional[] => {
      if (!institucion || institucion === "ALL" || institucion === "DINARP") {
        return proyectos;
      }
      return proyectos.filter(
        (p) => p.institucion.toLowerCase() === institucion.toLowerCase()
      );
    },
    [proyectos]
  );

  const getProyectoById = useCallback(
    (id: string): ProyectoInstitucional | undefined => {
      return proyectos.find((p) => p.id.toLowerCase() === id.toLowerCase());
    },
    [proyectos]
  );

  const formatCurrentTimestamp = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  const crearProyecto = useCallback(
    (payload: CrearProyectoPayload): StoreResponse<ProyectoInstitucional> => {
      const nombreTrim = payload.nombre?.trim() || "";
      const propositoTrim = payload.proposito?.trim() || "";
      const institucionTrim = payload.institucion?.trim() || "";

      // Validaciones obligatorias PRJ-01
      if (!nombreTrim) {
        return {
          success: false,
          error: "El nombre del proyecto es obligatorio.",
        };
      }
      if (nombreTrim.length < 3) {
        return {
          success: false,
          error: "El nombre del proyecto debe tener al menos 3 caracteres.",
        };
      }
      if (!propositoTrim) {
        return {
          success: false,
          error: "El propósito del proyecto es obligatorio.",
        };
      }
      if (propositoTrim.length < 10) {
        return {
          success: false,
          error: "El propósito debe tener al menos 10 caracteres explicativos.",
        };
      }
      if (!institucionTrim) {
        return {
          success: false,
          error: "La institución responsable es requerida.",
        };
      }

      // Validar duplicidad en la misma institución
      const existeDuplicado = proyectos.some(
        (p) =>
          p.institucion.toLowerCase() === institucionTrim.toLowerCase() &&
          p.nombre.toLowerCase() === nombreTrim.toLowerCase()
      );

      if (existeDuplicado) {
        return {
          success: false,
          error: `Ya existe un proyecto registrado con el nombre "${nombreTrim}" en ${institucionTrim}.`,
        };
      }

      // Generar correlativo ID (PRJ-2026-00X)
      const currentYear = new Date().getFullYear();
      const nextIndex = proyectos.length + 1;
      const nuevoId = `PRJ-${currentYear}-${String(nextIndex).padStart(3, "0")}`;
      const nowFormatted = formatCurrentTimestamp();

      const nuevoProyecto: ProyectoInstitucional = {
        id: nuevoId,
        nombre: nombreTrim,
        proposito: propositoTrim,
        institucion: institucionTrim,
        fechaCreacion: nowFormatted,
        fechaActualizacion: nowFormatted,
        version: 1,
        creadoPor: payload.creadoPor || "Coordinador Institucional",
        solicitudes: [],
        historialVersiones: [
          {
            version: 1,
            fecha: nowFormatted,
            nombre: nombreTrim,
            proposito: propositoTrim,
            modificadoPor: payload.creadoPor || "Coordinador Institucional",
          },
        ],
      };

      const updated = [nuevoProyecto, ...proyectos];
      setProyectos(updated);
      saveStoredProyectos(updated);

      return {
        success: true,
        data: nuevoProyecto,
      };
    },
    [proyectos]
  );

  const actualizarProyecto = useCallback(
    (
      id: string,
      payload: ActualizarProyectoPayload
    ): StoreResponse<ProyectoInstitucional> => {
      const proyectoIndex = proyectos.findIndex(
        (p) => p.id.toLowerCase() === id.toLowerCase()
      );

      if (proyectoIndex === -1) {
        return {
          success: false,
          error: "El proyecto solicitado no existe.",
        };
      }

      const nombreTrim = payload.nombre?.trim() || "";
      const propositoTrim = payload.proposito?.trim() || "";

      if (!nombreTrim) {
        return {
          success: false,
          error: "El nombre del proyecto es obligatorio.",
        };
      }
      if (nombreTrim.length < 3) {
        return {
          success: false,
          error: "El nombre del proyecto debe tener al menos 3 caracteres.",
        };
      }
      if (!propositoTrim) {
        return {
          success: false,
          error: "El propósito del proyecto es obligatorio.",
        };
      }
      if (propositoTrim.length < 10) {
        return {
          success: false,
          error: "El propósito debe tener al menos 10 caracteres explicativos.",
        };
      }

      const actual = proyectos[proyectoIndex];
      const nuevaVersion = actual.version + 1;
      const nowFormatted = formatCurrentTimestamp();

      const nuevaVersionRegistro: HistorialVersionProyecto = {
        version: nuevaVersion,
        fecha: nowFormatted,
        nombre: nombreTrim,
        proposito: propositoTrim,
        modificadoPor: payload.modificadoPor || "Coordinador Institucional",
      };

      const actualizado: ProyectoInstitucional = {
        ...actual,
        nombre: nombreTrim,
        proposito: propositoTrim,
        version: nuevaVersion,
        fechaActualizacion: nowFormatted,
        historialVersiones: [nuevaVersionRegistro, ...actual.historialVersiones],
      };

      const updatedList = [...proyectos];
      updatedList[proyectoIndex] = actualizado;

      setProyectos(updatedList);
      saveStoredProyectos(updatedList);

      return {
        success: true,
        data: actualizado,
      };
    },
    [proyectos]
  );

  const vincularSolicitud = useCallback(
    (proyectoId: string, solicitud: SolicitudVinculada): boolean => {
      const proyectoIndex = proyectos.findIndex(
        (p) => p.id.toLowerCase() === proyectoId.toLowerCase()
      );
      if (proyectoIndex === -1) return false;

      const actual = proyectos[proyectoIndex];
      const yaExiste = actual.solicitudes.some((s) => s.id === solicitud.id);
      if (yaExiste) return true;

      const actualizado: ProyectoInstitucional = {
        ...actual,
        solicitudes: [solicitud, ...actual.solicitudes],
      };

      const updatedList = [...proyectos];
      updatedList[proyectoIndex] = actualizado;

      setProyectos(updatedList);
      saveStoredProyectos(updatedList);
      return true;
    },
    [proyectos]
  );

  const restablecerDatosDemo = useCallback(() => {
    setProyectos(INITIAL_PROYECTOS);
    saveStoredProyectos(INITIAL_PROYECTOS);
  }, []);

  return {
    proyectos,
    isLoaded,
    getProyectosPorInstitucion,
    getProyectoById,
    crearProyecto,
    actualizarProyecto,
    vincularSolicitud,
    restablecerDatosDemo,
  };
}
