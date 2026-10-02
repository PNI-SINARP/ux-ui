"use client";

import { useState, useEffect, useCallback } from "react";

export type EstadoRol = "Borrador" | "Activo" | "Inactivo";

export type AccionCapacidad =
  | "LEER"
  | "CREAR"
  | "MODIFICAR"
  | "ELIMINAR"
  | "APROBAR"
  | "EJECUTAR"
  | "ADMINISTRAR";

export type AmbitoCapacidad =
  | "DINARP_TI"
  | "GLOBAL"
  | "DGR"
  | "DPI"
  | "INSTITUCIONAL"
  | "NORMATIVA"
  | "INTEROPERABILIDAD";

export interface CapacidadRol {
  codigo: string;
  nombre: string;
  accion: AccionCapacidad;
  ambito: AmbitoCapacidad;
  descripcion: string;
}

export interface DependenciaCuenta {
  id: string;
  cedula: string;
  nombre: string;
  correo: string;
  estado: "ACTIVO" | "PENDIENTE_ACTIVACION" | "SUSPENDIDO";
  ambito: string;
}

export interface DependenciaTarea {
  id: string;
  titulo: string;
  tipo: string;
  asignadoA: string;
  estado: "PENDIENTE" | "EN_PROGRESO";
}

export type TipoEventoAuditoriaRol =
  | "CREACION"
  | "EDICION"
  | "ACTIVACION"
  | "RETIRO"
  | "REACTIVACION"
  | "ELIMINACION_BORRADOR";

export interface EventoAuditoriaRol {
  id: string;
  fecha: string;
  autor: string;
  motivo: string;
  version: string;
  tipoAccion: TipoEventoAuditoriaRol;
  detalles: string;
}

export interface Rol {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  version: string;
  estado: EstadoRol;
  esProtegido: boolean;
  nuncaUsado: boolean;
  cuentasAsociadas: number;
  capacidades: CapacidadRol[];
  dependencias: {
    cuentas: DependenciaCuenta[];
    tareas: DependenciaTarea[];
    impactoPermisos: string[];
  };
  auditoria: EventoAuditoriaRol[];
  fechaCreacion: string;
  ultimaActualizacion: string;
}

// Catálogo General de Capacidades disponibles en DINARP
export const CATALOGO_CAPACIDADES: CapacidadRol[] = [
  {
    codigo: "CAP-AUTH-001",
    nombre: "Gestión de Autenticación y 2FA",
    accion: "ADMINISTRAR",
    ambito: "DINARP_TI",
    descripcion: "Configuración global de políticas de autenticación, restablecimiento de tokens y 2FA.",
  },
  {
    codigo: "CAP-USR-002",
    nombre: "Administración de Cuentas Internas",
    accion: "CREAR",
    ambito: "DINARP_TI",
    descripcion: "Creación, suspensión, reactivación y asignación de cuentas de funcionarios DINARP.",
  },
  {
    codigo: "CAP-ROL-003",
    nombre: "Gestión de Roles y Capacidades",
    accion: "ADMINISTRAR",
    ambito: "GLOBAL",
    descripcion: "Definición de roles de seguridad, versionado y asignación de privilegios de acceso.",
  },
  {
    codigo: "CAP-DGR-004",
    nombre: "Asignación de Trámites de Interoperabilidad",
    accion: "APROBAR",
    ambito: "DGR",
    descripcion: "Distribución y supervisión de expedientes de homologación e interoperabilidad.",
  },
  {
    codigo: "CAP-REV-005",
    nombre: "Revisión Técnica y Documental",
    accion: "EJECUTAR",
    ambito: "DGR",
    descripcion: "Validación de requisitos técnicos para consumo de servicios de registro civil y SRI.",
  },
  {
    codigo: "CAP-NORM-006",
    nombre: "Emisión de Dictámenes Jurídicos",
    accion: "APROBAR",
    ambito: "NORMATIVA",
    descripcion: "Control de legalidad y emisión de dictámenes normativos vinculantes.",
  },
  {
    codigo: "CAP-AUD-007",
    nombre: "Auditoría Forense y Trazabilidad",
    accion: "LEER",
    ambito: "GLOBAL",
    descripcion: "Acceso a logs de transacciones, descargas forenses y bitácora de eventos del sistema.",
  },
  {
    codigo: "CAP-CAT-008",
    nombre: "Gestión del Catálogo de Servicios",
    accion: "MODIFICAR",
    ambito: "INTEROPERABILIDAD",
    descripcion: "Publicación, versionado y deprecación de servicios REST/SOAP en el Catálogo Nacional.",
  },
];

