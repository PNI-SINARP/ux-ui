"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_USERS_BY_ROLE, type MockUser } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

const STORAGE_KEY = "dinarp_auth_v1";

export function useAuthStore() {
  const [activeUser, setActiveUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setActiveUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading auth store", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever activeUser changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (activeUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error saving auth store", e);
    }
  }, [activeUser, isLoaded]);

  const login = useCallback((input: string) => {
    const cleanInput = input.trim().toLowerCase();
    
    // Usuario especial demo Mariana Almeida (MinEduc)
    if (cleanInput === "1714443322" || cleanInput === "1714443376" || cleanInput === "m.almeida@educacion.gob.ec") {
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
      setActiveUser(userMariana);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userMariana));
      } catch (e) {
        console.error("Error saving auth store", e);
      }
      return userMariana;
    }

    const users = Object.values(MOCK_USERS_BY_ROLE);
    const user =
      users.find(
        (u) =>
          u.email?.toLowerCase() === cleanInput ||
          u.id.toLowerCase() === cleanInput ||
          u.cedula?.toLowerCase() === cleanInput ||
          (cleanInput === "1799999999" && u.role === "ADMIN") ||
          (cleanInput === "admin.portal@dinarp.gob.ec" && u.role === "ADMIN") ||
          (cleanInput === "1111111111" && u.role === "EQ_GESTION") ||
          (cleanInput === "2222222222" && u.role === "DIR_NORMATIVA") ||
          (cleanInput === "3333333333" && u.role === "EQ_NORMATIVA") ||
          (cleanInput === "gestion.revisor@gmail.com" && u.role === "EQ_GESTION") ||
          (cleanInput === "gestion.director@gmail.com" && u.role === "DIR_GESTION") ||
          (cleanInput === "normativa.director@gmail.com" && u.role === "DIR_NORMATIVA") ||
          (cleanInput === "normativa.revisor@gmail.com" && u.role === "EQ_NORMATIVA") ||
          (cleanInput === "1716789019" && u.role === "REPRESENTANTE_INSTITUCIONAL") ||
          (cleanInput === "carlos.andrade@educacion.gob.ec" && u.role === "REPRESENTANTE_INSTITUCIONAL")
      ) || (
        cleanInput === "1716789019"
          ? MOCK_USERS_BY_ROLE.REPRESENTANTE_INSTITUCIONAL
          : cleanInput === "1712345678"
          ? MOCK_USERS_BY_ROLE.COORDINADOR_SINARP
          : cleanInput === "1799999999" || cleanInput.includes("admin")
          ? MOCK_USERS_BY_ROLE.ADMIN
          : cleanInput === "1111111111"
          ? MOCK_USERS_BY_ROLE.EQ_GESTION
          : cleanInput === "2222222222"
          ? MOCK_USERS_BY_ROLE.DIR_NORMATIVA
          : cleanInput === "3333333333"
          ? MOCK_USERS_BY_ROLE.EQ_NORMATIVA
          : MOCK_USERS_BY_ROLE.DIR_GESTION
      );
    setActiveUser(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Error saving auth store", e);
    }
    return user;
  }, []);

  const logout = useCallback(() => {
    setActiveUser(null);
  }, []);

  return {
    activeUser,
    isLoaded,
    login,
    logout,
  };
}
