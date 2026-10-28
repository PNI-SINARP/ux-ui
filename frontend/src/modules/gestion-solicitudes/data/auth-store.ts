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
        if (memoryUser?.roleTitle) {
          memoryUser.roleTitle = memoryUser.roleTitle.replace(/\s*[—-]\s*.*$/, "");
        }
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

// Mapa exhaustivo de cuentas de prueba para sincronización exacta con el UserMenu
export const DINARP_TEST_USERS_MAP: Record<string, MockUser> = {
  // Admin del Sistema (ID-00 a ID-15)
  "1799999999": {
    id: "U-ADMIN01",
    name: "Admin Portal",
    role: "ADMIN",
    roleTitle: "Administrador del Sistema",
    email: "admin.portal@dinarp.gob.ec",
    avatar: "AP",
    institution: "DINARP",
    cedula: "1799999999",
    initials: "AP",
  },
  // Usuario Habilitado (ID-06, ID-07)
  "1788888888": {
    id: "USR-HAB-001",
    name: "Funcionario Habilitado",
    role: "COORDINADOR_SINARP",
    roleTitle: "Usuario Habilitado",
    email: "funcionario.habilitado@dinarp.gob.ec",
    institution: "DINARP",
    cedula: "1788888888",
    avatar: "FH",
    initials: "FH",
  },
  // Usuario Pendiente Activación (ID-09, ID-12)
  "1718956234": {
    id: "USR-ACT-001",
    name: "Usuario Pendiente Activación",
    role: "COORDINADOR_SINARP",
    roleTitle: "Usuario en Activación (Vinculación 2FA)",
    email: "usuario.activacion@dinarp.gob.ec",
    institution: "DINARP",
    cedula: "1718956234",
    avatar: "UA",
    initials: "UA",
  },
  // Representante Legal Marcelo Albuja (BN-01 / Anexo A)
  "1710001112": {
    id: "USR-REP-001",
    name: "Marcelo Albuja",
    role: "REPRESENTANTE_INSTITUCIONAL",
    roleTitle: "Representante Legal / Solicitante",
    email: "m.albuja@educacion.gob.ec",
    institution: "Ministerio de Educación",
    cedula: "1710001112",
    avatar: "MA",
    initials: "MA",
  },
  // Director Gestión
  "1711223344": {
    id: "U-DIRGEST",
    name: "Director Gestión",
    role: "DIR_GESTION",
    roleTitle: "Director Área de Gestión",
    email: "gestion.director@dinarp.gob.ec",
    avatar: "DG",
    institution: "DINARP",
    cedula: "1711223344",
    initials: "DG",
  },
  // Revisor Gestión
  "1111111111": {
    id: "U-EQGEST",
    name: "Ana Torres (Revisor)",
    role: "EQ_GESTION",
    roleTitle: "Revisor Área de Gestión",
    email: "gestion.revisor@dinarp.gob.ec",
    avatar: "AT",
    institution: "DINARP",
    cedula: "1111111111",
    initials: "AT",
  },
  // Director Normativa
  "2222222222": {
    id: "U-DIRNORM",
    name: "Director Normativa",
    role: "DIR_NORMATIVA",
    roleTitle: "Director Área de Normativa",
    email: "normativa.director@dinarp.gob.ec",
    avatar: "DN",
    institution: "DINARP",
    cedula: "2222222222",
    initials: "DN",
  },
  // Revisor Normativa
  "3333333333": {
    id: "U-EQNORM",
    name: "Revisor Normativa",
    role: "EQ_NORMATIVA",
    roleTitle: "Revisor Área de Normativa",
    email: "normativa.revisor@dinarp.gob.ec",
    avatar: "RN",
    institution: "DINARP",
    cedula: "3333333333",
    initials: "RN",
  },
  // Director DPI (BN-07)
  "4444444444": {
    id: "U-DIRDPI",
    name: "Director DPI",
    role: "DIR_DPI",
    roleTitle: "Director de Protección de la Información (DPI)",
    email: "dpi.director@dinarp.gob.ec",
    avatar: "DP",
    institution: "DINARP",
    cedula: "4444444444",
    initials: "DP",
  },
  // Revisor DPI (BN-07)
  "5555555555": {
    id: "U-EQDPI",
    name: "Carlos Mora (Revisor DPI)",
    role: "EQ_DPI",
    roleTitle: "Revisor de Protección de la Información (DPI)",
    email: "dpi.revisor@dinarp.gob.ec",
    avatar: "CM",
    institution: "DINARP",
    cedula: "5555555555",
    initials: "CM",
  },
  // Roberto Dávila (MSP - BN-02 / Anexo B)
  "1715489621": {
    id: "USR-CRD-MSP",
    name: "Roberto Dávila",
    role: "COORDINADOR_SINARP",
    roleTitle: "Coordinador Titular (Prerregistrado)",
    email: "roberto.davila@msp.gob.ec",
    institution: "Ministerio de Salud Pública",
    cedula: "1715489621",
    avatar: "RD",
    initials: "RD",
  },
  // Carlos Andrade (Rep. Institucional - BN-03 / Anexo C)
  "1716789019": {
    id: "1716789019",
    name: "Carlos Andrade",
    role: "REPRESENTANTE_INSTITUCIONAL",
    roleTitle: "Representante Institucional",
    email: "carlos.andrade@educacion.gob.ec",
    institution: "Ministerio de Educación",
    cedula: "1716789019",
    avatar: "CA",
    initials: "CA",
  },
  // Juan Pérez (Suplencias)
  "1234567890": {
    id: "USR-CRD-JP",
    name: "Juan Pérez",
    role: "COORDINADOR_SINARP",
    roleTitle: "Coordinador Titular (Suplencias)",
    email: "juan.perez@educacion.gob.ec",
    institution: "Ministerio de Educación",
    cedula: "1234567890",
    avatar: "JP",
    initials: "JP",
  },
  // Mariana Almeida (Coordinador Suplente)
  "1714443322": {
    id: "USR-CRD-001",
    name: "Mariana Almeida",
    role: "COORDINADOR_SINARP",
    roleTitle: "Coordinador Suplente",
    email: "m.almeida@educacion.gob.ec",
    institution: "Ministerio de Educación",
    cedula: "1714443322",
    avatar: "MA",
    initials: "MA",
  },
  // Andrea López (Coordinador Consumidor MinEduc)
  "1712345678": {
    id: "1712345678",
    name: "Andrea López (MinEduc)",
    role: "COORDINADOR_SINARP",
    roleTitle: "Coordinador SINARP",
    email: "coordinador@educacion.gob.ec",
    institution: "Ministerio de Educación",
    cedula: "1712345678",
    avatar: "AL",
    initials: "AL",
  },
  // Dr. Roberto Méndez (Aprobador)
  "1719876543": {
    id: "USR-005",
    name: "Dr. Roberto Méndez",
    role: "APROBADOR",
    roleTitle: "Aprobador Institucional",
    email: "roberto.mendez@dinarp.gob.ec",
    institution: "DINARP",
    cedula: "1719876543",
    avatar: "RM",
    initials: "RM",
  },
  // Lcda. Patricia Morales (Facturación)
  "1718765432": {
    id: "USR-006",
    name: "Lcda. Patricia Morales",
    role: "FACTURACION",
    roleTitle: "Analista de Facturación",
    email: "patricia.morales@dinarp.gob.ec",
    institution: "DINARP - Dirección Financiera",
    cedula: "1718765432",
    avatar: "PM",
    initials: "PM",
  },
  // Carlos Mendoza (Registro Civil - BN-06)
  "1720304050": {
    id: "USR-PRV-001",
    name: "Carlos Mendoza (Registro Civil)",
    role: "COORDINADOR_SINARP",
    roleTitle: "Coordinador Proveedor (Entidad Emisora)",
    email: "carlos.mendoza@registrocivil.gob.ec",
    institution: "Dirección General de Registro Civil, Identificación y Cedulación",
    cedula: "1720304050",
    avatar: "CM",
    initials: "CM",
  },
  // Carlos Mena (DTD - BN-06)
  "1716543210": {
    id: "USR-003",
    name: "Carlos Mena",
    role: "DTD",
    roleTitle: "Equipo de TI / Infraestructura (DTD)",
    email: "carlos.mena@dinarp.gob.ec",
    institution: "DINARP - DTD",
    cedula: "1716543210",
    avatar: "CM",
    initials: "CM",
  },
  "1712345602": {
    id: "USR-003",
    name: "Carlos Mena",
    role: "DTD",
    roleTitle: "Equipo de TI / Infraestructura (DTD)",
    email: "carlos.mena@dinarp.gob.ec",
    institution: "DINARP - DTD",
    cedula: "1712345602",
    avatar: "CM",
    initials: "CM",
  },
  // María Torres (DGR - BN-06)
  "1717654321": {
    id: "USR-002",
    name: "María Torres",
    role: "DGR",
    roleTitle: "Dirección de Gestión y Registro (DGR)",
    email: "maria.torres@dinarp.gob.ec",
    institution: "DINARP - DGR",
    cedula: "1717654321",
    avatar: "MT",
    initials: "MT",
  },
  // Daniela Ruiz (DPI - BN-06)
  "1715432109": {
    id: "USR-004",
    name: "Daniela Ruiz",
    role: "DPI",
    roleTitle: "Dirección de Protección de Información (DPI)",
    email: "daniela.ruiz@dinarp.gob.ec",
    institution: "DINARP - DPI",
    cedula: "1715432109",
    avatar: "DR",
    initials: "DR",
  },
  "1724589632": {
    id: "USR-004",
    name: "Daniela Ruiz",
    role: "DPI",
    roleTitle: "Dirección de Protección de Información (DPI)",
    email: "daniela.ruiz@dinarp.gob.ec",
    institution: "DINARP - DPI",
    cedula: "1724589632",
    avatar: "DR",
    initials: "DR",
  },
};

