"use client";

import { useState, useEffect, useCallback } from "react";

export type EstadoUsuario =
  | "PENDIENTE_ACTIVACION"
  | "ACTIVO"
  | "SUSPENDIDO"
  | "RETIRADO";

export type RolInterno =
  | "ADMIN"
  | "DIR_GESTION"
  | "EQ_GESTION"
  | "DIR_NORMATIVA"
  | "EQ_NORMATIVA"
  | "DGR"
  | "DTD"
  | "DPI"
  | "APROBADOR"
  | "FACTURACION";

export type TipoEventoAuditoria =
  | "CUENTA_CREADA"
  | "ACTIVACION"
  | "CAMBIO_ROL"
  | "CAMBIO_AREA"
  | "CAMBIO_AMBITO"
  | "INGRESO"
  | "BLOQUEO"
  | "SUSPENSION"
  | "REACTIVACION"
  | "RECUPERACION"
  | "CAMBIO_FACTOR"
  | "INVALIDACION_SESION"
  | "CAMBIO_COORDINADOR"
  | "CREDENCIALES_API_REVOCADAS"
  | "BAJA_LOGICA";

export interface EventoAuditoria {
  id: string;
  evento: TipoEventoAuditoria;
  eventoLabel: string;
  actor: string;
  fecha: string; // ISO or DD/MM/YYYY HH:mm
  resultado: "Éxito" | "Denegado" | "Fallo" | "Fallido" | "Pendiente" | "En conciliación";
  detalles?: string;
  motivo?: string;
  valorAnterior?: string;
  valorNuevo?: string;
  usuarioAfectadoId: string;
  usuarioAfectadoCedula: string;
  usuarioAfectadoNombre?: string;
  tipoCuenta?: "INTERNA" | "COORDINADOR" | "EXTERNA";
  institucion?: string;
  incidenciaTecnica?: string;
}

export interface UsuarioInterno {
  id: string;
  cedula: string;
  nombreCompleto: string;
  correo: string;
  correoVerificado: boolean;
  rol: RolInterno;
  rolLabel: string;
  ambito: string;
  ambitoCodigo: string;
  estado: EstadoUsuario;
  totpConfigurado: boolean;
  credencialesConfiguradas: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
  ultimaActualizacion?: string;
  // Para validación de baja lógica (ID-04)
  tareasActivas: number;
  detalleTareas?: string[];
  responsabilidades: string[];
  institucionesRelacionadas: string[];
  esCoordinadorInstitucionActiva?: boolean;
  institucionCoordinada?: string;
}

export const ROLES_INTERNOS_CATALOGO: {
  id: RolInterno;
  nombre: string;
  ambitosPermitidos: { codigo: string; nombre: string; activa?: boolean }[];
}[] = [
  {
    id: "ADMIN",
    nombre: "Administrador del Sistema",
    ambitosPermitidos: [
      { codigo: "DINARP_TI", nombre: "DINARP · Tecnologías de la Información", activa: true },
      { codigo: "DINARP_DIR", nombre: "DINARP · Dirección Ejecutiva", activa: true },
      { codigo: "DINARP_HIST_DIS", nombre: "Coordinación Territorial Histórica (Inactiva)", activa: false },
    ],
  },
  {
    id: "DIR_GESTION",
    nombre: "Director de Gestión y Registro",
    ambitosPermitidos: [
      { codigo: "DGR", nombre: "Dirección de Gestión y Registro (DGR)", activa: true },
    ],
  },
  {
    id: "EQ_GESTION",
    nombre: "Revisor del Área de Gestión",
    ambitosPermitidos: [
      { codigo: "DGR", nombre: "Dirección de Gestión y Registro (DGR)", activa: true },
    ],
  },
  {
    id: "DIR_NORMATIVA",
    nombre: "Director de Normatividad",
    ambitosPermitidos: [
      { codigo: "DN", nombre: "Dirección de Normatividad Jurídica", activa: true },
    ],
  },
  {
    id: "EQ_NORMATIVA",
    nombre: "Revisor del Equipo de Normatividad",
    ambitosPermitidos: [
      { codigo: "DN", nombre: "Dirección de Normatividad Jurídica", activa: true },
    ],
  },
  {
    id: "DTD",
    nombre: "Dirección de Tecnologías y Desarrollo",
    ambitosPermitidos: [
      { codigo: "DTD", nombre: "Dirección de Tecnología y Desarrollo (DTD)", activa: true },
    ],
  },
  {
    id: "DPI",
    nombre: "Dirección de Protección de la Información",
    ambitosPermitidos: [
      { codigo: "DPI", nombre: "Dirección de Protección de Datos (DPI)", activa: true },
    ],
  },
  {
    id: "APROBADOR",
    nombre: "Aprobador Institucional",
    ambitosPermitidos: [
      { codigo: "APROB_DINARP", nombre: "DINARP · Comité de Aprobación", activa: true },
    ],
  },
  {
    id: "FACTURACION",
    nombre: "Analista de Facturación y Cobranzas",
    ambitosPermitidos: [
      { codigo: "DIR_FIN", nombre: "DINARP · Dirección Financiera", activa: true },
    ],
  },
];

