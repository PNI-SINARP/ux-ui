"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CasoRecuperacion,
  EstadoRecuperacion,
  DecisionAdministrativa,
  EvidenciaArchivo,
  IncidenciaConciliacion,
} from "./gestion-recuperaciones-types";
import { CASOS_MOCK_INICIALES } from "./gestion-recuperaciones-mock-data";

const STORAGE_KEY_CASOS = "dinarp_gestion_recuperaciones_casos_v2";
const STORAGE_KEY_SYNC_FAIL = "dinarp_gestion_recuperaciones_sync_fail_v2";

export function useGestionRecuperacionesStore() {
  const [casos, setCasos] = useState<CasoRecuperacion[]>(CASOS_MOCK_INICIALES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [simulateIdpSyncFailure, setSimulateIdpSyncFailureState] = useState(false);

  // Cargar estado inicial desde localStorage si existe
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CASOS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCasos(parsed);
          }
        }
        const storedSync = localStorage.getItem(STORAGE_KEY_SYNC_FAIL);
        if (storedSync !== null) {
          setSimulateIdpSyncFailureState(storedSync === "true");
        }
      } catch (err) {
        console.error("Error al cargar casos de recuperación:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Guardar en localStorage
  const saveCasos = useCallback((nuevosCasos: CasoRecuperacion[]) => {
    setCasos(nuevosCasos);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_CASOS, JSON.stringify(nuevosCasos));
      } catch (err) {
        console.error("Error al persistir casos de recuperación:", err);
      }
    }
  }, []);

  const setSimulateIdpSyncFailure = useCallback((value: boolean) => {
    setSimulateIdpSyncFailureState(value);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_SYNC_FAIL, String(value));
      } catch (err) {
        console.error("Error al persistir flag de fallo de sincronización:", err);
      }
    }
  }, []);

  // Formateador de fecha corta actual
  const getNowFormatted = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 1. Autorizar Caso (HU ID-08)
  const autorizarCaso = useCallback(
    (
      casoId: string,
      params: {
        operador: string;
        observaciones: string;
        bloquearCanalAnterior?: boolean;
      }
    ): { ok: boolean; error?: string; referencia?: string; estadoResultante: EstadoRecuperacion } => {
      const caso = casos.find((c) => c.id === casoId);
      if (!caso) {
        return { ok: false, error: "Caso no encontrado.", estadoResultante: "PENDIENTE" };
      }

      const now = getNowFormatted();

      // SIMULACIÓN DE FALLO DE SINCRONIZACIÓN / CLÚSTER IdP
      if (simulateIdpSyncFailure) {
        const codigoIncidencia = `INC-ID08-SYNC-2026-${Math.floor(100 + Math.random() * 900)}`;
        const incidencia: IncidenciaConciliacion = {
          codigoIncidencia,
          descripcion:
            "Timeout (HTTP 504) al propagar la revocación de tokens y el bloqueo del factor anterior en el clúster Identity Platform DINARP. Por protocolo de seguridad, el acceso permanece DENEGADO y se eleva a conciliación técnica.",
          fechaFallo: now,
          moduloAfectado: "IAM DINARP / Clúster de Sincronización Federada",
          requiereSincronizacionManual: true,
        };

        const updatedCasos = casos.map((c) => {
          if (c.id === casoId) {
            return {
              ...c,
              estado: "EN_CONCILIACION" as EstadoRecuperacion,
              decision: "AUTORIZADA" as DecisionAdministrativa,
              resultado: "Fallo sincronización (En conciliación)",
              fechaResolucion: now,
              operadorAsignado: params.operador,
              observacionesOperador: params.observaciones,
              incidenciaConciliacion: incidencia,
              referenciaAutorizacion: codigoIncidencia,
              bloqueoCanalAnterior: {
                ...c.bloqueoCanalAnterior,
                activo: true, // Persistencia de bloqueo mantenida preventivamente
                fechaBloqueo: now,
              },
              historial: [
                ...c.historial,
                {
                  id: `HIST-${Date.now()}`,
                  fecha: now,
                  actor: params.operador,
                  accion: "Fallo de persistencia / Sincronización IdP",
                  detalle: `Se activó contingencia de seguridad: ${incidencia.descripcion}`,
                  tipo: "danger" as const,
                },
              ],
            };
          }
          return c;
        });

        saveCasos(updatedCasos);
        return {
          ok: false,
          error:
            "Fallo de sincronización con Identity Platform. El acceso se mantiene denegado y el caso pasó a estado 'En conciliación'.",
          estadoResultante: "EN_CONCILIACION",
        };
      }

      // AUTORIZACIÓN EXITOSA (ID-08)
      // Reglas:
      // 1. Invalidar sesiones previas (sesiones concurrentes cerradas en IdP)
      // 2. Bloquear canal anterior cuando aplique
      // 3. Continuar por ID-02 (Cuenta interna) o ID-10 (Coordinador)
      // 4. Obligar re-vinculación de Google Authenticator
      // 5. NUNCA mostrar ni generar contraseña temporal
      const referencia = `AUT-ID08-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const sesionesRevocadas = Math.floor(2 + Math.random() * 3);
      const canalContinuacion = caso.tipoCuenta === "CUENTA_INTERNA" ? "ID-02" : "ID-10";

      const updatedCasos = casos.map((c) => {
        if (c.id === casoId) {
          return {
            ...c,
            estado: "COMPLETADO" as EstadoRecuperacion,
            decision: "AUTORIZADA" as DecisionAdministrativa,
            resultado: `Autorizada (Enlace 2FA emitido vía ${canalContinuacion})`,
            fechaResolucion: now,
            operadorAsignado: params.operador,
            referenciaAutorizacion: referencia,
            observacionesOperador: params.observaciones,
            incidenciaConciliacion: undefined,
            bloqueoCanalAnterior: {
              activo: params.bloquearCanalAnterior ?? true,
              fechaBloqueo: now,
              canalBloqueado: `Canal anterior revocado (#${Math.floor(1000 + Math.random() * 9000)})`,
              sesionesInvalidadas: sesionesRevocadas,
              ipSolicitante: c.bloqueoCanalAnterior.ipSolicitante || "186.42.10.1",
            },
            historial: [
              ...c.historial,
              {
                id: `HIST-${Date.now()}`,
                fecha: now,
                actor: params.operador,
                accion: "Autorización de recuperación asistida",
                detalle: `Autorizado bajo referencia ${referencia}. ${sesionesRevocadas} sesiones invalidadas en IdP. Canal anterior bloqueado. Se continúa por ${canalContinuacion} obligando re-vinculación de Google Authenticator (sin contraseña temporal).`,
                tipo: "success" as const,
              },
            ],
          };
        }
        return c;
      });

      saveCasos(updatedCasos);
      return { ok: true, referencia, estadoResultante: "COMPLETADO" };
    },
    [casos, simulateIdpSyncFailure, saveCasos]
  );

  // 2. Denegar Caso (HU ID-08)
  const denegarCaso = useCallback(
    (
      casoId: string,
      params: {
        operador: string;
        motivoDenegacion: string;
        mantenerBloqueoPreventivo?: boolean;
      }
    ): { ok: boolean; error?: string } => {
      const caso = casos.find((c) => c.id === casoId);
      if (!caso) {
        return { ok: false, error: "Caso no encontrado." };
      }

      if (params.motivoDenegacion.trim().length < 10) {
        return {
          ok: false,
          error: "El motivo de la denegación debe contener al menos 10 caracteres.",
        };
      }

      const now = getNowFormatted();

      const updatedCasos = casos.map((c) => {
        if (c.id === casoId) {
          return {
            ...c,
            estado: "COMPLETADO" as EstadoRecuperacion,
            decision: "DENEGADA" as DecisionAdministrativa,
            resultado: "Denegada (Bloqueo preventivo conservado)",
            fechaResolucion: now,
            operadorAsignado: params.operador,
            motivoDecision: params.motivoDenegacion.trim(),
            bloqueoCanalAnterior: {
              ...c.bloqueoCanalAnterior,
              activo: params.mantenerBloqueoPreventivo ?? true, // El bloqueo se mantiene por seguridad
              fechaBloqueo: now,
            },
            historial: [
              ...c.historial,
              {
                id: `HIST-${Date.now()}`,
                fecha: now,
                actor: params.operador,
                accion: "Denegación de recuperación",
                detalle: `Solicitud denegada: ${params.motivoDenegacion.trim()}. Bloqueo preventivo de la cuenta mantenido por seguridad.`,
                tipo: "danger" as const,
              },
            ],
          };
        }
        return c;
      });

      saveCasos(updatedCasos);
      return { ok: true };
    },
    [casos, saveCasos]
  );

  // 3. Adjuntar Evidencia (UI Kit File Upload)
  const adjuntarEvidencia = useCallback(
    (
      casoId: string,
      archivo: { nombre: string; tamano: string; tipo: string; subidoPor: string; hashSha256?: string }
    ) => {
      const now = getNowFormatted();
      const hashGenerado =
        archivo.hashSha256 ||
        `sha256-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}b8f0412e87`;

      const nuevaEvidencia: EvidenciaArchivo = {
        ...archivo,
        id: `EVID-${Date.now()}`,
        fechaSubida: now,
        hashSha256: hashGenerado,
      };

      const updatedCasos = casos.map((c) => {
        if (c.id === casoId) {
          return {
            ...c,
            evidencias: [...c.evidencias, nuevaEvidencia],
            historial: [
              ...c.historial,
              {
                id: `HIST-${Date.now()}`,
                fecha: now,
                actor: archivo.subidoPor,
                accion: "Evidencia adjuntada",
                detalle: `Archivo incorporado: ${archivo.nombre} (${archivo.tamano}). Hash SHA-256 verificado.`,
                tipo: "info" as const,
              },
            ],
          };
        }
        return c;
      });

      saveCasos(updatedCasos);
    },
    [casos, saveCasos]
  );

  // 4. Reintentar Conciliación
  const reintentarConciliacion = useCallback(
    (casoId: string, operador: string): { ok: boolean; error?: string } => {
      const caso = casos.find((c) => c.id === casoId);
      if (!caso) return { ok: false, error: "Caso no encontrado." };

      const now = getNowFormatted();

      if (simulateIdpSyncFailure) {
        return {
          ok: false,
          error:
            "Reintento fallido: El clúster Identity Platform continúa sin responder. El caso debe permanecer en conciliación técnica.",
        };
      }

      const referencia = `AUT-ID08-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const canalContinuacion = caso.tipoCuenta === "CUENTA_INTERNA" ? "ID-02" : "ID-10";

      const updatedCasos = casos.map((c) => {
        if (c.id === casoId) {
          return {
            ...c,
            estado: "COMPLETADO" as EstadoRecuperacion,
            decision: "AUTORIZADA" as DecisionAdministrativa,
            resultado: `Conciliación exitosa (Enlace 2FA emitido vía ${canalContinuacion})`,
            referenciaAutorizacion: referencia,
            incidenciaConciliacion: undefined,
            historial: [
              ...c.historial,
              {
                id: `HIST-${Date.now()}`,
                fecha: now,
                actor: operador,
                accion: "Conciliación IdP exitosa",
                detalle: `Sincronización con Identity Platform reestablecida. Se generó referencia ${referencia} y se continúa por ${canalContinuacion}.`,
                tipo: "success" as const,
              },
            ],
          };
        }
        return c;
      });

      saveCasos(updatedCasos);
      return { ok: true };
    },
    [casos, simulateIdpSyncFailure, saveCasos]
  );

  // 5. Restablecer datos demo
  const resetDemoData = useCallback(() => {
    saveCasos(CASOS_MOCK_INICIALES);
    setSimulateIdpSyncFailure(false);
  }, [saveCasos, setSimulateIdpSyncFailure]);

  return {
    casos,
    isLoaded,
    simulateIdpSyncFailure,
    setSimulateIdpSyncFailure,
    autorizarCaso,
    denegarCaso,
    adjuntarEvidencia,
    reintentarConciliacion,
    resetDemoData,
  };
}

export const useRecuperacionAccesoStore = useGestionRecuperacionesStore;
