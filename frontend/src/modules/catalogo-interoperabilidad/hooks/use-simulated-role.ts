"use client";

import { useState, useEffect } from "react";
import { type UserRole, ROLES_CONFIG } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export const useSimulatedRole = (initialRole: UserRole = "COORDINADOR_SINARP"): [UserRole, (role: UserRole) => void] => {
  const safeInitialRole: UserRole = (initialRole && initialRole in ROLES_CONFIG) ? initialRole : "COORDINADOR_SINARP";
  const [role, setRole] = useState<UserRole>(safeInitialRole);

  useEffect(() => {
    // 1. Initial read from sessionStorage on mount
    try {
      const storedRole = sessionStorage.getItem("dinarp_simulated_role") as UserRole | null;
      if (storedRole && storedRole in ROLES_CONFIG) {
        setRole(storedRole);
      } else {
        // Init sessionStorage with provided default if empty or invalid
        sessionStorage.setItem("dinarp_simulated_role", safeInitialRole);
        setRole(safeInitialRole);
      }
    } catch (e) {
      // Ignore if sessionStorage is not available
    }

    // 2. Listen for changes from other components (like Header Menu)
    const handleRoleChanged = (e: CustomEvent<{ role: UserRole }>) => {
      if (e.detail?.role && e.detail.role in ROLES_CONFIG) {
        setRole(e.detail.role);
      }
    };

    window.addEventListener("simulatedRoleChanged", handleRoleChanged as EventListener);

    return () => {
      window.removeEventListener("simulatedRoleChanged", handleRoleChanged as EventListener);
    };
  }, [safeInitialRole]);

  // 3. Setter that updates local state, sessionStorage, and broadcasts
  const setSimulatedRole = (newRole: UserRole) => {
    const safeRole = (newRole && newRole in ROLES_CONFIG) ? newRole : "COORDINADOR_SINARP";
    setRole(safeRole);
    try {
      sessionStorage.setItem("dinarp_simulated_role", safeRole);
    } catch (e) {}

    window.dispatchEvent(
      new CustomEvent("simulatedRoleChanged", { detail: { role: safeRole } })
    );
  };

  return [role, setSimulatedRole];
};