export const INITIAL_USUARIOS: UsuarioInterno[] = [
  {
    id: "USR-INT-001",
    cedula: "1799999999",
    nombreCompleto: "Administrador DINARP",
    correo: "admin.portal@dinarp.gob.ec",
    correoVerificado: true,
    rol: "ADMIN",
    rolLabel: "Administrador del Sistema",
    ambito: "DINARP · Tecnologías de la Información",
    ambitoCodigo: "DINARP_TI",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "01/01/2026 08:00",
    ultimoAcceso: "29/09/2026 23:30",
    ultimaActualizacion: "28/09/2026 10:15",
    tareasActivas: 0,
    responsabilidades: ["Gestión integral de usuarios", "Configuración del sistema"],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-002",
    cedula: "1711223344",
    nombreCompleto: "Director Gestión",
    correo: "gestion.director@gmail.com",
    correoVerificado: true,
    rol: "DIR_GESTION",
    rolLabel: "Director de Gestión y Registro",
    ambito: "Dirección de Gestión y Registro (DGR)",
    ambitoCodigo: "DGR",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "15/01/2026 09:30",
    ultimoAcceso: "28/09/2026 18:20",
    ultimaActualizacion: "25/09/2026 11:40",
    tareasActivas: 2,
    detalleTareas: ["TRM-2026-001: Asignación pendiente Registro Civil", "TRM-2026-004: Supervisión expediente SRI"],
    responsabilidades: ["Asignación de trámites Anexo A", "Supervisión de revisores"],
    institucionesRelacionadas: ["DINARP", "Registro Civil", "SRI"],
  },
  {
    id: "USR-INT-003",
    cedula: "1111111111",
    nombreCompleto: "Revisor Gestión (Ana Torres)",
    correo: "gestion.revisor@gmail.com",
    correoVerificado: true,
    rol: "EQ_GESTION",
    rolLabel: "Revisor del Área de Gestión",
    ambito: "Dirección de Gestión y Registro (DGR)",
    ambitoCodigo: "DGR",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "20/01/2026 10:15",
    ultimoAcceso: "29/09/2026 14:10",
    ultimaActualizacion: "20/01/2026 10:15",
    tareasActivas: 1,
    detalleTareas: ["TRM-2026-089: Revisión de requisitos técnicos de interoperabilidad"],
    responsabilidades: ["Revisión documental TRM-2026-089"],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-004",
    cedula: "2222222222",
    nombreCompleto: "Director Normatividad",
    correo: "normativa.director@gmail.com",
    correoVerificado: true,
    rol: "DIR_NORMATIVA",
    rolLabel: "Director de Normatividad",
    ambito: "Dirección de Normatividad Jurídica",
    ambitoCodigo: "DN",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "18/01/2026 11:00",
    ultimoAcceso: "27/09/2026 17:45",
    ultimaActualizacion: "18/01/2026 11:30",
    tareasActivas: 0,
    responsabilidades: ["Asignación jurídica"],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-005",
    cedula: "3333333333",
    nombreCompleto: "Revisor Normatividad (Carlos Mora)",
    correo: "normativa.revisor@gmail.com",
    correoVerificado: true,
    rol: "EQ_NORMATIVA",
    rolLabel: "Revisor del Equipo de Normatividad",
    ambito: "Dirección de Normatividad Jurídica",
    ambitoCodigo: "DN",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "22/01/2026 12:00",
    ultimoAcceso: "29/09/2026 09:25",
    ultimaActualizacion: "22/01/2026 12:00",
    tareasActivas: 0,
    responsabilidades: ["Emisión de Resoluciones"],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-006",
    cedula: "1723456789",
    nombreCompleto: "Ing. Sofía Morales",
    correo: "sofia.morales@dinarp.gob.ec",
    correoVerificado: false,
    rol: "DTD",
    rolLabel: "Dirección de Tecnologías y Desarrollo",
    ambito: "Dirección de Tecnología y Desarrollo (DTD)",
    ambitoCodigo: "DTD",
    estado: "PENDIENTE_ACTIVACION",
    totpConfigurado: false,
    credencialesConfiguradas: false,
    fechaCreacion: "28/09/2026 16:30",
    ultimoAcceso: undefined,
    ultimaActualizacion: "28/09/2026 16:30",
    tareasActivas: 0,
    responsabilidades: [],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-007",
    cedula: "1719876543",
    nombreCompleto: "Dr. Patricio Alarcón",
    correo: "patricio.alarcon@dinarp.gob.ec",
    correoVerificado: true,
    rol: "DPI",
    rolLabel: "Dirección de Protección de la Información",
    ambito: "Dirección de Protección de Datos (DPI)",
    ambitoCodigo: "DPI",
    estado: "SUSPENDIDO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "05/02/2026 08:45",
    ultimoAcceso: "14/09/2026 11:20",
    ultimaActualizacion: "14/09/2026 11:20",
    tareasActivas: 0,
    responsabilidades: ["Revisión de confidencialidad de campos"],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-008",
    cedula: "1708765432",
    nombreCompleto: "Dra. Elena Villacís",
    correo: "elena.villacis@dinarp.gob.ec",
    correoVerificado: true,
    rol: "EQ_GESTION",
    rolLabel: "Revisor del Área de Gestión",
    ambito: "Dirección de Gestión y Registro (DGR)",
    ambitoCodigo: "DGR",
    estado: "RETIRADO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "10/01/2025 09:00",
    ultimoAcceso: "30/06/2026 17:00",
    ultimaActualizacion: "30/06/2026 17:00",
    tareasActivas: 0,
    responsabilidades: [],
    institucionesRelacionadas: [],
  },
  {
    id: "USR-INT-009",
    cedula: "0912345678",
    nombreCompleto: "Ing. Marco Guamán",
    correo: "marco.guaman@registrocivil.gob.ec",
    correoVerificado: true,
    rol: "APROBADOR",
    rolLabel: "Aprobador Técnico Institucional",
    ambito: "Dirección de Gestión y Registro (DGR)",
    ambitoCodigo: "DGR",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "01/03/2026 10:00",
    ultimoAcceso: "29/09/2026 17:15",
    ultimaActualizacion: "20/09/2026 15:30",
    tareasActivas: 0,
    responsabilidades: ["Coordinación institucional Registro Civil"],
    institucionesRelacionadas: ["Registro Civil"],
    esCoordinadorInstitucionActiva: true,
    institucionCoordinada: "Dirección General de Registro Civil, Identificación y Cedulación",
  },
  {
    id: "USR-INT-010",
    cedula: "1724567890",
    nombreCompleto: "Lic. Gabriela Mendoza",
    correo: "gabriela.mendoza@dinarp.gob.ec",
    correoVerificado: true,
    rol: "EQ_GESTION",
    rolLabel: "Revisor del Área de Gestión",
    ambito: "Dirección de Gestión y Registro (DGR)",
    ambitoCodigo: "DGR",
    estado: "PENDIENTE_ACTIVACION",
    totpConfigurado: false,
    credencialesConfiguradas: false,
    fechaCreacion: "29/09/2026 11:20",
    ultimoAcceso: undefined,
    ultimaActualizacion: "29/09/2026 11:20",
    tareasActivas: 0,
    responsabilidades: [],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-011",
    cedula: "1715678901",
    nombreCompleto: "Abg. Roberto Zambrano",
    correo: "roberto.zambrano@dinarp.gob.ec",
    correoVerificado: true,
    rol: "EQ_NORMATIVA",
    rolLabel: "Revisor del Equipo de Normatividad",
    ambito: "Dirección de Normatividad Jurídica",
    ambitoCodigo: "DN",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "12/02/2026 09:00",
    ultimoAcceso: "29/09/2026 15:40",
    ultimaActualizacion: "25/09/2026 16:10",
    tareasActivas: 3,
    detalleTareas: [
      "TRM-2026-092: Dictamen de viabilidad jurídica",
      "TRM-2026-095: Revisión de convenio IESS",
      "TRM-2026-099: Resolución de acceso interoperable"
    ],
    responsabilidades: ["Dictámenes jurídicos", "Emisión de resoluciones"],
    institucionesRelacionadas: ["DINARP", "IESS"],
  },
  {
    id: "USR-INT-012",
    cedula: "1706789012",
    nombreCompleto: "Mgs. Fernando Cárdenas",
    correo: "fernando.cardenas@dinarp.gob.ec",
    correoVerificado: true,
    rol: "DIR_GESTION",
    rolLabel: "Director de Gestión y Registro",
    ambito: "Dirección de Gestión y Registro (DGR)",
    ambitoCodigo: "DGR",
    estado: "SUSPENDIDO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "05/01/2026 08:30",
    ultimoAcceso: "20/09/2026 12:00",
    ultimaActualizacion: "21/09/2026 09:15",
    tareasActivas: 2,
    detalleTareas: [
      "TRM-2026-077: Reasignación pendiente MINTEL",
      "TRM-2026-081: Autorización paquete catastral"
    ],
    responsabilidades: ["Supervisión DGR", "Asignación de expedientes"],
    institucionesRelacionadas: ["DINARP", "MINTEL"],
  },
  {
    id: "USR-INT-013",
    cedula: "1717890123",
    nombreCompleto: "Ing. Diana Paredes",
    correo: "diana.paredes@dinarp.gob.ec",
    correoVerificado: true,
    rol: "ADMIN",
    rolLabel: "Administrador del Sistema",
    ambito: "DINARP · Tecnologías de la Información",
    ambitoCodigo: "DINARP_TI",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "10/01/2026 08:00",
    ultimoAcceso: "30/09/2026 08:15",
    ultimaActualizacion: "27/09/2026 14:00",
    tareasActivas: 0,
    responsabilidades: ["Monitoreo de seguridad", "Gestión de certificados"],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-014",
    cedula: "1728901234",
    nombreCompleto: "Dr. Javier Ortiz",
    correo: "javier.ortiz@dinarp.gob.ec",
    correoVerificado: true,
    rol: "DPI",
    rolLabel: "Dirección de Protección de la Información",
    ambito: "Dirección de Protección de Datos (DPI)",
    ambitoCodigo: "DPI",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "15/02/2026 10:30",
    ultimoAcceso: "28/09/2026 16:50",
    ultimaActualizacion: "22/09/2026 11:20",
    tareasActivas: 1,
    detalleTareas: [
      "TRM-2026-103: Evaluación de impacto en protección de datos personales"
    ],
    responsabilidades: ["Dictamen de protección de datos personales"],
    institucionesRelacionadas: ["DINARP"],
  },
  {
    id: "USR-INT-015",
    cedula: "1709012345",
    nombreCompleto: "Lcda. Mónica Viteri",
    correo: "monica.viteri@dinarp.gob.ec",
    correoVerificado: true,
    rol: "EQ_GESTION",
    rolLabel: "Revisor del Área de Gestión",
    ambito: "Dirección de Gestión y Registro (DGR)",
    ambitoCodigo: "DGR",
    estado: "RETIRADO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "01/02/2025 09:00",
    ultimoAcceso: "15/05/2026 17:30",
    ultimaActualizacion: "15/05/2026 18:00",
    tareasActivas: 0,
    responsabilidades: [],
    institucionesRelacionadas: [],
  },
  {
    id: "USR-INT-016",
    cedula: "1710123456",
    nombreCompleto: "Ing. Cristian Salgado",
    correo: "cristian.salgado@dinarp.gob.ec",
    correoVerificado: true,
    rol: "DTD",
    rolLabel: "Dirección de Tecnologías y Desarrollo",
    ambito: "Dirección de Tecnología y Desarrollo (DTD)",
    ambitoCodigo: "DTD",
    estado: "ACTIVO",
    totpConfigurado: true,
    credencialesConfiguradas: true,
    fechaCreacion: "01/03/2026 09:00",
    ultimoAcceso: "29/09/2026 18:10",
    ultimaActualizacion: "24/09/2026 13:45",
    tareasActivas: 0,
    responsabilidades: ["Arquitectura de microservicios", "Catálogo técnico"],
    institucionesRelacionadas: ["DINARP"],
  },
];

