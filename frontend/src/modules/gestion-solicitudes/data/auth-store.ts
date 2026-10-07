"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_USERS_BY_ROLE, type MockUser, type UserRole } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

const STORAGE_KEY = "dinarp_auth_v1";

let memoryUser: MockUser | null = null;
let isInitialized = false;
const listeners = new Set<() => void>();

function getInitialUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  if (!isInitialized) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        memoryUser = JSON.parse(stored);
      } else {
        // Default demo session: Andrea López (Coordinador SINARP)
        memoryUser = MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryUser));
      }
    } catch (e) {
      console.error("Error reading initial auth store", e);
      memoryUser = MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
    }
    isInitialized = true;
  }
  return memoryUser;
}

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error in auth listener", e);
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dinarp_auth_sync"));
  }
}

function persistUser(user: MockUser | null) {
  memoryUser = user;
  isInitialized = true;
  if (typeof window !== "undefined") {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error persisting auth store", e);
    }
  }
  notifySubscribers();
}

export function useAuthStore() {
  const [activeUser, setActiveUserInternal] = useState<MockUser | null>(getInitialUser);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const current = getInitialUser();
    setActiveUserInternal(current);
    setIsLoaded(true);

    const handleSync = () => {
      setActiveUserInternal(memoryUser);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const user = e.newValue ? JSON.parse(e.newValue) : null;
          memoryUser = user;
          setActiveUserInternal(user);
        } catch {}
      }
    };

    listeners.add(handleSync);
    window.addEventListener("dinarp_auth_sync", handleSync);
    window.addEventListener("storage", handleStorage);

    return () => {
      listeners.delete(handleSync);
      window.removeEventListener("dinarp_auth_sync", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const login = useCallback((input: string): MockUser => {
    const cleanInput = input.trim().toLowerCase();

    // 1. Caso especial: Mariana Almeida (Coordinador Titular SINARP / MinEduc)
    if (
      cleanInput === "1714443322" ||
      cleanInput === "1714443376" ||
      cleanInput === "m.almeida@educacion.gob.ec" ||
      cleanInput.includes("mariana")
    ) {
      const userMariana: MockUser = {
        id: "USR-CRD-001",
        name: "Mariana Almeida",
        role: "COORDINADOR_SINARP",
        roleTitle: "Coordinador Titular SINARP",
        email: "m.almeida@educacion.gob.ec",
        institution: "Ministerio de Educación",
        cedula: "1714443322",
        avatar: "MA",
        initials: "MA",
      };
      persistUser(userMariana);
      return userMariana;
    }

    // 2. Coincidencia por rol exacto (ej: "COORDINADOR_SINARP", "ADMIN", etc.)
    const upperInput = cleanInput.toUpperCase() as UserRole;
    if (MOCK_USERS_BY_ROLE[upperInput]) {
      const user = MOCK_USERS_BY_ROLE[upperInput];
      persistUser(user);
      return user;
    }

    // 3. Coincidencia en MOCK_USERS_BY_ROLE por cédula, email, id o nombre
    const users = Object.values(MOCK_USERS_BY_ROLE);
    let matchedUser = users.find((u) => {
      return (
        u.cedula?.toLowerCase() === cleanInput ||
        u.email?.toLowerCase() === cleanInput ||
        u.id.toLowerCase() === cleanInput ||
        u.name.toLowerCase() === cleanInput ||
        u.role.toLowerCase() === cleanInput
      );
    });

    // 4. Mapeo específico por cédulas conocidas de prueba
    if (!matchedUser) {
      switch (cleanInput) {
        case "1712345678": // Andrea López
          matchedUser = MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
          break;
        case "1716789019": // Carlos Andrade
          matchedUser = MOCK_USERS_BY_ROLE.REPRESENTANTE_INSTITUCIONAL;
          break;
        case "1799999999": // Admin Portal
        case "1718956234":
          matchedUser = MOCK_USERS_BY_ROLE.ADMIN;
          break;
        case "1711223344": // Director Gestión
          matchedUser = MOCK_USERS_BY_ROLE.DIR_GESTION;
          break;
        case "1111111111": // Ana Torres (Revisor)
          matchedUser = MOCK_USERS_BY_ROLE.EQ_GESTION;
          break;
        case "2222222222": // Director Normatividad
          matchedUser = MOCK_USERS_BY_ROLE.DIR_NORMATIVA;
          break;
        case "3333333333": // Revisor Normatividad
          matchedUser = MOCK_USERS_BY_ROLE.EQ_NORMATIVA;
          break;
        case "1719876543": // Dr. Roberto Méndez
          matchedUser = MOCK_USERS_BY_ROLE.APROBADOR;
          break;
        case "1718765432": // Lcda. Patricia Morales
          matchedUser = MOCK_USERS_BY_ROLE.FACTURACION;
          break;
        case "1715489621": // María Torres (DGR)
          matchedUser = MOCK_USERS_BY_ROLE.DGR;
          break;
        case "1712345602": // Carlos Mena (DTD)
          matchedUser = MOCK_USERS_BY_ROLE.DTD;
          break;
        case "1724589632": // Daniela Ruiz (DPI)
          matchedUser = MOCK_USERS_BY_ROLE.DPI;
          break;
        default:
          if (cleanInput.includes("admin")) {
            matchedUser = MOCK_USERS_BY_ROLE.ADMIN;
          } else if (cleanInput.includes("aprob")) {
            matchedUser = MOCK_USERS_BY_ROLE.APROBADOR;
          } else if (cleanInput.includes("normat")) {
            matchedUser = MOCK_USERS_BY_ROLE.DIR_NORMATIVA;
          } else if (cleanInput.includes("gest")) {
            matchedUser = MOCK_USERS_BY_ROLE.DIR_GESTION;
          } else {
            // Predeterminado: Coordinador SINARP (Andrea López)
            matchedUser = MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
          }
          break;
      }
    }

    persistUser(matchedUser);
    return matchedUser;
  }, []);

  const setRole = useCallback((role: UserRole) => {
    const user = MOCK_USERS_BY_ROLE[role] || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
    persistUser(user);
    return user;
  }, []);

  const setUser = useCallback((user: MockUser) => {
    persistUser(user);
  }, []);

  const logout = useCallback(() => {
    persistUser(null);
  }, []);

  return {
    activeUser,
    isLoaded,
    login,
    logout,
    setRole,
    setUser,
  };
}