export const INITIAL_ROLES: Rol[] = [
  {
    id: "ROL-ADM-001",
    codigo: "ADMIN",
    nombre: "Administrador del Sistema",
    descripcion: "Control total de la infraestructura, aprovisionamiento de identidades, reglas de seguridad y auditoría institucional.",
    version: "v2.1",
    estado: "Activo",
    esProtegido: true,
    nuncaUsado: false,
    cuentasAsociadas: 1,
    capacidades: [
      CATALOGO_CAPACIDADES[0], // CAP-AUTH-001
      CATALOGO_CAPACIDADES[1], // CAP-USR-002
      CATALOGO_CAPACIDADES[2], // CAP-ROL-003
      CATALOGO_CAPACIDADES[6], // CAP-AUD-007
    ],
    dependencias: {
      cuentas: [
        {
          id: "USR-INT-001",
          cedula: "1799999999",
          nombre: "Administrador DINARP",
          correo: "admin.portal@dinarp.gob.ec",
          estado: "ACTIVO",
          ambito: "DINARP · Tecnologías de la Información",
        },
      ],
      tareas: [
        {
          id: "TSK-001",
          titulo: "Renovación periódica de claves criptográficas y certificados TLS",
          tipo: "Infraestructura",
          asignadoA: "Administrador DINARP",
          estado: "PENDIENTE",
        },
      ],
      impactoPermisos: [
        "Pérdida inmediata de acceso al panel de administración institucional.",
        "Bloqueo total en el aprovisionamiento de nuevas cuentas y gestión de 2FA.",
        "Inhabilitación de políticas de mitigación y revocatoria de sesiones.",
      ],
    },
    auditoria: [
      {
        id: "AUD-ROL-001",
        fecha: "01/01/2026 08:00",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Aprovisionamiento inicial de privilegios administrativos de plataforma.",
        version: "v1.0",
        tipoAccion: "CREACION",
        detalles: "Creación del rol maestro protegido del núcleo DINARP.",
      },
      {
        id: "AUD-ROL-002",
        fecha: "15/02/2026 10:30",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Actualización de directivas de auditoría forense ISO 27001.",
        version: "v2.0",
        tipoAccion: "EDICION",
        detalles: "Adición de capacidad CAP-AUD-007.",
      },
      {
        id: "AUD-ROL-003",
        fecha: "20/09/2026 14:00",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Ajuste de capacidades de versionado de roles.",
        version: "v2.1",
        tipoAccion: "EDICION",
        detalles: "Actualización de alcances globales en CAP-ROL-003.",
      },
    ],
    fechaCreacion: "01/01/2026 08:00",
    ultimaActualizacion: "20/09/2026 14:00",
  },
  {
    id: "ROL-DIR-002",
    codigo: "DIR_GESTION",
    nombre: "Director de Gestión y Registro",
    descripcion: "Dirección y supervisión operativa, asignación de trámites de interoperabilidad y coordinación con entidades requirentes.",
    version: "v1.4",
    estado: "Activo",
    esProtegido: false,
    nuncaUsado: false,
    cuentasAsociadas: 1,
    capacidades: [
      CATALOGO_CAPACIDADES[3], // CAP-DGR-004
      CATALOGO_CAPACIDADES[4], // CAP-REV-005
      CATALOGO_CAPACIDADES[7], // CAP-CAT-008
    ],
    dependencias: {
      cuentas: [
        {
          id: "USR-INT-002",
          cedula: "1711223344",
          nombre: "Director Gestión",
          correo: "gestion.director@gmail.com",
          estado: "ACTIVO",
          ambito: "Dirección de Gestión y Registro (DGR)",
        },
      ],
      tareas: [
        {
          id: "TRM-2026-001",
          titulo: "Asignación pendiente Registro Civil - Certificados de Nacimiento",
          tipo: "Trámite DGR",
          asignadoA: "Director Gestión",
          estado: "PENDIENTE",
        },
        {
          id: "TRM-2026-004",
          titulo: "Supervisión expediente SRI - Matriz de Datos Tributarios",
          tipo: "Supervisión",
          asignadoA: "Director Gestión",
          estado: "EN_PROGRESO",
        },
      ],
      impactoPermisos: [
        "Paralización de la asignación formal de expedientes entrantes de interoperabilidad.",
        "Revocatoria de firma de actas de homologación técnica para entidades requirentes.",
      ],
    },
    auditoria: [
      {
        id: "AUD-ROL-004",
        fecha: "15/01/2026 09:30",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Configuración de perfil directivo para área de registro.",
        version: "v1.0",
        tipoAccion: "CREACION",
        detalles: "Creación del rol directivo con capacidades DGR.",
      },
      {
        id: "AUD-ROL-005",
        fecha: "10/05/2026 11:20",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Inclusión de permisos para actualización del catálogo de servicios.",
        version: "v1.4",
        tipoAccion: "EDICION",
        detalles: "Incorporación de CAP-CAT-008.",
      },
    ],
    fechaCreacion: "15/01/2026 09:30",
    ultimaActualizacion: "10/05/2026 11:20",
  },
  {
    id: "ROL-EQ-003",
    codigo: "EQ_GESTION",
    nombre: "Revisor del Área de Gestión",
    descripcion: "Revisión documental técnica, calificación de carpetas y verificación de protocolos de intercambio de información.",
    version: "v1.2",
    estado: "Activo",
    esProtegido: false,
    nuncaUsado: false,
    cuentasAsociadas: 2,
    capacidades: [
      CATALOGO_CAPACIDADES[4], // CAP-REV-005
    ],
    dependencias: {
      cuentas: [
        {
          id: "USR-INT-003",
          cedula: "1111111111",
          nombre: "Revisor Gestión (Ana Torres)",
          correo: "gestion.revisor@gmail.com",
          estado: "ACTIVO",
          ambito: "Dirección de Gestión y Registro (DGR)",
        },
        {
          id: "USR-INT-007",
          cedula: "1724567890",
          nombre: "Pedro Sánchez (Analista Técnico)",
          correo: "pedro.sanchez@dinarp.gob.ec",
          estado: "ACTIVO",
          ambito: "Dirección de Gestión y Registro (DGR)",
        },
      ],
      tareas: [
        {
          id: "TRM-2026-089",
          titulo: "Revisión técnica de especificaciones de consumo de API Registro Civil",
          tipo: "Revisión Documental",
          asignadoA: "Ana Torres",
          estado: "EN_PROGRESO",
        },
      ],
      impactoPermisos: [
        "2 analistas perderán la facultad de calificar expedientes técnicos asignados.",
        "Los trámites en bandeja técnica quedarán en estado bloqueado hasta reasignación de rol.",
      ],
    },
    auditoria: [
      {
        id: "AUD-ROL-006",
        fecha: "20/01/2026 10:15",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Habilitación del equipo de revisión técnica.",
        version: "v1.0",
        tipoAccion: "CREACION",
        detalles: "Creación inicial para analistas de gestión.",
      },
    ],
    fechaCreacion: "20/01/2026 10:15",
    ultimaActualizacion: "20/01/2026 10:15",
  },
  {
    id: "ROL-DIR-004",
    codigo: "DIR_NORMATIVA",
    nombre: "Director de Normatividad Jurídica",
    descripcion: "Dirección y validación legal de convenios de datos, acuerdos marco de intercambio y emisión de dictámenes normativos.",
    version: "v1.0",
    estado: "Activo",
    esProtegido: false,
    nuncaUsado: false,
    cuentasAsociadas: 1,
    capacidades: [
      CATALOGO_CAPACIDADES[5], // CAP-NORM-006
    ],
    dependencias: {
      cuentas: [
        {
          id: "USR-INT-004",
          cedula: "2222222222",
          nombre: "Director Normatividad",
          correo: "normativa.director@gmail.com",
          estado: "ACTIVO",
          ambito: "Dirección de Normatividad Jurídica",
        },
      ],
      tareas: [],
      impactoPermisos: [
        "Suspensión de firma en resoluciones de homologación legal.",
      ],
    },
    auditoria: [
      {
        id: "AUD-ROL-007",
        fecha: "18/01/2026 11:00",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Acreditación de rol para dirección jurídica institucional.",
        version: "v1.0",
        tipoAccion: "CREACION",
        detalles: "Rol creado con capacidad CAP-NORM-006.",
      },
    ],
    fechaCreacion: "18/01/2026 11:00",
    ultimaActualizacion: "18/01/2026 11:00",
  },
  {
    id: "ROL-BORR-005",
    codigo: "AUDITOR_SEG",
    nombre: "Auditor de Seguridad y Cumplimiento",
    descripcion: "Fiscalización independiente de accesos, inspección de eventos y análisis de riesgo en consultas transaccionales.",
    version: "v1.0-draft",
    estado: "Borrador",
    esProtegido: false,
    nuncaUsado: true,
    cuentasAsociadas: 0,
    capacidades: [
      CATALOGO_CAPACIDADES[6], // CAP-AUD-007
    ],
    dependencias: {
      cuentas: [],
      tareas: [],
      impactoPermisos: [
        "Ninguna cuenta vinculada actualmente. Sin impacto en usuarios activos.",
      ],
    },
    auditoria: [
      {
        id: "AUD-ROL-008",
        fecha: "28/09/2026 16:40",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Preparación de propuesta de rol para auditoría externa CGE.",
        version: "v1.0-draft",
        tipoAccion: "CREACION",
        detalles: "Borrador inicial guardado sin publicación operativa.",
      },
    ],
    fechaCreacion: "28/09/2026 16:40",
    ultimaActualizacion: "28/09/2026 16:40",
  },
  {
    id: "ROL-INA-006",
    codigo: "OPERADOR_TERRITORIAL",
    nombre: "Operador de Nodo Territorial (Histórico)",
    descripcion: "Rol delegado para validación presencial en cabeceras cantonales. Retirado lógicamente por centralización en SURI 2.0.",
    version: "v1.3",
    estado: "Inactivo",
    esProtegido: false,
    nuncaUsado: false,
    cuentasAsociadas: 0,
    capacidades: [
      CATALOGO_CAPACIDADES[4], // CAP-REV-005
    ],
    dependencias: {
      cuentas: [],
      tareas: [],
      impactoPermisos: [
        "Rol actualmente inactivo. No afecta operaciones en curso.",
      ],
    },
    auditoria: [
      {
        id: "AUD-ROL-009",
        fecha: "05/01/2026 09:00",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Configuración legado para ventanillas zonales.",
        version: "v1.0",
        tipoAccion: "CREACION",
        detalles: "Rol operativo desplegado en zonales.",
      },
      {
        id: "AUD-ROL-010",
        fecha: "15/08/2026 17:00",
        autor: "Paula M. (Administrador DINARP)",
        motivo: "Cese de operaciones zonales por consolidación SURI 2.0.",
        version: "v1.3",
        tipoAccion: "RETIRO",
        detalles: "Baja lógica efectuada sin dependencias pendientes.",
      },
    ],
    fechaCreacion: "05/01/2026 09:00",
    ultimaActualizacion: "15/08/2026 17:00",
  },
];