const INITIAL_AUDITORIA: EventoAuditoria[] = [
  {
    id: "AUD-001",
    evento: "CUENTA_CREADA",
    eventoLabel: "Cuenta creada",
    actor: "Administrador DINARP",
    fecha: "28/09/2026 16:30",
    resultado: "Éxito",
    detalles: "Creación de cuenta de acceso institucional con rol DTD. Contraseña y TOTP pendientes de configuración inicial. [Credenciales protegidas por política de seguridad]",
    usuarioAfectadoId: "USR-INT-006",
    usuarioAfectadoCedula: "1723456789",
    usuarioAfectadoNombre: "Ing. Diego Fernando Ramos Alvear",
  },
  {
    id: "AUD-002",
    evento: "SUSPENSION",
    eventoLabel: "Suspensión de cuenta",
    actor: "Administrador DINARP",
    fecha: "15/09/2026 09:14",
    resultado: "Éxito",
    motivo: "Licencia médica temporal de 30 días sin goce de funciones.",
    detalles: "Sesiones invalidadas y acceso bloqueado para Dr. Patricio Alarcón. Trámites permanecen visibles a la Dirección.",
    usuarioAfectadoId: "USR-INT-007",
    usuarioAfectadoCedula: "1719876543",
    usuarioAfectadoNombre: "Dr. Patricio Marcelo Alarcón Jaramillo",
  },
  {
    id: "AUD-003",
    evento: "BAJA_LOGICA",
    eventoLabel: "Baja lógica",
    actor: "Administrador DINARP",
    fecha: "30/06/2026 17:05",
    resultado: "Éxito",
    motivo: "Desvinculación institucional formal mediante Acción de Personal N° 459-2026.",
    detalles: "Tareas activas reasignadas previamente (0 pendientes). Estado pasado a RETIRADO sin borrado físico ni reutilización.",
    usuarioAfectadoId: "USR-INT-008",
    usuarioAfectadoCedula: "1708765432",
    usuarioAfectadoNombre: "Lcda. Gabriela Soledad Benítez Ortiz",
  },
  {
    id: "AUD-004",
    evento: "CAMBIO_ROL",
    eventoLabel: "Cambio de rol",
    actor: "Administrador DINARP",
    fecha: "12/04/2026 11:20",
    resultado: "Éxito",
    valorAnterior: "EQ_GESTION",
    valorNuevo: "DIR_GESTION",
    motivo: "Nombramiento de Dirección de Gestión según Acuerdo Ministerial 088.",
    detalles: "Actualización de atribuciones institucionales. Permisos previos conservados según regla de trazabilidad.",
    usuarioAfectadoId: "USR-INT-002",
    usuarioAfectadoCedula: "1711223344",
    usuarioAfectadoNombre: "Lcda. María Fernanda Morales Castro",
  },
  {
    id: "AUD-005",
    evento: "INGRESO",
    eventoLabel: "Ingreso al sistema",
    actor: "Revisor Gestión (Ana Torres)",
    fecha: "29/09/2026 14:10",
    resultado: "Éxito",
    detalles: "Validación de 1er factor y TOTP Google Authenticator correctos. [Credenciales y tokens protegidos por confidencialidad]",
    usuarioAfectadoId: "USR-INT-003",
    usuarioAfectadoCedula: "1111111111",
    usuarioAfectadoNombre: "Ing. Ana Lucía Torres Vega",
  },
  {
    id: "AUD-006",
    evento: "BLOQUEO",
    eventoLabel: "Bloqueo por intentos fallidos",
    actor: "Sistema Identity Platform",
    fecha: "25/09/2026 08:42",
    resultado: "Denegado",
    motivo: "5 intentos consecutivos de contraseña incorrecta desde terminal institucional.",
    detalles: "Bloqueo preventivo de sesión y requerimiento de validación OTP institucional. [Datos de acceso no expuestos]",
    incidenciaTecnica: "INC-SEC-2026-094: Bloqueo preventivo de terminal por umbral de intentos fallidos.",
    usuarioAfectadoId: "USR-INT-002",
    usuarioAfectadoCedula: "1711223344",
    usuarioAfectadoNombre: "Lcda. María Fernanda Morales Castro",
  },
  {
    id: "AUD-007",
    evento: "RECUPERACION",
    eventoLabel: "Recuperación de acceso",
    actor: "Director Gestión",
    fecha: "25/09/2026 09:05",
    resultado: "Éxito",
    detalles: "Enlace de un solo uso validado con verificación de factor de segundo paso. [Tokens temporales no expuestos]",
    usuarioAfectadoId: "USR-INT-002",
    usuarioAfectadoCedula: "1711223344",
    usuarioAfectadoNombre: "Lcda. María Fernanda Morales Castro",
  },
  {
    id: "AUD-008",
    evento: "CAMBIO_COORDINADOR",
    eventoLabel: "Cambio de Coordinador (Anexo C)",
    actor: "Administrador DINARP",
    fecha: "20/09/2026 15:30",
    resultado: "Éxito",
    motivo: "Designación formal mediante trámite Anexo C (ARP-R03) para cambio de coordinador titular.",
    detalles: "Relevo formal de la persona natural asignada a la función de Coordinador de la entidad. Las credenciales de consumo API institucional del organismo permanecen vigentes y no sufren revocación.",
    usuarioAfectadoId: "USR-INT-002",
    usuarioAfectadoCedula: "1711223344",
    usuarioAfectadoNombre: "Lcda. María Fernanda Morales Castro",
  },
  {
    id: "AUD-009",
    evento: "CREDENCIALES_API_REVOCADAS",
    eventoLabel: "Revocación de credenciales institucionales",
    actor: "Administrador DINARP",
    fecha: "18/09/2026 16:00",
    resultado: "Éxito",
    motivo: "Rotación programada de claves y certificados de consumo REST para interoperabilidad con SRI.",
    detalles: "Revocación y anulación técnica de Client Secret de la entidad SRI (INS-08). Operación técnica institucional independiente que no altera ni revoca la cuenta de persona natural.",
    usuarioAfectadoId: "USR-INT-002",
    usuarioAfectadoCedula: "1711223344",
    usuarioAfectadoNombre: "Lcda. María Fernanda Morales Castro",
  },
  {
    id: "AUD-010",
    evento: "ACTIVACION",
    eventoLabel: "Activación de cuenta",
    actor: "Director Normatividad",
    fecha: "18/01/2026 11:30",
    resultado: "Éxito",
    detalles: "Contraseña inicial robusta y factor TOTP Google Authenticator configurados con éxito. [Claves resguardadas]",
    usuarioAfectadoId: "USR-INT-004",
    usuarioAfectadoCedula: "2222222222",
    usuarioAfectadoNombre: "Abg. Roberto Carlos Noboa Mendoza",
  },
  {
    id: "AUD-011",
    evento: "REACTIVACION",
    eventoLabel: "Reactivación de cuenta",
    actor: "Administrador DINARP",
    fecha: "22/08/2026 10:00",
    resultado: "Éxito",
    motivo: "Reincorporación laboral luego de culminación de comisión de servicios.",
    detalles: "Factor TOTP validado. Restaurado estado ACTIVO sin alterar roles previamente asignados.",
    usuarioAfectadoId: "USR-INT-005",
    usuarioAfectadoCedula: "3333333333",
    usuarioAfectadoNombre: "Abg. Patricia Elena Salazar Viteri",
  },
  {
    id: "AUD-012",
    evento: "CAMBIO_COORDINADOR",
    eventoLabel: "Cambio de Coordinador (Anexo C)",
    actor: "Administrador DINARP",
    fecha: "01/03/2026 10:05",
    resultado: "Éxito",
    motivo: "Oficio formal de designación de nuevo enlace titular mediante trámite ARP-R03 (Anexo C).",
    detalles: "Asignación de rol de enlace interinstitucional a persona natural. Credenciales de consumo técnico y API permanecen inalteradas bajo expediente INS-08.",
    usuarioAfectadoId: "USR-INT-009",
    usuarioAfectadoCedula: "0912345678",
    usuarioAfectadoNombre: "Mgs. Marco Vinicio Guamán Cárdenas",
  },
  {
    id: "AUD-013",
    evento: "INGRESO",
    eventoLabel: "Ingreso al sistema",
    actor: "Aprobador Técnico (Marco Guamán)",
    fecha: "29/09/2026 17:15",
    resultado: "Éxito",
    detalles: "Acceso exitoso al módulo de aprobaciones con autenticación multifactor TOTP. [Sesión autenticada]",
    usuarioAfectadoId: "USR-INT-009",
    usuarioAfectadoCedula: "0912345678",
    usuarioAfectadoNombre: "Mgs. Marco Vinicio Guamán Cárdenas",
  },
  {
    id: "AUD-014",
    evento: "CAMBIO_AMBITO",
    eventoLabel: "Cambio de ámbito operativo",
    actor: "Administrador DINARP",
    fecha: "15/02/2026 14:00",
    resultado: "Éxito",
    valorAnterior: "DINARP Central",
    valorNuevo: "DINARP · Tecnologías de la Información",
    motivo: "Reestructuración orgánica de la Dirección de TI.",
    detalles: "Ajuste de alcance institucional y permisos departamentales.",
    usuarioAfectadoId: "USR-INT-001",
    usuarioAfectadoCedula: "1799887766",
    usuarioAfectadoNombre: "Ing. Carlos Eduardo Andrade Paredes",
  },
  {
    id: "AUD-015",
    evento: "INGRESO",
    eventoLabel: "Ingreso al sistema",
    actor: "Administrador DINARP",
    fecha: "29/09/2026 23:30",
    resultado: "Éxito",
    detalles: "Inicio de sesión administrativo con factor TOTP verificado. [Protegido por política de seguridad]",
    usuarioAfectadoId: "USR-INT-001",
    usuarioAfectadoCedula: "1799887766",
    usuarioAfectadoNombre: "Ing. Carlos Eduardo Andrade Paredes",
  },
  {
    id: "AUD-016",
    evento: "BLOQUEO",
    eventoLabel: "Intento fallido de segundo factor",
    actor: "Sistema Identity Platform",
    fecha: "14/09/2026 11:22",
    resultado: "Fallido",
    motivo: "Código TOTP expirado tras 3 reintentos consecutivos.",
    detalles: "Reintento bloqueado preventivamente; no se expusieron secretos, códigos ni hashes.",
    incidenciaTecnica: "INC-AUTH-2026-0118: Desincronización de reloj TOTP en dispositivo cliente.",
    usuarioAfectadoId: "USR-INT-007",
    usuarioAfectadoCedula: "1719876543",
    usuarioAfectadoNombre: "Dr. Patricio Marcelo Alarcón Jaramillo",
  },
  {
    id: "AUD-017",
    evento: "ACTIVACION",
    eventoLabel: "Activación de cuenta",
    actor: "Administrador DINARP",
    fecha: "27/09/2026 10:15",
    resultado: "Éxito",
    detalles: "Configuración inicial de contraseña y vinculación exitosa de Google Authenticator. [Credenciales resguardadas]",
    usuarioAfectadoId: "USR-INT-010",
    usuarioAfectadoCedula: "1715647382",
    usuarioAfectadoNombre: "Dra. Carmen Lucía Espinosa Delgado",
  },
  {
    id: "AUD-018",
    evento: "INGRESO",
    eventoLabel: "Ingreso al sistema",
    actor: "Analista Gestión (David Herrera)",
    fecha: "28/09/2026 08:30",
    resultado: "Éxito",
    detalles: "Acceso validado con 2do factor TOTP activo. Sesión emitida para jornada laboral.",
    usuarioAfectadoId: "USR-INT-011",
    usuarioAfectadoCedula: "1718293041",
    usuarioAfectadoNombre: "Econ. David Alejandro Herrera Vaca",
  },
  {
    id: "AUD-019",
    evento: "CAMBIO_COORDINADOR",
    eventoLabel: "Cambio de Coordinador (Anexo C)",
    actor: "Administrador DINARP",
    fecha: "10/09/2026 14:20",
    resultado: "Éxito",
    motivo: "Actualización de nómina directiva del CNE registrada mediante Anexo C (ARP-R03).",
    detalles: "Modificación de designación de coordinación institucional. No altera llaves técnicas de los servicios de consulta.",
    usuarioAfectadoId: "USR-INT-012",
    usuarioAfectadoCedula: "0921436587",
    usuarioAfectadoNombre: "Lcda. Valeria Sofía Cárdenas Mora",
  },
  {
    id: "AUD-020",
    evento: "CREDENCIALES_API_REVOCADAS",
    eventoLabel: "Revocación de credenciales institucionales",
    actor: "Administrador DINARP",
    fecha: "05/09/2026 16:45",
    resultado: "Éxito",
    motivo: "Revocación de claves de entorno de homologación por vencimiento de vigencia técnica.",
    detalles: "Inhabilitación de tokens y credenciales API del cliente técnico. La cuenta del funcionario permanece activa sin impedimentos.",
    usuarioAfectadoId: "USR-INT-013",
    usuarioAfectadoCedula: "1729485736",
    usuarioAfectadoNombre: "Ing. Santiago Paul Ortiz Romero",
  },
  {
    id: "AUD-021",
    evento: "RECUPERACION",
    eventoLabel: "Recuperación de acceso",
    actor: "Administrador DINARP",
    fecha: "22/09/2026 11:10",
    resultado: "Éxito",
    detalles: "Emisión de enlace de recuperación de contraseña con revocación de sesiones previas activas. [Token de un solo uso no expuesto]",
    usuarioAfectadoId: "USR-INT-014",
    usuarioAfectadoCedula: "1716253490",
    usuarioAfectadoNombre: "Abg. Mónica Beatriz Cevallos Pazmiño",
  },
  {
    id: "AUD-022",
    evento: "BLOQUEO",
    eventoLabel: "Bloqueo por intentos fallidos",
    actor: "Sistema Identity Platform",
    fecha: "26/09/2026 19:40",
    resultado: "Denegado",
    motivo: "Múltiples accesos fallidos fuera de horario autorizado.",
    detalles: "Suspensión automática de sesión para protección de cuenta institucional. [Parámetros confidenciales resguardados]",
    usuarioAfectadoId: "USR-INT-015",
    usuarioAfectadoCedula: "0928374651",
    usuarioAfectadoNombre: "Lcdo. Javier Fernando Pazmiño Silva",
  },
  {
    id: "AUD-023",
    evento: "CUENTA_CREADA",
    eventoLabel: "Cuenta creada",
    actor: "Administrador DINARP",
    fecha: "23/09/2026 12:00",
    resultado: "Éxito",
    detalles: "Registro en estado PENDIENTE_ACTIVACION para nueva funcionaria de la Dirección de Planificación. Enlace de activación despachado.",
    usuarioAfectadoId: "USR-INT-016",
    usuarioAfectadoCedula: "1723849501",
    usuarioAfectadoNombre: "Ing. Elena Rocío Vargas Montalvo",
    tipoCuenta: "INTERNA",
    institucion: "DINARP",
  },
  {
    id: "AUD-024",
    evento: "CAMBIO_FACTOR",
    eventoLabel: "Cambio de segundo factor (MFA)",
    actor: "Administrador DINARP",
    fecha: "30/09/2026 10:15",
    resultado: "Éxito",
    motivo: "Renovación obligatoria de credencial de factor doble por extravío de terminal móvil institucional.",
    detalles: "Reemisión de clave secreta TOTP completada tras verificación presencial del funcionario. Códigos de un solo uso y semillas criptográficas resguardados bajo política de confidencialidad.",
    usuarioAfectadoId: "USR-INT-001",
    usuarioAfectadoCedula: "1799887766",
    usuarioAfectadoNombre: "Ing. Carlos Eduardo Andrade Paredes",
    tipoCuenta: "INTERNA",
    institucion: "DINARP",
  },
  {
    id: "AUD-025",
    evento: "INVALIDACION_SESION",
    eventoLabel: "Invalidación forzada de sesión",
    actor: "Administrador DINARP",
    fecha: "30/09/2026 18:20",
    resultado: "Éxito",
    motivo: "Cierre forzado de sesiones concurrentes por detección de anomalía de red en acceso remoto.",
    detalles: "Revocación inmediata de 2 tokens de sesión activos y desconexión de endpoints web. Sin exposición de credenciales.",
    usuarioAfectadoId: "USR-INT-007",
    usuarioAfectadoCedula: "1719876543",
    usuarioAfectadoNombre: "Dr. Patricio Marcelo Alarcón Jaramillo",
    tipoCuenta: "INTERNA",
    institucion: "DINARP",
  },
  {
    id: "AUD-026",
    evento: "CAMBIO_AREA",
    eventoLabel: "Cambio de área institucional",
    actor: "Director de Gestión y Registro",
    fecha: "28/09/2026 15:45",
    resultado: "Éxito",
    valorAnterior: "Dirección de Gestión y Registro (DGR)",
    valorNuevo: "DINARP · Tecnologías de la Información",
    motivo: "Reestructuración orgánica y traslado de personal según memorando DINARP-DIR-2026-088.",
    detalles: "Reasignación departamental y actualización de atribuciones operacionales en el sistema.",
    usuarioAfectadoId: "USR-INT-002",
    usuarioAfectadoCedula: "1711223344",
    usuarioAfectadoNombre: "Lcda. María Fernanda Morales Castro",
    tipoCuenta: "INTERNA",
    institucion: "DINARP",
  },
  {
    id: "AUD-027",
    evento: "CAMBIO_FACTOR",
    eventoLabel: "Cambio de segundo factor (MFA)",
    actor: "Sistema Identity Platform",
    fecha: "29/09/2026 16:30",
    resultado: "Éxito",
    motivo: "Revinculación autorizada de TOTP Google Authenticator para Coordinador Institucional.",
    detalles: "Validación del código de recuperación REC-ID08-2026-0045 y reinicio de credencial de segundo factor. [Semillas y códigos no expuestos]",
    usuarioAfectadoId: "COORD-001",
    usuarioAfectadoCedula: "0912345678",
    usuarioAfectadoNombre: "Ing. Jorge Washington Bohórquez Silva",
    tipoCuenta: "COORDINADOR",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Guayaquil",
  },
  {
    id: "AUD-028",
    evento: "INVALIDACION_SESION",
    eventoLabel: "Invalidación forzada de sesión",
    actor: "Sistema Identity Platform",
    fecha: "29/09/2026 21:00",
    resultado: "Éxito",
    motivo: "Expiración por inactividad prolongada según política de seguridad de sesiones (30 min).",
    detalles: "Invalidadas sesiones de navegador activas del Coordinador Institucional. Tokens de refresco revocados de inmediato.",
    usuarioAfectadoId: "COORD-002",
    usuarioAfectadoCedula: "4444444444",
    usuarioAfectadoNombre: "Ing. Carlos Alberto Morales Viteri",
    tipoCuenta: "COORDINADOR",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Cuenca",
  },
];

