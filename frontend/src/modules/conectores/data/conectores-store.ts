"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export type EstadoConector = "HABILITADO" | "EN_PRUEBAS" | "RETIRADO";

export interface PruebaConector {
  fecha: string;
  resultado: "EXITOSO" | "FALLIDO";
  latenciaMs: number;
  protocoloProbado: string;
  handshakeTls: boolean;
  versionCompatible: boolean;
  detalle: string;
  ejecutadoPor: string;
}

export interface ConectorDefinicion {
  id: string; // ej: CNX-PG-01
  codigo: string; // ej: CNX-01
  nombre: string;
  tipo: string; // PostgreSQL, Oracle, REST, MySQL, SOAP, SFTP, MongoDB, DB2, etc.
  version: string;
  protocolo: string;
  puertoDefault: number;
  tipoAutenticacion: string;
  descripcion: string;
  estado: EstadoConector;
  fuentesAsociadasCount: number;
  driverJar?: string;
  timeoutSegundos: number;
  soportaSsl: boolean;
  fechaRegistro: string;
  registradoPor: string;
  ultimaPrueba?: PruebaConector;
}

export const CONECTORES_DEFAULT: ConectorDefinicion[] = [
  {
    id: "CNX-PG-01",
    codigo: "CNX-01",
    nombre: "PostgreSQL Native Connector",
    tipo: "PostgreSQL",
    version: "v4.2.1",
    protocolo: "TCP/IP 5432 - TLS v1.3",
    puertoDefault: 5432,
    tipoAutenticacion: "mTLS / Certificado X.509",
    descripcion: "Conexión directa optimizada vía red VPN institucional con lectura cifrada y pooling de conexiones.",
    estado: "HABILITADO",
    fuentesAsociadasCount: 5,
    driverJar: "postgresql-42.6.0.jar",
    timeoutSegundos: 15,
    soportaSsl: true,
    fechaRegistro: "2026-01-15",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-10-24 10:15",
      resultado: "EXITOSO",
      latenciaMs: 18,
      protocoloProbado: "TCP/IP 5432 - TLS v1.3",
      handshakeTls: true,
      versionCompatible: true,
      detalle: "Handshake TLS 1.3 exitoso. Compatibilidad de tipos UUID, VARCHAR y TIMESTAMPTZ verificada.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
  {
    id: "CNX-ORA-02",
    codigo: "CNX-01",
    nombre: "Oracle Enterprise Connector",
    tipo: "Oracle",
    version: "v3.1.0",
    protocolo: "Oracle Net 1521 - SSL TCPS",
    puertoDefault: 1521,
    tipoAutenticacion: "Oracle TCPS Wallet / Kerberos",
    descripcion: "Conector de alta concurrencia para bases transaccionales Oracle 19c/21c con failover de TNS.",
    estado: "HABILITADO",
    fuentesAsociadasCount: 3,
    driverJar: "ojdbc11-23.3.0.jar",
    timeoutSegundos: 20,
    soportaSsl: true,
    fechaRegistro: "2026-02-10",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-10-22 14:30",
      resultado: "EXITOSO",
      latenciaMs: 24,
      protocoloProbado: "Oracle Net 1521 - SSL TCPS",
      handshakeTls: true,
      versionCompatible: true,
      detalle: "Conexión a instancia transaccional verificada. Esquema canonizado para lectura.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
  {
    id: "CNX-REST-03",
    codigo: "CNX-01",
    nombre: "REST API Gateway Connector",
    tipo: "REST",
    version: "v2.0.4",
    protocolo: "HTTPS / OpenAPI v3.1",
    puertoDefault: 443,
    tipoAutenticacion: "OAuth2 mTLS / API Key",
    descripcion: "Conector HTTP seguro para microservicios y endpoints web RESTful con negociación de esquemas JSON.",
    estado: "HABILITADO",
    fuentesAsociadasCount: 8,
    driverJar: "rest-client-core-2.0.jar",
    timeoutSegundos: 10,
    soportaSsl: true,
    fechaRegistro: "2026-03-01",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-10-25 09:00",
      resultado: "EXITOSO",
      latenciaMs: 32,
      protocoloProbado: "HTTPS / OpenAPI v3.1",
      handshakeTls: true,
      versionCompatible: true,
      detalle: "Certificado TLS institucional validado. Swagger specification cargada correctamente.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
  {
    id: "CNX-MYS-04",
    codigo: "CNX-01",
    nombre: "MySQL / MariaDB Connector",
    tipo: "MySQL",
    version: "v8.0.33",
    protocolo: "TCP/IP 3306 - SSL",
    puertoDefault: 3306,
    tipoAutenticacion: "caching_sha2_password / SSL",
    descripcion: "Integrador de motores relacionales MySQL 8.0 y MariaDB para bases departamentales.",
    estado: "HABILITADO",
    fuentesAsociadasCount: 2,
    driverJar: "mysql-connector-j-8.0.33.jar",
    timeoutSegundos: 15,
    soportaSsl: true,
    fechaRegistro: "2026-03-18",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-10-20 16:40",
      resultado: "EXITOSO",
      latenciaMs: 28,
      protocoloProbado: "TCP/IP 3306 - SSL",
      handshakeTls: true,
      versionCompatible: true,
      detalle: "Validación de juego de caracteres utf8mb4 completada.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
  {
    id: "CNX-SOAP-05",
    codigo: "CNX-01",
    nombre: "SOAP / WSDL Legacy Bridge",
    tipo: "SOAP",
    version: "v1.2.0",
    protocolo: "HTTPS 443 - XML SOAP 1.2",
    puertoDefault: 443,
    tipoAutenticacion: "WS-Security / X.509",
    descripcion: "Puente de interoperabilidad para servicios legacy gubernamentales con contratos WSDL y envelopes XML.",
    estado: "HABILITADO",
    fuentesAsociadasCount: 1,
    driverJar: "apache-cxf-soap-3.5.jar",
    timeoutSegundos: 30,
    soportaSsl: true,
    fechaRegistro: "2026-04-05",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-10-18 11:20",
      resultado: "EXITOSO",
      latenciaMs: 45,
      protocoloProbado: "HTTPS 443 - XML SOAP 1.2",
      handshakeTls: true,
      versionCompatible: true,
      detalle: "Parsing de WSDL exitoso. Transformación canónica validada.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
  {
    id: "CNX-SFTP-06",
    codigo: "CNX-01",
    nombre: "Secure File Transfer (SFTP Batch)",
    tipo: "SFTP",
    version: "v2.5.1",
    protocolo: "SSH / SFTP Puerto 22",
    puertoDefault: 22,
    tipoAutenticacion: "SSH Key Ed25519 / RSA 4096",
    descripcion: "Conector batch para ingestión programada de archivos CSV, Parquet o JSON vía canal seguro SFTP.",
    estado: "EN_PRUEBAS",
    fuentesAsociadasCount: 0,
    driverJar: "jsch-sftp-0.2.14.jar",
    timeoutSegundos: 60,
    soportaSsl: true,
    fechaRegistro: "2026-09-12",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-10-23 17:10",
      resultado: "EXITOSO",
      latenciaMs: 52,
      protocoloProbado: "SSH / SFTP Puerto 22",
      handshakeTls: true,
      versionCompatible: true,
      detalle: "Autenticación por par de llaves SSH verificada en entorno de pruebas.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
  {
    id: "CNX-MGO-07",
    codigo: "CNX-01",
    nombre: "MongoDB Document Connector",
    tipo: "MongoDB",
    version: "v5.0.1",
    protocolo: "mongodb+srv / TLS",
    puertoDefault: 27017,
    tipoAutenticacion: "SCRAM-SHA-256 / X.509",
    descripcion: "Conector NoSQL para repositorios documentales BSON con soporte para sharding y replica sets.",
    estado: "EN_PRUEBAS",
    fuentesAsociadasCount: 0,
    driverJar: "mongodb-driver-sync-4.10.jar",
    timeoutSegundos: 15,
    soportaSsl: true,
    fechaRegistro: "2026-10-01",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-10-24 15:00",
      resultado: "EXITOSO",
      latenciaMs: 38,
      protocoloProbado: "mongodb+srv / TLS",
      handshakeTls: true,
      versionCompatible: true,
      detalle: "Replica set ping exitoso. Inspección de colecciones operando con esquema dinámico.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
  {
    id: "CNX-DB2-08",
    codigo: "CNX-01",
    nombre: "IBM DB2 Mainframe Connector",
    tipo: "DB2",
    version: "v11.5",
    protocolo: "DRDA 50000 - SSL",
    puertoDefault: 50000,
    tipoAutenticacion: "Kerberos / RACF",
    descripcion: "Conector legacy para sistemas centrales IBM z/OS y LUW bajo régimen excepcional de homologación.",
    estado: "RETIRADO",
    fuentesAsociadasCount: 0,
    driverJar: "db2jcc4-11.5.jar",
    timeoutSegundos: 45,
    soportaSsl: false,
    fechaRegistro: "2025-11-20",
    registradoPor: "Carlos Mena (TI)",
    ultimaPrueba: {
      fecha: "2026-06-15 10:00",
      resultado: "EXITOSO",
      latenciaMs: 110,
      protocoloProbado: "DRDA 50000",
      handshakeTls: false,
      versionCompatible: true,
      detalle: "Túnel VPN homologado. Emulación CP500 validada satisfactoriamente.",
      ejecutadoPor: "Carlos Mena (TI)",
    },
  },
];

const STORAGE_KEY = "dinarp_conectores_v1";
const EVENT_CHANGE = "dinarp_conectores_changed";

export function getStoredConectores(): ConectorDefinicion[] {
  if (typeof window === "undefined") return CONECTORES_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CONECTORES_DEFAULT));
      return CONECTORES_DEFAULT;
    }
    return JSON.parse(raw) as ConectorDefinicion[];
  } catch (err) {
    console.error("Error reading conectores from localStorage:", err);
    return CONECTORES_DEFAULT;
  }
}

export function saveStoredConectores(data: ConectorDefinicion[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_CHANGE));
  } catch (err) {
    console.error("Error saving conectores to localStorage:", err);
  }
}

export function useConectoresStore() {
  const [conectores, setConectores] = useState<ConectorDefinicion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(() => {
    setConectores(getStoredConectores());
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

  const getConectorById = useCallback(
    (id: string): ConectorDefinicion | undefined => {
      return conectores.find((c: ConectorDefinicion) => c.id.toLowerCase() === id.toLowerCase());
    },
    [conectores]
  );

  const registrarConector = useCallback(
    (nuevo: Omit<ConectorDefinicion, "id" | "fechaRegistro">): string => {
      const id = `CNX-${nuevo.tipo.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const conector: ConectorDefinicion = {
        ...nuevo,
        id,
        codigo: "CNX-01",
        fechaRegistro: new Date().toISOString().split("T")[0],
        fuentesAsociadasCount: 0,
      };

      const current = getStoredConectores();
      const updated = [conector, ...current];
      saveStoredConectores(updated);
      setConectores(updated);

      toast.success(`Tipo de conector ${conector.nombre} registrado (CNX-01)`, {
        description: `Identificador: ${id} · Estado inicial: ${conector.estado}`,
      });

      return id;
    },
    []
  );

  const actualizarConector = useCallback(
    (id: string, updates: Partial<ConectorDefinicion>): void => {
      const current = getStoredConectores();
      const updated = current.map((c: ConectorDefinicion) =>
        c.id === id ? { ...c, ...updates } : c
      );
      saveStoredConectores(updated);
      setConectores(updated);
      toast.success("Conector actualizado correctamente (CNX-01)");
    },
    []
  );

  const probarConector = useCallback(
    async (id: string, simularFallo = false): Promise<PruebaConector> => {
      const current = getStoredConectores();
      const conector = current.find((c: ConectorDefinicion) => c.id === id);
      if (!conector) {
        throw new Error("Conector no encontrado");
      }

      // Simulación de prueba técnica de laboratorio (CNX-02)
      await new Promise((res) => setTimeout(res, 900));

      const now = new Date();
      const fechaStr = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;

      if (simularFallo) {
        const resultadoFallido: PruebaConector = {
          fecha: fechaStr,
          resultado: "FALLIDO",
          latenciaMs: 1450,
          protocoloProbado: conector.protocolo,
          handshakeTls: false,
          versionCompatible: false,
          detalle: `Error de handshake TLS o timeout en puerto ${conector.puertoDefault}. El conector no respondió en el tiempo reglamentario.`,
          ejecutadoPor: "Carlos Mena (TI)",
        };

        const updated = current.map((c: ConectorDefinicion) =>
          c.id === id ? { ...c, ultimaPrueba: resultadoFallido } : c
        );
        saveStoredConectores(updated);
        setConectores(updated);

        toast.error(`Prueba técnica fallida para ${conector.nombre} (CNX-02)`, {
          description: resultadoFallido.detalle,
        });

        return resultadoFallido;
      }

      const latencia = Math.floor(Math.random() * 30) + 15;
      const resultadoExitoso: PruebaConector = {
        fecha: fechaStr,
        resultado: "EXITOSO",
        latenciaMs: latencia,
        protocoloProbado: conector.protocolo,
        handshakeTls: conector.soportaSsl,
        versionCompatible: true,
        detalle: `Conexión de sandbox exitosa (${latencia}ms). Handshake TLS verificado. Driver ${conector.version} certificado para interoperabilidad DINARP.`,
        ejecutadoPor: "Carlos Mena (TI)",
      };

      const updated = current.map((c: ConectorDefinicion) =>
        c.id === id ? { ...c, ultimaPrueba: resultadoExitoso } : c
      );
      saveStoredConectores(updated);
      setConectores(updated);

      toast.success(`Prueba técnica exitosa: ${conector.nombre} (CNX-02)`, {
        description: `Latencia: ${latencia}ms · Protocolo certificado: ${conector.protocolo}`,
      });

      return resultadoExitoso;
    },
    []
  );

  const cambiarEstadoConector = useCallback(
    (id: string, nuevoEstado: EstadoConector, motivo?: string): void => {
      const current = getStoredConectores();
      const conector = current.find((c: ConectorDefinicion) => c.id === id);
      if (!conector) return;

      const updated = current.map((c: ConectorDefinicion) =>
        c.id === id ? { ...c, estado: nuevoEstado } : c
      );
      saveStoredConectores(updated);
      setConectores(updated);

      const verb =
        nuevoEstado === "HABILITADO"
          ? "habilitado en catálogo"
          : nuevoEstado === "RETIRADO"
          ? "retirado del catálogo"
          : "puesto en pruebas técnicas";

      toast.success(`Conector ${conector.nombre} ${verb} (CNX-02)`, {
        description: motivo ? `Motivo: ${motivo}` : undefined,
      });
    },
    []
  );

  const reiniciarValoresPorDefecto = useCallback((): void => {
    saveStoredConectores(CONECTORES_DEFAULT);
    setConectores(CONECTORES_DEFAULT);
    toast.info("Catálogo de conectores reiniciado a valores oficiales");
  }, []);

  return {
    conectores,
    isLoaded,
    getConectorById,
    registrarConector,
    actualizarConector,
    probarConector,
    cambiarEstadoConector,
    reiniciarValoresPorDefecto,
  };
}
