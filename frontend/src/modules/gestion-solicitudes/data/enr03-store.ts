"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_ENR03_SIM = "dinarp_enr03_simulation_v1";

export interface Enr03SimulationConfig {
  sinRevisoresActivos: boolean;
  simularFalloGuardado: boolean;
  simularNotificacionPendiente: boolean;
}

const DEFAULT_SIMULATION: Enr03SimulationConfig = {
  sinRevisoresActivos: false,
  simularFalloGuardado: false,
  simularNotificacionPendiente: false,
};

function getStoredSimConfig(): Enr03SimulationConfig {
  if (typeof window === "undefined") return DEFAULT_SIMULATION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENR03_SIM);
    if (!raw) return DEFAULT_SIMULATION;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SIMULATION;
  }
}

function saveStoredSimConfig(config: Enr03SimulationConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ENR03_SIM, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent("dinarp_enr03_sim_updated", { detail: config }));
  } catch (err) {
    console.error("Error saving ENR-03 sim config", err);
  }
}

export function useEnr03SimulationStore() {
  const [config, setConfig] = useState<Enr03SimulationConfig>(DEFAULT_SIMULATION);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setConfig(getStoredSimConfig());
    setIsLoaded(true);

    const handleUpdate = (e: CustomEvent<Enr03SimulationConfig>) => {
      if (e.detail) {
        setConfig(e.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ENR03_SIM && e.newValue) {
        try {
          setConfig(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("dinarp_enr03_sim_updated", handleUpdate as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("dinarp_enr03_sim_updated", handleUpdate as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateConfig = useCallback((patch: Partial<Enr03SimulationConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      saveStoredSimConfig(next);
      return next;
    });
  }, []);

  const setSinRevisoresActivos = useCallback((val: boolean) => {
    updateConfig({ sinRevisoresActivos: val });
  }, [updateConfig]);

  const setSimularFalloGuardado = useCallback((val: boolean) => {
    updateConfig({ simularFalloGuardado: val });
  }, [updateConfig]);

  const setSimularNotificacionPendiente = useCallback((val: boolean) => {
    updateConfig({ simularNotificacionPendiente: val });
  }, [updateConfig]);

  const resetSimulation = useCallback(() => {
    setConfig(DEFAULT_SIMULATION);
    saveStoredSimConfig(DEFAULT_SIMULATION);
  }, []);

  return {
    ...config,
    isLoaded,
    setSinRevisoresActivos,
    setSimularFalloGuardado,
    setSimularNotificacionPendiente,
    resetSimulation,
  };
}