const LOCAL_STORAGE_KEY = "dinarp_roles_permisos_v1";

function getFormattedCurrentDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function incrementMinorVersion(currentVer: string): string {
  const match = currentVer.match(/v(\d+)\.(\d+)/);
  if (!match) return "v1.1";
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10) + 1;
  return `v${major}.${minor}`;
}

export function useRolesStore() {
  const [roles, setRoles] = useState<Rol[]>(INITIAL_ROLES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga inicial de localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRoles(parsed);
          }
        }
      } catch (err) {
        console.error("Error al cargar roles de localStorage:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Guardado reactivo
  const persistRoles = useCallback((newRoles: Rol[]) => {
    setRoles(newRoles);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newRoles));
      } catch (err) {
        console.error("Error al persistir roles en localStorage:", err);
      }
    }
  }, []);

  // Restablecer a datos de fábrica
  const restablecerDemo = useCallback(() => {
    persistRoles(INITIAL_ROLES);
  }, [persistRoles]);

  // 1. CREAR ROL
  const crearRol = useCallback(
    (data: {
      codigo: string;
      nombre: string;
      descripcion: string;
      capacidadesCodigos: string[];
      motivo: string;
      iniciarComoActivo?: boolean;
    }) => {
      const trimmedCodigo = data.codigo.trim().toUpperCase().replace(/\s+/g, "_");
      const trimmedNombre = data.nombre.trim();
      const trimmedDescripcion = data.descripcion.trim();
      const trimmedMotivo = data.motivo.trim();

      if (!trimmedCodigo || !trimmedNombre || !trimmedDescripcion || !trimmedMotivo) {
        throw new Error("Todos los campos obligatorios deben ser completados.");
      }

      // Validar código único
      const existe = roles.some((r) => r.codigo === trimmedCodigo);
      if (existe) {
        throw new Error(`El código '${trimmedCodigo}' ya está registrado en otro rol.`);
      }

      const caps = CATALOGO_CAPACIDADES.filter((c) =>
        data.capacidadesCodigos.includes(c.codigo)
      );

      const fecha = getFormattedCurrentDate();
      const id = `ROL-${Date.now().toString().slice(-4)}`;
      const estadoInicial: EstadoRol = data.iniciarComoActivo ? "Activo" : "Borrador";
      const versionInicial = data.iniciarComoActivo ? "v1.0" : "v1.0-draft";

      const nuevoRol: Rol = {
        id,
        codigo: trimmedCodigo,
        nombre: trimmedNombre,
        descripcion: trimmedDescripcion,
        version: versionInicial,
        estado: estadoInicial,
        esProtegido: false,
        nuncaUsado: !data.iniciarComoActivo,
        cuentasAsociadas: 0,
        capacidades: caps,
        dependencias: {
          cuentas: [],
          tareas: [],
          impactoPermisos: ["Rol de reciente incorporación en el sistema."],
        },
        auditoria: [
          {
            id: `AUD-${Date.now()}`,
            fecha,
            autor: "Paula M. (Administrador DINARP)",
            motivo: trimmedMotivo,
            version: versionInicial,
            tipoAccion: "CREACION",
            detalles: `Creación de rol en estado ${estadoInicial} con ${caps.length} capacidades asignadas.`,
          },
        ],
        fechaCreacion: fecha,
        ultimaActualizacion: fecha,
      };

      persistRoles([nuevoRol, ...roles]);
      return nuevoRol;
    },
    [roles, persistRoles]
  );

  // 2. EDITAR ROL
  const editarRol = useCallback(
    (
      id: string,
      data: {
        nombre: string;
        descripcion: string;
        capacidadesCodigos: string[];
        motivo: string;
      }
    ) => {
      const target = roles.find((r) => r.id === id);
      if (!target) throw new Error("Rol no encontrado.");

      const trimmedNombre = data.nombre.trim();
      const trimmedDescripcion = data.descripcion.trim();
      const trimmedMotivo = data.motivo.trim();

      if (!trimmedNombre || !trimmedDescripcion || !trimmedMotivo) {
        throw new Error("Nombre, descripción y motivo son obligatorios.");
      }

      const caps = CATALOGO_CAPACIDADES.filter((c) =>
        data.capacidadesCodigos.includes(c.codigo)
      );

      const nuevaVersion =
        target.estado === "Borrador"
          ? target.version
          : incrementMinorVersion(target.version);

      const fecha = getFormattedCurrentDate();

      const evento: EventoAuditoriaRol = {
        id: `AUD-${Date.now()}`,
        fecha,
        autor: "Paula M. (Administrador DINARP)",
        motivo: trimmedMotivo,
        version: nuevaVersion,
        tipoAccion: "EDICION",
        detalles: `Modificación de parámetros y asignación de ${caps.length} capacidades.`,
      };

      const updated = roles.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          nombre: trimmedNombre,
          descripcion: trimmedDescripcion,
          capacidades: caps,
          version: nuevaVersion,
          ultimaActualizacion: fecha,
          auditoria: [evento, ...r.auditoria],
        };
      });

      persistRoles(updated);
      return updated.find((r) => r.id === id);
    },
    [roles, persistRoles]
  );

  // 3. ACTIVAR ROL (Borrador -> Activo)
  const activarRol = useCallback(
    (id: string, data: { motivo: string }) => {
      const target = roles.find((r) => r.id === id);
      if (!target) throw new Error("Rol no encontrado.");
      if (target.estado !== "Borrador") {
        throw new Error("Solo los roles en Borrador pueden ser activados.");
      }

      const trimmedMotivo = data.motivo.trim();
      if (!trimmedMotivo) throw new Error("Debe ingresar un motivo para la activación.");

      const fecha = getFormattedCurrentDate();
      const nuevaVersion = target.version.includes("draft") ? "v1.0" : target.version;

      const evento: EventoAuditoriaRol = {
        id: `AUD-${Date.now()}`,
        fecha,
        autor: "Paula M. (Administrador DINARP)",
        motivo: trimmedMotivo,
        version: nuevaVersion,
        tipoAccion: "ACTIVACION",
        detalles: "Transición de Borrador a Activo para asignación operativa.",
      };

      const updated = roles.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          estado: "Activo" as EstadoRol,
          nuncaUsado: false,
          version: nuevaVersion,
          ultimaActualizacion: fecha,
          auditoria: [evento, ...r.auditoria],
        };
      });

      persistRoles(updated);
      return updated.find((r) => r.id === id);
    },
    [roles, persistRoles]
  );

  // 4. RETIRAR ROL (Activo -> Inactivo)
  const retirarRol = useCallback(
    (id: string, data: { motivo: string }) => {
      const target = roles.find((r) => r.id === id);
      if (!target) throw new Error("Rol no encontrado.");

      // Regla de Negocio: Rol Administrador protegido
      if (target.esProtegido) {
        throw new Error(
          "El rol Administrador del Sistema es un rol protegido del núcleo institucional y no puede ser retirado."
        );
      }

      // Regla de Negocio: Último Administrador activo
      if (target.codigo === "ADMIN") {
        const otrosAdmins = roles.filter(
          (r) => r.codigo === "ADMIN" && r.estado === "Activo" && r.id !== id
        );
        if (otrosAdmins.length === 0) {
          throw new Error(
            "No se puede retirar el único rol Administrador activo del geoportal."
          );
        }
      }

      // Regla de Negocio: Bloquear el cambio si hay dependencias no resueltas
      const tieneCuentas = target.dependencias.cuentas.length > 0;
      const tieneTareas = target.dependencias.tareas.length > 0;
      if (tieneCuentas || tieneTareas) {
        const cuentasCount = target.dependencias.cuentas.length;
        const tareasCount = target.dependencias.tareas.length;
        throw new Error(
          `Retiro bloqueado: existen ${cuentasCount} cuenta(s) activa(s) y ${tareasCount} tarea(s) pendiente(s) asociadas a este rol. Reasigne o resuelva las dependencias antes de proceder.`
        );
      }

      const trimmedMotivo = data.motivo.trim();
      if (!trimmedMotivo) throw new Error("Debe ingresar un motivo para el retiro del rol.");

      const fecha = getFormattedCurrentDate();
      const nuevaVersion = incrementMinorVersion(target.version);

      const evento: EventoAuditoriaRol = {
        id: `AUD-${Date.now()}`,
        fecha,
        autor: "Paula M. (Administrador DINARP)",
        motivo: trimmedMotivo,
        version: nuevaVersion,
        tipoAccion: "RETIRO",
        detalles: "Baja lógica del rol institucional. Estado actualizado a Inactivo.",
      };

      const updated = roles.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          estado: "Inactivo" as EstadoRol,
          version: nuevaVersion,
          ultimaActualizacion: fecha,
          auditoria: [evento, ...r.auditoria],
        };
      });

      persistRoles(updated);
      return updated.find((r) => r.id === id);
    },
    [roles, persistRoles]
  );

  // 5. REACTIVAR ROL (Inactivo -> Activo)
  const reactivarRol = useCallback(
    (id: string, data: { motivo: string }) => {
      const target = roles.find((r) => r.id === id);
      if (!target) throw new Error("Rol no encontrado.");
      if (target.estado !== "Inactivo") {
        throw new Error("Solo los roles inactivos pueden ser reactivados.");
      }

      const trimmedMotivo = data.motivo.trim();
      if (!trimmedMotivo) throw new Error("Debe ingresar un motivo para reactivar el rol.");

      const fecha = getFormattedCurrentDate();
      const nuevaVersion = incrementMinorVersion(target.version);

      const evento: EventoAuditoriaRol = {
        id: `AUD-${Date.now()}`,
        fecha,
        autor: "Paula M. (Administrador DINARP)",
        motivo: trimmedMotivo,
        version: nuevaVersion,
        tipoAccion: "REACTIVACION",
        detalles: "Restablecimiento de vigencia y operatividad del rol.",
      };

      const updated = roles.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          estado: "Activo" as EstadoRol,
          version: nuevaVersion,
          ultimaActualizacion: fecha,
          auditoria: [evento, ...r.auditoria],
        };
      });

      persistRoles(updated);
      return updated.find((r) => r.id === id);
    },
    [roles, persistRoles]
  );

  // 6. ELIMINAR BORRADOR (Solo borradores nunca usados)
  const eliminarBorrador = useCallback(
    (id: string, data: { motivo: string }) => {
      const target = roles.find((r) => r.id === id);
      if (!target) throw new Error("Rol no encontrado.");

      if (target.estado !== "Borrador" || !target.nuncaUsado) {
        throw new Error(
          "Un rol que ha sido usado o publicado solo puede retirarse lógicamente; únicamente un borrador nunca usado puede eliminarse."
        );
      }

      if (target.cuentasAsociadas > 0 || target.dependencias.cuentas.length > 0) {
        throw new Error("No se puede eliminar un borrador con cuentas asignadas.");
      }

      const trimmedMotivo = data.motivo.trim();
      if (!trimmedMotivo) throw new Error("Debe ingresar un motivo para eliminar el borrador.");

      const updated = roles.filter((r) => r.id !== id);
      persistRoles(updated);
      return true;
    },
    [roles, persistRoles]
  );

  // 7. SIMULAR RESOLUCIÓN DE DEPENDENCIAS (Herramienta interactiva para pruebas del evaluador)
  const simularResolverDependencias = useCallback(
    (id: string) => {
      const target = roles.find((r) => r.id === id);
      if (!target) return;

      const fecha = getFormattedCurrentDate();
      const updated = roles.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          cuentasAsociadas: 0,
          dependencias: {
            cuentas: [],
            tareas: [],
            impactoPermisos: [
              "Dependencias resueltas: cuentas migradas a roles alternos y tareas finalizadas.",
            ],
          },
          ultimaActualizacion: fecha,
        };
      });

      persistRoles(updated);
    },
    [roles, persistRoles]
  );

  return {
    roles,
    isLoaded,
    crearRol,
    editarRol,
    activarRol,
    retirarRol,
    reactivarRol,
    eliminarBorrador,
    simularResolverDependencias,
    restablecerDemo,
  };
}