export function useAuthStore() {
  const [activeUser, setActiveUserInternal] = useState<MockUser | null>(null);
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


  const login = useCallback((input: string, override?: Partial<MockUser>): MockUser => {
    const cleanInput = input.trim().toLowerCase();

    // 1. Coincidencia directa en tabla exhaustiva de cuentas de prueba
    let matchedUser: MockUser | undefined = DINARP_TEST_USERS_MAP[cleanInput];

    // 2. Coincidencia por rol exacto (ej: "COORDINADOR_SINARP", "ADMIN", etc.)
    if (!matchedUser) {
      const upperInput = cleanInput.toUpperCase() as UserRole;
      if (MOCK_USERS_BY_ROLE[upperInput]) {
        matchedUser = { ...MOCK_USERS_BY_ROLE[upperInput] };
      }
    }

    // 3. Coincidencia por nombre, email o cédula en DINARP_TEST_USERS_MAP
    if (!matchedUser) {
      const testAccounts = Object.values(DINARP_TEST_USERS_MAP);
      matchedUser = testAccounts.find((u) => {
        return (
          u.cedula?.toLowerCase() === cleanInput ||
          u.email?.toLowerCase() === cleanInput ||
          u.id.toLowerCase() === cleanInput ||
          u.name.toLowerCase() === cleanInput ||
          u.name.toLowerCase().includes(cleanInput)
        );
      });
    }

    // 4. Coincidencia en MOCK_USERS_BY_ROLE por cédula, email, id o nombre
    if (!matchedUser) {
      const users = Object.values(MOCK_USERS_BY_ROLE);
      matchedUser = users.find((u) => {
        return (
          u.cedula?.toLowerCase() === cleanInput ||
          u.email?.toLowerCase() === cleanInput ||
          u.id.toLowerCase() === cleanInput ||
          u.name.toLowerCase() === cleanInput ||
          u.role.toLowerCase() === cleanInput
        );
      });
    }

    // 5. Fallbacks por palabras clave
    if (!matchedUser) {
      if (cleanInput.includes("admin")) {
        matchedUser = DINARP_TEST_USERS_MAP["1799999999"];
      } else if (cleanInput.includes("aprob")) {
        matchedUser = DINARP_TEST_USERS_MAP["1719876543"];
      } else if (cleanInput.includes("normat")) {
        matchedUser = DINARP_TEST_USERS_MAP["2222222222"];
      } else if (cleanInput.includes("gest")) {
        matchedUser = DINARP_TEST_USERS_MAP["1711223344"];
      } else if (cleanInput.includes("mendoza") || cleanInput.includes("proveedor")) {
        matchedUser = DINARP_TEST_USERS_MAP["1720304050"];
      } else if (cleanInput.includes("mena") || cleanInput.includes("dtd")) {
        matchedUser = DINARP_TEST_USERS_MAP["1716543210"];
      } else if (cleanInput.includes("torres") || cleanInput.includes("dgr")) {
        matchedUser = DINARP_TEST_USERS_MAP["1717654321"];
      } else if (cleanInput.includes("ruiz") || cleanInput.includes("dpi")) {
        matchedUser = DINARP_TEST_USERS_MAP["1715432109"];
      } else {
        matchedUser = DINARP_TEST_USERS_MAP["1712345678"] || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
      }
    }

    // Clonar para no mutar el mapa base
    let finalUser: MockUser = { ...matchedUser };

    // Si se pasa un override (por ejemplo desde el drawer de cuentas de prueba), se fusiona
    if (override) {
      finalUser = {
        ...finalUser,
        ...override,
        initials:
          override.initials ||
          (override.name
            ? override.name
                .split(" ")
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : finalUser.initials),
      };
    }

    persistUser(finalUser);
    return finalUser;
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