const STORAGE_USERS_KEY = "dinarp_usuarios_internos_v3";
const STORAGE_AUDIT_KEY = "dinarp_auditoria_usuarios_v5";

export function useUsuariosStore() {
  const [usuarios, setUsuarios] = useState<UsuarioInterno[]>(INITIAL_USUARIOS);
  const [auditoria, setAuditoria] = useState<EventoAuditoria[]>(INITIAL_AUDITORIA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (storedUsers) {
        setUsuarios(JSON.parse(storedUsers));
      }
      const storedAudit = localStorage.getItem(STORAGE_AUDIT_KEY);
      if (storedAudit) {
        setAuditoria(JSON.parse(storedAudit));
      }
    } catch (e) {
      console.error("Error reading usuarios store from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  const persistUsers = (newUsers: UsuarioInterno[]) => {
    setUsuarios(newUsers);
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(newUsers));
    } catch (e) {
      console.error("Error saving users to localStorage", e);
    }
  };

  const persistAudit = (newAudit: EventoAuditoria[]) => {
    setAuditoria(newAudit);
    try {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(newAudit));
    } catch (e) {
      console.error("Error saving audit to localStorage", e);
    }
  };

  const registrarAuditoria = useCallback(
    (evento: Omit<EventoAuditoria, "id" | "fecha">) => {
      const now = new Date();
      const fecha = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      setAuditoria((prev) => {
        const targetUser = usuarios.find(
          (u) => u.id === evento.usuarioAfectadoId || u.cedula === evento.usuarioAfectadoCedula
        );
        const nuevoEvento: EventoAuditoria = {
          ...evento,
          usuarioAfectadoNombre:
            evento.usuarioAfectadoNombre || targetUser?.nombreCompleto || "Funcionario DINARP",
          id: `AUD-${Date.now().toString().slice(-4)}`,
          fecha,
        };
        const updated = [nuevoEvento, ...prev];
        try {
          localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Error saving audit to localStorage", e);
        }
        return updated;
      });
    },
    [usuarios]
  );

  // ID-01: Crear usuario interno
  const crearUsuarioInterno = useCallback(
    (datos: {
      cedula: string;
      correo: string;
      nombreCompleto?: string;
      rol: RolInterno;
      ambitoCodigo: string;
      actor: string;
    }): { ok: boolean; error?: string; usuario?: UsuarioInterno } => {
      const cleanCedula = datos.cedula.trim();
      const cleanEmail = datos.correo.trim().toLowerCase();

      // Validar cédula duplicada
      const cedulaExiste = usuarios.some((u) => u.cedula === cleanCedula);
      if (cedulaExiste) {
        registrarAuditoria({
          evento: "CUENTA_CREADA",
          eventoLabel: "Intento de creación fallido",
          actor: datos.actor,
          resultado: "Denegado",
          detalles: `Cédula ${cleanCedula} duplicada en el sistema.`,
          usuarioAfectadoId: "N/A",
          usuarioAfectadoCedula: cleanCedula,
        });
        return { ok: false, error: "La cédula ingresada ya cuenta con un usuario registrado en el sistema." };
      }

      // Validar correo duplicado
      const correoExiste = usuarios.some((u) => u.correo.toLowerCase() === cleanEmail);
      if (correoExiste) {
        return { ok: false, error: "El correo electrónico ya se encuentra registrado por otro usuario." };
      }

      // Validar rol y ámbito en catálogo (ID-01)
      const rolConfig = ROLES_INTERNOS_CATALOGO.find((r) => r.id === datos.rol);
      if (!rolConfig) {
        return { ok: false, error: "El rol seleccionado no está permitido en el catálogo institucional." };
      }

      const ambitoValido = rolConfig.ambitosPermitidos.find(
        (a) => a.codigo === datos.ambitoCodigo
      );
      if (!ambitoValido) {
        return { ok: false, error: "El área DINARP seleccionada no existe en la estructura orgánica vigente." };
      }
      if (ambitoValido.activa === false) {
        return { ok: false, error: "El área DINARP seleccionada está inactiva o no existe en la estructura orgánica vigente." };
      }

      const now = new Date();
      const fechaCreacion = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const nuevoUsuario: UsuarioInterno = {
        id: `USR-INT-${String(usuarios.length + 1).padStart(3, "0")}`,
        cedula: cleanCedula,
        nombreCompleto: datos.nombreCompleto?.trim() || `Usuario ${cleanCedula}`,
        correo: cleanEmail,
        correoVerificado: false,
        rol: datos.rol,
        rolLabel: rolConfig.nombre,
        ambito: ambitoValido.nombre,
        ambitoCodigo: ambitoValido.codigo,
        estado: "PENDIENTE_ACTIVACION",
        totpConfigurado: false,
        credencialesConfiguradas: false,
        fechaCreacion,
        ultimaActualizacion: fechaCreacion,
        tareasActivas: 0,
        responsabilidades: [],
        institucionesRelacionadas: ["DINARP"],
      };

      const updated = [nuevoUsuario, ...usuarios];
      persistUsers(updated);

      registrarAuditoria({
        evento: "CUENTA_CREADA",
        eventoLabel: "Cuenta creada",
        actor: datos.actor,
        resultado: "Éxito",
        detalles: `Cuenta creada en estado PENDIENTE_ACTIVACION con rol ${rolConfig.nombre} y ámbito ${ambitoValido.nombre}. Se remitieron instrucciones por correo.`,
        usuarioAfectadoId: nuevoUsuario.id,
        usuarioAfectadoCedula: nuevoUsuario.cedula,
      });

      return { ok: true, usuario: nuevoUsuario };
    },
    [usuarios, registrarAuditoria]
  );

  // ID-02: Editar usuario (contacto, rol, ámbito con motivo obligatorio si cambian rol o ámbito)
  const editarUsuario = useCallback(
    (
      id: string,
      cambios: {
        correo?: string;
        nombreCompleto?: string;
        rol?: RolInterno;
        ambitoCodigo?: string;
        motivoCambio?: string;
        actor: string;
      }
    ): { ok: boolean; error?: string } => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) {
        return { ok: false, error: "Usuario no encontrado." };
      }

      const actual = usuarios[index];
      const rolCambiado = cambios.rol && cambios.rol !== actual.rol;
      const ambitoCambiado = cambios.ambitoCodigo && cambios.ambitoCodigo !== actual.ambitoCodigo;

      if ((rolCambiado || ambitoCambiado) && (!cambios.motivoCambio || cambios.motivoCambio.trim().length < 5)) {
        return {
          ok: false,
          error: "Para modificar el rol o ámbito es obligatorio registrar un motivo detallado del cambio.",
        };
      }

      let nuevoRol = actual.rol;
      let nuevoRolLabel = actual.rolLabel;
      let nuevoAmbito = actual.ambito;
      let nuevoAmbitoCodigo = actual.ambitoCodigo;

      if (cambios.rol) {
        const rolConfig = ROLES_INTERNOS_CATALOGO.find((r) => r.id === cambios.rol);
        if (!rolConfig) return { ok: false, error: "Rol no permitido." };
        nuevoRol = cambios.rol;
        nuevoRolLabel = rolConfig.nombre;

        // Verificar si el ámbito actual sigue siendo válido para el nuevo rol
        const ambitoCodigoParaVerificar = cambios.ambitoCodigo || actual.ambitoCodigo;
        const ambitoValido = rolConfig.ambitosPermitidos.find(
          (a) => a.codigo === ambitoCodigoParaVerificar
        );
        if (!ambitoValido) {
          return {
            ok: false,
            error: `El ámbito seleccionado no es compatible con el nuevo rol ${rolConfig.nombre}.`,
          };
        }
        nuevoAmbito = ambitoValido.nombre;
        nuevoAmbitoCodigo = ambitoValido.codigo;
      } else if (cambios.ambitoCodigo) {
        const rolConfig = ROLES_INTERNOS_CATALOGO.find((r) => r.id === actual.rol);
        const ambitoValido = rolConfig?.ambitosPermitidos.find(
          (a) => a.codigo === cambios.ambitoCodigo
        );
        if (!ambitoValido) {
          return { ok: false, error: "Ámbito no válido para el rol actual." };
        }
        nuevoAmbito = ambitoValido.nombre;
        nuevoAmbitoCodigo = ambitoValido.codigo;
      }

      const now = new Date();
      const fechaActualizacion = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const usuarioActualizado: UsuarioInterno = {
        ...actual,
        nombreCompleto: cambios.nombreCompleto?.trim() || actual.nombreCompleto,
        correo: cambios.correo?.trim().toLowerCase() || actual.correo,
        rol: nuevoRol,
        rolLabel: nuevoRolLabel,
        ambito: nuevoAmbito,
        ambitoCodigo: nuevoAmbitoCodigo,
        ultimaActualizacion: fechaActualizacion,
      };

      const updated = [...usuarios];
      updated[index] = usuarioActualizado;
      persistUsers(updated);

      if (rolCambiado) {
        registrarAuditoria({
          evento: "CAMBIO_ROL",
          eventoLabel: "Cambio de rol",
          actor: cambios.actor,
          resultado: "Éxito",
          valorAnterior: actual.rol,
          valorNuevo: nuevoRol,
          motivo: cambios.motivoCambio,
          usuarioAfectadoId: actual.id,
          usuarioAfectadoCedula: actual.cedula,
        });
      }

      if (ambitoCambiado && !rolCambiado) {
        registrarAuditoria({
          evento: "CAMBIO_AMBITO",
          eventoLabel: "Cambio de ámbito",
          actor: cambios.actor,
          resultado: "Éxito",
          valorAnterior: actual.ambito,
          valorNuevo: nuevoAmbito,
          motivo: cambios.motivoCambio,
          usuarioAfectadoId: actual.id,
          usuarioAfectadoCedula: actual.cedula,
        });
      }

      return { ok: true };
    },
    [usuarios, registrarAuditoria]
  );

  // ID-03: Activar cuenta
  const activarUsuario = useCallback(
    (id: string, actor: string): { ok: boolean; error?: string } => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) return { ok: false, error: "Usuario no encontrado." };

      const u = usuarios[index];
      if (u.estado === "ACTIVO") {
        return { ok: false, error: "La cuenta ya se encuentra activa." };
      }

      // Validar requisitos previos (credenciales y 2FA)
      if (!u.credencialesConfiguradas || !u.totpConfigurado) {
        // En ambiente demo, si está en PENDIENTE_ACTIVACION se puede configurar para demostración
        return {
          ok: false,
          error: "Requisito pendiente: La persona no ha completado el establecimiento de contraseña y vinculación del segundo factor (TOTP).",
        };
      }

      const now = new Date();
      const fechaActualizacion = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const updated = [...usuarios];
      updated[index] = { ...u, estado: "ACTIVO", ultimaActualizacion: fechaActualizacion };
      persistUsers(updated);

      registrarAuditoria({
        evento: "ACTIVACION",
        eventoLabel: "Activación de cuenta",
        actor,
        resultado: "Éxito",
        detalles: "Cuenta activada tras validar credenciales y segundo factor TOTP.",
        usuarioAfectadoId: u.id,
        usuarioAfectadoCedula: u.cedula,
      });

      return { ok: true };
    },
    [usuarios, registrarAuditoria]
  );

  // Forzar activación demo con simulación de configuración de credenciales
  const simularActivacionDemo = useCallback(
    (id: string, actor: string): { ok: boolean; error?: string } => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) return { ok: false, error: "Usuario no encontrado." };

      const u = usuarios[index];
      const now = new Date();
      const fechaActualizacion = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const updated = [...usuarios];
      updated[index] = {
        ...u,
        estado: "ACTIVO",
        credencialesConfiguradas: true,
        totpConfigurado: true,
        correoVerificado: true,
        ultimaActualizacion: fechaActualizacion,
      };
      persistUsers(updated);

      registrarAuditoria({
        evento: "ACTIVACION",
        eventoLabel: "Activación de cuenta",
        actor,
        resultado: "Éxito",
        detalles: "Configuración de credenciales y TOTP completada. Cuenta activada.",
        usuarioAfectadoId: u.id,
        usuarioAfectadoCedula: u.cedula,
      });

      return { ok: true };
    },
    [usuarios, registrarAuditoria]
  );

  // ID-03 Demo: Configurar credenciales y TOTP sin activar aún (para validar botón habilitado/deshabilitado)
  const simularEnrolamiento2FA = useCallback(
    (id: string, completado: boolean): { ok: boolean; error?: string } => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) return { ok: false, error: "Usuario no encontrado." };

      const u = usuarios[index];
      const updated = [...usuarios];
      updated[index] = {
        ...u,
        credencialesConfiguradas: completado,
        totpConfigurado: completado,
      };
      persistUsers(updated);
      return { ok: true };
    },
    [usuarios]
  );

  // ID-03: Suspender cuenta
  const suspenderUsuario = useCallback(
    (id: string, causa: string, actor: string): { ok: boolean; error?: string } => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) return { ok: false, error: "Usuario no encontrado." };

      if (!causa || causa.trim().length < 5) {
        return { ok: false, error: "Debe registrar una causa justificada para la suspensión." };
      }

      const u = usuarios[index];
      if (u.estado === "SUSPENDIDO") {
        return { ok: false, error: "El usuario ya se encuentra suspendido." };
      }
      if (u.estado === "RETIRADO") {
        return { ok: false, error: "No es posible suspender una cuenta en estado RETIRADO." };
      }

      const now = new Date();
      const fechaActualizacion = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const updated = [...usuarios];
      updated[index] = { ...u, estado: "SUSPENDIDO", ultimaActualizacion: fechaActualizacion };
      persistUsers(updated);

      registrarAuditoria({
        evento: "SUSPENSION",
        eventoLabel: "Suspensión de cuenta",
        actor,
        resultado: "Éxito",
        motivo: causa,
        detalles: "Sesiones invalidadas, ingreso impedido y asignaciones nuevas bloqueadas. Trámites previos continúan visibles.",
        usuarioAfectadoId: u.id,
        usuarioAfectadoCedula: u.cedula,
      });

      return { ok: true };
    },
    [usuarios, registrarAuditoria]
  );

  // ID-03: Reactivar cuenta
  const reactivarUsuario = useCallback(
    (id: string, causa: string, actor: string): { ok: boolean; error?: string } => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) return { ok: false, error: "Usuario no encontrado." };

      if (!causa || causa.trim().length < 5) {
        return { ok: false, error: "Debe registrar una causa de reactivación." };
      }

      const u = usuarios[index];
      if (u.estado !== "SUSPENDIDO") {
        return { ok: false, error: "Solo se pueden reactivar cuentas que se encuentren suspendidas." };
      }

      if (!u.totpConfigurado) {
        return { ok: false, error: "Falta segundo factor TOTP configurado. Se mantiene suspendido." };
      }

      const now = new Date();
      const fechaActualizacion = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const updated = [...usuarios];
      updated[index] = { ...u, estado: "ACTIVO", ultimaActualizacion: fechaActualizacion };
      persistUsers(updated);

      registrarAuditoria({
        evento: "REACTIVACION",
        eventoLabel: "Reactivación de cuenta",
        actor,
        resultado: "Éxito",
        motivo: causa,
        detalles: "Cuenta reactivada a estado ACTIVO. Conserva roles y permisos previos.",
        usuarioAfectadoId: u.id,
        usuarioAfectadoCedula: u.cedula,
      });

      return { ok: true };
    },
    [usuarios, registrarAuditoria]
  );

  // ID-04: Baja lógica (Dar de baja)
  const darDeBajaUsuario = useCallback(
    (id: string, justificacion: string, actor: string): { ok: boolean; error?: string } => {
      const index = usuarios.findIndex((u) => u.id === id);
      if (index === -1) return { ok: false, error: "Usuario no encontrado." };

      const u = usuarios[index];
      if (u.estado === "RETIRADO") {
        return { ok: false, error: "El usuario ya ha sido dado de baja previamente." };
      }

      if (!justificacion || justificacion.trim().length < 10) {
        return { ok: false, error: "Debe ingresar una justificación detallada (mínimo 10 caracteres)." };
      }

      // Validar si es Coordinador Institucional activo (ID-04 Criterio 1: No elimina un Coordinador aún designado)
      if (u.esCoordinadorInstitucionActiva) {
        return {
          ok: false,
          error: `No es posible dar de baja: El usuario aún figura como Coordinador designado en ${u.institucionCoordinada || "una institución activa"}. Requiere previo cambio de coordinador (CAM-03 o INS-08) para retirar su último rol vigente.`,
        };
      }

      // Validar si tiene tareas o responsabilidades pendientes (ID-04 Criterio 1 y 4)
      if (u.tareasActivas > 0) {
        const tareasList = u.detalleTareas?.length ? ` [${u.detalleTareas.join(", ")}]` : "";
        return {
          ok: false,
          error: `No es posible dar de baja: La cuenta registra ${u.tareasActivas} tarea(s)/trámite(s) activo(s) pendiente(s) de reasignación${tareasList}. Resuelva o reasigne antes de reintentar.`,
        };
      }

      const now = new Date();
      const fechaActualizacion = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const updated = [...usuarios];
      updated[index] = { ...u, estado: "RETIRADO", ultimaActualizacion: fechaActualizacion };
      persistUsers(updated);

      registrarAuditoria({
        evento: "BAJA_LOGICA",
        eventoLabel: "Baja lógica",
        actor,
        resultado: "Éxito",
        motivo: justificacion,
        detalles: "Baja lógica procesada. Estado RETIRADO. Cuenta no ingresa ni recibe asignaciones. Se conservan decisiones, firmas, eventos e incidentes intactos sin borrado físico.",
        usuarioAfectadoId: u.id,
        usuarioAfectadoCedula: u.cedula,
      });

      return { ok: true };
    },
    [usuarios, registrarAuditoria]
  );

  return {
    usuarios,
    auditoria,
    isLoaded,
    crearUsuarioInterno,
    editarUsuario,
    activarUsuario,
    simularActivacionDemo,
    simularEnrolamiento2FA,
    suspenderUsuario,
    reactivarUsuario,
    darDeBajaUsuario,
    registrarAuditoria,
  };
}
