"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaDinarp,
  EstadoArea,
  EventoTrazabilidadArea,
  ImpactoArea,
  TipoAccionArea,
} from "./areas-types";
import { INITIAL_AREAS } from "./areas-data";

const STORAGE_AREAS_KEY = "dinarp_areas_organicas_v1";

// Función utilitaria para formatear fecha en formato estándar DINARP: DD/MM/YYYY HH:mm
export function getFechaActualFormateada(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Función para incrementar versiones menores (ej: v1.0 -> v1.1, v2.4 -> v2.5)
export function incrementarVersionMenor(versionActual: string): string {
  const match = versionActual.match(/v?(\d+)\.(\d+)/);
  if (!match) return "v1.1";
  const mayor = parseInt(match[1], 10);
  const menor = parseInt(match[2], 10) + 1;
  return `v${mayor}.${menor}`;
}

// Función para incrementar versión mayor (ej: v0.2 -> v1.0 al activar)
export function promoverAVersionOficial(versionActual: string): string {
  const match = versionActual.match(/v?(\d+)\.(\d+)/);
  if (!match) return "v1.0";
  const mayor = parseInt(match[1], 10);
  if (mayor === 0) return "v1.0";
  return `v${mayor + 1}.0`;
}

export function useAreasStore() {
  const [areas, setAreas] = useState<AreaDinarp[]>(INITIAL_AREAS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga inicial reactiva desde LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AREAS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAreas(parsed);
        }
      }
    } catch (err) {
      console.error("Error al cargar areas desde localStorage", err);
    }
    setIsLoaded(true);
  }, []);

  // Persistir en LocalStorage
  const persistAreas = useCallback((newAreas: AreaDinarp[]) => {
    setAreas(newAreas);
    try {
      localStorage.setItem(STORAGE_AREAS_KEY, JSON.stringify(newAreas));
      // Notificar a otras pestañas o componentes si es necesario
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dinarp-areas-updated"));
      }
    } catch (err) {
      console.error("Error al persistir areas en localStorage", err);
    }
  }, []);

  // Obtener área por ID o por Código
  const getArea = useCallback(
    (idOrCodigo: string): AreaDinarp | null => {
      const normalizado = idOrCodigo.trim().toUpperCase();
      return (
        areas.find(
          (a) =>
            a.id.toUpperCase() === normalizado ||
            a.codigo.toUpperCase() === normalizado
        ) || null
      );
    },
    [areas]
  );

  // Obtener solo áreas activas (para ID-01 e ID-02)
  const getAreasActivas = useCallback((): AreaDinarp[] => {
    return areas.filter((a) => a.estado === "Activa");
  }, [areas]);

  // Cálculo estricto de impacto previo a inactivación
  const calcularImpacto = useCallback((area: AreaDinarp): ImpactoArea => {
    const cuentasActivas = area.usuarios.filter(
      (u) => u.estado !== "RETIRADO"
    ).length;
    const tramitesVigentes = area.tramites.filter(
      (t) => t.vigente && t.estado !== "Cerrado"
    ).length;
    const tareasVigentes = area.tareas.filter(
      (t) => t.vigente && t.estado !== "Completada"
    ).length;

    const totalObligaciones = cuentasActivas + tramitesVigentes + tareasVigentes;
    const motivosBloqueo: string[] = [];

    if (cuentasActivas > 0) {
      motivosBloqueo.push(
        `Tiene ${cuentasActivas} cuenta(s) de usuario activa(s) vinculada(s). Reasigne a los funcionarios a otra área antes de continuar.`
      );
    }
    if (tramitesVigentes > 0) {
      motivosBloqueo.push(
        `Tiene ${tramitesVigentes} trámite(s) o solicitud(es) vigente(s) en revisión o asignación sin culminar ni transferir.`
      );
    }
    if (tareasVigentes > 0) {
      motivosBloqueo.push(
        `Tiene ${tareasVigentes} tarea(s) operativa(s) en curso o pendiente(s) de ejecución.`
      );
    }

    return {
      cuentasVinculadasCount: cuentasActivas,
      tramitesVigentesCount: tramitesVigentes,
      tareasVigentesCount: tareasVigentes,
      totalObligaciones,
      puedeInactivar: totalObligaciones === 0,
      motivosBloqueo,
    };
  }, []);

  // Crear nueva área (Borrador o Activa)
  const crearArea = useCallback(
    (
      datos: {
        codigo: string;
        nombre: string;
        descripcion: string;
        responsableNombre: string;
        responsableCargo: string;
        responsableCorreo: string;
        estadoInicial?: EstadoArea;
      },
      motivo: string
    ) => {
      const codigoNormalizado = datos.codigo.trim().toUpperCase();

      // Validación de unicidad de código
      const duplicado = areas.some(
        (a) => a.codigo.toUpperCase() === codigoNormalizado
      );
      if (duplicado) {
        return {
          success: false,
          error: `Ya existe un área con el código institucional [${codigoNormalizado}]. Debe ser único.`,
        };
      }

      const estadoInicial = datos.estadoInicial || "Borrador";
      const versionInicial = estadoInicial === "Activa" ? "v1.0" : "v0.1";
      const fechaNow = getFechaActualFormateada();

      const nuevoEvento: EventoTrazabilidadArea = {
        id: `TRZ-${Date.now()}-1`,
        version: versionInicial,
        autor: "Administrador DINARP",
        autorCargo: "Administrador del Sistema",
        motivo: motivo.trim() || "Creación y registro inicial de área en la estructura institucional.",
        fecha: fechaNow,
        tipoAccion: "CREACION",
        estadoResultante: estadoInicial,
        detalles: `Registro en estado [${estadoInicial}]. Código orgánico: ${codigoNormalizado}.`,
      };

      const nuevaArea: AreaDinarp = {
        id: `AREA-${Date.now()}`,
        codigo: codigoNormalizado,
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim(),
        responsableNombre: datos.responsableNombre.trim(),
        responsableCargo: datos.responsableCargo.trim(),
        responsableCorreo: datos.responsableCorreo.trim(),
        estado: estadoInicial,
        version: versionInicial,
        referenciada: false, // Nueva, sin referencias
        usuarios: [],
        tramites: [],
        tareas: [],
        trazabilidad: [nuevoEvento],
        fechaCreacion: fechaNow,
        ultimaActualizacion: fechaNow,
      };

      const updated = [nuevaArea, ...areas];
      persistAreas(updated);
      return { success: true, area: nuevaArea };
    },
    [areas, persistAreas]
  );

  // Editar área existente
  const editarArea = useCallback(
    (
      id: string,
      cambios: {
        nombre: string;
        descripcion: string;
        responsableNombre: string;
        responsableCargo: string;
        responsableCorreo: string;
      },
      motivo: string
    ) => {
      const area = areas.find((a) => a.id === id);
      if (!area) return { success: false, error: "Área no encontrada." };

      const nuevaVersion = incrementarVersionMenor(area.version);
      const fechaNow = getFechaActualFormateada();

      const evento: EventoTrazabilidadArea = {
        id: `TRZ-${Date.now()}`,
        version: nuevaVersion,
        autor: "Administrador DINARP",
        autorCargo: "Administrador del Sistema",
        motivo: motivo.trim() || "Actualización de datos generales y titularidad del área.",
        fecha: fechaNow,
        tipoAccion: "EDICION",
        estadoResultante: area.estado,
        detalles: `Modificación de metadatos orgánicos. Versión actualizada a ${nuevaVersion}.`,
      };

      const updated = areas.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          nombre: cambios.nombre.trim(),
          descripcion: cambios.descripcion.trim(),
          responsableNombre: cambios.responsableNombre.trim(),
          responsableCargo: cambios.responsableCargo.trim(),
          responsableCorreo: cambios.responsableCorreo.trim(),
          version: nuevaVersion,
          ultimaActualizacion: fechaNow,
          trazabilidad: [evento, ...a.trazabilidad],
        };
      });

      persistAreas(updated);
      return { success: true, version: nuevaVersion };
    },
    [areas, persistAreas]
  );

  // Activar área (de Borrador a Activa)
  const activarArea = useCallback(
    (id: string, motivo: string) => {
      const area = areas.find((a) => a.id === id);
      if (!area) return { success: false, error: "Área no encontrada." };

      const nuevaVersion = promoverAVersionOficial(area.version);
      const fechaNow = getFechaActualFormateada();

      const evento: EventoTrazabilidadArea = {
        id: `TRZ-${Date.now()}`,
        version: nuevaVersion,
        autor: "Administrador DINARP",
        autorCargo: "Administrador del Sistema",
        motivo: motivo.trim() || "Formalización y activación oficial del área en el catálogo orgánico.",
        fecha: fechaNow,
        tipoAccion: "ACTIVACION",
        estadoResultante: "Activa",
        detalles: `El área pasa a estado [Activa]. Queda disponible para enrolamiento y asignación en ID-01/ID-02.`,
      };

      const updated = areas.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          estado: "Activa" as EstadoArea,
          version: nuevaVersion,
          ultimaActualizacion: fechaNow,
          trazabilidad: [evento, ...a.trazabilidad],
        };
      });

      persistAreas(updated);
      return { success: true, version: nuevaVersion };
    },
    [areas, persistAreas]
  );

  // Inactivar área con regla estricta de bloqueo de obligaciones vigentes
  const inactivarArea = useCallback(
    (id: string, motivo: string) => {
      const area = areas.find((a) => a.id === id);
      if (!area) return { success: false, error: "Área no encontrada." };

      // Validar obligaciones vigentes
      const impacto = calcularImpacto(area);
      if (!impacto.puedeInactivar) {
        return {
          success: false,
          bloqueado: true,
          error: "Inactivación bloqueada: Existen obligaciones vigentes en esta área orgánica.",
          motivos: impacto.motivosBloqueo,
          impacto,
        };
      }

      const nuevaVersion = incrementarVersionMenor(area.version);
      const fechaNow = getFechaActualFormateada();

      const evento: EventoTrazabilidadArea = {
        id: `TRZ-${Date.now()}`,
        version: nuevaVersion,
        autor: "Administrador DINARP",
        autorCargo: "Administrador del Sistema",
        motivo: motivo.trim() || "Inactivación formal del área tras resolución de todas las obligaciones.",
        fecha: fechaNow,
        tipoAccion: "INACTIVACION",
        estadoResultante: "Inactiva",
        detalles: `El área pasa a estado [Inactiva]. Se retira de los listados de selección en ID-01 e ID-02.`,
      };

      const updated = areas.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          estado: "Inactiva" as EstadoArea,
          version: nuevaVersion,
          referenciada: true, // Queda sellada como referenciada
          ultimaActualizacion: fechaNow,
          trazabilidad: [evento, ...a.trazabilidad],
        };
      });

      persistAreas(updated);
      return { success: true, version: nuevaVersion };
    },
    [areas, calcularImpacto, persistAreas]
  );

  // Reactivar área (de Inactiva a Activa)
  const reactivarArea = useCallback(
    (id: string, motivo: string) => {
      const area = areas.find((a) => a.id === id);
      if (!area) return { success: false, error: "Área no encontrada." };

      const nuevaVersion = incrementarVersionMenor(area.version);
      const fechaNow = getFechaActualFormateada();

      const evento: EventoTrazabilidadArea = {
        id: `TRZ-${Date.now()}`,
        version: nuevaVersion,
        autor: "Administrador DINARP",
        autorCargo: "Administrador del Sistema",
        motivo: motivo.trim() || "Reactivación operativa del área en la estructura orgánica.",
        fecha: fechaNow,
        tipoAccion: "REACTIVACION",
        estadoResultante: "Activa",
        detalles: `El área vuelve a estar [Activa] y visible en Combobox de selección ID-01/ID-02.`,
      };

      const updated = areas.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          estado: "Activa" as EstadoArea,
          version: nuevaVersion,
          ultimaActualizacion: fechaNow,
          trazabilidad: [evento, ...a.trazabilidad],
        };
      });

      persistAreas(updated);
      return { success: true, version: nuevaVersion };
    },
    [areas, persistAreas]
  );

  // Eliminar / Retirar área según regla:
  // "Un área usada se retira lógicamente. Solo un borrador nunca referenciado puede eliminarse."
  const eliminarArea = useCallback(
    (id: string, motivo?: string) => {
      const area = areas.find((a) => a.id === id);
      if (!area) return { success: false, error: "Área no encontrada." };

      const esBorradorLimpio =
        area.estado === "Borrador" &&
        !area.referenciada &&
        area.usuarios.length === 0 &&
        area.tramites.length === 0 &&
        area.tareas.length === 0;

      if (esBorradorLimpio) {
        // Borrador nunca referenciado: eliminación física
        const filtered = areas.filter((a) => a.id !== id);
        persistAreas(filtered);
        return {
          success: true,
          tipo: "FISICO" as const,
          mensaje: "Borrador sin referencias eliminado completamente del sistema.",
        };
      }

      // Área usada o con historial: RETIRO LÓGICO obligatorio
      const nuevaVersion = incrementarVersionMenor(area.version);
      const fechaNow = getFechaActualFormateada();

      const evento: EventoTrazabilidadArea = {
        id: `TRZ-${Date.now()}`,
        version: nuevaVersion,
        autor: "Administrador DINARP",
        autorCargo: "Administrador del Sistema",
        motivo:
          motivo?.trim() ||
          "Retiro lógico institucional por cese de funciones. Conservado para trazabilidad histórica.",
        fecha: fechaNow,
        tipoAccion: "RETIRO_LOGICO",
        estadoResultante: "Inactiva",
        detalles:
          "Retiro lógico definitivo. El registro permanece bloqueado y custodiado para auditoría.",
      };

      const updated = areas.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          estado: "Inactiva" as EstadoArea,
          referenciada: true,
          version: nuevaVersion,
          ultimaActualizacion: fechaNow,
          trazabilidad: [evento, ...a.trazabilidad],
        };
      });

      persistAreas(updated);
      return {
        success: true,
        tipo: "LOGICO" as const,
        mensaje: "Área retirada lógicamente. Se preservó el historial de auditoría.",
        version: nuevaVersion,
      };
    },
    [areas, persistAreas]
  );

  // Simulador de resolución de obligaciones (Permite desbloquear la inactivación para demostración)
  const simularResolucionObligaciones = useCallback(
    (id: string) => {
      const area = areas.find((a) => a.id === id);
      if (!area) return { success: false, error: "Área no encontrada." };

      const fechaNow = getFechaActualFormateada();
      const updated = areas.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          usuarios: a.usuarios.map((u) => ({ ...u, estado: "RETIRADO" })),
          tramites: a.tramites.map((t) => ({ ...t, vigente: false, estado: "Cerrado" as const })),
          tareas: a.tareas.map((tar) => ({ ...tar, vigente: false, estado: "Completada" as const })),
          ultimaActualizacion: fechaNow,
        };
      });

      persistAreas(updated);
      return { success: true };
    },
    [areas, persistAreas]
  );

  // Reiniciar a datos por defecto
  const resetearAreas = useCallback(() => {
    persistAreas(INITIAL_AREAS);
  }, [persistAreas]);

  return {
    areas,
    isLoaded,
    getArea,
    getAreasActivas,
    calcularImpacto,
    crearArea,
    editarArea,
    activarArea,
    inactivarArea,
    reactivarArea,
    eliminarArea,
    simularResolucionObligaciones,
    resetearAreas,
  };
}
