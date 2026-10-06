"use client";

import { useState, useEffect, useCallback } from "react";

export type TipoTramiteIngreso =
  | "PROCESO_A_REGISTRO_INSTITUCION"
  | "PROCESO_B_ENROLAMIENTO_COORDINADOR"
  | "PROCESO_C_CAMBIO_COORDINADOR";

export type EstadoSolicitudIngreso =
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "PENDIENTE_ENVIO"
  | "PENDIENTE_ASIGNACION_GESTION"
  | "EN_REVISION_GESTION"
  | "APROBADO_GESTION"
  | "PENDIENTE_ASIGNACION_NORMATIVIDAD"
  | "PENDIENTE_GENERAR_RESOLUCION"
  | "EN_GENERACION_RESOLUCION"
  | "GENERACION_PENDIENTE"
  | "RESOLUCION_GENERADA"
  | "PENDIENTE_DE_FIRMA"
  | "INSTITUCION_ACTIVA"
  | "EN_REVISION_NORMATIVIDAD"
  | "APROBADO_FINAL"
  | "Cancelada";

import { getStatusBadgeConfig, type StatusBadgeConfig } from "@/lib/status-badge-config";

// Helper para badges de estado
export function getEstadoBadgeProps(
  estado: EstadoSolicitudIngreso,
  revisionIniciada?: boolean,
  contexto?: "REVISOR" | "DIRECTOR",
  rechazadoPor?: "GESTION" | "NORMATIVIDAD"
): StatusBadgeConfig {
  const baseConfig = getStatusBadgeConfig(estado);
  
  if (contexto === "REVISOR") {
    if (
      estado === "Aprobada" ||
      estado === "APROBADO_FINAL" ||
      estado === "RESOLUCION_GENERADA" ||
      estado === "APROBADO_GESTION" ||
      estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" ||
      estado === "EN_REVISION_NORMATIVIDAD" ||
      estado === "PENDIENTE_GENERAR_RESOLUCION" ||
      estado === "EN_GENERACION_RESOLUCION" ||
      estado === "GENERACION_PENDIENTE" ||
      estado === "INSTITUCION_ACTIVA" ||
      estado === "PENDIENTE_DE_FIRMA"
    ) {
      return { tone: "success", appearance: "soft", scale: "100", dot: true, label: "Aprobada" as const };
    }
    if (estado === "Rechazada" || estado === "Cancelada") {
      return { tone: "danger", appearance: "soft", scale: "50", dot: true, label: "Rechazada" as const };
    }
    if (estado === "EN_REVISION_GESTION") {
      return { tone: "warning", appearance: "soft", scale: "50", dot: true, label: "Pendiente" as const };
    }
    if (estado === "Pendiente" || estado === "PENDIENTE_ASIGNACION_GESTION" || estado === "PENDIENTE_ENVIO") {
      return { tone: "warning", appearance: "soft", scale: "50", dot: true, label: "Pendiente" as const };
    }
  }

  if ((estado === "EN_GENERACION_RESOLUCION" || estado === "EN_REVISION_NORMATIVIDAD") && revisionIniciada) {
    return { ...baseConfig, label: "En generación de resolución" };
  }
  if ((estado === "Rechazada" || estado === "Cancelada") && contexto !== "REVISOR" && rechazadoPor === "NORMATIVIDAD") {
    return { ...baseConfig, label: "Rechazado por Normatividad" };
  }

  return baseConfig;
}

export function puedeReasignarSolicitud(solicitud: SolicitudIngreso | null | undefined, tipoArea?: string) {
  if (!solicitud) return { puedeReasignar: false, esReasignacion: false, motivoBloqueo: undefined };
  if (
    solicitud.estado === "APROBADO_FINAL" ||
    solicitud.estado === "RESOLUCION_GENERADA" ||
    solicitud.estado === "PENDIENTE_DE_FIRMA" ||
    solicitud.estado === "INSTITUCION_ACTIVA" ||
    solicitud.estado === "Aprobada" ||
    solicitud.estado === "Rechazada" ||
    solicitud.estado === "Cancelada"
  ) {
    return { puedeReasignar: false, esReasignacion: false, motivoBloqueo: "Trámite finalizado o resolución ya generada" };
  }

  const isNormativa = tipoArea === "DIR_NORMATIVA" || tipoArea === "NORMATIVIDAD" || solicitud.estado.includes("NORMATIVIDAD") || solicitud.estado.includes("RESOLUCION") || solicitud.estado === "GENERACION_PENDIENTE";
  const revisorActual = isNormativa ? solicitud.revisorNormatividad : (solicitud.revisorGestion || solicitud.revisor);
  const esReasignacion = Boolean(revisorActual);

  // Si el usuario tiene rol directivo, siempre tiene potestad de asignar o reasignar en su ámbito
  if (tipoArea === "DIR_GESTION" || tipoArea === "DIR_NORMATIVA") {
    return { puedeReasignar: true, esReasignacion, motivoBloqueo: undefined };
  }

  // Si la revisión o generación de resolución ya fue iniciada formalmente por el funcionario
  if (isNormativa ? (solicitud.revisionIniciada && Boolean(solicitud.revisorNormatividad) && (solicitud.estado === "EN_GENERACION_RESOLUCION" || solicitud.estado === "EN_REVISION_NORMATIVIDAD")) : (solicitud.revisionIniciada && solicitud.estado === "EN_REVISION_GESTION")) {
    return { puedeReasignar: false, esReasignacion, motivoBloqueo: "Revisión ya iniciada por el responsable" };
  }

  return { puedeReasignar: true, esReasignacion, motivoBloqueo: undefined };
}

// Datos Anexo A: Solicitud de Acceso al SINARP (ARP-R01)
export interface DatosAnexoA {
  // 1.1 Solicitante
  entidadTipo: "Publica" | "Privada";
  nombreEntidad: string;
  entidadSiglas?: string;
  rucEntidad: string;
  direccionEntidad: string;
  objetoSocial: string;
  representanteLegalNombre: string;
  representanteLegalCargo: string;
  representanteLegalEmail: string;
  esDelegado: boolean;
  archivoSoporteDelegacion?: string;

  // 1.2 Coordinador Titular (Preregistrado)
  titularNombreCompleto: string;
  titularCedula: string;
  titularCargo: string;
  titularAreaUnidad: string;
  titularEmail: string;
  titularTelefonoFijo: string;
  titularMovilInstitucional: string;
  titularMovilPersonal: string;

  // 1.3 Coordinador Suplente (Preregistrado)
  suplenteNombreCompleto: string;
  suplenteCedula: string;
  suplenteCargo: string;
  suplenteAreaUnidad: string;
  suplenteEmail: string;
  suplenteTelefonoFijo: string;
  suplenteMovilInstitucional: string;
  suplenteMovilPersonal: string;

  // Sección II: Servicios y Herramientas
  serviciosHerramientas: string[]; // Infodigital, Ficha de Registro Único, Interoperabilidad
  areasUso: string;
  procesosUso: string;

  // Declaraciones y Firma
  declaracionesAceptadas: boolean;
  ciudadFirma: string;
  fechaFirma: string;
  firmadoDigitalmente: boolean;
  archivoDocumentoFirmado?: string;
}

// Datos Anexo B: Acuerdo de Uso y Confidencialidad (ARP-R02)
export interface DatosAnexoB {
  nombreEntidad: string;
  domicilioEntidad: string;
  representanteLegalNombre: string;
  funcionarioNombre: string;
  funcionarioCedula: string;
  funcionarioCargo: string;
  funcionarioEmail?: string;
  rolAsignado: "COORDINADOR TITULAR" | "SUPLENTE" | "SUPERVISOR" | "VISUALIZADOR";
  misionVisionInstitucional: string;
  clausulasAceptadas: boolean;
  ciudadFirma: string;
  fechaFirma: string;
  firmadoPorRepresentante: boolean;
  firmadoPorFuncionario: boolean;
  archivoAcuerdoFirmado?: string;
}

// Datos Anexo C: Cambio de Coordinador Institucional (ARP-R03)
export interface DatosAnexoC {
  nombreEntidad: string;
  representanteLegalNombre: string;
  esDelegado: boolean;
  archivoSoporteDelegacion?: string;

  // Cláusula Segunda: Cambio Titular
  aplicaCambioTitular: boolean;
  nuevoTitularNombre?: string;
  nuevoTitularCedula?: string;
  nuevoTitularCargo?: string;
  nuevoTitularMotivo?: string;
  nuevoTitularEmail?: string;
  nuevoTitularArea?: string;
  nuevoTitularTelefonoFijo?: string;
  nuevoTitularMovilInst?: string;
  nuevoTitularMovilPersonal?: string;

  // Cláusula Segunda: Cambio Suplente
  aplicaCambioSuplente: boolean;
  nuevoSuplenteNombre?: string;
  nuevoSuplenteCedula?: string;
  nuevoSuplenteCargo?: string;
  nuevoSuplenteMotivo?: string;
  nuevoSuplenteEmail?: string;
  nuevoSuplenteArea?: string;
  nuevoSuplenteTelefonoFijo?: string;
  nuevoSuplenteMovilInst?: string;
  nuevoSuplenteMovilPersonal?: string;

  // Cláusula Tercera: Designación Inicial Suplente (Solo si entidad no tenía suplente)
  aplicaDesignacionInicialSuplente: boolean;
  inicialSuplenteNombre?: string;
  inicialSuplenteCedula?: string;
  inicialSuplenteCargo?: string;
  inicialSuplenteEmail?: string;

  // Cláusula Cuarta: Aceptación y Firmas
  ciudadFirma: string;
  fechaFirma: string;
  firmadoDigitalmente: boolean;
  archivoDocumentoFirmado?: string;
}

export interface InvitacionAnexoB {
  id: string; // ej: "INV-B-2026-0042-TIT"
  solicitudId: string;
  destinatarioCedula: string;
  destinatarioNombre: string;
  destinatarioEmail: string;
  destinatarioCargo?: string;
  institucion: string;
  rol: "TITULAR" | "SUPLENTE";
  token: string; // Token opaco sensible, nunca visible en UI
  fechaEmision: string;
  fechaCaducidad: string;
  estado: "PENDIENTE" | "USADA" | "VENCIDA" | "REVOCADA";
  canalEnvio: "CORREO_ELECTRONICO";
  fechaEnvio: string;
}

// ENR-03: Asignación trazable y opaca de trámites Anexo B
export interface AsignacionTramite {
  id_asignacion: string; // Formato opaco TEC-00: ASIG-B-[timestamp]-[random]
  id_asignador: string; // Identificador del Director asignador (ej: U-DIRGEST, 1711223344)
  nombre_asignador?: string;
  id_revisor: string; // Identificador del Revisor asignado (ej: U-EQGEST, REV-G04, 1111111111)
  nombre_revisor: string;
  instante_asignacion: string; // ISO 8601 UTC exacto
  id_tramite_b: string; // Identificador del trámite Anexo B vinculado
  vigente: boolean; // true si es la asignación activa, false si fue cerrada por reasignación
  motivo_reasignacion?: string;
}

export interface SolicitudIngreso {
  id: string;
  tipoTramite: TipoTramiteIngreso;
  codigoDocumental: "ARP-R01" | "ARP-R02" | "ARP-R03";
  tituloTramite: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  iniciales: string;
  correo: string;
  institucion: string;
  fechaSolicitud: string;
  estado: EstadoSolicitudIngreso;
  fechaRevision?: string;
  fechaInicioRevision?: string;
  revisor?: string;
  revisorGestion?: string;
  revisorNormatividad?: string;
  revisionIniciada?: boolean;
  fechaAsignacionGestion?: string;
  fechaAsignacionNormatividad?: string;
  fechaAprobacionGestion?: string;
  observacionesAsignacion?: string;
  resolucion?: string;
  motivoRechazo?: string;
  rechazadoPor?: "GESTION" | "NORMATIVIDAD";
  documentos: string[];

  // ENR-03: Trazabilidad y asignación opaca de Anexo B
  asignacionActual?: AsignacionTramite;
  historialAsignaciones?: AsignacionTramite[];

  // ENR-03 / ENR-04: Idempotencia y activación de Coordinador
  enr04Ejecutado?: boolean;
  enr04Instante?: string;
  enr04CoordinadorActivado?: boolean;
  estadoNotificacionResolucion?: "ENVIADA" | "PENDIENTE" | "FALLIDA";

  // INS-07: Datos de firma de resolución y activación institucional
  datosFirmaResolucion?: {
    firmante: string;
    cargo: string;
    entidad: string;
    entidadCertificadora: string;
    algoritmo: string;
    fechaHoraFirma: string;
    verificada: boolean;
    hashDocumento?: string;
  };

  invitacionesB?: InvitacionAnexoB[];

  historial?: Array<{
    id: string;
    fecha?: string;
    fechaHora?: string;
    accion: string;
    usuario?: string;
    realizadoPor?: string;
    rol?: string;
    detalle?: string;
    detalles?: string;
  }>;

  // Contenido de los anexos BPM
  anexoA?: DatosAnexoA;
  anexoB?: DatosAnexoB;
  anexoC?: DatosAnexoC;
}

export const STORAGE_KEY_INGRESOS = "dinarp_solicitudes_ingreso_v18";

export const INITIAL_SOLICITUDES_INGRESO: SolicitudIngreso[] = [
  // CASO 1 (PRIORITARIO NORMATIVA): APROBADO POR GESTIÓN → PENDIENTE ASIGNACIÓN EN NORMATIVIDAD
  {
    id: "SOL-ING-102",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1709998887",
    nombres: "Roberto",
    apellidos: "García",
    nombreCompleto: "Roberto García",
    iniciales: "RG",
    correo: "roberto.garcia@salud.gob.ec",
    institucion: "Ministerio de Salud Pública",
    fechaSolicitud: "29/09/2026 15:45",
    estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
    revisorGestion: "Revisor Gestión",
    revisor: "Por asignar",
    revisorNormatividad: undefined,
    revisionIniciada: false,
    fechaAsignacionGestion: "25/09/2026 15:00",
    fechaRevision: "26/09/2026 10:30",
    fechaAprobacionGestion: "26/09/2026 10:30",
    documentos: ["ARP-R01_Solicitud_Acceso_MSP.pdf"],
    historial: [
      {
        id: "h-ing-102",
        fechaHora: "25/09/2026 14:20",
        accion: "Ingreso de trámite",
        realizadoPor: "Roberto García",
        rol: "Solicitante Institucional",
        detalles: "Ingreso formal de solicitud de registro institucional para consumo de interoperabilidad."
      },
      {
        id: "h-asig-102",
        fechaHora: "25/09/2026 15:00",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión para control formal y documental."
      },
      {
        id: "h-rev-102",
        fechaHora: "26/09/2026 09:15",
        accion: "Revisión técnica iniciada",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "El revisor Revisor Gestión ha iniciado formalmente la verificación técnica y documental del expediente."
      },
      {
        id: "h1-102",
        fechaHora: "26/09/2026 10:30",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "Documentación legal y técnica conforme a la normativa SINARP. Expediente remitido a Normatividad para asignación jurídica."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio de Salud Pública",
      rucEntidad: "1760001120001",
      direccionEntidad: "Av. Quitumbe Ñan, Quito",
      objetoSocial: "Salud pública",
      representanteLegalNombre: "Dr. José Ruales",
      representanteLegalCargo: "Ministro de Salud",
      representanteLegalEmail: "ministro@salud.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Roberto García",
      titularCedula: "1709998887",
      titularCargo: "Director de Tecnologías",
      titularAreaUnidad: "DNTIC",
      titularEmail: "roberto.garcia@salud.gob.ec",
      titularTelefonoFijo: "023814400",
      titularMovilInstitucional: "0981112233",
      titularMovilPersonal: "0992223344",
      suplenteNombreCompleto: "Marta Sánchez",
      suplenteCedula: "1718889990",
      suplenteCargo: "Especialista TIC",
      suplenteAreaUnidad: "DNTIC",
      suplenteEmail: "marta.sanchez@salud.gob.ec",
      suplenteTelefonoFijo: "023814400",
      suplenteMovilInstitucional: "0995556677",
      suplenteMovilPersonal: "0986667788",
      serviciosHerramientas: ["Consulta de defunciones"],
      areasUso: "Epidemiología",
      procesosUso: "Registro estadístico",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "25/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_MSP.pdf"
    }
  },

  // CASO 2 (PRIORITARIO NORMATIVA): APROBADO POR GESTIÓN → PENDIENTE ASIGNACIÓN EN NORMATIVIDAD
  {
    id: "SOL-ING-104",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1714443322",
    nombres: "Mariana",
    apellidos: "Almeida Cárdenas",
    nombreCompleto: "Mariana Almeida Cárdenas",
    iniciales: "MA",
    correo: "mariana.almeida@educacion.gob.ec",
    institucion: "Ministerio de Educación",
    fechaSolicitud: "29/09/2026 15:30",
    estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
    revisorGestion: "Revisor Gestión",
    revisor: "Por asignar",
    revisorNormatividad: undefined,
    revisionIniciada: false,
    fechaAsignacionGestion: "28/09/2026 09:00",
    fechaRevision: "28/09/2026 11:30",
    fechaAprobacionGestion: "28/09/2026 11:30",
    documentos: ["ARP-R01_Solicitud_Acceso_MINEDUC.pdf"],
    historial: [
      {
        id: "h-ing-104",
        fechaHora: "28/09/2026 08:30",
        accion: "Ingreso de trámite",
        realizadoPor: "Mariana Almeida Cárdenas",
        rol: "Solicitante Institucional",
        detalles: "Formulario oficial ARP-R01 ingresado formalmente al sistema."
      },
      {
        id: "h-asig-104",
        fechaHora: "28/09/2026 09:00",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Trámite asignado a Revisor Gestión. Verificar datos del titular y suplente para consulta de títulos académicos."
      },
      {
        id: "h-rev-104",
        fechaHora: "28/09/2026 09:40",
        accion: "Revisión técnica iniciada",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "El revisor Revisor Gestión ha iniciado formalmente la verificación técnica y documental del expediente."
      },
      {
        id: "h-aprob-104",
        fechaHora: "28/09/2026 11:30",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "Expediente validado técnicamente. Remitido a Normatividad para asignación de especialista jurídico y formulación de resolución."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio de Educación",
      rucEntidad: "1760008200001",
      direccionEntidad: "Av. Amazonas N34-451 y Atahualpa, Quito",
      objetoSocial: "Garantizar el acceso y calidad de la educación nacional inicial, básica y bachillerato.",
      representanteLegalNombre: "Dra. María Brown Pérez",
      representanteLegalCargo: "Ministra de Educación",
      representanteLegalEmail: "ministra@educacion.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Mariana Almeida Cárdenas",
      titularCedula: "1714443322",
      titularCargo: "Directora Nacional de Tecnologías de la Información",
      titularAreaUnidad: "Dirección de TI",
      titularEmail: "mariana.almeida@educacion.gob.ec",
      titularTelefonoFijo: "023961300",
      titularMovilInstitucional: "0998877665",
      titularMovilPersonal: "0987766554",
      suplenteNombreCompleto: "Jorge Andrés Morales",
      suplenteCedula: "1713332211",
      suplenteCargo: "Analista de Seguridad de la Información",
      suplenteAreaUnidad: "Dirección de TI",
      suplenteEmail: "jorge.morales@educacion.gob.ec",
      suplenteTelefonoFijo: "023961300",
      suplenteMovilInstitucional: "0991112233",
      suplenteMovilPersonal: "0982223344",
      serviciosHerramientas: ["Consulta de títulos bachiller", "Consulta de actas"],
      areasUso: "Matriculación y Certificación",
      procesosUso: "Validación de expedientes estudiantiles",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "28/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_MINEDUC.pdf"
    }
  },
  // CASO 1: PENDIENTE POR REVISAR (Asignado por el Director al Revisor, en espera de iniciar formalmente)
  {
    id: "SOL-ING-101",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1722334455",
    nombres: "Ana María",
    apellidos: "Pérez Gómez",
    nombreCompleto: "Ana María Pérez Gómez",
    iniciales: "AP",
    correo: "ana.perez@mintel.gob.ec",
    institucion: "Ministerio de Telecomunicaciones",
    fechaSolicitud: "28/09/2026 09:15",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "28/09/2026 10:15",
    observacionesAsignacion: "Prioridad alta. Validar designación de coordinadores y firma digital FirmaEC.",
    revisionIniciada: false,
    documentos: ["ARP-R01_Solicitud_Acceso_MINTEL.pdf"],
    historial: [
      {
        id: "h-ing-101",
        fechaHora: "28/09/2026 09:15",
        accion: "Ingreso de trámite",
        realizadoPor: "Ana María Pérez Gómez",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-asig-101",
        fechaHora: "28/09/2026 10:15",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Trámite asignado a Revisor Gestión. Prioridad alta. Validar designación de coordinadores y firma digital FirmaEC."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio de Telecomunicaciones",
      rucEntidad: "1768151240001",
      direccionEntidad: "Av. 6 de Diciembre y Colón, Quito",
      objetoSocial: "Rector de las telecomunicaciones y sociedad de la información.",
      representanteLegalNombre: "Ing. Vianna Maino",
      representanteLegalCargo: "Ministra",
      representanteLegalEmail: "ministra@mintel.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Ana María Pérez Gómez",
      titularCedula: "1722334455",
      titularCargo: "Directora de Interoperabilidad",
      titularAreaUnidad: "Subsecretaría de Gobierno Electrónico",
      titularEmail: "ana.perez@mintel.gob.ec",
      titularTelefonoFijo: "023931000",
      titularMovilInstitucional: "0991112233",
      titularMovilPersonal: "0992223344",
      suplenteNombreCompleto: "Luis Fernando Torres",
      suplenteCedula: "1711223344",
      suplenteCargo: "Especialista en Datos",
      suplenteAreaUnidad: "Subsecretaría de Gobierno Electrónico",
      suplenteEmail: "luis.torres@mintel.gob.ec",
      suplenteTelefonoFijo: "023931000",
      suplenteMovilInstitucional: "0993334455",
      suplenteMovilPersonal: "0994445566",
      serviciosHerramientas: ["Ficha de Información Ciudadana"],
      areasUso: "Gestión de Trámites",
      procesosUso: "Simplificación de trámites",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "28/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_MINTEL.pdf"
    }
  },

  // CASO 1.2: PENDIENTE POR REVISAR (Consejo de la Judicatura - Anexo A)
  {
    id: "SOL-ING-109",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1710001112",
    nombres: "Marcelo",
    apellidos: "Albuja",
    nombreCompleto: "Marcelo Albuja",
    iniciales: "MA",
    correo: "marcelo.albuja@funcionjudicial.gob.ec",
    institucion: "Consejo de la Judicatura",
    fechaSolicitud: "29/09/2026 08:15",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 08:45",
    observacionesAsignacion: "Verificar acceso para sorteo de peritos judiciales.",
    revisionIniciada: true,
    fechaInicioRevision: "29/09/2026 09:10",
    documentos: ["ARP-R01_Solicitud_Acceso_Judicatura.pdf"],
    historial: [
      {
        id: "h-ing-109",
        fechaHora: "29/09/2026 08:15",
        accion: "Ingreso de trámite",
        realizadoPor: "Marcelo Albuja",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito e ingresado."
      },
      {
        id: "h-asig-109",
        fechaHora: "29/09/2026 08:45",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión. Prioridad normal."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Consejo de la Judicatura",
      rucEntidad: "1768097520001",
      direccionEntidad: "Av. 12 de Octubre N24-563, Quito",
      objetoSocial: "Administración de la Función Judicial",
      representanteLegalNombre: "Dr. Mario Godoy",
      representanteLegalCargo: "Presidente",
      representanteLegalEmail: "presidencia@funcionjudicial.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Marcelo Albuja",
      titularCedula: "1710001112",
      titularCargo: "Director Nacional de Tecnologías",
      titularAreaUnidad: "Tecnología",
      titularEmail: "marcelo.albuja@funcionjudicial.gob.ec",
      titularTelefonoFijo: "023953600",
      titularMovilInstitucional: "0991112233",
      titularMovilPersonal: "0982223344",
      suplenteNombreCompleto: "Silvia Montalvo",
      suplenteCedula: "1712223334",
      suplenteCargo: "Especialista de Sistemas",
      suplenteAreaUnidad: "Tecnología",
      suplenteEmail: "silvia.montalvo@funcionjudicial.gob.ec",
      suplenteTelefonoFijo: "023953600",
      suplenteMovilInstitucional: "0993334455",
      suplenteMovilPersonal: "0984445566",
      serviciosHerramientas: ["Consulta de datos de identidad y estado civil"],
      areasUso: "Gestión Judicial",
      procesosUso: "Validación de sujetos procesales",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_Judicatura.pdf"
    }
  },

  // CASO 1.3: PENDIENTE POR REVISAR (GAD Municipal de Guayaquil - Anexo B)
  {
    id: "SOL-ING-110",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Anexo B — Enrolamiento de Coordinador",
    cedula: "0912345678",
    nombres: "Javier",
    apellidos: "Bohórquez",
    nombreCompleto: "Javier Bohórquez",
    iniciales: "JB",
    correo: "jbohorquez@guayaquil.gob.ec",
    institucion: "GAD Municipal de Guayaquil",
    fechaSolicitud: "29/09/2026 09:00",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 09:30",
    observacionesAsignacion: "Revisar suscripción del acuerdo y rol de titular.",
    revisionIniciada: false,
    documentos: ["ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf"],
    historial: [
      {
        id: "h-ing-110-1",
        fechaHora: "29/09/2026 08:40",
        accion: "Invitación validada",
        realizadoPor: "Javier Bohórquez",
        rol: "Coordinador Designado",
        detalles: "Invitación B vigente verificada para Javier Bohórquez como COORDINADOR TITULAR de GAD Municipal de Guayaquil."
      },
      {
        id: "h-ing-110-2",
        fechaHora: "29/09/2026 08:50",
        accion: "Firma verificada en FirmaEC",
        realizadoPor: "FirmaEC · Servicio de Certificación",
        detalles: "FirmaEC confirmó correctamente la firma electrónica del Acuerdo de Uso y Confidencialidad."
      },
      {
        id: "h-ing-110",
        fechaHora: "29/09/2026 09:00",
        accion: "Anexo B enviado a Gestión DINARP",
        realizadoPor: "Javier Bohórquez",
        rol: "Coordinador Designado",
        detalles: "Acuerdo de Confidencialidad ingresado formalmente a la Dirección de Gestión y Registro DINARP."
      },
      {
        id: "h-asig-110",
        fechaHora: "29/09/2026 09:30",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoB: {
      nombreEntidad: "GAD Municipal de Guayaquil",
      domicilioEntidad: "Pichincha y Clemente Ballén, Guayaquil",
      representanteLegalNombre: "Aquiles Alvarez Henriques",
      funcionarioNombre: "Javier Bohórquez",
      funcionarioCedula: "0912345678",
      funcionarioCargo: "Director de Informática",
      funcionarioEmail: "jbohorquez@guayaquil.gob.ec",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Impulsar el desarrollo cantonal y la gobernanza digital.",
      clausulasAceptadas: true,
      ciudadFirma: "Guayaquil",
      fechaFirma: "29/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf"
    }
  },

  // CASO 1.3B: ANEXO B PENDIENTE DE ASIGNACIÓN (Nuevo trámite ingresado por Coordinador)
  {
    id: "SOL-ING-109",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Anexo B — Enrolamiento de Coordinador",
    cedula: "4444444444",
    nombres: "Carlos Alberto",
    apellidos: "Morales Viteri",
    nombreCompleto: "Ing. Carlos Alberto Morales Viteri",
    iniciales: "CM",
    correo: "carlos.morales@cuenca.gob.ec",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Cuenca",
    fechaSolicitud: "29/09/2026 09:15",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: ["ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf"],
    historial: [
      {
        id: "h-ing-109-1",
        fechaHora: "29/09/2026 08:55",
        accion: "Invitación validada",
        realizadoPor: "Ing. Carlos Alberto Morales Viteri",
        rol: "Coordinador Designado",
        detalles: "Invitación B vigente verificada para Ing. Carlos Alberto Morales Viteri como COORDINADOR TITULAR de GAD Municipal de Cuenca."
      },
      {
        id: "h-ing-109-2",
        fechaHora: "29/09/2026 09:05",
        accion: "Firma verificada en FirmaEC",
        realizadoPor: "FirmaEC · Servicio de Certificación",
        detalles: "FirmaEC confirmó correctamente la firma electrónica del Acuerdo de Uso y Confidencialidad y certificado digital válido."
      },
      {
        id: "h-ing-109-3",
        fechaHora: "29/09/2026 09:15",
        accion: "Anexo B enviado a Gestión DINARP",
        realizadoPor: "Ing. Carlos Alberto Morales Viteri",
        rol: "Coordinador Designado",
        detalles: "Acuerdo de Confidencialidad (Anexo B) ingresado formalmente a la bandeja de Gestión DINARP para asignación de revisor."
      }
    ],
    anexoB: {
      nombreEntidad: "Gobierno Autónomo Descentralizado Municipal de Cuenca",
      domicilioEntidad: "Calle Bolívar y Borrero, Cuenca, Azuay",
      representanteLegalNombre: "Dr. Cristian Zamora Matute (Alcalde)",
      funcionarioNombre: "Ing. Carlos Alberto Morales Viteri",
      funcionarioCedula: "4444444444",
      funcionarioCargo: "Director de Tecnologías de la Información",
      funcionarioEmail: "carlos.morales@cuenca.gob.ec",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Brindar servicios públicos de excelencia y transformación digital transparente para los ciudadanos de Cuenca.",
      clausulasAceptadas: true,
      ciudadFirma: "Cuenca",
      fechaFirma: "29/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf"
    }
  },

  // CASO 1.4: PENDIENTE POR REVISAR (Ministerio de Finanzas - Anexo A)
  {
    id: "SOL-ING-111",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1716667779",
    nombres: "Andrea",
    apellidos: "Moncayo",
    nombreCompleto: "Andrea Moncayo",
    iniciales: "AM",
    correo: "andrea.moncayo@finanzas.gob.ec",
    institucion: "Ministerio de Economía y Finanzas",
    fechaSolicitud: "29/09/2026 09:20",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 09:50",
    observacionesAsignacion: "Revisar interoperabilidad con e-SIGEF.",
    revisionIniciada: false,
    documentos: ["ARP-R01_Solicitud_Acceso_MEF.pdf"],
    historial: [
      {
        id: "h-ing-111",
        fechaHora: "29/09/2026 09:20",
        accion: "Ingreso de trámite",
        realizadoPor: "Andrea Moncayo",
        rol: "Solicitante Institucional",
        detalles: "Ingreso de formulario ARP-R01."
      },
      {
        id: "h-asig-111",
        fechaHora: "29/09/2026 09:50",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio de Economía y Finanzas",
      rucEntidad: "1760001040001",
      direccionEntidad: "Av. 10 de Agosto y Jorge Washington, Quito",
      objetoSocial: "Gestión financiera del Estado",
      representanteLegalNombre: "Econ. Juan Carlos Vega",
      representanteLegalCargo: "Ministro",
      representanteLegalEmail: "ministro@finanzas.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Andrea Moncayo",
      titularCedula: "1716667779",
      titularCargo: "Directora de Tecnología",
      titularAreaUnidad: "Tecnología",
      titularEmail: "andrea.moncayo@finanzas.gob.ec",
      titularTelefonoFijo: "023998800",
      titularMovilInstitucional: "0994445566",
      titularMovilPersonal: "0983332211",
      suplenteNombreCompleto: "César Andrade",
      suplenteCedula: "1715554443",
      suplenteCargo: "Analista de Integración",
      suplenteAreaUnidad: "Tecnología",
      suplenteEmail: "cesar.andrade@finanzas.gob.ec",
      suplenteTelefonoFijo: "023998800",
      suplenteMovilInstitucional: "0996667788",
      suplenteMovilPersonal: "0981112233",
      serviciosHerramientas: ["Ficha de Información Ciudadana"],
      areasUso: "Tesorería Nacional",
      procesosUso: "Control de pagos del sector público",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_MEF.pdf"
    }
  },

  // CASO 1.5: PENDIENTE POR REVISAR (CNE - Anexo C)
  {
    id: "SOL-ING-112",
    tipoTramite: "PROCESO_C_CAMBIO_COORDINADOR",
    codigoDocumental: "ARP-R03",
    tituloTramite: "Cambio de Coordinador Institucional (ARP-R03)",
    cedula: "1718889995",
    nombres: "Diana",
    apellidos: "Atamaint",
    nombreCompleto: "Diana Atamaint",
    iniciales: "DA",
    correo: "datamaint@cne.gob.ec",
    institucion: "Consejo Nacional Electoral",
    fechaSolicitud: "29/09/2026 10:00",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 10:20",
    observacionesAsignacion: "Validar cambio de suplente por renuncia.",
    revisionIniciada: false,
    documentos: ["ARP-R03_Cambio_Coordinador_CNE.pdf"],
    historial: [
      {
        id: "h-ing-112",
        fechaHora: "29/09/2026 10:00",
        accion: "Ingreso de trámite",
        realizadoPor: "Diana Atamaint",
        rol: "Solicitante Institucional",
        detalles: "Ingreso formal de formulario ARP-R03."
      },
      {
        id: "h-asig-112",
        fechaHora: "29/09/2026 10:20",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoC: {
      nombreEntidad: "Consejo Nacional Electoral",
      representanteLegalNombre: "Ing. Diana Atamaint",
      esDelegado: false,
      aplicaCambioTitular: false,
      aplicaCambioSuplente: true,
      aplicaDesignacionInicialSuplente: false,
      nuevoSuplenteNombre: "Ing. Paúl Córdova",
      nuevoSuplenteCedula: "1719990001",
      nuevoSuplenteCargo: "Coordinador de Voto Telemático",
      nuevoSuplenteMotivo: "Renuncia del titular anterior",
      nuevoSuplenteEmail: "paul.cordova@cne.gob.ec",
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R03_Cambio_Coordinador_CNE.pdf"
    }
  },

  // CASO 1.6: PENDIENTE POR REVISAR (Policía Nacional - Anexo A)
  {
    id: "SOL-ING-113",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1715551122",
    nombres: "Geovanny",
    apellidos: "Ponce",
    nombreCompleto: "Geovanny Ponce",
    iniciales: "GP",
    correo: "geovanny.ponce@policia.gob.ec",
    institucion: "Policía Nacional del Ecuador",
    fechaSolicitud: "29/09/2026 10:30",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 11:00",
    observacionesAsignacion: "Prioridad alta para Dirección Nacional de Investigación Criminal.",
    revisionIniciada: false,
    documentos: ["ARP-R01_Solicitud_Acceso_Policia.pdf"],
    historial: [
      {
        id: "h-ing-113",
        fechaHora: "29/09/2026 10:30",
        accion: "Ingreso de trámite",
        realizadoPor: "Geovanny Ponce",
        rol: "Solicitante Institucional",
        detalles: "Ingreso de formulario ARP-R01."
      },
      {
        id: "h-asig-113",
        fechaHora: "29/09/2026 11:00",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Policía Nacional del Ecuador",
      rucEntidad: "1768000540001",
      direccionEntidad: "Av. Amazonas y Japón, Quito",
      objetoSocial: "Seguridad ciudadana y orden público",
      representanteLegalNombre: "Gral. César Zapata",
      representanteLegalCargo: "Comandante General",
      representanteLegalEmail: "comandancia@policia.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Geovanny Ponce",
      titularCedula: "1715551122",
      titularCargo: "Director de Tecnologías de la Información",
      titularAreaUnidad: "DNTIC",
      titularEmail: "geovanny.ponce@policia.gob.ec",
      titularTelefonoFijo: "022447070",
      titularMovilInstitucional: "0998877112",
      titularMovilPersonal: "0987766223",
      suplenteNombreCompleto: "Mayr. Fernando Salas",
      suplenteCedula: "1714443355",
      suplenteCargo: "Jefe de Ciberseguridad",
      suplenteAreaUnidad: "DNTIC",
      suplenteEmail: "fernando.salas@policia.gob.ec",
      suplenteTelefonoFijo: "022447070",
      suplenteMovilInstitucional: "0991122445",
      suplenteMovilPersonal: "0983344556",
      serviciosHerramientas: ["Consulta de datos de identidad y estado civil", "Consulta de defunciones"],
      areasUso: "Investigación Policial",
      procesosUso: "Verificación de antecedentes e identidad en operativos",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_Policia.pdf"
    }
  },

  // CASO 1.7: PENDIENTE POR REVISAR (BCE - Anexo B)
  {
    id: "SOL-ING-114",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Confidencialidad (Enrolamiento)",
    cedula: "1713337778",
    nombres: "Guillermo",
    apellidos: "Avellán",
    nombreCompleto: "Guillermo Avellán",
    iniciales: "GA",
    correo: "gavellan@bce.ec",
    institucion: "Banco Central del Ecuador",
    fechaSolicitud: "29/09/2026 11:15",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 11:30",
    observacionesAsignacion: "Revisar cláusulas de sigilo bancario en el acuerdo.",
    revisionIniciada: false,
    documentos: ["ARP-R02_Acuerdo_Confidencialidad_BCE.pdf"],
    historial: [
      {
        id: "h-ing-114",
        fechaHora: "29/09/2026 11:15",
        accion: "Ingreso de trámite",
        realizadoPor: "Guillermo Avellán",
        rol: "Solicitante Institucional",
        detalles: "Ingreso formal de ARP-R02."
      },
      {
        id: "h-asig-114",
        fechaHora: "29/09/2026 11:30",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoB: {
      nombreEntidad: "Banco Central del Ecuador",
      domicilioEntidad: "Av. 10 de Agosto y Briceño, Quito",
      representanteLegalNombre: "Econ. Tatiana Rodríguez",
      funcionarioNombre: "Guillermo Avellán",
      funcionarioCedula: "1713337778",
      funcionarioCargo: "Gerente de Operaciones",
      funcionarioEmail: "gavellan@bce.ec",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Instrumentar la política monetaria y financiera nacional.",
      clausulasAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Confidencialidad_BCE.pdf"
    }
  },

  // CASO 1.8: PENDIENTE POR REVISAR (Registro Civil - Anexo A)
  {
    id: "SOL-ING-115",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1714448889",
    nombres: "Ottón",
    apellidos: "Cevallos",
    nombreCompleto: "Ottón Cevallos",
    iniciales: "OC",
    correo: "otton.cevallos@registrocivil.gob.ec",
    institucion: "Dirección General de Registro Civil",
    fechaSolicitud: "29/09/2026 11:45",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 12:00",
    observacionesAsignacion: "Verificar cruce de datos de defunciones y cedulación.",
    revisionIniciada: false,
    documentos: ["ARP-R01_Solicitud_Acceso_DIGERCIC.pdf"],
    historial: [
      {
        id: "h-ing-115",
        fechaHora: "29/09/2026 11:45",
        accion: "Ingreso de trámite",
        realizadoPor: "Ottón Cevallos",
        rol: "Solicitante Institucional",
        detalles: "Ingreso de formulario ARP-R01."
      },
      {
        id: "h-asig-115",
        fechaHora: "29/09/2026 12:00",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Dirección General de Registro Civil, Identificación y Cedulación",
      rucEntidad: "1768037230001",
      direccionEntidad: "Av. Amazonas N37-61 y Villalengua, Quito",
      objetoSocial: "Identificación y registro de hechos y actos del estado civil",
      representanteLegalNombre: "Ing. Ottón Cevallos",
      representanteLegalCargo: "Director General",
      representanteLegalEmail: "direccion@registrocivil.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Ottón Cevallos",
      titularCedula: "1714448889",
      titularCargo: "Director de Tecnologías",
      titularAreaUnidad: "Tecnología",
      titularEmail: "otton.cevallos@registrocivil.gob.ec",
      titularTelefonoFijo: "023731110",
      titularMovilInstitucional: "0998889990",
      titularMovilPersonal: "0987778889",
      suplenteNombreCompleto: "Ing. Lorena Romero",
      suplenteCedula: "1715556660",
      suplenteCargo: "Jefa de Datos",
      suplenteAreaUnidad: "Tecnología",
      suplenteEmail: "lorena.romero@registrocivil.gob.ec",
      suplenteTelefonoFijo: "023731110",
      suplenteMovilInstitucional: "0991113335",
      suplenteMovilPersonal: "0982224446",
      serviciosHerramientas: ["Ficha de Información Ciudadana"],
      areasUso: "Identificación Ciudadana",
      procesosUso: "Verificación biométrica y registral",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_DIGERCIC.pdf"
    }
  },

  // CASO 1.9: PENDIENTE POR REVISAR (Ministerio del Ambiente - Anexo A)
  {
    id: "SOL-ING-116",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1716669991",
    nombres: "Sade",
    apellidos: "Fritschi",
    nombreCompleto: "Sade Fritschi",
    iniciales: "SF",
    correo: "sade.fritschi@ambiente.gob.ec",
    institucion: "Ministerio del Ambiente, Agua y Transición Ecológica",
    fechaSolicitud: "29/09/2026 12:10",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 12:30",
    observacionesAsignacion: "Revisar autorizaciones de permisos ambientales.",
    revisionIniciada: false,
    documentos: ["ARP-R01_Solicitud_Acceso_MAATE.pdf"],
    historial: [
      {
        id: "h-ing-116",
        fechaHora: "29/09/2026 12:10",
        accion: "Ingreso de trámite",
        realizadoPor: "Sade Fritschi",
        rol: "Solicitante Institucional",
        detalles: "Ingreso de formulario ARP-R01."
      },
      {
        id: "h-asig-116",
        fechaHora: "29/09/2026 12:30",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio del Ambiente, Agua y Transición Ecológica",
      rucEntidad: "1768153340001",
      direccionEntidad: "Calle Madrid 1159 y Andalucía, Quito",
      objetoSocial: "Gestión ambiental nacional",
      representanteLegalNombre: "Mgs. Sade Fritschi",
      representanteLegalCargo: "Ministra",
      representanteLegalEmail: "ministra@ambiente.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Sade Fritschi",
      titularCedula: "1716669991",
      titularCargo: "Directora de Sistemas",
      titularAreaUnidad: "Tecnología",
      titularEmail: "sade.fritschi@ambiente.gob.ec",
      titularTelefonoFijo: "023987600",
      titularMovilInstitucional: "0994443322",
      titularMovilPersonal: "0983332211",
      suplenteNombreCompleto: "Carlos Viteri",
      suplenteCedula: "1717778882",
      suplenteCargo: "Especialista SIG",
      suplenteAreaUnidad: "Tecnología",
      suplenteEmail: "carlos.viteri@ambiente.gob.ec",
      suplenteTelefonoFijo: "023987600",
      suplenteMovilInstitucional: "0995554433",
      suplenteMovilPersonal: "0984443322",
      serviciosHerramientas: ["Consulta de datos de identidad y estado civil"],
      areasUso: "Licencias Ambientales",
      procesosUso: "Verificación de personería de proponentes",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_MAATE.pdf"
    }
  },

  // CASO 1.10: PENDIENTE POR REVISAR (Corte Nacional de Justicia - Anexo A)
  {
    id: "SOL-ING-117",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1712229990",
    nombres: "José",
    apellidos: "Suing",
    nombreCompleto: "José Suing",
    iniciales: "JS",
    correo: "jose.suing@cortenacional.gob.ec",
    institucion: "Corte Nacional de Justicia",
    fechaSolicitud: "29/09/2026 12:45",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 13:00",
    revisionIniciada: false,
    documentos: ["ARP-R01_Solicitud_Acceso_CNJ.pdf"],
    historial: [
      {
        id: "h-ing-117",
        fechaHora: "29/09/2026 12:45",
        accion: "Ingreso de trámite",
        realizadoPor: "José Suing",
        rol: "Solicitante Institucional",
        detalles: "Ingreso de formulario ARP-R01."
      },
      {
        id: "h-asig-117",
        fechaHora: "29/09/2026 13:00",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Corte Nacional de Justicia",
      rucEntidad: "1768097440001",
      direccionEntidad: "Av. Amazonas N37-101 y Villalengua, Quito",
      objetoSocial: "Administración de justicia ordinaria",
      representanteLegalNombre: "Dr. José Suing Nagua",
      representanteLegalCargo: "Presidente",
      representanteLegalEmail: "presidencia@cortenacional.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "José Suing",
      titularCedula: "1712229990",
      titularCargo: "Director de TI",
      titularAreaUnidad: "Tecnología",
      titularEmail: "jose.suing@cortenacional.gob.ec",
      titularTelefonoFijo: "023953500",
      titularMovilInstitucional: "0997778899",
      titularMovilPersonal: "0986667788",
      suplenteNombreCompleto: "Ing. Xavier Benítez",
      suplenteCedula: "1713335557",
      suplenteCargo: "Jefe de Infraestructura",
      suplenteAreaUnidad: "Tecnología",
      suplenteEmail: "xavier.benitez@cortenacional.gob.ec",
      suplenteTelefonoFijo: "023953500",
      suplenteMovilInstitucional: "0998881122",
      suplenteMovilPersonal: "0981119900",
      serviciosHerramientas: ["Consulta de datos de identidad y estado civil"],
      areasUso: "Salas de Casación",
      procesosUso: "Consulta para sentencias y autos resolutorios",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_CNJ.pdf"
    }
  },

  // CASO 4: RECHAZADO POR GESTIÓN (Observaciones obligatorias, expediente cancelado)
  {
    id: "SOL-ING-103",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1715556667",
    nombres: "Carla",
    apellidos: "Ruiz",
    nombreCompleto: "Carla Ruiz",
    iniciales: "CR",
    correo: "carla.ruiz@miduvi.gob.ec",
    institucion: "Ministerio de Desarrollo Urbano y Vivienda",
    fechaSolicitud: "27/09/2026 11:10",
    estado: "Cancelada",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    revisionIniciada: true,
    fechaAsignacionGestion: "27/09/2026 11:45",
    fechaRevision: "28/09/2026 15:45",
    motivoRechazo: "La firma electrónica en el Anexo A está caducada y no corresponde al representante legal registrado ante la entidad de control.",
    rechazadoPor: "GESTION",
    documentos: ["ARP-R01_Solicitud_Acceso_MIDUVI.pdf"],
    historial: [
      {
        id: "h-ing-103",
        fechaHora: "27/09/2026 11:10",
        accion: "Ingreso de trámite",
        realizadoPor: "Carla Ruiz",
        rol: "Solicitante Institucional",
        detalles: "Ingreso de formulario ARP-R01."
      },
      {
        id: "h-asig-103",
        fechaHora: "27/09/2026 11:45",
        accion: "Asignación de trámite",
        realizadoPor: "Director Gestión",
        rol: "Director / Coordinador",
        detalles: "Asignado a Revisor Gestión."
      },
      {
        id: "h-rev-103",
        fechaHora: "28/09/2026 14:00",
        accion: "Revisión técnica iniciada",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "El revisor Revisor Gestión ha iniciado formalmente la verificación técnica y documental del expediente."
      },
      {
        id: "h2-103",
        fechaHora: "28/09/2026 15:45",
        accion: "Solicitud rechazada por Gestión",
        realizadoPor: "Revisor Gestión",
        rol: "Equipo de Gestión",
        detalles: `Motivo:\n"La firma electrónica en el Anexo A está caducada y no corresponde al representante legal registrado ante la entidad de control."\n\nNotificación:\nInstitución notificada por correo electrónico.`
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio de Desarrollo Urbano y Vivienda",
      rucEntidad: "1768012340001",
      direccionEntidad: "Plataforma Gubernamental Sur, Quito",
      objetoSocial: "Desarrollo urbano y vivienda",
      representanteLegalNombre: "Arq. Gabriela Aguilera",
      representanteLegalCargo: "Ministra",
      representanteLegalEmail: "ministra@miduvi.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Carla Ruiz",
      titularCedula: "1715556667",
      titularCargo: "Directora de Sistemas",
      titularAreaUnidad: "Sistemas",
      titularEmail: "carla.ruiz@miduvi.gob.ec",
      titularTelefonoFijo: "022983600",
      titularMovilInstitucional: "0982223344",
      titularMovilPersonal: "0993334455",
      suplenteNombreCompleto: "Esteban López",
      suplenteCedula: "1726667778",
      suplenteCargo: "Técnico TIC",
      suplenteAreaUnidad: "Sistemas",
      suplenteEmail: "esteban.lopez@miduvi.gob.ec",
      suplenteTelefonoFijo: "022983600",
      suplenteMovilInstitucional: "0994445566",
      suplenteMovilPersonal: "0985556677",
      serviciosHerramientas: ["Consulta de bienes"],
      areasUso: "Vivienda Social",
      procesosUso: "Verificación de requisitos",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "27/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_MIDUVI.pdf"
    }
  },

  // CASO 5: ASIGNADO EN NORMATIVIDAD (PENDIENTE NORMATIVA)
  {
    id: "SOL-ING-105",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Confidencialidad (Enrolamiento)",
    cedula: "1719998881",
    nombres: "Gonzalo",
    apellidos: "Paredes",
    nombreCompleto: "Gonzalo Paredes",
    iniciales: "GP",
    correo: "gonzalo.paredes@ant.gob.ec",
    institucion: "Agencia Nacional de Tránsito",
    fechaSolicitud: "24/09/2026 10:15",
    estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
    revisorGestion: "Revisor Gestión",
    revisorNormatividad: undefined,
    revisor: "Abg. Diego Morales",
    revisionIniciada: false,
    fechaAsignacionGestion: "24/09/2026 11:00",
    fechaAprobacionGestion: "25/09/2026 09:30",
    fechaAsignacionNormatividad: "25/09/2026 14:00",
    documentos: ["ARP-R02_Acuerdo_Uso_Confidencialidad_ANT.pdf"],
    historial: [
      {
        id: "h-ing-105",
        fechaHora: "24/09/2026 10:15",
        accion: "Ingreso de trámite",
        realizadoPor: "Gonzalo Paredes",
        rol: "Solicitante Institucional",
        detalles: "Ingreso de Acuerdo de Confidencialidad ARP-R02."
      },
      {
        id: "h-aprob-gest-105",
        fechaHora: "25/09/2026 09:30",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "Validación documental completada conforme. Expediente remitido a Normatividad."
      },
      {
        id: "h-asig-norm-105",
        fechaHora: "25/09/2026 14:00",
        accion: "Asignación jurídica",
        realizadoPor: "Director Normatividad",
        rol: "Director de Normatividad",
        detalles: "Asignado a Abg. Diego Morales para revisión de cláusulas de confidencialidad."
      }
    ],
    anexoB: {
      nombreEntidad: "Agencia Nacional de Tránsito",
      domicilioEntidad: "Av. Antonio José de Sucre y Mariscal Sucre, Quito",
      representanteLegalNombre: "Ing. Vanessa Cueva",
      funcionarioNombre: "Gonzalo Paredes",
      funcionarioCedula: "1719998881",
      funcionarioCargo: "Director de TI",
      funcionarioEmail: "gonzalo.paredes@ant.gob.ec",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Garantizar la seguridad vial y transporte terrestre.",
      clausulasAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "24/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Uso_Confidencialidad_ANT.pdf"
    }
  },

  // CASO 6: EN REVISIÓN JURÍDICA (EN REVISIÓN NORMATIVA)
  {
    id: "SOL-ING-106",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1717778889",
    nombres: "Patricia",
    apellidos: "Villacís",
    nombreCompleto: "Patricia Villacís",
    iniciales: "PV",
    correo: "patricia.villacis@iess.gob.ec",
    institucion: "Instituto Ecuatoriano de Seguridad Social",
    fechaSolicitud: "23/09/2026 08:45",
    estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
    revisorGestion: "Revisor Gestión",
    revisorNormatividad: undefined,
    revisor: "Abg. Diego Morales",
    revisionIniciada: true,
    fechaAsignacionGestion: "23/09/2026 09:30",
    fechaAprobacionGestion: "24/09/2026 11:20",
    fechaAsignacionNormatividad: "24/09/2026 15:00",
    documentos: ["ARP-R01_Solicitud_Acceso_IESS.pdf"],
    historial: [
      {
        id: "h-aprob-gest-106",
        fechaHora: "24/09/2026 11:20",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "Control documental aprobado. Pasa a emisión de informe jurídico en Normatividad."
      },
      {
        id: "h-rev-norm-106",
        fechaHora: "25/09/2026 10:15",
        accion: "Revisión jurídica iniciada",
        realizadoPor: "Abg. Diego Morales",
        rol: "Revisor de Normatividad",
        detalles: "El revisor jurídico ha iniciado el análisis normativo y legal del convenio de interoperabilidad."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Instituto Ecuatoriano de Seguridad Social",
      rucEntidad: "1760004650001",
      direccionEntidad: "Av. 10 de Agosto y Bogotá, Quito",
      objetoSocial: "Seguridad social integral",
      representanteLegalNombre: "Ing. Eduardo Peña Hurtado",
      representanteLegalCargo: "Presidente del Consejo Directivo",
      representanteLegalEmail: "presidencia@iess.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Patricia Villacís",
      titularCedula: "1717778889",
      titularCargo: "Directora Nacional de Servicios Digitales",
      titularAreaUnidad: "Tecnología",
      titularEmail: "patricia.villacis@iess.gob.ec",
      titularTelefonoFijo: "023945600",
      titularMovilInstitucional: "0991234567",
      titularMovilPersonal: "0987654321",
      suplenteNombreCompleto: "Marco Antonio Silva",
      suplenteCedula: "1716665554",
      suplenteCargo: "Subdirector de Integraciones",
      suplenteAreaUnidad: "Tecnología",
      suplenteEmail: "marco.silva@iess.gob.ec",
      suplenteTelefonoFijo: "023945600",
      suplenteMovilInstitucional: "0997654321",
      suplenteMovilPersonal: "0981234567",
      serviciosHerramientas: ["Consulta de datos de identidad y estado civil"],
      areasUso: "Afiliación y Pensiones",
      procesosUso: "Verificación de beneficiarios",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "23/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_IESS.pdf"
    }
  },

  // CASO 7: RECHAZADO POR NORMATIVA (Gestión lo aprobó, pero Normatividad emitió objeción legal)
  {
    id: "SOL-ING-107",
    tipoTramite: "PROCESO_C_CAMBIO_COORDINADOR",
    codigoDocumental: "ARP-R03",
    tituloTramite: "Cambio de Coordinador Institucional (ARP-R03)",
    cedula: "1718881112",
    nombres: "Esteban",
    apellidos: "Cárdenas",
    nombreCompleto: "Esteban Cárdenas",
    iniciales: "EC",
    correo: "esteban.cardenas@senescyt.gob.ec",
    institucion: "SENESCYT",
    fechaSolicitud: "21/09/2026 12:00",
    estado: "Cancelada",
    revisorGestion: "Revisor Gestión",
    revisorNormatividad: undefined,
    revisor: "Abg. Diego Morales",
    revisionIniciada: true,
    fechaAsignacionGestion: "21/09/2026 12:30",
    fechaAprobacionGestion: "22/09/2026 10:15",
    fechaAsignacionNormatividad: "22/09/2026 14:00",
    fechaRevision: "23/09/2026 16:30",
    motivoRechazo: "La delegación jurídica adjunta no faculta al firmante para designar coordinadores institucionales de interoperabilidad.",
    rechazadoPor: "NORMATIVIDAD",
    documentos: ["ARP-R03_Cambio_Coordinador_SENESCYT.pdf", "Accion_Personal_Delegacion.pdf"],
    historial: [
      {
        id: "h-aprob-gest-107",
        fechaHora: "22/09/2026 10:15",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "Revisión documental técnica conforme."
      },
      {
        id: "h-rech-norm-107",
        fechaHora: "23/09/2026 16:30",
        accion: "Solicitud rechazada por Normatividad",
        realizadoPor: "Abg. Diego Morales",
        rol: "Dirección de Normatividad",
        detalles: "Objeción legal: La delegación jurídica no faculta al firmante para designar coordinadores."
      }
    ],
    anexoC: {
      nombreEntidad: "SENESCYT",
      representanteLegalNombre: "Dra. Ana Changuín",
      esDelegado: true,
      archivoSoporteDelegacion: "Accion_Personal_Delegacion.pdf",
      aplicaCambioTitular: true,
      aplicaCambioSuplente: false,
      aplicaDesignacionInicialSuplente: false,
      nuevoTitularNombre: "Esteban Cárdenas",
      nuevoTitularCedula: "1718881112",
      nuevoTitularCargo: "Director de TI",
      nuevoTitularMotivo: "Cese de funciones del titular anterior",
      nuevoTitularEmail: "esteban.cardenas@senescyt.gob.ec",
      ciudadFirma: "Quito D.M.",
      fechaFirma: "21/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R03_Cambio_Coordinador_SENESCYT.pdf"
    }
  },

  // CASO 8: INSTITUCIÓN ACTIVA (INS-07 culminado: resolución firmada por Máxima Autoridad, invitaciones B emitidas)
  {
    id: "SOL-ING-108",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1713334445",
    nombres: "Lorena",
    apellidos: "Barahona",
    nombreCompleto: "Lorena Barahona",
    iniciales: "LB",
    correo: "lorena.barahona@sri.gob.ec",
    institucion: "Servicio de Rentas Internas",
    fechaSolicitud: "20/09/2026 10:00",
    estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
    revisorGestion: "Revisor Gestión",
    revisorNormatividad: undefined,
    revisor: "Abg. Diego Morales",
    revisionIniciada: true,
    fechaAsignacionGestion: "20/09/2026 10:45",
    fechaAprobacionGestion: "21/09/2026 11:30",
    fechaAsignacionNormatividad: "21/09/2026 15:00",
    fechaRevision: "22/09/2026 17:00",
    resolucion: "RES-DINARP-2026-0089",
    documentos: [
      "ARP-R01_Solicitud_Acceso_SRI.pdf",
      "Dictamen_Juridico_Favorable.pdf",
      "RES-DINARP-2026-0089_Firmada_MaximaAutoridad.pdf"
    ],
    datosFirmaResolucion: {
      firmante: "Mgs. Christian Ruiz (Director Nacional)",
      cargo: "Máxima Autoridad DINARP",
      entidad: "Dirección Nacional de Registros Públicos",
      entidadCertificadora: "Banco Central del Ecuador (BCE)",
      algoritmo: "SHA-256 with RSA Encryption (2048-bit)",
      fechaHoraFirma: "22/09/2026 18:30:15",
      verificada: true,
      hashDocumento: "a8f94e21b7c093d56701ea93245cfbc9d671"
    },
    invitacionesB: [
      {
        id: "INV-B-2026-0089-TIT",
        solicitudId: "SOL-ING-108",
        destinatarioCedula: "1713334445",
        destinatarioNombre: "Lorena Barahona",
        destinatarioEmail: "lorena.barahona@sri.gob.ec",
        destinatarioCargo: "Directora Nacional de Tecnología",
        institucion: "Servicio de Rentas Internas",
        rol: "TITULAR",
        token: "tok_sec_opaque_8f7b3a9c1e4d2a0",
        fechaEmision: "22/09/2026 18:32",
        fechaCaducidad: "22/10/2026 23:59",
        estado: "PENDIENTE",
        canalEnvio: "CORREO_ELECTRONICO",
        fechaEnvio: "22/09/2026 18:32"
      },
      {
        id: "INV-B-2026-0089-SUP",
        solicitudId: "SOL-ING-108",
        destinatarioCedula: "1714455667",
        destinatarioNombre: "Carlos Alberto Espinosa",
        destinatarioEmail: "carlos.espinosa@sri.gob.ec",
        destinatarioCargo: "Jefe de Arquitectura de Datos",
        institucion: "Servicio de Rentas Internas",
        rol: "SUPLENTE",
        token: "tok_sec_opaque_9c2e4f6a8b0d1e3",
        fechaEmision: "22/09/2026 18:32",
        fechaCaducidad: "22/10/2026 23:59",
        estado: "PENDIENTE",
        canalEnvio: "CORREO_ELECTRONICO",
        fechaEnvio: "22/09/2026 18:32"
      }
    ],
    historial: [
      {
        id: "h-ing-108",
        fechaHora: "20/09/2026 10:00",
        accion: "Anexo A completado",
        realizadoPor: "Econ. Damián Larco",
        rol: "Representante Legal",
        detalles: "Formulario de Registro de Institución ARP-R01 completado en el Portal."
      },
      {
        id: "h-firmaec-108",
        fechaHora: "20/09/2026 10:15",
        accion: "Firma del Anexo A verificada",
        realizadoPor: "FirmaEC · Servicio de Certificación",
        rol: "Sistema",
        detalles: "Firma electrónica de Representante Legal verificada correctamente."
      },
      {
        id: "h-env-gest-108",
        fechaHora: "20/09/2026 10:20",
        accion: "Solicitud enviada a Gestión",
        realizadoPor: "Portal DINARP",
        rol: "Sistema",
        detalles: "Expediente digital verificado e ingresado a la Dirección de Gestión y Registro."
      },
      {
        id: "h-asig-gest-108",
        fechaHora: "20/09/2026 10:45",
        accion: "Revisor de Gestión asignado",
        realizadoPor: "Director de Gestión",
        rol: "Director de Gestión",
        detalles: "Asignado a Revisor Gestión para análisis documental y técnico."
      },
      {
        id: "h-rev-gest-108",
        fechaHora: "20/09/2026 11:00",
        accion: "Revisión iniciada",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "Revisión de requisitos y personería jurídica del solicitante en curso."
      },
      {
        id: "h-aprob-gest-108",
        fechaHora: "21/09/2026 11:30",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "Revisor Gestión",
        rol: "Revisor de Gestión",
        detalles: "Validación de formularios y firmas conforme. Expediente remitido a Normatividad."
      },
      {
        id: "h-env-norm-108",
        fechaHora: "21/09/2026 11:35",
        accion: "Enviada a Normatividad",
        realizadoPor: "Sistema DINARP",
        rol: "Sistema",
        detalles: "Expediente derivado a la Dirección de Normatividad y Convenios."
      },
      {
        id: "h-asig-norm-108",
        fechaHora: "21/09/2026 15:00",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Asignado a Abg. Diego Morales para formulación de resolución jurídica."
      },
      {
        id: "h-inicia-res-108",
        fechaHora: "22/09/2026 09:30",
        accion: "Generación de resolución iniciada",
        realizadoPor: "Abg. Diego Morales",
        rol: "Revisor de Normatividad",
        detalles: "Redacción de considerandos y articulado resolutivo institucional."
      },
      {
        id: "h-aprob-norm-108",
        fechaHora: "22/09/2026 17:00",
        accion: "Resolución institucional generada",
        realizadoPor: "Abg. Diego Morales",
        rol: "Dirección de Normatividad",
        detalles: "Emisión de Resolución RES-DINARP-2026-0089. Preparada para firma de Máxima Autoridad."
      },
      {
        id: "h-pend-firma-108",
        fechaHora: "22/09/2026 17:05",
        accion: "Pendiente de firma",
        realizadoPor: "Sistema DINARP",
        rol: "Sistema",
        detalles: "Expediente enviado a firma externa por la Máxima Autoridad mediante FirmaEC."
      },
      {
        id: "h-res-firm-108",
        fechaHora: "22/09/2026 18:30",
        accion: "Resolución firmada y verificada",
        realizadoPor: "Mgs. Christian Ruiz (Director Nacional)",
        rol: "Máxima Autoridad DINARP",
        detalles: "Resolución RES-DINARP-2026-0089 suscrita válidamente mediante FirmaEC. Certificado BCE válido, SHA-256/RSA con sello de tiempo oficial."
      },
      {
        id: "h-inst-activa-108",
        fechaHora: "22/09/2026 18:31",
        accion: "Institución activada",
        realizadoPor: "Sistema DINARP",
        rol: "Sistema",
        detalles: "La resolución fue firmada y verificada correctamente. La institución se encuentra activa y puede continuar con el enrolamiento de sus coordinadores."
      },
      {
        id: "h-inv-tit-108",
        fechaHora: "22/09/2026 18:32",
        accion: "Invitación B — Coordinador Titular generada",
        realizadoPor: "Sistema DINARP",
        rol: "Sistema",
        detalles: "Invitación individual INV-B-2026-0089-TIT generada y notificada por correo a Lorena Barahona (lorena.barahona@sri.gob.ec). Vigencia de 30 días calendario según PAR-05."
      },
      {
        id: "h-inv-sup-108",
        fechaHora: "22/09/2026 18:32",
        accion: "Invitación B — Coordinador Suplente generada",
        realizadoPor: "Sistema DINARP",
        rol: "Sistema",
        detalles: "Invitación individual INV-B-2026-0089-SUP generada y notificada por correo a Carlos Alberto Espinosa (carlos.espinosa@sri.gob.ec). Vigencia de 30 días calendario según PAR-05."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Servicio de Rentas Internas",
      rucEntidad: "1760013210001",
      direccionEntidad: "Av. Galo Plaza Lasso N37-123, Quito",
      objetoSocial: "Administración tributaria nacional",
      representanteLegalNombre: "Econ. Damián Larco",
      representanteLegalCargo: "Director General",
      representanteLegalEmail: "direccion@sri.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Lorena Barahona",
      titularCedula: "1713334445",
      titularCargo: "Directora Nacional de Tecnología",
      titularAreaUnidad: "Tecnología",
      titularEmail: "lorena.barahona@sri.gob.ec",
      titularTelefonoFijo: "022985400",
      titularMovilInstitucional: "0993344556",
      titularMovilPersonal: "0982233445",
      suplenteNombreCompleto: "Carlos Alberto Espinosa",
      suplenteCedula: "1714455667",
      suplenteCargo: "Jefe de Arquitectura de Datos",
      suplenteAreaUnidad: "Tecnología",
      suplenteEmail: "carlos.espinosa@sri.gob.ec",
      suplenteTelefonoFijo: "022985400",
      suplenteMovilInstitucional: "0995566778",
      suplenteMovilPersonal: "0983344556",
      serviciosHerramientas: ["Consulta de datos de identidad y estado civil", "Consulta de defunciones"],
      areasUso: "Control Tributario",
      procesosUso: "Validación registral de contribuyentes",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "20/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_SRI.pdf"
    }
  },

  {
    id: "SOL-ING-001",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1799999999",
    nombres: "Juan Carlos",
    apellidos: "Pérez Gómez",
    nombreCompleto: "Juan Carlos Pérez Gómez",
    iniciales: "JP",
    correo: "juan.perez@msp.gob.ec",
    institucion: "Ministerio de Salud Pública",
    fechaSolicitud: "22/09/2026 14:35",
    estado: "Pendiente",
    documentos: [
      "ARP-R01_Solicitud_Acceso_SINARP_MSP.pdf",
      "Soporte_Delegacion_Representante.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio de Salud Pública",
      rucEntidad: "1760001230001",
      direccionEntidad: "Av. República de El Salvador 36-64 y Suecia, Quito",
      objetoSocial: "Garantizar el derecho a la salud pública integral en el territorio ecuatoriano.",
      representanteLegalNombre: "Dra. Gabriela Patricia Aguinaga",
      representanteLegalCargo: "Ministra de Salud Pública (Representante Legal)",
      representanteLegalEmail: "ministra@msp.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Juan Carlos Pérez Gómez",
      titularCedula: "1799999999",
      titularCargo: "Director Nacional de Tecnologías de la Información",
      titularAreaUnidad: "Dirección Nacional de Tecnologías",
      titularEmail: "juan.perez@msp.gob.ec",
      titularTelefonoFijo: "023814400 ext 1102",
      titularMovilInstitucional: "0998765432",
      titularMovilPersonal: "0987654321",
      suplenteNombreCompleto: "Ing. Roberto Carlos Dávila Silva",
      suplenteCedula: "1715489621",
      suplenteCargo: "Especialista de Infraestructura y Datos",
      suplenteAreaUnidad: "Dirección Nacional de Tecnologías",
      suplenteEmail: "roberto.davila@msp.gob.ec",
      suplenteTelefonoFijo: "023814400 ext 1105",
      suplenteMovilInstitucional: "0991234567",
      suplenteMovilPersonal: "0981234567",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Dirección Nacional de Vigilancia Epidemiológica y Estadística Sanitaria",
      procesosUso: "Validación de identidad en historias clínicas electrónicas e interoperabilidad del Sistema Nacional de Salud.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "22/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_SINARP_MSP.pdf"
    }
  },
  {
    id: "SOL-ING-002",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Confidencialidad (Enrolamiento)",
    cedula: "1712345602",
    nombres: "Paula Andrea",
    apellidos: "Mendoza Zambrano",
    nombreCompleto: "Paula Andrea Mendoza Zambrano",
    iniciales: "PM",
    correo: "paula.mendoza@dinarp.gob.ec",
    institucion: "Dirección Nacional de Registros Públicos",
    fechaSolicitud: "20/09/2026 09:12",
    estado: "Aprobada",
    fechaRevision: "21/09/2026 11:20",
    revisor: "María Torres (Dirección de Gestión y Registro)",
    documentos: [
      "ARP-R02_Acuerdo_Uso_Confidencialidad_PM.pdf"
    ],
    anexoB: {
      nombreEntidad: "Dirección Nacional de Registros Públicos",
      domicilioEntidad: "Av. Amazonas N24-196 y Luis Cordero, Quito",
      representanteLegalNombre: "Mgs. Christian Ruiz (Director Nacional)",
      funcionarioNombre: "Paula Andrea Mendoza Zambrano",
      funcionarioCedula: "1712345602",
      funcionarioCargo: "Coordinadora de Tecnologías de la Información",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Coordinar, regular y gestionar la interoperabilidad y custodia de los registros públicos del Estado ecuatoriano con altos estándares de seguridad y protección de datos.",
      clausulasAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "20/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Uso_Confidencialidad_PM.pdf"
    }
  },
  {
    id: "SOL-ING-003",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Confidencialidad (Enrolamiento)",
    cedula: "1788888888",
    nombres: "Carlos Alberto",
    apellidos: "Andrade Villacís",
    nombreCompleto: "Carlos Alberto Andrade Villacís",
    iniciales: "CA",
    correo: "carlos.andrade@educacion.gob.ec",
    institucion: "Ministerio de Educación",
    fechaSolicitud: "18/09/2026 16:40",
    estado: "Rechazada",
    fechaRevision: "19/09/2026 10:15",
    revisor: "María Torres (Dirección de Gestión y Registro)",
    motivoRechazo: "El acuerdo presentado no cuenta con la firma electrónica válida de la máxima autoridad o su delegado debidamente justificado.",
    documentos: [
      "ARP-R02_Acuerdo_Uso_Confidencialidad_Educacion.pdf"
    ],
    anexoB: {
      nombreEntidad: "Ministerio de Educación",
      domicilioEntidad: "Av. Amazonas N34-451 entre Atahualpa y Juan Pablo Sanz, Quito",
      representanteLegalNombre: "Dra. Alegría Crespo Cordovez",
      funcionarioNombre: "Carlos Alberto Andrade Villacís",
      funcionarioCedula: "1788888888",
      funcionarioCargo: "Especialista Zonal de TIC",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Garantizar el acceso universal, la calidad y pertinencia de la educación pública en el Ecuador.",
      clausulasAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "18/09/2026",
      firmadoPorRepresentante: false,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Uso_Confidencialidad_Educacion.pdf"
    }
  },
  {
    id: "SOL-ING-004",
    tipoTramite: "PROCESO_C_CAMBIO_COORDINADOR",
    codigoDocumental: "ARP-R03",
    tituloTramite: "Cambio de Coordinador Institucional (ARP-R03)",
    cedula: "1724589632",
    nombres: "Lucía Fernanda",
    apellidos: "Navarrete Morales",
    nombreCompleto: "Lucía Fernanda Navarrete Morales",
    iniciales: "LN",
    correo: "lucia.navarrete@registrocivil.gob.ec",
    institucion: "Dirección General de Registro Civil, Identificación y Cedulación",
    fechaSolicitud: "23/09/2026 08:22",
    estado: "Pendiente",
    documentos: [
      "ARP-R03_Cambio_Coordinador_RegistroCivil.pdf",
      "Accion_Personal_Delegacion_Firmante.pdf"
    ],
    anexoC: {
      nombreEntidad: "Dirección General de Registro Civil, Identificación y Cedulación",
      representanteLegalNombre: "Abg. Fernando Alarcón (Subdirector General Delegado)",
      esDelegado: true,
      archivoSoporteDelegacion: "Accion_Personal_Delegacion_Firmante.pdf",
      aplicaCambioTitular: true,
      nuevoTitularNombre: "Lucía Fernanda Navarrete Morales",
      nuevoTitularCedula: "1724589632",
      nuevoTitularCargo: "Directora de Gestión de la Información y Seguridad Registral",
      nuevoTitularMotivo: "Cese de funciones del coordinador saliente por cambio de estructura administrativa.",
      nuevoTitularEmail: "lucia.navarrete@registrocivil.gob.ec",
      nuevoTitularArea: "Dirección de Tecnologías y Seguridad de la Información",
      nuevoTitularTelefonoFijo: "023731110 ext 204",
      nuevoTitularMovilInst: "0984561230",
      nuevoTitularMovilPersonal: "0991245876",
      aplicaCambioSuplente: false,
      aplicaDesignacionInicialSuplente: false,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "23/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R03_Cambio_Coordinador_RegistroCivil.pdf"
    }
  },
  {
    id: "SOL-ING-005",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
    cedula: "1756321478",
    nombres: "Santiago Andrés",
    apellidos: "Cárdenas Viteri",
    nombreCompleto: "Santiago Andrés Cárdenas Viteri",
    iniciales: "SC",
    correo: "santiago.cardenas@sri.gob.ec",
    institucion: "Servicio de Rentas Internas",
    fechaSolicitud: "21/09/2026 18:05",
    estado: "Pendiente",
    documentos: [
      "ARP-R01_Solicitud_Acceso_SRI.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Servicio de Rentas Internas",
      rucEntidad: "1760013210001",
      direccionEntidad: "Salinas y Santiago, Edificio SRI, Quito",
      objetoSocial: "Administración, control y recaudación de tributos internos del Estado.",
      representanteLegalNombre: "Ec. Damián Larco (Director General)",
      representanteLegalCargo: "Director General del SRI",
      representanteLegalEmail: "director@sri.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Santiago Andrés Cárdenas Viteri",
      titularCedula: "1756321478",
      titularCargo: "Jefe de Interoperabilidad e Intercambio de Información",
      titularAreaUnidad: "Departamento de Analítica y TIC",
      titularEmail: "santiago.cardenas@sri.gob.ec",
      titularTelefonoFijo: "022987100 ext 550",
      titularMovilInstitucional: "0998521470",
      titularMovilPersonal: "0987456321",
      suplenteNombreCompleto: "Ing. Mónica Patricia Paredes Loor",
      suplenteCedula: "1719874562",
      suplenteCargo: "Analista Senior de Bases de Datos",
      suplenteAreaUnidad: "Departamento de Analítica y TIC",
      suplenteEmail: "monica.paredes@sri.gob.ec",
      suplenteTelefonoFijo: "022987100 ext 554",
      suplenteMovilInstitucional: "0993698521",
      suplenteMovilPersonal: "0981472583",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Infodigital"],
      areasUso: "Dirección Nacional de Recaudación y Control Tributario",
      procesosUso: "Cruce automático de información patrimonial y societaria para procesos de auditoría fiscal.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "21/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_SRI.pdf"
    }
  },
  {
    id: "SOL-ING-006",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Confidencialidad (Enrolamiento)",
    cedula: "0918745210",
    nombres: "Diana Patricia",
    apellidos: "Espinoza Valarezo",
    nombreCompleto: "Diana Patricia Espinoza Valarezo",
    iniciales: "DE",
    correo: "diana.espinoza@ant.gob.ec",
    institucion: "Agencia Nacional de Tránsito",
    fechaSolicitud: "15/09/2026 11:45",
    estado: "Aprobada",
    fechaRevision: "16/09/2026 09:30",
    revisor: "María Torres (Dirección de Gestión y Registro)",
    documentos: [
      "ARP-R02_Acuerdo_Confidencialidad_ANT.pdf"
    ],
    anexoB: {
      nombreEntidad: "Agencia Nacional de Tránsito",
      domicilioEntidad: "Av. Antonio José de Sucre y José Sánchez, Quito",
      representanteLegalNombre: "Mgs. Vanessa Cueva (Directora Ejecutiva)",
      funcionarioNombre: "Diana Patricia Espinoza Valarezo",
      funcionarioCedula: "0918745210",
      funcionarioCargo: "Subdirectora de Registro de Títulos Habilitantes",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Planificar, regular y controlar la gestión del transporte terrestre, tránsito y seguridad vial en el territorio nacional.",
      clausulasAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "15/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Confidencialidad_ANT.pdf"
    }
  },
  {
    id: "SOL-ING-007",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1719823451",
    nombres: "Marcelo Eduardo",
    apellidos: "Almeida Proaño",
    nombreCompleto: "Marcelo Eduardo Almeida Proaño",
    iniciales: "MA",
    correo: "marcelo.almeida@epn.edu.ec",
    institucion: "Escuela Politécnica Nacional",
    fechaSolicitud: "29/09/2026 08:30",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_EPN.pdf",
      "Nombramiento_Rector_EPN.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Escuela Politécnica Nacional",
      rucEntidad: "1768034560001",
      direccionEntidad: "Ladrón de Guevara E11-253, Quito",
      objetoSocial: "Educación superior pública, investigación científica, tecnológica y vinculación con la sociedad.",
      representanteLegalNombre: "Dra. Florinella Muñoz (Rectora)",
      representanteLegalCargo: "Rectora",
      representanteLegalEmail: "rectorado@epn.edu.ec",
      esDelegado: false,
      titularNombreCompleto: "Marcelo Eduardo Almeida Proaño",
      titularCedula: "1719823451",
      titularCargo: "Director de Tecnologías de Información y Comunicación",
      titularAreaUnidad: "Dirección de TIC",
      titularEmail: "marcelo.almeida@epn.edu.ec",
      titularTelefonoFijo: "022976300 ext 1201",
      titularMovilInstitucional: "0994567890",
      titularMovilPersonal: "0983214567",
      suplenteNombreCompleto: "Ing. Katherine Viviana Morales Ortiz",
      suplenteCedula: "1724567892",
      suplenteCargo: "Administradora de Sistemas Institucionales",
      suplenteAreaUnidad: "Dirección de TIC",
      suplenteEmail: "katherine.morales@epn.edu.ec",
      suplenteTelefonoFijo: "022976300 ext 1205",
      suplenteMovilInstitucional: "0997891234",
      suplenteMovilPersonal: "0986543210",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Dirección de Admisiones, Registro y Bienestar Estudiantil",
      procesosUso: "Verificación automática de identidad ciudadana y validación registral en matrículas estudiantiles.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_EPN.pdf"
    }
  },
  {
    id: "SOL-ING-008",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "0104567893",
    nombres: "Valeria Soledad",
    apellidos: "Cárdenas Ochoa",
    nombreCompleto: "Valeria Soledad Cárdenas Ochoa",
    iniciales: "VC",
    correo: "valeria.cardenas@cuenca.gob.ec",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Cuenca",
    fechaSolicitud: "29/09/2026 10:15",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_GAD_Cuenca.pdf",
      "Accion_Personal_Delegacion_Alcalde.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Gobierno Autónomo Descentralizado Municipal de Cuenca",
      rucEntidad: "0160000270001",
      direccionEntidad: "Calle Bolívar y Borrero, Cuenca",
      objetoSocial: "Planificación del desarrollo cantonal y prestación de servicios públicos municipales.",
      representanteLegalNombre: "Dr. Cristian Zamora (Alcalde)",
      representanteLegalCargo: "Alcalde del Cantón Cuenca",
      representanteLegalEmail: "alcaldia@cuenca.gob.ec",
      esDelegado: true,
      archivoSoporteDelegacion: "Accion_Personal_Delegacion_Alcalde.pdf",
      titularNombreCompleto: "Valeria Soledad Cárdenas Ochoa",
      titularCedula: "0104567893",
      titularCargo: "Directora General de Tecnologías y Transformación Digital",
      titularAreaUnidad: "Dirección General de Tecnologías",
      titularEmail: "valeria.cardenas@cuenca.gob.ec",
      titularTelefonoFijo: "074134900 ext 1450",
      titularMovilInstitucional: "0998745612",
      titularMovilPersonal: "0987412589",
      suplenteNombreCompleto: "Ing. Esteban Daniel Palacios Vintimilla",
      suplenteCedula: "0103698524",
      suplenteCargo: "Líder de Interoperabilidad e Integración de Datos",
      suplenteAreaUnidad: "Dirección General de Tecnologías",
      suplenteEmail: "esteban.palacios@cuenca.gob.ec",
      suplenteTelefonoFijo: "074134900 ext 1455",
      suplenteMovilInstitucional: "0993654128",
      suplenteMovilPersonal: "0982547896",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Infodigital",
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Dirección Financiera y Dirección de Control Territorial",
      procesosUso: "Validación de solvencias, avalúos, catastros y consulta registral de bienes inmuebles en línea.",
      declaracionesAceptadas: true,
      ciudadFirma: "Cuenca",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_GAD_Cuenca.pdf"
    }
  },
  {
    id: "SOL-ING-009",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "0923456781",
    nombres: "Gustavo Adolfo",
    apellidos: "Paredes Rivas",
    nombreCompleto: "Gustavo Adolfo Paredes Rivas",
    iniciales: "GP",
    correo: "gustavo.paredes@bancoguayaquil.com",
    institucion: "Banco Guayaquil S.A.",
    fechaSolicitud: "29/09/2026 11:40",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_BancoGuayaquil.pdf",
      "Poder_Especial_Representante_Legal.pdf"
    ],
    anexoA: {
      entidadTipo: "Privada",
      nombreEntidad: "Banco Guayaquil S.A.",
      rucEntidad: "0990005740001",
      direccionEntidad: "Pichincha 105 y P. Ycaza, Guayaquil",
      objetoSocial: "Intermediación financiera privada y servicios bancarios regulados por la Superintendencia de Bancos.",
      representanteLegalNombre: "Mgs. Guillermo Lasso Alcívar (Presidente Ejecutivo)",
      representanteLegalCargo: "Presidente Ejecutivo y Representante Legal",
      representanteLegalEmail: "presidencia@bancoguayaquil.com",
      esDelegado: true,
      archivoSoporteDelegacion: "Poder_Especial_Representante_Legal.pdf",
      titularNombreCompleto: "Gustavo Adolfo Paredes Rivas",
      titularCedula: "0923456781",
      titularCargo: "Gerente de Cumplimiento Normativo y Prevención",
      titularAreaUnidad: "Gerencia de Cumplimiento y Control",
      titularEmail: "gustavo.paredes@bancoguayaquil.com",
      titularTelefonoFijo: "043730100 ext 3200",
      titularMovilInstitucional: "0991478523",
      titularMovilPersonal: "0983692581",
      suplenteNombreCompleto: "Abg. Silvia Carolina Mendoza Vera",
      suplenteCedula: "0915678942",
      suplenteCargo: "Oficial Senior de Seguridad de la Información",
      suplenteAreaUnidad: "Gerencia de Cumplimiento y Control",
      suplenteEmail: "silvia.mendoza@bancoguayaquil.com",
      suplenteTelefonoFijo: "043730100 ext 3205",
      suplenteMovilInstitucional: "0992581473",
      suplenteMovilPersonal: "0981473692",
      serviciosHerramientas: [
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Oficialía de Cumplimiento y Apertura de Cuentas Digitales",
      procesosUso: "Validación estricta de identidad para debida diligencia de clientes y prevención de lavado de activos.",
      declaracionesAceptadas: true,
      ciudadFirma: "Guayaquil",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_BancoGuayaquil.pdf"
    }
  },
  {
    id: "SOL-ING-010",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1103654789",
    nombres: "Lorena Elizabeth",
    apellidos: "Jaramillo Castro",
    nombreCompleto: "Lorena Elizabeth Jaramillo Castro",
    iniciales: "LJ",
    correo: "lorena.jaramillo@loja.gob.ec",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Loja",
    fechaSolicitud: "29/09/2026 13:05",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_GAD_Loja.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Gobierno Autónomo Descentralizado Municipal de Loja",
      rucEntidad: "1160000240001",
      direccionEntidad: "Bolívar y José Antonio Eguiguren, Loja",
      objetoSocial: "Gobierno local y administración de servicios públicos cantonales de Loja.",
      representanteLegalNombre: "Mgs. Franco Quezada (Alcalde)",
      representanteLegalCargo: "Alcalde de Loja",
      representanteLegalEmail: "alcaldia@loja.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Lorena Elizabeth Jaramillo Castro",
      titularCedula: "1103654789",
      titularCargo: "Directora de Informática y Telecomunicaciones",
      titularAreaUnidad: "Dirección de Informática",
      titularEmail: "lorena.jaramillo@loja.gob.ec",
      titularTelefonoFijo: "072570407 ext 210",
      titularMovilInstitucional: "0996541238",
      titularMovilPersonal: "0985214796",
      suplenteNombreCompleto: "Ing. Jorge Luis Benítez Sarango",
      suplenteCedula: "1102587413",
      suplenteCargo: "Analista de Seguridad Registral y Redes",
      suplenteAreaUnidad: "Dirección de Informática",
      suplenteEmail: "jorge.benitez@loja.gob.ec",
      suplenteTelefonoFijo: "072570407 ext 214",
      suplenteMovilInstitucional: "0997412586",
      suplenteMovilPersonal: "0983691475",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Infodigital"
      ],
      areasUso: "Registro de la Propiedad del Cantón Loja y Dirección de Avalúos",
      procesosUso: "Automatización de certificados de gravámenes y verificación de solvencias patrimoniales en línea.",
      declaracionesAceptadas: true,
      ciudadFirma: "Loja",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_GAD_Loja.pdf"
    }
  },
  {
    id: "SOL-ING-011",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1710987654",
    nombres: "Mauricio Xavier",
    apellidos: "Paredes Carrera",
    nombreCompleto: "Mauricio Xavier Paredes Carrera",
    iniciales: "MP",
    correo: "mauricio.paredes@emaseo.gob.ec",
    institucion: "Empresa Pública Metropolitana de Aseo de Quito (EMASEO EP)",
    fechaSolicitud: "29/09/2026 14:10",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_EMASEO.pdf",
      "Nombramiento_Gerente_EMASEO.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Empresa Pública Metropolitana de Aseo de Quito (EMASEO EP)",
      rucEntidad: "1768153450001",
      direccionEntidad: "Av. Mariscal Sucre y Occidental, Quito",
      objetoSocial: "Gestión integral de residuos sólidos en el Distrito Metropolitano de Quito.",
      representanteLegalNombre: "Ing. Jorge Jaramillo (Gerente General)",
      representanteLegalCargo: "Gerente General",
      representanteLegalEmail: "gerencia@emaseo.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Mauricio Xavier Paredes Carrera",
      titularCedula: "1710987654",
      titularCargo: "Director de Tecnologías de la Información",
      titularAreaUnidad: "Dirección de Tecnologías",
      titularEmail: "mauricio.paredes@emaseo.gob.ec",
      titularTelefonoFijo: "023310555 ext 110",
      titularMovilInstitucional: "0998765412",
      titularMovilPersonal: "0987654123",
      suplenteNombreCompleto: "Ing. Gabriela Alexandra Suárez Mora",
      suplenteCedula: "1718765432",
      suplenteCargo: "Administradora de Bases de Datos",
      suplenteAreaUnidad: "Dirección de Tecnologías",
      suplenteEmail: "gabriela.suarez@emaseo.gob.ec",
      suplenteTelefonoFijo: "023310555 ext 114",
      suplenteMovilInstitucional: "0991234587",
      suplenteMovilPersonal: "0982345671",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Dirección Comercial y Recaudación",
      procesosUso: "Verificación de titulares de predios y contratos de servicios de recolección especial.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_EMASEO.pdf"
    }
  },
  {
    id: "SOL-ING-012",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "0917654321",
    nombres: "Mariana del Carmen",
    apellidos: "Velasco Zambrano",
    nombreCompleto: "Mariana del Carmen Velasco Zambrano",
    iniciales: "MV",
    correo: "mariana.velasco@bancopichincha.com",
    institucion: "Banco Pichincha C.A.",
    fechaSolicitud: "29/09/2026 14:45",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_BancoPichincha.pdf",
      "Poder_Especial_Representante_Legal.pdf"
    ],
    anexoA: {
      entidadTipo: "Privada",
      nombreEntidad: "Banco Pichincha C.A.",
      rucEntidad: "1790010937001",
      direccionEntidad: "Amazonas 4560 y Pereira, Quito",
      objetoSocial: "Servicios financieros de intermediación bancaria nacional e internacional.",
      representanteLegalNombre: "Dr. Antonio Acosta Espinosa (Presidente)",
      representanteLegalCargo: "Presidente del Directorio",
      representanteLegalEmail: "presidencia@pichincha.com",
      esDelegado: true,
      archivoSoporteDelegacion: "Poder_Especial_Representante_Legal.pdf",
      titularNombreCompleto: "Mariana del Carmen Velasco Zambrano",
      titularCedula: "0917654321",
      titularCargo: "Gerente de Riesgo Operativo e Integridad de Datos",
      titularAreaUnidad: "Gerencia de Riesgos",
      titularEmail: "mariana.velasco@bancopichincha.com",
      titularTelefonoFijo: "022999999 ext 4100",
      titularMovilInstitucional: "0995551234",
      titularMovilPersonal: "0984441234",
      suplenteNombreCompleto: "Abg. Felipe Andrés Ponce Larrea",
      suplenteCedula: "1714567890",
      suplenteCargo: "Oficial de Cumplimiento Regulatorio",
      suplenteAreaUnidad: "Gerencia Jurídica y Cumplimiento",
      suplenteEmail: "felipe.ponce@bancopichincha.com",
      suplenteTelefonoFijo: "022999999 ext 4105",
      suplenteMovilInstitucional: "0996667890",
      suplenteMovilPersonal: "0987778901",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Oficialía de Cumplimiento y Operaciones Crediticias",
      procesosUso: "Cruce de datos para validación de solicitantes de microcréditos y debida diligencia de clientes.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_BancoPichincha.pdf"
    }
  },
  {
    id: "SOL-ING-013",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1803456789",
    nombres: "Christian Danilo",
    apellidos: "Gómez Villafuerte",
    nombreCompleto: "Christian Danilo Gómez Villafuerte",
    iniciales: "CG",
    correo: "christian.gomez@ambato.gob.ec",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Ambato",
    fechaSolicitud: "29/09/2026 15:15",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_GAD_Ambato.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Gobierno Autónomo Descentralizado Municipal de Ambato",
      rucEntidad: "1860000210001",
      direccionEntidad: "Bolívar y Castillo, Ambato",
      objetoSocial: "Administración territorial cantonal y ejecución de obras públicas municipales.",
      representanteLegalNombre: "Dra. Diana Caiza (Alcaldesa)",
      representanteLegalCargo: "Alcaldesa de Ambato",
      representanteLegalEmail: "alcaldia@ambato.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Christian Danilo Gómez Villafuerte",
      titularCedula: "1803456789",
      titularCargo: "Director de Tecnologías de la Información",
      titularAreaUnidad: "Dirección de TIC",
      titularEmail: "christian.gomez@ambato.gob.ec",
      titularTelefonoFijo: "032997800 ext 301",
      titularMovilInstitucional: "0993214567",
      titularMovilPersonal: "0986541230",
      suplenteNombreCompleto: "Ing. Pamela Rocío Silva Altamirano",
      suplenteCedula: "1804561238",
      suplenteCargo: "Líder de Sistemas de Información",
      suplenteAreaUnidad: "Dirección de TIC",
      suplenteEmail: "pamela.silva@ambato.gob.ec",
      suplenteTelefonoFijo: "032997800 ext 305",
      suplenteMovilInstitucional: "0991472583",
      suplenteMovilPersonal: "0982583691",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Infodigital"
      ],
      areasUso: "Dirección de Avalúos y Catastros, Registro Municipal de la Propiedad",
      procesosUso: "Certificados digitales de no adeudar y registro ágil de transferencias de dominio inmobiliario.",
      declaracionesAceptadas: true,
      ciudadFirma: "Ambato",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_GAD_Ambato.pdf"
    }
  },
  {
    id: "SOL-ING-014",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1711223388",
    nombres: "Santiago Israel",
    apellidos: "Montalvo Cifuentes",
    nombreCompleto: "Santiago Israel Montalvo Cifuentes",
    iniciales: "SM",
    correo: "santiago.montalvo@usfq.edu.ec",
    institucion: "Universidad San Francisco de Quito (USFQ)",
    fechaSolicitud: "29/09/2026 15:50",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_USFQ.pdf",
      "Poder_General_Representante_Legal.pdf"
    ],
    anexoA: {
      entidadTipo: "Privada",
      nombreEntidad: "Universidad San Francisco de Quito (USFQ)",
      rucEntidad: "1791234567001",
      direccionEntidad: "Diego de Robles y Vía Interoceánica, Cumbayá, Quito",
      objetoSocial: "Educación superior particular y fomento a la investigación científica y humanística.",
      representanteLegalNombre: "Dr. Diego Quiroga (Rector)",
      representanteLegalCargo: "Rector de la USFQ",
      representanteLegalEmail: "rectorado@usfq.edu.ec",
      esDelegado: true,
      archivoSoporteDelegacion: "Poder_General_Representante_Legal.pdf",
      titularNombreCompleto: "Santiago Israel Montalvo Cifuentes",
      titularCedula: "1711223388",
      titularCargo: "Director de TI y Soluciones Digitales",
      titularAreaUnidad: "Dirección de Informática",
      titularEmail: "santiago.montalvo@usfq.edu.ec",
      titularTelefonoFijo: "022971700 ext 1500",
      titularMovilInstitucional: "0998884422",
      titularMovilPersonal: "0987773311",
      suplenteNombreCompleto: "Mgs. Cristina Belén Endara Ponce",
      suplenteCedula: "1719873214",
      suplenteCargo: "Coordinadora de Sistemas de Registro Académico",
      suplenteAreaUnidad: "Dirección de Registro",
      suplenteEmail: "cristina.endara@usfq.edu.ec",
      suplenteTelefonoFijo: "022971700 ext 1504",
      suplenteMovilInstitucional: "0994443322",
      suplenteMovilPersonal: "0985552211",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Oficina de Registro Académico y Admisiones",
      procesosUso: "Autenticación automática de cédula e historial de títulos de bachiller en el proceso de admisión.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_USFQ.pdf"
    }
  },
  {
    id: "SOL-ING-015",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1309876543",
    nombres: "Néstor Javier",
    apellidos: "Barreiro Delgado",
    nombreCompleto: "Néstor Javier Barreiro Delgado",
    iniciales: "NB",
    correo: "nestor.barreiro@manta.gob.ec",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Manta",
    fechaSolicitud: "29/09/2026 16:20",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_GAD_Manta.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Gobierno Autónomo Descentralizado Municipal de Manta",
      rucEntidad: "1360000280001",
      direccionEntidad: "Malecón Jaime Chávez Gutiérrez y Calle 9, Manta",
      objetoSocial: "Administración cantonal y dotación de servicios básicos, planificación y desarrollo urbano.",
      representanteLegalNombre: "Marciana Valdivieso de Poveda (Alcaldesa)",
      representanteLegalCargo: "Alcaldesa de Manta",
      representanteLegalEmail: "alcaldia@manta.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Néstor Javier Barreiro Delgado",
      titularCedula: "1309876543",
      titularCargo: "Director de Innovación y Tecnología",
      titularAreaUnidad: "Dirección de Tecnología",
      titularEmail: "nestor.barreiro@manta.gob.ec",
      titularTelefonoFijo: "052611471 ext 205",
      titularMovilInstitucional: "0991593574",
      titularMovilPersonal: "0982604685",
      suplenteNombreCompleto: "Ing. Tatiana Lisbeth Zambrano Solórzano",
      suplenteCedula: "1314567892",
      suplenteCargo: "Jefa de Desarrollo de Sistemas",
      suplenteAreaUnidad: "Dirección de Tecnología",
      suplenteEmail: "tatiana.zambrano@manta.gob.ec",
      suplenteTelefonoFijo: "052611471 ext 209",
      suplenteMovilInstitucional: "0993571594",
      suplenteMovilPersonal: "0984682605",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Infodigital"
      ],
      areasUso: "Dirección de Rentas y Dirección de Gestión Territorial",
      procesosUso: "Consulta en tiempo real de vehículos y bienes raíces para patentes e impuestos prediales.",
      declaracionesAceptadas: true,
      ciudadFirma: "Manta",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_GAD_Manta.pdf"
    }
  },
  {
    id: "SOL-ING-016",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1708529631",
    nombres: "Clara Inés",
    apellidos: "Bustamante Vinueza",
    nombreCompleto: "Clara Inés Bustamante Vinueza",
    iniciales: "CB",
    correo: "clara.bustamante@cnt.gob.ec",
    institucion: "Corporación Nacional de Telecomunicaciones (CNT EP)",
    fechaSolicitud: "29/09/2026 16:50",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R01_Solicitud_Registro_CNT.pdf",
      "Nombramiento_Gerente_CNT.pdf"
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Corporación Nacional de Telecomunicaciones (CNT EP)",
      rucEntidad: "1768152560001",
      direccionEntidad: "Av. Amazonas N36-152 y Naciones Unidas, Quito",
      objetoSocial: "Prestación de servicios públicos y privados de telecomunicaciones en el Ecuador.",
      representanteLegalNombre: "Mgs. Lourdes Cuesta (Gerente General)",
      representanteLegalCargo: "Gerente General de CNT EP",
      representanteLegalEmail: "gerencia@cnt.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Clara Inés Bustamante Vinueza",
      titularCedula: "1708529631",
      titularCargo: "Gerente de Seguridad de la Información y Cumplimiento",
      titularAreaUnidad: "Gerencia de Seguridad",
      titularEmail: "clara.bustamante@cnt.gob.ec",
      titularTelefonoFijo: "023731700 ext 5010",
      titularMovilInstitucional: "0997531590",
      titularMovilPersonal: "0986420864",
      suplenteNombreCompleto: "Ing. Pablo Andrés Yánez Guarderas",
      suplenteCedula: "1716549873",
      suplenteCargo: "Jefe de Interconexión y Servicios Mayoristas",
      suplenteAreaUnidad: "Gerencia de Redes e Infraestructura",
      suplenteEmail: "pablo.yanez@cnt.gob.ec",
      suplenteTelefonoFijo: "023731700 ext 5015",
      suplenteMovilInstitucional: "0991357924",
      suplenteMovilPersonal: "0982468013",
      serviciosHerramientas: [
        "Interoperabilidad SINARP",
        "Ficha de Registro Único del Ciudadano"
      ],
      areasUso: "Gerencia de Clientes Masivos y Oficialía de Fraudes",
      procesosUso: "Validación biométrica e identidad ciudadana en planes pospago y líneas telefónicas móviles.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_CNT.pdf"
    }
  },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CASOS DE PRUEBA DEL FLUJO DE NORMATIVIDAD (DIRECTOR: 2222222222 / PERSONAL: 3333333333)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // CASO N1: PENDIENTE DE ASIGNACIÓN · NORMATIVIDAD (Recién aprobada por Gestión, lista para asignar por Director)
  {
    id: "SOL-NORM-201",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1719988776",
    nombres: "Mariana",
    apellidos: "Almeida Proaño",
    nombreCompleto: "Mariana Almeida Proaño",
    iniciales: "MA",
    correo: "mariana.almeida@aduana.gob.ec",
    institucion: "Servicio Nacional de Aduana del Ecuador (SENAE)",
    fechaSolicitud: "29/09/2026 14:10",
    estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
    fechaRevision: "29/09/2026 15:30",
    fechaAprobacionGestion: "29/09/2026 15:30",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisor: undefined,
    revisorNormatividad: undefined,
    revisionIniciada: false,
    documentos: [
      "ARP-R01_Solicitud_Registro_SENAE.pdf",
      "Decreto_Ejecutivo_Nombramiento_SENAE.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf"
    ],
    historial: [
      {
        id: "h-norm-201-1",
        fechaHora: "29/09/2026 14:10",
        accion: "Ingreso de trámite",
        realizadoPor: "Mariana Almeida Proaño",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-norm-201-2",
        fechaHora: "29/09/2026 14:20",
        accion: "Firma verificada en FirmaEC",
        realizadoPor: "FirmaEC · Servicio de Certificación",
        detalles: "Firma electrónica validada satisfactoriamente con certificado de persona jurídica."
      },
      {
        id: "h-norm-201-3",
        fechaHora: "29/09/2026 14:30",
        accion: "Asignación de trámite",
        realizadoPor: "Director de Gestión y Registro",
        rol: "Director / Coordinador",
        detalles: "Asignado a María Torres para revisión técnica."
      },
      {
        id: "h-norm-201-4",
        fechaHora: "29/09/2026 15:30",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Anexo A revisado documental y técnicamente con dictamen favorable. Pasa a Normatividad para emisión de resolución institucional."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Servicio Nacional de Aduana del Ecuador (SENAE)",
      rucEntidad: "1768025290001",
      direccionEntidad: "Av. 25 de Julio km 4.5, Vía Puerto Marítimo, Guayaquil",
      objetoSocial: "Control y facilitación del comercio exterior y recaudación aduanera.",
      representanteLegalNombre: "Ing. Gabriela Solís (Directora General)",
      representanteLegalCargo: "Directora General de SENAE",
      representanteLegalEmail: "direccion.general@aduana.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Mariana Almeida Proaño",
      titularCedula: "1719988776",
      titularCargo: "Directora de Tecnologías de la Información",
      titularAreaUnidad: "Dirección de TI",
      titularEmail: "mariana.almeida@aduana.gob.ec",
      titularTelefonoFijo: "045006060 ext 1100",
      titularMovilInstitucional: "0998877665",
      titularMovilPersonal: "0987766554",
      suplenteNombreCompleto: "Ing. Roberto Carvajal",
      suplenteCedula: "0912233445",
      suplenteCargo: "Jefe de Interoperabilidad",
      suplenteAreaUnidad: "Dirección de TI",
      suplenteEmail: "roberto.carvajal@aduana.gob.ec",
      suplenteTelefonoFijo: "045006060 ext 1105",
      suplenteMovilInstitucional: "0991122334",
      suplenteMovilPersonal: "0982233445",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Ficha de Registro Único"],
      areasUso: "Dirección de Gestión de Riesgo Aduanero",
      procesosUso: "Control aduanero e interoperabilidad de registros mercantiles de importadores.",
      declaracionesAceptadas: true,
      ciudadFirma: "Guayaquil",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_SENAE.pdf"
    }
  },

  // CASO N2: PENDIENTE DE GENERAR RESOLUCIÓN (Asignado al personal facultado, aún no inicia la redacción formal) -> REASIGNABLE
  {
    id: "SOL-NORM-202",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1709911223",
    nombres: "Esteban",
    apellidos: "Morales Cifuentes",
    nombreCompleto: "Esteban Morales Cifuentes",
    iniciales: "EM",
    correo: "esteban.morales@epmmop.gob.ec",
    institucion: "Empresa Pública Metropolitana de Movilidad y Obras Públicas (EPMMOP)",
    fechaSolicitud: "29/09/2026 10:20",
    estado: "PENDIENTE_GENERAR_RESOLUCION",
    fechaRevision: "29/09/2026 12:40",
    fechaAprobacionGestion: "29/09/2026 12:40",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "29/09/2026 13:00",
    observacionesAsignacion: "Verificar competencias institucionales para interconexión catastral.",
    revisionIniciada: false,
    documentos: [
      "ARP-R01_Solicitud_Registro_EPMMOP.pdf",
      "Resolucion_Directorio_EPMMOP.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf"
    ],
    historial: [
      {
        id: "h-norm-202-1",
        fechaHora: "29/09/2026 10:20",
        accion: "Ingreso de trámite",
        realizadoPor: "Esteban Morales Cifuentes",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-norm-202-2",
        fechaHora: "29/09/2026 12:40",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Aprobación técnica de Anexo A efectuada por Gestión. Continúa a Normatividad."
      },
      {
        id: "h-norm-202-3",
        fechaHora: "29/09/2026 13:00",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Responsable: Personal facultado de Normatividad. Asignado por: Director de Normatividad. Observaciones: Verificar competencias institucionales para interconexión catastral."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Empresa Pública Metropolitana de Movilidad y Obras Públicas (EPMMOP)",
      rucEntidad: "1760003410001",
      direccionEntidad: "Calle 9 de Octubre N26-56 y Santa María, Quito",
      objetoSocial: "Planificación, construcción y mantenimiento vial y de espacios públicos en Quito.",
      representanteLegalNombre: "Arq. Claudia Otero",
      representanteLegalCargo: "Gerente General EPMMOP",
      representanteLegalEmail: "claudia.otero@epmmop.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Esteban Morales Cifuentes",
      titularCedula: "1709911223",
      titularCargo: "Gerente de Tecnologías de la Información",
      titularAreaUnidad: "Gerencia de TI",
      titularEmail: "esteban.morales@epmmop.gob.ec",
      titularTelefonoFijo: "022907005 ext 201",
      titularMovilInstitucional: "0993456789",
      titularMovilPersonal: "0982345678",
      suplenteNombreCompleto: "Ing. Sofía Villacrés",
      suplenteCedula: "1718899001",
      suplenteCargo: "Especialista de Infraestructura",
      suplenteAreaUnidad: "Gerencia de TI",
      suplenteEmail: "sofia.villacres@epmmop.gob.ec",
      suplenteTelefonoFijo: "022907005 ext 204",
      suplenteMovilInstitucional: "0994567890",
      suplenteMovilPersonal: "0983456789",
      serviciosHerramientas: ["Interoperabilidad SINARP"],
      areasUso: "Gerencia de Operaciones de la Movilidad",
      procesosUso: "Validación de vehículos y títulos de propiedad en vías públicas.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_EPMMOP.pdf"
    }
  },

  // CASO N3: EN GENERACIÓN DE RESOLUCIÓN (Personal inició redacción/análisis jurídico formal) -> BLOQUEADO PARA REASIGNACIÓN
  {
    id: "SOL-NORM-203",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1711223344",
    nombres: "Patricia",
    apellidos: "Jaramillo Viteri",
    nombreCompleto: "Patricia Jaramillo Viteri",
    iniciales: "PJ",
    correo: "patricia.jaramillo@ambiente.gob.ec",
    institucion: "Ministerio del Ambiente, Agua y Transición Ecológica",
    fechaSolicitud: "28/09/2026 11:30",
    estado: "EN_GENERACION_RESOLUCION",
    fechaRevision: "28/09/2026 16:00",
    fechaAprobacionGestion: "28/09/2026 16:00",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "29/09/2026 08:30",
    observacionesAsignacion: "Priorizar proyecto de resolución institucional interconectando áreas protegidas.",
    revisionIniciada: true,
    fechaInicioRevision: "29/09/2026 09:15",
    documentos: [
      "ARP-R01_Solicitud_Registro_MAATE.pdf",
      "Decreto_Ejecutivo_MAATE.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf",
      "Borrador_Resolucion_MAATE_v1.docx"
    ],
    historial: [
      {
        id: "h-norm-203-1",
        fechaHora: "28/09/2026 11:30",
        accion: "Ingreso de trámite",
        realizadoPor: "Patricia Jaramillo Viteri",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-norm-203-2",
        fechaHora: "28/09/2026 16:00",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Validación técnica y documental aprobada por Gestión."
      },
      {
        id: "h-norm-203-3",
        fechaHora: "29/09/2026 08:30",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Responsable: Personal facultado de Normatividad. Asignado por: Director de Normatividad."
      },
      {
        id: "h-norm-203-4",
        fechaHora: "29/09/2026 09:15",
        accion: "Generación de resolución iniciada",
        realizadoPor: "Personal facultado de Normatividad",
        rol: "Personal facultado de Normatividad",
        detalles: "El funcionario ha iniciado la formulación de la resolución institucional y el cotejo legal de considerandos."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio del Ambiente, Agua y Transición Ecológica",
      rucEntidad: "1768138780001",
      direccionEntidad: "Calle Madrid 1159 y Andalucía, Quito",
      objetoSocial: "Rectoría, planificación, regulación, control y gestión ambiental y de recursos hídricos.",
      representanteLegalNombre: "Mgs. Sade Fritschi",
      representanteLegalCargo: "Ministra del Ambiente",
      representanteLegalEmail: "despacho@ambiente.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Patricia Jaramillo Viteri",
      titularCedula: "1711223344",
      titularCargo: "Directora de Tecnologías de Información y Comunicación",
      titularAreaUnidad: "DNTIC",
      titularEmail: "patricia.jaramillo@ambiente.gob.ec",
      titularTelefonoFijo: "023987600 ext 1401",
      titularMovilInstitucional: "0995678901",
      titularMovilPersonal: "0984567890",
      suplenteNombreCompleto: "Ing. Andrés Benalcázar",
      suplenteCedula: "1719988112",
      suplenteCargo: "Especialista de Sistemas Geográficos",
      suplenteAreaUnidad: "DNTIC",
      suplenteEmail: "andres.benalcazar@ambiente.gob.ec",
      suplenteTelefonoFijo: "023987600 ext 1405",
      suplenteMovilInstitucional: "0996789012",
      suplenteMovilPersonal: "0985678901",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Ficha de Registro Único"],
      areasUso: "Subsecretaría de Patrimonio Natural",
      procesosUso: "Validación de tenencia predial y servidumbres en zonas de amortiguamiento ecológico.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "28/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_MAATE.pdf"
    }
  },

  // CASO N4: GENERACIÓN PENDIENTE (Pausa o requerimiento de consulta jurídica interna con causa registrada)
  {
    id: "SOL-NORM-204",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1706655443",
    nombres: "Rodrigo",
    apellidos: "Albuja Moncayo",
    nombreCompleto: "Rodrigo Albuja Moncayo",
    iniciales: "RA",
    correo: "rodrigo.albuja@emaseo.gob.ec",
    institucion: "Empresa Pública Metropolitana de Aseo (EMASEO EP)",
    fechaSolicitud: "27/09/2026 15:45",
    estado: "GENERACION_PENDIENTE",
    fechaRevision: "28/09/2026 10:10",
    fechaAprobacionGestion: "28/09/2026 10:10",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "28/09/2026 11:00",
    observacionesAsignacion: "Revisar alcance de la personería municipal en los considerandos.",
    revisionIniciada: true,
    fechaInicioRevision: "28/09/2026 14:00",
    motivoRechazo: "Se solicitó aclaración interna sobre la vigencia del convenio marco interinstitucional previo a la suscripción de la resolución.",
    documentos: [
      "ARP-R01_Solicitud_Registro_EMASEO.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf",
      "Memorando_Consulta_Juridica_041.pdf"
    ],
    historial: [
      {
        id: "h-norm-204-1",
        fechaHora: "27/09/2026 15:45",
        accion: "Ingreso de trámite",
        realizadoPor: "Rodrigo Albuja Moncayo",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-norm-204-2",
        fechaHora: "28/09/2026 10:10",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Validación de Anexo A efectuada satisfactoriamente por Gestión."
      },
      {
        id: "h-norm-204-3",
        fechaHora: "28/09/2026 11:00",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Responsable: Gabriel Suárez. Asignado por: Director de Normatividad."
      },
      {
        id: "h-norm-204-4",
        fechaHora: "28/09/2026 16:30",
        accion: "Pausa en generación de resolución",
        realizadoPor: "Gabriel Suárez",
        rol: "Personal facultado de Normatividad",
        detalles: "Se solicitó aclaración interna sobre la vigencia del convenio marco interinstitucional previo a la suscripción de la resolución."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Empresa Pública Metropolitana de Aseo (EMASEO EP)",
      rucEntidad: "1760004570001",
      direccionEntidad: "Av. Mariscal Sucre y Mariana de Jesús, Quito",
      objetoSocial: "Gestión integral de residuos sólidos en el Distrito Metropolitano de Quito.",
      representanteLegalNombre: "Ing. Jorge Jaramillo",
      representanteLegalCargo: "Gerente General EMASEO",
      representanteLegalEmail: "gerencia@emaseo.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Rodrigo Albuja Moncayo",
      titularCedula: "1706655443",
      titularCargo: "Coordinador de TICS",
      titularAreaUnidad: "Coordinación de Tecnologías",
      titularEmail: "rodrigo.albuja@emaseo.gob.ec",
      titularTelefonoFijo: "023310555 ext 102",
      titularMovilInstitucional: "0997890123",
      titularMovilPersonal: "0986789012",
      suplenteNombreCompleto: "Ing. Marcelo Endara",
      suplenteCedula: "1713344556",
      suplenteCargo: "Analista de Redes y Seguridad",
      suplenteAreaUnidad: "Coordinación de Tecnologías",
      suplenteEmail: "marcelo.endara@emaseo.gob.ec",
      suplenteTelefonoFijo: "023310555 ext 106",
      suplenteMovilInstitucional: "0998901234",
      suplenteMovilPersonal: "0987890123",
      serviciosHerramientas: ["Interoperabilidad SINARP"],
      areasUso: "Dirección de Operaciones",
      procesosUso: "Validación de flota vehicular para recolección automatizada.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "27/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_EMASEO.pdf"
    }
  },

  // CASO N5: RESOLUCIÓN GENERADA (Resolución emitida, firmada y finalizada con número de resolución institucional)
  {
    id: "SOL-NORM-205",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1718877665",
    nombres: "Valeria",
    apellidos: "Montenegro Cárdenas",
    nombreCompleto: "Valeria Montenegro Cárdenas",
    iniciales: "VM",
    correo: "valeria.montenegro@snai.gob.ec",
    institucion: "Servicio Nacional de Atención Integral a Personas Adultas Privadas de la Libertad (SNAI)",
    fechaSolicitud: "25/09/2026 09:30",
    estado: "PENDIENTE_DE_FIRMA",
    fechaRevision: "26/09/2026 17:00",
    fechaAprobacionGestion: "25/09/2026 16:00",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "26/09/2026 08:30",
    revisionIniciada: true,
    fechaInicioRevision: "26/09/2026 09:00",
    resolucion: "RES-DINARP-2026-0042",
    documentos: [
      "ARP-R01_Solicitud_Registro_SNAI.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf",
      "RES-DINARP-2026-0042_Para_Firma.pdf"
    ],
    historial: [
      {
        id: "h-norm-205-1",
        fechaHora: "25/09/2026 09:30",
        accion: "Ingreso de trámite",
        realizadoPor: "Valeria Montenegro Cárdenas",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-norm-205-2",
        fechaHora: "25/09/2026 16:00",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Anexo A aprobado por Gestión. Expediente transferido a Normatividad."
      },
      {
        id: "h-norm-205-3",
        fechaHora: "26/09/2026 08:30",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Responsable: Personal facultado de Normatividad. Asignado por: Director de Normatividad."
      },
      {
        id: "h-norm-205-4",
        fechaHora: "26/09/2026 09:00",
        accion: "Generación de resolución iniciada",
        realizadoPor: "Personal facultado de Normatividad",
        rol: "Personal facultado de Normatividad",
        detalles: "Formulación de considerandos y articulado de la resolución institucional."
      },
      {
        id: "h-norm-205-5",
        fechaHora: "26/09/2026 17:00",
        accion: "Resolución institucional generada",
        realizadoPor: "Personal facultado de Normatividad",
        rol: "Personal facultado de Normatividad",
        detalles: "Resolución institucional RES-DINARP-2026-0042 formulada y vinculada. Expediente preparado para firma de Máxima Autoridad (INS-07)."
      },
      {
        id: "h-norm-205-6",
        fechaHora: "26/09/2026 17:05",
        accion: "Pendiente de firma",
        realizadoPor: "Sistema DINARP",
        rol: "Sistema",
        detalles: "Enviado a proceso de firma externa por la Máxima Autoridad de DINARP mediante FirmaEC. La activación institucional y generación de invitaciones B permanecen bloqueadas hasta la verificación de la firma."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Servicio Nacional de Atención Integral a Personas Adultas Privadas de la Libertad (SNAI)",
      rucEntidad: "1768194480001",
      direccionEntidad: "Av. Orellana E3-62 y 9 de Octubre, Quito",
      objetoSocial: "Administración del Sistema Penitenciario Nacional y medidas socioeducativas.",
      representanteLegalNombre: "Gral. Fausto Cobo",
      representanteLegalCargo: "Director General del SNAI",
      representanteLegalEmail: "direccion@snai.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Valeria Montenegro Cárdenas",
      titularCedula: "1718877665",
      titularCargo: "Directora de Tecnologías de la Información",
      titularAreaUnidad: "Dirección de TI",
      titularEmail: "valeria.montenegro@snai.gob.ec",
      titularTelefonoFijo: "023932520 ext 1102",
      titularMovilInstitucional: "0998901234",
      titularMovilPersonal: "0987890123",
      suplenteNombreCompleto: "Ing. Santiago Morales",
      suplenteCedula: "1715566778",
      suplenteCargo: "Jefe de Desarrollo de Sistemas",
      suplenteAreaUnidad: "Dirección de TI",
      suplenteEmail: "santiago.morales@snai.gob.ec",
      suplenteTelefonoFijo: "023932520 ext 1108",
      suplenteMovilInstitucional: "0999012345",
      suplenteMovilPersonal: "0988901234",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Ficha de Registro Único"],
      areasUso: "Dirección de Seguridad Penitenciaria",
      procesosUso: "Verificación de identidad jurídica de personas privadas de libertad e interoperabilidad registral.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "25/09/2026",
      firmadoDigitalmente: true,
    }
  },

  // CASO N6: ANT - PENDIENTE DE GENERAR RESOLUCIÓN (Asignado al personal facultado de Normatividad)
  {
    id: "SOL-NORM-206",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1716543210",
    nombres: "Carlos",
    apellidos: "Villavicencio Paredes",
    nombreCompleto: "Ing. Carlos Villavicencio Paredes",
    iniciales: "CV",
    correo: "carlos.villavicencio@ant.gob.ec",
    institucion: "Agencia Nacional de Tránsito (ANT)",
    fechaSolicitud: "01/10/2026 09:15",
    estado: "PENDIENTE_GENERAR_RESOLUCION",
    fechaRevision: "01/10/2026 11:30",
    fechaAprobacionGestion: "01/10/2026 11:30",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "01/10/2026 14:00",
    observacionesAsignacion: "Verificar base normativa de gravámenes e impedimentos vehiculares.",
    revisionIniciada: false,
    documentos: [
      "ARP-R01_Solicitud_Registro_ANT.pdf",
      "Resolucion_Directorio_ANT_2026.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf"
    ],
    historial: [
      {
        id: "h-norm-206-1",
        fechaHora: "01/10/2026 09:15",
        accion: "Ingreso de trámite",
        realizadoPor: "Ing. Carlos Villavicencio Paredes",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-norm-206-2",
        fechaHora: "01/10/2026 11:30",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Aprobación técnica de Anexo A efectuada por Gestión. Continúa a Normatividad."
      },
      {
        id: "h-norm-206-3",
        fechaHora: "01/10/2026 14:00",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Responsable: Personal facultado de Normatividad. Asignado por: Director de Normatividad. Observaciones: Verificar base normativa de gravámenes e impedimentos vehiculares."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Agencia Nacional de Tránsito (ANT)",
      rucEntidad: "1768137380001",
      direccionEntidad: "Av. Antonio José de Sucre y José Sánchez, Quito",
      objetoSocial: "Planificación, regulación y control del transporte terrestre, tránsito y seguridad vial a nivel nacional.",
      representanteLegalNombre: "Ing. Alejandro Freire",
      representanteLegalCargo: "Director Ejecutivo de la ANT",
      representanteLegalEmail: "direccion.ejecutiva@ant.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Carlos Villavicencio Paredes",
      titularCedula: "1716543210",
      titularCargo: "Director de Tecnologías de la Información",
      titularAreaUnidad: "Dirección de TI",
      titularEmail: "carlos.villavicencio@ant.gob.ec",
      titularTelefonoFijo: "023828890 ext 1100",
      titularMovilInstitucional: "0991234567",
      titularMovilPersonal: "0982345678",
      suplenteNombreCompleto: "Ing. Daniela Pazmiño",
      suplenteCedula: "1719876543",
      suplenteCargo: "Especialista en Interoperabilidad",
      suplenteAreaUnidad: "Dirección de TI",
      suplenteEmail: "daniela.pazmino@ant.gob.ec",
      suplenteTelefonoFijo: "023828890 ext 1104",
      suplenteMovilInstitucional: "0992345678",
      suplenteMovilPersonal: "0983456789",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Infodigital"],
      areasUso: "Dirección de Registro Nacional de Tránsito",
      procesosUso: "Validación de historial de dominio vehicular y gravámenes registrales para emisión de matrículas y licencias.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "01/10/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_ANT.pdf"
    }
  },

  // CASO N7: IESS - EN GENERACIÓN DE RESOLUCIÓN (Redacción jurídica y considerandos en curso)
  {
    id: "SOL-NORM-207",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1712233445",
    nombres: "Diana",
    apellidos: "Carrión Salazar",
    nombreCompleto: "Mgs. Diana Carrión Salazar",
    iniciales: "DC",
    correo: "diana.carrion@iess.gob.ec",
    institucion: "Instituto Ecuatoriano de Seguridad Social (IESS)",
    fechaSolicitud: "30/09/2026 14:20",
    estado: "EN_GENERACION_RESOLUCION",
    fechaRevision: "01/10/2026 09:30",
    fechaAprobacionGestion: "01/10/2026 09:30",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "01/10/2026 10:00",
    observacionesAsignacion: "Redactar considerandos para interoperabilidad de defunciones y fondos de reserva.",
    revisionIniciada: true,
    fechaInicioRevision: "01/10/2026 10:45",
    documentos: [
      "ARP-R01_Solicitud_Registro_IESS.pdf",
      "Acuerdo_Consejo_Directivo_IESS.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf",
      "Borrador_Resolucion_IESS_v1.docx"
    ],
    historial: [
      {
        id: "h-norm-207-1",
        fechaHora: "30/09/2026 14:20",
        accion: "Ingreso de trámite",
        realizadoPor: "Mgs. Diana Carrión Salazar",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 suscrito y registrado formalmente en el sistema."
      },
      {
        id: "h-norm-207-2",
        fechaHora: "01/10/2026 09:30",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Aprobación técnica efectuada por Gestión. Transferida a Normatividad."
      },
      {
        id: "h-norm-207-3",
        fechaHora: "01/10/2026 10:00",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Responsable: Personal facultado de Normatividad. Asignado por: Director de Normatividad."
      },
      {
        id: "h-norm-207-4",
        fechaHora: "01/10/2026 10:45",
        accion: "Generación de resolución iniciada",
        realizadoPor: "Personal facultado de Normatividad",
        rol: "Personal facultado de Normatividad",
        detalles: "Formulación de considerandos institucionales para consulta automatizada de actas de defunción."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Instituto Ecuatoriano de Seguridad Social (IESS)",
      rucEntidad: "1760004650001",
      direccionEntidad: "Av. 10 de Agosto y Bogotá, Edificio Matriz IESS, Quito",
      objetoSocial: "Protección a la población urbana y rural con relación de dependencia o sin ella, contra las contingencias de enfermedad, maternidad, riesgos del trabajo, cesantía, vejez, invalidez y muerte.",
      representanteLegalNombre: "Dr. Eduardo Peña Hurtado",
      representanteLegalCargo: "Presidente del Consejo Directivo del IESS",
      representanteLegalEmail: "presidencia@iess.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Diana Carrión Salazar",
      titularCedula: "1712233445",
      titularCargo: "Directora Nacional de Tecnologías de la Información",
      titularAreaUnidad: "DNTI",
      titularEmail: "diana.carrion@iess.gob.ec",
      titularTelefonoFijo: "023945678 ext 2200",
      titularMovilInstitucional: "0994567891",
      titularMovilPersonal: "0985678912",
      suplenteNombreCompleto: "Ing. Jorge Benítez",
      suplenteCedula: "1708899112",
      suplenteCargo: "Subdirector de Servicios Digitales",
      suplenteAreaUnidad: "DNTI",
      suplenteEmail: "jorge.benitez@iess.gob.ec",
      suplenteTelefonoFijo: "023945678 ext 2205",
      suplenteMovilInstitucional: "0995678912",
      suplenteMovilPersonal: "0986789123",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Ficha de Registro Único"],
      areasUso: "Dirección del Seguro General de Pensiones",
      procesosUso: "Cotejo continuo de actas de defunción y estado civil para el pago seguro y oportuno de montepíos y pensiones jubilares.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "30/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_IESS.pdf"
    }
  },

  // CASO N8: GAD CUENCA - RESOLUCIÓN GENERADA (Resolución emitida y suscrita)
  {
    id: "SOL-NORM-208",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "0102938475",
    nombres: "Marcelo",
    apellidos: "Vázquez Astudillo",
    nombreCompleto: "Arq. Marcelo Vázquez Astudillo",
    iniciales: "MV",
    correo: "marcelo.vazquez@cuenca.gob.ec",
    institucion: "Gobierno Autónomo Descentralizado Municipal del Cantón Cuenca",
    fechaSolicitud: "24/09/2026 11:00",
    estado: "RESOLUCION_GENERADA",
    fechaRevision: "26/09/2026 15:00",
    fechaAprobacionGestion: "25/09/2026 10:00",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "25/09/2026 14:00",
    revisionIniciada: true,
    fechaInicioRevision: "25/09/2026 15:30",
    resolucion: "RES-DINARP-2026-0089",
    documentos: [
      "ARP-R01_Solicitud_Registro_GAD_Cuenca.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf",
      "RES-DINARP-2026-0089_Suscrita.pdf"
    ],
    historial: [
      {
        id: "h-norm-208-1",
        fechaHora: "24/09/2026 11:00",
        accion: "Ingreso de trámite",
        realizadoPor: "Arq. Marcelo Vázquez Astudillo",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 registrado formalmente en la plataforma."
      },
      {
        id: "h-norm-208-2",
        fechaHora: "25/09/2026 10:00",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Control documental verificado con dictamen favorable."
      },
      {
        id: "h-norm-208-3",
        fechaHora: "25/09/2026 14:00",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Asignado a Personal facultado de Normatividad."
      },
      {
        id: "h-norm-208-4",
        fechaHora: "26/09/2026 15:00",
        accion: "Resolución institucional generada",
        realizadoPor: "Personal facultado de Normatividad",
        rol: "Personal facultado de Normatividad",
        detalles: "Resolución RES-DINARP-2026-0089 emitida y suscrita conforme a la ley."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Gobierno Autónomo Descentralizado Municipal del Cantón Cuenca",
      rucEntidad: "0160000270001",
      direccionEntidad: "Calle Bolívar y Borrero, Cuenca",
      objetoSocial: "Planificación del desarrollo cantonal y ejercicio de competencias de ordenamiento territorial, catastro municipal y control urbano.",
      representanteLegalNombre: "Dr. Cristian Zamora Matute",
      representanteLegalCargo: "Alcalde de Cuenca",
      representanteLegalEmail: "alcaldia@cuenca.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Marcelo Vázquez Astudillo",
      titularCedula: "0102938475",
      titularCargo: "Director de Tecnologías y Comunicaciones",
      titularAreaUnidad: "DIT",
      titularEmail: "marcelo.vazquez@cuenca.gob.ec",
      titularTelefonoFijo: "074134900 ext 1201",
      titularMovilInstitucional: "0996789123",
      titularMovilPersonal: "0987891234",
      suplenteNombreCompleto: "Ing. Lorena Ordóñez",
      suplenteCedula: "0103847562",
      suplenteCargo: "Jefa de Sistemas Geográficos",
      suplenteAreaUnidad: "DIT",
      suplenteEmail: "lorena.ordonez@cuenca.gob.ec",
      suplenteTelefonoFijo: "074134900 ext 1206",
      suplenteMovilInstitucional: "0997891234",
      suplenteMovilPersonal: "0988901235",
      serviciosHerramientas: ["Interoperabilidad SINARP"],
      areasUso: "Dirección de Avalúos y Catastros",
      procesosUso: "Actualización predial catastral en tiempo real cruzada con el Registro de la Propiedad del cantón.",
      declaracionesAceptadas: true,
      ciudadFirma: "Cuenca",
      fechaFirma: "24/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_GAD_Cuenca.pdf"
    }
  },

  // CASO N9: SUPERINTENDENCIA DE BANCOS - PENDIENTE DE ASIGNACIÓN EN NORMATIVIDAD (Lista para que Director la asigne)
  {
    id: "SOL-NORM-209",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1708877665",
    nombres: "Fernando",
    apellidos: "Larrea Cisneros",
    nombreCompleto: "Econ. Fernando Larrea Cisneros",
    iniciales: "FL",
    correo: "fernando.larrea@superbancos.gob.ec",
    institucion: "Superintendencia de Bancos del Ecuador",
    fechaSolicitud: "01/10/2026 10:15",
    estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
    fechaRevision: "01/10/2026 11:20",
    fechaAprobacionGestion: "01/10/2026 11:20",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: undefined,
    revisor: "Por asignar",
    revisionIniciada: false,
    documentos: [
      "ARP-R01_Solicitud_Registro_SuperBancos.pdf",
      "Accion_Personal_Superintendente.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf"
    ],
    historial: [
      {
        id: "h-norm-209-1",
        fechaHora: "01/10/2026 10:15",
        accion: "Ingreso de trámite",
        realizadoPor: "Econ. Fernando Larrea Cisneros",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 ingresado formalmente."
      },
      {
        id: "h-norm-209-2",
        fechaHora: "01/10/2026 11:20",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Aprobación técnica y legal de Anexo A efectuada por Gestión. Expediente transferido a Normatividad."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Superintendencia de Bancos del Ecuador",
      rucEntidad: "1760001710001",
      direccionEntidad: "Av. 12 de Octubre N24-185 y Madrid, Quito",
      objetoSocial: "Supervisión y control de las entidades del sector financiero público y privado, protegiendo los intereses de los depositantes.",
      representanteLegalNombre: "Abg. Roberto Romero von Buchwald",
      representanteLegalCargo: "Superintendente de Bancos",
      representanteLegalEmail: "superintendente@superbancos.gob.ec",
      esDelegado: false,
      titularNombreCompleto: "Fernando Larrea Cisneros",
      titularCedula: "1708877665",
      titularCargo: "Subdirector de Tecnologías de Información",
      titularAreaUnidad: "Subdirección de TI",
      titularEmail: "fernando.larrea@superbancos.gob.ec",
      titularTelefonoFijo: "022997800 ext 1500",
      titularMovilInstitucional: "0998901235",
      titularMovilPersonal: "0989012345",
      suplenteNombreCompleto: "Ing. Gabriela Ponce",
      suplenteCedula: "1717788990",
      suplenteCargo: "Especialista de Arquitectura de Datos",
      suplenteAreaUnidad: "Subdirección de TI",
      suplenteEmail: "gabriela.ponce@superbancos.gob.ec",
      suplenteTelefonoFijo: "022997800 ext 1504",
      suplenteMovilInstitucional: "0999012346",
      suplenteMovilPersonal: "0980123456",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Infodigital"],
      areasUso: "Dirección de Control Financiero y Riesgos",
      procesosUso: "Monitoreo prudencial de gravámenes societarios y control de solvencia patrimonial en el sistema bancario.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "01/10/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_SuperBancos.pdf"
    }
  },

  // CASO N10: SENESCYT - PENDIENTE DE GENERAR RESOLUCIÓN (Con delegación de firma y soporte adjunto)
  {
    id: "SOL-NORM-210",
    tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
    codigoDocumental: "ARP-R01",
    tituloTramite: "Solicitud de Registro de Institución (Anexo A)",
    cedula: "1713456789",
    nombres: "Beatriz",
    apellidos: "Guayasamín Terán",
    nombreCompleto: "Ing. Beatriz Guayasamín Terán",
    iniciales: "BG",
    correo: "beatriz.guayasamin@senescyt.gob.ec",
    institucion: "Secretaría de Educación Superior, Ciencia, Tecnología e Innovación (SENESCYT)",
    fechaSolicitud: "29/09/2026 16:30",
    estado: "PENDIENTE_GENERAR_RESOLUCION",
    fechaRevision: "30/09/2026 11:00",
    fechaAprobacionGestion: "30/09/2026 11:00",
    revisorGestion: "María Torres (Revisor Gestión)",
    revisorNormatividad: "Personal facultado de Normatividad",
    revisor: "Personal facultado de Normatividad",
    fechaAsignacionNormatividad: "30/09/2026 14:15",
    observacionesAsignacion: "Verificar delegación de firma del Secretario a Coordinación General Jurídica.",
    revisionIniciada: false,
    documentos: [
      "ARP-R01_Solicitud_Registro_SENESCYT.pdf",
      "Acuerdo_Delegacion_Firma_0032.pdf",
      "Dictamen_Tecnico_Gestion_Aprobado.pdf"
    ],
    historial: [
      {
        id: "h-norm-210-1",
        fechaHora: "29/09/2026 16:30",
        accion: "Ingreso de trámite",
        realizadoPor: "Ing. Beatriz Guayasamín Terán",
        rol: "Solicitante Institucional",
        detalles: "Formulario ARP-R01 con delegación de firma adjunta registrado formalmente."
      },
      {
        id: "h-norm-210-2",
        fechaHora: "30/09/2026 11:00",
        accion: "Solicitud aprobada por Gestión",
        realizadoPor: "María Torres",
        rol: "Revisor de Gestión",
        detalles: "Documentación validada y aprobada por Gestión."
      },
      {
        id: "h-norm-210-3",
        fechaHora: "30/09/2026 14:15",
        accion: "Responsable de Normatividad asignado",
        realizadoPor: "Director de Normatividad",
        rol: "Director de Normatividad",
        detalles: "Responsable: Personal facultado de Normatividad. Asignado por: Director de Normatividad. Observaciones: Verificar delegación de firma del Secretario a Coordinación General Jurídica."
      }
    ],
    anexoA: {
      entidadTipo: "Publica",
      nombreEntidad: "Secretaría de Educación Superior, Ciencia, Tecnología e Innovación (SENESCYT)",
      rucEntidad: "1768157650001",
      direccionEntidad: "Calle Whymper E7-37 y Alpallana, Quito",
      objetoSocial: "Rectoría de la política pública de educación superior, ciencia, tecnología e innovación en el Ecuador.",
      representanteLegalNombre: "Dr. César Augusto Vásquez",
      representanteLegalCargo: "Secretario de Educación Superior",
      representanteLegalEmail: "secretaria.general@senescyt.gob.ec",
      esDelegado: true,
      archivoSoporteDelegacion: "Acuerdo_Delegacion_Firma_0032.pdf",
      titularNombreCompleto: "Beatriz Guayasamín Terán",
      titularCedula: "1713456789",
      titularCargo: "Coordinadora General de Tecnologías de la Información",
      titularAreaUnidad: "CGTIC",
      titularEmail: "beatriz.guayasamin@senescyt.gob.ec",
      titularTelefonoFijo: "023934300 ext 1700",
      titularMovilInstitucional: "0990123457",
      titularMovilPersonal: "0981234567",
      suplenteNombreCompleto: "Mgs. David Villalba",
      suplenteCedula: "1716677889",
      suplenteCargo: "Director de Gestión de Datos e Interoperabilidad",
      suplenteAreaUnidad: "CGTIC",
      suplenteEmail: "david.villalba@senescyt.gob.ec",
      suplenteTelefonoFijo: "023934300 ext 1705",
      suplenteMovilInstitucional: "0991234568",
      suplenteMovilPersonal: "0982345679",
      serviciosHerramientas: ["Interoperabilidad SINARP", "Ficha de Registro Único"],
      areasUso: "Subsecretaría de Fortalecimiento del Conocimiento",
      procesosUso: "Verificación de titulación de tercer y cuarto nivel e identidad registral para asignación de becas y registro de investigadores.",
      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "29/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Registro_SENESCYT.pdf"
    }
  },
  // ENR-03: Trámite Anexo B en estado PENDIENTE DE ASIGNACIÓN (para Director de Gestión)
  {
    id: "SOL-ING-008-B",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Uso y Confidencialidad — Enrolamiento de Coordinador (Anexo B)",
    cedula: "0104829143",
    nombres: "Roberto Carlos",
    apellidos: "Mendieta Loor",
    nombreCompleto: "Ing. Roberto Carlos Mendieta Loor",
    iniciales: "RM",
    correo: "roberto.mendieta@etapa.net.ec",
    institucion: "Empresa Pública Municipal de Telecomunicaciones ETAPA EP",
    fechaSolicitud: "30/09/2026 09:15",
    estado: "PENDIENTE_ASIGNACION_GESTION",
    documentos: [
      "ARP-R02_Acuerdo_Confidencialidad_ETAPA_EP.pdf"
    ],
    anexoB: {
      nombreEntidad: "Empresa Pública Municipal de Telecomunicaciones, Agua Potable, Alcantarillado y Saneamiento de Cuenca (ETAPA EP)",
      domicilioEntidad: "Gran Colombia y Tarqui, Cuenca",
      representanteLegalNombre: "Ing. Alfredo Mancheno (Gerente General)",
      funcionarioNombre: "Ing. Roberto Carlos Mendieta Loor",
      funcionarioCedula: "0104829143",
      funcionarioCargo: "Director de Tecnologías y Sistemas de Información",
      funcionarioEmail: "roberto.mendieta@etapa.net.ec",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Prestar servicios de agua potable, telecomunicaciones y saneamiento ambiental con estándares de excelencia técnica para Cuenca y la región.",
      clausulasAceptadas: true,
      ciudadFirma: "Cuenca",
      fechaFirma: "30/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Confidencialidad_ETAPA_EP.pdf"
    },
    historial: [
      {
        id: "hist-inv-008b",
        fechaHora: "28/09/2026 10:00",
        accion: "Invitación emitida por Proceso A",
        realizadoPor: "Dirección de Gestión DINARP",
        detalles: "Invitación de enrolamiento enviada al Coordinador Titular designado tras aprobación de la institución."
      },
      {
        id: "hist-firma-008b",
        fechaHora: "30/09/2026 09:10",
        accion: "Anexo B firmado por el Coordinador y validado mediante FirmaEC",
        realizadoPor: "FirmaEC · Servicio Oficial",
        detalles: "Firma electrónica válida del Coordinador Ing. Roberto Carlos Mendieta Loor (CI: 0104829143). Certificado Banco Central del Ecuador."
      },
      {
        id: "hist-envio-008b",
        fechaHora: "30/09/2026 09:15",
        accion: "Ingreso a bandeja de asignación",
        realizadoPor: "Portal SINARP",
        detalles: "Expediente digital remitido formalmente a la Dirección de Gestión para asignación de revisor técnico."
      }
    ]
  },
  // ENR-03: Trámite Anexo B ASIGNADO a Revisor Gestión (1111111111) en EN_REVISION_GESTION
  {
    id: "SOL-ING-009-B",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Uso y Confidencialidad — Enrolamiento de Coordinador (Anexo B)",
    cedula: "1714443322",
    nombres: "Mariana del Carmen",
    apellidos: "Almeida Paredes",
    nombreCompleto: "Mariana del Carmen Almeida Paredes",
    iniciales: "MA",
    correo: "m.almeida@educacion.gob.ec",
    institucion: "Ministerio de Educación",
    fechaSolicitud: "30/09/2026 10:30",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "30/09/2026 11:00",
    asignacionActual: {
      id_asignacion: "ASIG-B-1727788800000-8472",
      id_asignador: "U-DIRGEST",
      nombre_asignador: "Director Gestión",
      id_revisor: "U-EQGEST",
      nombre_revisor: "Revisor Gestión",
      instante_asignacion: "2026-09-30T16:00:00.000Z",
      id_tramite_b: "SOL-ING-009-B",
      vigente: true
    },
    historialAsignaciones: [
      {
        id_asignacion: "ASIG-B-1727788800000-8472",
        id_asignador: "U-DIRGEST",
        nombre_asignador: "Director Gestión",
        id_revisor: "U-EQGEST",
        nombre_revisor: "Revisor Gestión",
        instante_asignacion: "2026-09-30T16:00:00.000Z",
        id_tramite_b: "SOL-ING-009-B",
        vigente: true
      }
    ],
    documentos: [
      "ARP-R02_Acuerdo_Confidencialidad_MinEduc.pdf"
    ],
    anexoB: {
      nombreEntidad: "Ministerio de Educación",
      domicilioEntidad: "Av. Amazonas N34-451 y Atahualpa, Quito",
      representanteLegalNombre: "Dra. Alegría Crespo Cordovez (Ministra)",
      funcionarioNombre: "Mariana del Carmen Almeida Paredes",
      funcionarioCedula: "1714443322",
      funcionarioCargo: "Coordinadora General de Información y Datos Educativos",
      funcionarioEmail: "m.almeida@educacion.gob.ec",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Garantizar el acceso universal y la calidad de la educación nacional mediante políticas públicas equitativas y transparentes.",
      clausulasAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "30/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Confidencialidad_MinEduc.pdf"
    },
    historial: [
      {
        id: "hist-inv-009b",
        fechaHora: "29/09/2026 14:00",
        accion: "Invitación emitida por Proceso A",
        realizadoPor: "Dirección de Gestión DINARP",
        detalles: "Invitación de enrolamiento remitida al titular Mariana Almeida."
      },
      {
        id: "hist-firma-009b",
        fechaHora: "30/09/2026 10:20",
        accion: "Anexo B firmado por el Coordinador y validado mediante FirmaEC",
        realizadoPor: "FirmaEC · Servicio Oficial",
        detalles: "Firma electrónica validada de Mariana del Carmen Almeida Paredes (CI: 1714443322). Certificado Security Data."
      },
      {
        id: "hist-asig-009b",
        fechaHora: "30/09/2026 11:00",
        accion: "Asignación de revisor Anexo B",
        realizadoPor: "Director Gestión",
        detalles: "Revisor asignado: Revisor Gestión (U-EQGEST). ID Asignación: ASIG-B-1727788800000-8472. Instante UTC: 2026-09-30T16:00:00.000Z."
      }
    ]
  },
  // ENR-03: Trámite Anexo B con REASIGNACIÓN histórica trazada
  {
    id: "SOL-ING-010-B",
    tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
    codigoDocumental: "ARP-R02",
    tituloTramite: "Acuerdo de Uso y Confidencialidad — Enrolamiento de Coordinador (Anexo B)",
    cedula: "0921345678",
    nombres: "Gonzalo Javier",
    apellidos: "Benalcázar Ruiz",
    nombreCompleto: "Gonzalo Javier Benalcázar Ruiz",
    iniciales: "GB",
    correo: "gonzalo.benalcazar@guayaquil.gob.ec",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Guayaquil",
    fechaSolicitud: "28/09/2026 14:20",
    estado: "EN_REVISION_GESTION",
    revisorGestion: "Revisor Gestión",
    revisor: "Revisor Gestión",
    fechaAsignacionGestion: "29/09/2026 09:15",
    observacionesAsignacion: "Rebalanceo de carga operativa en el Equipo de Gestión",
    asignacionActual: {
      id_asignacion: "ASIG-B-1727697300000-5190",
      id_asignador: "U-DIRGEST",
      nombre_asignador: "Director Gestión",
      id_revisor: "U-EQGEST",
      nombre_revisor: "Revisor Gestión",
      instante_asignacion: "2026-09-29T14:15:00.000Z",
      id_tramite_b: "SOL-ING-010-B",
      vigente: true,
      motivo_reasignacion: "Rebalanceo de carga operativa en el Equipo de Gestión"
    },
    historialAsignaciones: [
      {
        id_asignacion: "ASIG-B-1727610000000-1102",
        id_asignador: "U-DIRGEST",
        nombre_asignador: "Director Gestión",
        id_revisor: "REV-G01",
        nombre_revisor: "Ana Torres",
        instante_asignacion: "2026-09-28T15:00:00.000Z",
        id_tramite_b: "SOL-ING-010-B",
        vigente: false,
        motivo_reasignacion: "Asignación inicial cerrada por reasignación de área"
      },
      {
        id_asignacion: "ASIG-B-1727697300000-5190",
        id_asignador: "U-DIRGEST",
        nombre_asignador: "Director Gestión",
        id_revisor: "U-EQGEST",
        nombre_revisor: "Revisor Gestión",
        instante_asignacion: "2026-09-29T14:15:00.000Z",
        id_tramite_b: "SOL-ING-010-B",
        vigente: true,
        motivo_reasignacion: "Rebalanceo de carga operativa en el Equipo de Gestión"
      }
    ],
    documentos: [
      "ARP-R02_Acuerdo_Confidencialidad_Guayaquil.pdf"
    ],
    anexoB: {
      nombreEntidad: "Gobierno Autónomo Descentralizado Municipal de Guayaquil",
      domicilioEntidad: "Pichincha 605 y Clemente Ballén, Guayaquil",
      representanteLegalNombre: "Aquiles Álvarez Henriques (Alcalde)",
      funcionarioNombre: "Gonzalo Javier Benalcázar Ruiz",
      funcionarioCedula: "0921345678",
      funcionarioCargo: "Director de Transformación Digital y Gobierno Electrónico",
      funcionarioEmail: "gonzalo.benalcazar@guayaquil.gob.ec",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Impulsar el desarrollo integral y la modernización de los servicios públicos cantonales para los ciudadanos de Guayaquil.",
      clausulasAceptadas: true,
      ciudadFirma: "Guayaquil",
      fechaFirma: "28/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: true,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Confidencialidad_Guayaquil.pdf"
    },
    historial: [
      {
        id: "hist-inv-010b",
        fechaHora: "27/09/2026 11:30",
        accion: "Invitación emitida por Proceso A",
        realizadoPor: "Dirección de Gestión DINARP",
        detalles: "Invitación de enrolamiento remitida al titular Gonzalo Benalcázar."
      },
      {
        id: "hist-firma-010b",
        fechaHora: "28/09/2026 14:15",
        accion: "Anexo B firmado por el Coordinador y validado mediante FirmaEC",
        realizadoPor: "FirmaEC · Servicio Oficial",
        detalles: "Firma electrónica validada de Gonzalo Javier Benalcázar Ruiz (CI: 0921345678). Certificado Banco Central del Ecuador."
      },
      {
        id: "hist-asig1-010b",
        fechaHora: "28/09/2026 15:00",
        accion: "Asignación de revisor Anexo B",
        realizadoPor: "Director Gestión",
        detalles: "Revisor asignado: Ana Torres (REV-G01). ID Asignación: ASIG-B-1727610000000-1102."
      },
      {
        id: "hist-reasig-010b",
        fechaHora: "29/09/2026 09:15",
        accion: "Reasignación de revisor Anexo B",
        realizadoPor: "Director Gestión",
        detalles: "Trámite reasignado a Revisor Gestión (U-EQGEST). ID Nueva Asignación: ASIG-B-1727697300000-5190. Asignación previa cerrada formalmente."
      }
    ]
  }
];

export function getStoredSolicitudesIngreso(): SolicitudIngreso[] {
  if (typeof window === "undefined") return INITIAL_SOLICITUDES_INGRESO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INGRESOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(INITIAL_SOLICITUDES_INGRESO));
      return INITIAL_SOLICITUDES_INGRESO;
    }
    const parsed: SolicitudIngreso[] = JSON.parse(raw);
    const tieneCasosB = parsed.some((s) => s.id === "SOL-ING-008-B" || s.id === "SOL-ING-009-B");
    if (!tieneCasosB) {
      const casosB = INITIAL_SOLICITUDES_INGRESO.filter((s) => s.id.endsWith("-B"));
      const combinados = [...casosB, ...parsed];
      localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(combinados));
      return combinados;
    }
    return parsed;
  } catch {
    return INITIAL_SOLICITUDES_INGRESO;
  }
}

export function saveStoredSolicitudesIngreso(items: SolicitudIngreso[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(items));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("dinarp_ingresos_updated", { detail: items }));
    }, 0);
  } catch {
    // Ignore storage issues
  }
}

export function useSolicitudesIngresoStore() {
  const [solicitudes, setSolicitudes] = useState<SolicitudIngreso[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSolicitudes(getStoredSolicitudesIngreso());
    setIsLoaded(true);

    const handleUpdate = (e: CustomEvent<SolicitudIngreso[]>) => {
      if (e.detail) {
        setSolicitudes(e.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_INGRESOS && e.newValue) {
        try {
          setSolicitudes(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("dinarp_ingresos_updated", handleUpdate as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("dinarp_ingresos_updated", handleUpdate as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Aprobar solicitud (BPM: Proceso A preregistra coordinadores y notifica; Proceso B activa coordinador; Proceso C aprueba y abre preregistro)
  const aprobarSolicitud = useCallback((id: string, revisor: string = "María Torres (Dirección de Gestión y Registro)") => {
    setSolicitudes((prev) => {
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const updated = prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            estado: "Aprobada" as EstadoSolicitudIngreso,
            fechaRevision: fechaStr,
            revisor,
            motivoRechazo: undefined
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  // Rechazar solicitud (BPM: Requiere registrar observaciones obligatorias y notificar a la entidad)
  const rechazarSolicitud = useCallback((id: string, motivo: string, revisor: string = "Revisor Gestión", notificacionPendiente?: boolean) => {
    setSolicitudes((prev) => {
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const updated = prev.map((item) => {
        if (item.id === id) {
          const esAnexoB = item.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR";
          const nuevoHistorial = [...(item.historial || [])];
          nuevoHistorial.push({
            id: `hist-${Date.now()}`,
            fechaHora: fechaStr,
            accion: esAnexoB ? "Anexo B rechazado" : "Solicitud rechazada por Gestión",
            realizadoPor: revisor,
            rol: "Equipo de Gestión",
            detalles: esAnexoB
              ? `Acuerdo de Confidencialidad (Anexo B) rechazado por Gestión. Motivo: "${motivo.trim()}". Notificación formal remitida al postulante; cuenta de coordinador no habilitada.${notificacionPendiente ? " Notificación en cola de contingencia." : ""}`
              : `Motivo:\n"${motivo.trim()}"\n\nNotificación:\nInstitución notificada por correo electrónico.`
          });

          return {
            ...item,
            estado: "Rechazada" as EstadoSolicitudIngreso,
            fechaRevision: fechaStr,
            revisor,
            motivoRechazo: motivo.trim(),
            rechazadoPor: "GESTION" as const,
            enr04Ejecutado: false,
            enr04CoordinadorActivado: false,
            estadoNotificacionResolucion: (notificacionPendiente ? "PENDIENTE" : "ENVIADA") as "PENDIENTE" | "ENVIADA",
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  // Agregar Trámite Proceso A (Registro de Institución - Anexo A)
  const agregarRegistroInstitucion = useCallback((anexoA: DatosAnexoA, estado: EstadoSolicitudIngreso = "Pendiente") => {
    setSolicitudes((prev) => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const fechaStr = fmt(now);
      const nextNum = prev.length + 1;
      const id = `SOL-ING-${String(nextNum).padStart(3, "0")}`;

      const docs = ["ARP-R01_Solicitud_Acceso_SINARP.pdf"];
      if (anexoA.esDelegado && anexoA.archivoSoporteDelegacion) {
        docs.push(anexoA.archivoSoporteDelegacion);
      }

      const t_base = now.getTime();
      const initialHistorial = [
        {
          id: `hist-anexo-${t_base}`,
          fechaHora: fmt(new Date(t_base - 25 * 60 * 1000)),
          accion: "Anexo A completado",
          realizadoPor: anexoA.representanteLegalNombre || anexoA.titularNombreCompleto,
          detalles: `Formulario de solicitud de acceso al SINARP completado en el Portal Web DINARP con información institucional de ${anexoA.nombreEntidad}.`
        },
        {
          id: `hist-envio-firma-${t_base}`,
          fechaHora: fmt(new Date(t_base - 15 * 60 * 1000)),
          accion: "Enviado a FirmaEC",
          realizadoPor: anexoA.representanteLegalNombre || anexoA.titularNombreCompleto,
          detalles: "Documento generado (ARP-R01) enviado al servicio de FirmaEC para proceso de suscripción digital del Representante Legal."
        },
        {
          id: `hist-verif-firma-${t_base}`,
          fechaHora: fmt(new Date(t_base - 6 * 60 * 1000)),
          accion: "Firma verificada en FirmaEC",
          realizadoPor: "FirmaEC · Servicio de Certificación",
          detalles: `FirmaEC confirmó correctamente la firma electrónica del documento y se recuperaron y validaron los datos correspondientes del certificado digital del firmante (${anexoA.representanteLegalNombre || "Representante Legal"}).`
        },
        {
          id: `hist-datos-firma-${t_base}`,
          fechaHora: fmt(new Date(t_base - 3 * 60 * 1000)),
          accion: "Datos de firma confirmados",
          realizadoPor: "Portal Web DINARP / Interoperabilidad",
          detalles: "Validación técnica de integridad del archivo firmado, estampa cronológica y coincidencia de identidad del firmante con personería jurídica."
        },
        {
          id: `hist-envio-gestion-${t_base}`,
          fechaHora: fechaStr,
          accion: "Solicitud enviada a Gestión DINARP",
          realizadoPor: anexoA.titularNombreCompleto || anexoA.nombreEntidad,
          detalles: "Expediente digital verificado e ingresado formalmente a la bandeja de entrada de la Dirección de Gestión y Registro DINARP para asignación de revisor."
        }
      ];

      const newSol: SolicitudIngreso = {
        id,
        tipoTramite: "PROCESO_A_REGISTRO_INSTITUCION",
        codigoDocumental: "ARP-R01",
        tituloTramite: "Solicitud de Acceso SINARP (Registro Institución)",
        cedula: anexoA.titularCedula,
        nombres: anexoA.titularNombreCompleto.split(" ")[0] || anexoA.titularNombreCompleto,
        apellidos: anexoA.titularNombreCompleto.split(" ").slice(1).join(" ") || "",
        nombreCompleto: anexoA.titularNombreCompleto,
        iniciales: anexoA.titularNombreCompleto.slice(0, 2).toUpperCase(),
        correo: anexoA.titularEmail,
        institucion: anexoA.nombreEntidad,
        fechaSolicitud: fechaStr,
        estado,
        documentos: docs,
        anexoA,
        historial: initialHistorial
      };

      const updated = [newSol, ...prev];
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  // Agregar Trámite Proceso B (Enrolamiento de Coordinador - Anexo B)
  const agregarEnrolamientoCoordinador = useCallback((anexoB: DatosAnexoB, estado: EstadoSolicitudIngreso = "PENDIENTE_ASIGNACION_GESTION") => {
    setSolicitudes((prev) => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const fechaStr = fmt(now);
      const nextNum = prev.length + 1;
      const id = `SOL-ING-${String(nextNum).padStart(3, "0")}`;

      const t_base = now.getTime();
      const initialHistorial = [
        {
          id: `hist-invitacion-${t_base}`,
          fechaHora: fmt(new Date(t_base - 20 * 60 * 1000)),
          accion: "Invitación validada",
          realizadoPor: anexoB.funcionarioNombre,
          rol: "Coordinador Designado",
          detalles: `Invitación B vigente verificada para ${anexoB.funcionarioNombre} como ${anexoB.rolAsignado || "COORDINADOR TITULAR"} de ${anexoB.nombreEntidad}.`
        },
        {
          id: `hist-anexo-b-iniciado-${t_base}`,
          fechaHora: fmt(new Date(t_base - 14 * 60 * 1000)),
          accion: "Anexo B iniciado",
          realizadoPor: anexoB.funcionarioNombre,
          rol: "Coordinador Designado",
          detalles: "Borrador de formulario Anexo B completado y términos del Acuerdo de Uso y Confidencialidad aceptados."
        },
        {
          id: `hist-envio-firma-${t_base}`,
          fechaHora: fmt(new Date(t_base - 8 * 60 * 1000)),
          accion: "Enviado a FirmaEC",
          realizadoPor: anexoB.funcionarioNombre,
          rol: "Coordinador Designado",
          detalles: "Documento oficial ARP-R02 enviado al servicio de FirmaEC para proceso de suscripción digital del Coordinador."
        },
        {
          id: `hist-firma-verificada-${t_base}`,
          fechaHora: fmt(new Date(t_base - 3 * 60 * 1000)),
          accion: "Firma verificada en FirmaEC",
          realizadoPor: "FirmaEC · Servicio de Certificación",
          detalles: `FirmaEC confirmó correctamente la firma electrónica del Acuerdo de Confidencialidad y se validó el certificado de ${anexoB.funcionarioNombre}.`
        },
        {
          id: `hist-envio-gestion-${t_base}`,
          fechaHora: fechaStr,
          accion: "Anexo B enviado a Gestión DINARP",
          realizadoPor: anexoB.funcionarioNombre,
          rol: "Coordinador Designado",
          detalles: "Acuerdo de Confidencialidad (Anexo B) ingresado formalmente a la Dirección de Gestión y Registro DINARP para asignación de revisor."
        }
      ];

      const newSol: SolicitudIngreso = {
        id,
        tipoTramite: "PROCESO_B_ENROLAMIENTO_COORDINADOR",
        codigoDocumental: "ARP-R02",
        tituloTramite: "Anexo B — Enrolamiento de Coordinador",
        cedula: anexoB.funcionarioCedula,
        nombres: anexoB.funcionarioNombre.split(" ")[0] || anexoB.funcionarioNombre,
        apellidos: anexoB.funcionarioNombre.split(" ").slice(1).join(" ") || "",
        nombreCompleto: anexoB.funcionarioNombre,
        iniciales: anexoB.funcionarioNombre.slice(0, 2).toUpperCase(),
        correo: anexoB.funcionarioEmail || `${anexoB.funcionarioNombre.toLowerCase().replace(/\s+/g, ".")}@institucion.gob.ec`,
        institucion: anexoB.nombreEntidad,
        fechaSolicitud: fechaStr,
        estado,
        documentos: ["ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf"],
        historial: initialHistorial,
        anexoB
      };

      const updated = [newSol, ...prev];
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  // Agregar Trámite Proceso C (Cambio de Coordinador - Anexo C)
  const agregarCambioCoordinador = useCallback((anexoC: DatosAnexoC) => {
    setSolicitudes((prev) => {
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const nextNum = prev.length + 1;
      const id = `SOL-ING-${String(nextNum).padStart(3, "0")}`;

      const personaNombre = anexoC.nuevoTitularNombre || anexoC.nuevoSuplenteNombre || anexoC.inicialSuplenteNombre || "Coordinador Solicitado";
      const personaCedula = anexoC.nuevoTitularCedula || anexoC.nuevoSuplenteCedula || anexoC.inicialSuplenteCedula || "1700000000";
      const personaEmail = anexoC.nuevoTitularEmail || anexoC.nuevoSuplenteEmail || anexoC.inicialSuplenteEmail || "coordinador@institucion.gob.ec";

      const docs = ["ARP-R03_Cambio_Coordinador_Institucional.pdf"];
      if (anexoC.esDelegado && anexoC.archivoSoporteDelegacion) {
        docs.push(anexoC.archivoSoporteDelegacion);
      }

      const newSol: SolicitudIngreso = {
        id,
        tipoTramite: "PROCESO_C_CAMBIO_COORDINADOR",
        codigoDocumental: "ARP-R03",
        tituloTramite: "Cambio de Coordinador Institucional (ARP-R03)",
        cedula: personaCedula,
        nombres: personaNombre.split(" ")[0] || personaNombre,
        apellidos: personaNombre.split(" ").slice(1).join(" ") || "",
        nombreCompleto: personaNombre,
        iniciales: personaNombre.slice(0, 2).toUpperCase(),
        correo: personaEmail,
        institucion: anexoC.nombreEntidad,
        fechaSolicitud: fechaStr,
        estado: "Pendiente",
        documentos: docs,
        anexoC
      };

      const updated = [newSol, ...prev];
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  // Helper para validar cédula en Proceso B contra preregistros aprobados (BPM Proceso B)
  const buscarPreregistroPorCedula = useCallback((cedula: string) => {
    const list = getStoredSolicitudesIngreso();
    const cleanCedula = cedula.trim();

    // 1. Buscar si hay una institución aprobada en Proceso A con esta cédula
    for (const sol of list) {
      if (
        sol.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" &&
        (sol.estado === "INSTITUCION_ACTIVA" || sol.estado === "Aprobada" || sol.estado === "APROBADO_FINAL") &&
        sol.anexoA
      ) {
        if (sol.anexoA.titularCedula === cleanCedula) {
          return {
            encontrado: true,
            invitacionValida: true,
            tipo: "TITULAR",
            nombreCompleto: sol.anexoA.titularNombreCompleto,
            cedula: sol.anexoA.titularCedula,
            cargo: sol.anexoA.titularCargo,
            correo: sol.anexoA.titularEmail,
            institucion: sol.anexoA.nombreEntidad,
            direccion: sol.anexoA.direccionEntidad,
            representanteLegal: sol.anexoA.representanteLegalNombre,
            origenTramiteId: sol.id,
            yaEnrolado: list.some((s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" && s.cedula === cleanCedula && (s.estado === "Aprobada" || s.estado === "APROBADO_FINAL"))
          };
        }
        if (sol.anexoA.suplenteCedula === cleanCedula) {
          return {
            encontrado: true,
            invitacionValida: true,
            tipo: "SUPLENTE",
            nombreCompleto: sol.anexoA.suplenteNombreCompleto,
            cedula: sol.anexoA.suplenteCedula,
            cargo: sol.anexoA.suplenteCargo,
            correo: sol.anexoA.suplenteEmail,
            institucion: sol.anexoA.nombreEntidad,
            direccion: sol.anexoA.direccionEntidad,
            representanteLegal: sol.anexoA.representanteLegalNombre,
            origenTramiteId: sol.id,
            yaEnrolado: list.some((s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" && s.cedula === cleanCedula && (s.estado === "Aprobada" || s.estado === "APROBADO_FINAL"))
          };
        }
      }

      // 2. Buscar si hay un cambio de coordinador aprobado en Proceso C con esta cédula
      if (sol.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" && sol.estado === "Aprobada" && sol.anexoC) {
        if (sol.anexoC.nuevoTitularCedula === cleanCedula) {
          return {
            encontrado: true,
            tipo: "TITULAR",
            nombreCompleto: sol.anexoC.nuevoTitularNombre || "",
            cedula: cleanCedula,
            cargo: sol.anexoC.nuevoTitularCargo || "",
            correo: sol.anexoC.nuevoTitularEmail || "",
            institucion: sol.anexoC.nombreEntidad,
            direccion: "Dirección institucional registrada",
            representanteLegal: sol.anexoC.representanteLegalNombre,
            origenTramiteId: sol.id,
            yaEnrolado: list.some((s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" && s.cedula === cleanCedula && s.estado === "Aprobada")
          };
        }
        if (sol.anexoC.nuevoSuplenteCedula === cleanCedula || sol.anexoC.inicialSuplenteCedula === cleanCedula) {
          return {
            encontrado: true,
            tipo: "SUPLENTE",
            nombreCompleto: sol.anexoC.nuevoSuplenteNombre || sol.anexoC.inicialSuplenteNombre || "",
            cedula: cleanCedula,
            cargo: sol.anexoC.nuevoSuplenteCargo || sol.anexoC.inicialSuplenteCargo || "",
            correo: sol.anexoC.nuevoSuplenteEmail || sol.anexoC.inicialSuplenteEmail || "",
            institucion: sol.anexoC.nombreEntidad,
            direccion: "Dirección institucional registrada",
            representanteLegal: sol.anexoC.representanteLegalNombre,
            origenTramiteId: sol.id,
            yaEnrolado: list.some((s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" && s.cedula === cleanCedula && s.estado === "Aprobada")
          };
        }
      }
    }

    // Cédula oficial de prueba para Anexo B — Enrolamiento de Coordinador
    if (cleanCedula === "4444444444") {
      return {
        encontrado: true,
        invitacionValida: true,
        tipo: "TITULAR",
        nombreCompleto: "Ing. Carlos Alberto Morales Viteri",
        cedula: "4444444444",
        cargo: "Director de Tecnologías de la Información",
        correo: "carlos.morales@cuenca.gob.ec",
        institucion: "Gobierno Autónomo Descentralizado Municipal de Cuenca",
        direccion: "Calle Bolívar y Borrero, Cuenca, Azuay",
        representanteLegal: "Dr. Cristian Zamora Matute (Alcalde)",
        origenTramiteId: "SOL-ING-001",
        yaEnrolado: list.some((s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" && s.cedula === "4444444444" && s.estado === "Aprobada")
      };
    }

    // Caso demo de invitación vencida o no válida (HU ENR-01)
    if (cleanCedula === "9999999999") {
      return {
        encontrado: false,
        invitacionValida: false,
        mensaje: "Invitación no válida o vencida."
      };
    }

    // Datos demo precargados para test si coincide con la cédula demo
    if (cleanCedula === "1712345602") {
      return {
        encontrado: true,
        invitacionValida: true,
        tipo: "TITULAR",
        nombreCompleto: "Paula Andrea Mendoza Zambrano",
        cedula: "1712345602",
        cargo: "Coordinadora de Tecnologías de la Información",
        correo: "paula.mendoza@dinarp.gob.ec",
        institucion: "Dirección Nacional de Registros Públicos",
        direccion: "Av. Amazonas N24-196 y Luis Cordero, Quito",
        representanteLegal: "Mgs. Christian Ruiz (Director Nacional)",
        origenTramiteId: "SOL-ING-002",
        yaEnrolado: true
      };
    }

    if (cleanCedula === "1715489621") {
      return {
        encontrado: true,
        tipo: "SUPLENTE",
        nombreCompleto: "Ing. Roberto Carlos Dávila Silva",
        cedula: "1715489621",
        cargo: "Especialista de Infraestructura y Datos",
        correo: "roberto.davila@msp.gob.ec",
        institucion: "Ministerio de Salud Pública",
        direccion: "Av. República de El Salvador 36-64 y Suecia, Quito",
        representanteLegal: "Dra. Gabriela Patricia Aguinaga",
        origenTramiteId: "SOL-ING-001",
        yaEnrolado: false
      };
    }

    return { encontrado: false };
  }, []);

  const actualizarEstado = useCallback((id: string, nuevoEstado: EstadoSolicitudIngreso, extras?: Partial<SolicitudIngreso>) => {
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            estado: nuevoEstado,
            ...extras
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const asignarRevisorGestion = useCallback((solicitudId: string, revisorNombre: string, asignadoPor?: string, observaciones?: string) => {
    const now = new Date().toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const esAnexoB = item.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR";
          const esReasignacion = Boolean(item.revisorGestion || item.revisor);
          const nuevoHistorial = [...(item.historial || [])];
          
          const idAsignacion = `ASIG-B-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const instanteUtc = new Date().toISOString();
          const idRevisor = revisorNombre.includes("Gestión") ? "U-EQGEST" : "REV-G04";
          const idAsignador = "U-DIRGEST";

          // Desactivar vigencia de asignaciones previas para cumplir que solo una está activa
          const prevAsignaciones = (item.historialAsignaciones || []).map((asig) => ({
            ...asig,
            vigente: false
          }));

          const nuevaAsignacion: AsignacionTramite = {
            id_asignacion: idAsignacion,
            id_asignador: idAsignador,
            nombre_asignador: asignadoPor || "Director Gestión",
            id_revisor: idRevisor,
            nombre_revisor: revisorNombre,
            instante_asignacion: instanteUtc,
            id_tramite_b: item.id,
            vigente: true,
            motivo_reasignacion: observaciones
          };

          const accion = esAnexoB
            ? (esReasignacion ? "Reasignación de revisor Anexo B" : "Asignación de revisor Anexo B")
            : (esReasignacion ? "Reasignación de trámite" : "Asignación de trámite");

          const detalles = esAnexoB
            ? `Revisor asignado: ${revisorNombre} (${idRevisor}). ID Asignación: ${idAsignacion}. Instante UTC: ${instanteUtc}.${observaciones ? ` Observaciones: ${observaciones}` : ""}`.trim()
            : `Trámite ${esReasignacion ? 'reasignado' : 'asignado'} a ${revisorNombre}. ${observaciones ? `Observaciones: ${observaciones}` : ''}`.trim();

          nuevoHistorial.push({
            id: `hist-${Date.now()}`,
            fechaHora: now,
            accion,
            realizadoPor: asignadoPor || "Director Gestión",
            detalles
          });

          return {
            ...item,
            estado: "EN_REVISION_GESTION" as EstadoSolicitudIngreso,
            revisorGestion: revisorNombre,
            revisor: revisorNombre,
            fechaAsignacionGestion: now,
            observacionesAsignacion: observaciones,
            revisionIniciada: false,
            asignacionActual: nuevaAsignacion,
            historialAsignaciones: [...prevAsignaciones, nuevaAsignacion],
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const asignarRevisorMasivo = useCallback((
    solicitudIds: string[],
    revisorNombre: string,
    areaOrAsignadoPor?: string,
    dirOrObservaciones?: string,
    observacionesOrRol?: string
  ) => {
    const isAreaProvided = areaOrAsignadoPor === "NORMATIVIDAD" || areaOrAsignadoPor === "GESTION";
    const area = isAreaProvided ? areaOrAsignadoPor : (observacionesOrRol === "DIR_NORMATIVA" ? "NORMATIVIDAD" : "GESTION");
    const asignadoPor = isAreaProvided ? dirOrObservaciones : areaOrAsignadoPor;
    const observaciones = isAreaProvided ? observacionesOrRol : dirOrObservaciones;

    const now = new Date().toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (solicitudIds.includes(item.id)) {
          const esNormatividad = area === "NORMATIVIDAD" ||
            item.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" ||
            item.estado === "PENDIENTE_GENERAR_RESOLUCION" ||
            item.estado === "EN_GENERACION_RESOLUCION" ||
            item.estado === "EN_REVISION_NORMATIVIDAD" ||
            observacionesOrRol === "DIR_NORMATIVA";
          const esReasignacion = esNormatividad ? Boolean(item.revisorNormatividad) : Boolean(item.revisorGestion || item.revisor);
          const nuevoHistorial = [...(item.historial || [])];
          
          const accion = esNormatividad
            ? (esReasignacion ? "Reasignación de responsable en Normatividad" : "Responsable de Normatividad asignado")
            : (esReasignacion ? "Reasignación de trámite" : "Asignación de trámite");
          const detalles = `Responsable: ${revisorNombre}. Asignado por: ${asignadoPor || (esNormatividad ? "Director de Normatividad" : "Director de Gestión")}.${observaciones ? ` Observaciones: ${observaciones}` : ""}`.trim();

          nuevoHistorial.push({
            id: `hist-${Date.now()}-${item.id}`,
            fechaHora: now,
            accion,
            realizadoPor: asignadoPor || (esNormatividad ? "Director de Normatividad" : "Director de Gestión"),
            detalles
          });

          if (esNormatividad) {
            return {
              ...item,
              estado: "PENDIENTE_GENERAR_RESOLUCION" as EstadoSolicitudIngreso,
              revisorNormatividad: revisorNombre,
              revisor: revisorNombre,
              fechaAsignacionNormatividad: now,
              observacionesAsignacion: observaciones,
              revisionIniciada: false,
              historial: nuevoHistorial
            };
          }

          return {
            ...item,
            estado: "EN_REVISION_GESTION" as EstadoSolicitudIngreso,
            revisorGestion: revisorNombre,
            revisor: revisorNombre,
            fechaAsignacionGestion: now,
            observacionesAsignacion: observaciones,
            revisionIniciada: false,
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const iniciarRevision = useCallback((solicitudId: string, revisorNombre?: string) => {
    setSolicitudes((prev) => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const fechaStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const isNormativa = item.estado === "PENDIENTE_GENERAR_RESOLUCION" || item.estado === "EN_GENERACION_RESOLUCION" || item.estado === "EN_REVISION_NORMATIVIDAD" || item.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD";
          const resp = revisorNombre || (isNormativa ? item.revisorNormatividad : item.revisorGestion) || item.revisor || (isNormativa ? "Personal facultado de Normatividad" : "Revisor de Gestión");
          const nuevoHistorial = [...(item.historial || [])];
          
          if (!item.revisionIniciada) {
            nuevoHistorial.push({
              id: `hist-rev-${Date.now()}`,
              fechaHora: fechaStr,
              accion: isNormativa ? "Generación de resolución iniciada" : "Revisión técnica iniciada",
              realizadoPor: resp,
              rol: isNormativa ? "Personal facultado de Normatividad" : "Revisor de Gestión",
              detalles: isNormativa
                ? `El funcionario ${resp} ha iniciado la formulación de la resolución institucional.`
                : `El revisor ${resp} ha iniciado formalmente la verificación técnica y documental del expediente.`
            });
          }

          return {
            ...item,
            estado: isNormativa ? ("EN_GENERACION_RESOLUCION" as EstadoSolicitudIngreso) : ("EN_REVISION_GESTION" as EstadoSolicitudIngreso),
            revisionIniciada: true,
            fechaInicioRevision: item.fechaInicioRevision || fechaStr,
            revisor: resp,
            revisorGestion: isNormativa ? item.revisorGestion : (item.revisorGestion || resp),
            revisorNormatividad: isNormativa ? (item.revisorNormatividad || resp) : item.revisorNormatividad,
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const pausarRevision = useCallback((solicitudId: string, revisorNombre?: string, motivo?: string) => {
    setSolicitudes((prev) => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const fechaStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const isNormativa = item.estado === "PENDIENTE_GENERAR_RESOLUCION" || item.estado === "EN_GENERACION_RESOLUCION" || item.estado === "EN_REVISION_NORMATIVIDAD" || item.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD";
          const resp = revisorNombre || (isNormativa ? item.revisorNormatividad : item.revisorGestion) || item.revisor || (isNormativa ? "Personal facultado de Normatividad" : "Revisor de Gestión");
          const nuevoHistorial = [...(item.historial || [])];

          nuevoHistorial.push({
            id: `hist-pause-${Date.now()}`,
            fechaHora: fechaStr,
            accion: isNormativa ? "Generación de resolución pausada" : "Revisión pausada",
            realizadoPor: resp,
            rol: isNormativa ? "Personal facultado de Normatividad" : "Revisor de Gestión",
            detalles: motivo || (isNormativa 
              ? `El funcionario ${resp} salió de la formulación sin emitir la resolución. El trámite retorna al estado pendiente de formulación.`
              : `El revisor ${resp} salió de la revisión sin emitir dictamen. El trámite retorna al estado pendiente de revisión.`)
          });

          return {
            ...item,
            revisionIniciada: false,
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const aprobarGestion = useCallback((solicitudId: string, aprobadoPor?: string, observaciones?: string, notificacionPendiente?: boolean) => {
    const now = new Date().toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const esAnexoB = item.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" || item.codigoDocumental === "ARP-R02" || Boolean(item.anexoB);
          
          // ENR-03 / ENR-04: Idempotencia - evitar duplicar activación
          if (esAnexoB && item.enr04Ejecutado && item.estado === "Aprobada") {
            return item;
          }

          const nuevoHistorial = [...(item.historial || [])];

          nuevoHistorial.push({
            id: `hist-${Date.now()}`,
            fechaHora: now,
            accion: esAnexoB ? "Anexo B aprobado" : "Solicitud aprobada por Gestión",
            realizadoPor: aprobadoPor || item.revisorGestion || "Revisor Gestión",
            detalles: esAnexoB
              ? (observaciones || `Enrolamiento de Coordinador (Anexo B) y Acuerdo de Confidencialidad verificados y aprobados exitosamente. Coordinador habilitado en SINARP (ENR-04).${notificacionPendiente ? " Notificación en cola de contingencia." : ""}`)
              : (observaciones || "Trámite validado documentalmente. Continúa a Normatividad.")
          });

          return {
            ...item,
            estado: (esAnexoB ? "Aprobada" : "PENDIENTE_ASIGNACION_NORMATIVIDAD") as EstadoSolicitudIngreso,
            fechaRevision: now,
            fechaAprobacionGestion: now,
            enr04Ejecutado: esAnexoB ? true : item.enr04Ejecutado,
            enr04Instante: esAnexoB ? new Date().toISOString() : item.enr04Instante,
            enr04CoordinadorActivado: esAnexoB ? true : item.enr04CoordinadorActivado,
            estadoNotificacionResolucion: (notificacionPendiente ? "PENDIENTE" : "ENVIADA") as "PENDIENTE" | "ENVIADA",
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const asignarRevisorNormatividad = useCallback((solicitudId: string, revisorNombre: string, asignadoPor?: string, observaciones?: string) => {
    const now = new Date().toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const esReasignacion = Boolean(item.revisorNormatividad);
          const nuevoHistorial = [...(item.historial || [])];
          
          const accion = esReasignacion ? "Reasignación de responsable en Normatividad" : "Responsable de Normatividad asignado";
          const detalles = `Responsable: ${revisorNombre}. Asignado por: ${asignadoPor || "Director de Normatividad"}.${observaciones ? ` Observaciones: ${observaciones}` : ""}`.trim();
          
          nuevoHistorial.push({
            id: `hist-${Date.now()}`,
            fechaHora: now,
            accion,
            realizadoPor: asignadoPor || "Director de Normatividad",
            detalles
          });

          return {
            ...item,
            estado: "PENDIENTE_GENERAR_RESOLUCION" as EstadoSolicitudIngreso,
            revisorNormatividad: revisorNombre,
            revisor: revisorNombre,
            fechaAsignacionNormatividad: now,
            observacionesAsignacion: observaciones,
            revisionIniciada: false,
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const aprobarNormatividad = useCallback((solicitudId: string, aprobadoPor?: string, observaciones?: string, resolucion?: string) => {
    const now = new Date().toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const nuevoHistorial = [...(item.historial || [])];
          const numRes = resolucion || item.resolucion || "RES-DINARP-2026-001";
          
          // 1. Hito: Resolución institucional generada (INS-06 completado)
          nuevoHistorial.push({
            id: `hist-${Date.now()}-res`,
            fechaHora: now,
            accion: "Resolución institucional generada",
            realizadoPor: aprobadoPor || item.revisorNormatividad || "Personal facultado de Normatividad",
            rol: "Personal facultado de Normatividad",
            detalles: `Resolución institucional ${numRes} generada y vinculada a la solicitud y Anexo A aprobado. ${observaciones || ""}`.trim()
          });

          // 2. Hito: Remisión a Máxima Autoridad para firma digital y posterior activación (INS-07)
          nuevoHistorial.push({
            id: `hist-${Date.now()}-firma-pend`,
            fechaHora: now,
            accion: "Remisión a Máxima Autoridad para firma digital",
            realizadoPor: "Sistema DINARP",
            rol: "Sistema",
            detalles: "Resolución institucional remitida al despacho de la Máxima Autoridad para suscripción electrónica mediante FirmaEC. Al suscribirse la resolución, se activará la institución en el sistema SINARP y se enviarán automáticamente las invitaciones de enrolamiento al Coordinador Titular y Coordinador Suplente."
          });

          return {
            ...item,
            estado: "PENDIENTE_DE_FIRMA" as EstadoSolicitudIngreso,
            fechaRevision: now,
            resolucion: numRes,
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const completarFirmaResolucion = useCallback((
    solicitudId: string,
    exitosa: boolean,
    firmanteNombre: string = "Mgs. Christian Ruiz (Director Nacional)",
    motivoFallo?: string
  ) => {
    const now = new Date().toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
    const nowIso = new Date().toISOString();
    const fechaCaducidad = new Date();
    fechaCaducidad.setDate(fechaCaducidad.getDate() + 30);
    const fechaCaducidadStr = fechaCaducidad.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });

    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const nuevoHistorial = [...(item.historial || [])];
          const numRes = item.resolucion || "RES-DINARP-2026-0042";

          if (exitosa) {
            // Hito 1: Resolución firmada y verificada
            nuevoHistorial.push({
              id: `hist-${Date.now()}-firma-ok`,
              fechaHora: now,
              accion: "Resolución firmada y verificada",
              realizadoPor: firmanteNombre,
              rol: "Máxima Autoridad DINARP",
              detalles: `Resolución institucional ${numRes} suscrita por la Máxima Autoridad mediante FirmaEC. Verificación de firma criptográfica y certificado digital de entidad certificadora oficial válidos.`
            });

            // Hito 2: Institución activada
            nuevoHistorial.push({
              id: `hist-${Date.now()}-inst-activa`,
              fechaHora: now,
              accion: "Institución activada",
              realizadoPor: "Sistema DINARP",
              rol: "Sistema",
              detalles: "La resolución fue firmada y verificada correctamente. La institución se encuentra activa y puede continuar con el enrolamiento de sus coordinadores."
            });

            // Generación de 2 invitaciones independientes: Titular y Suplente
            const titularNombre = item.anexoA?.titularNombreCompleto || item.nombreCompleto || "Coordinador Titular";
            const titularCedula = item.anexoA?.titularCedula || item.cedula || "1700000001";
            const titularEmail = item.anexoA?.titularEmail || item.correo || "titular@institucion.gob.ec";
            const titularCargo = item.anexoA?.titularCargo || "Director de TI";

            const suplenteNombre = item.anexoA?.suplenteNombreCompleto || "Coordinador Suplente";
            const suplenteCedula = item.anexoA?.suplenteCedula || "1700000002";
            const suplenteEmail = item.anexoA?.suplenteEmail || "suplente@institucion.gob.ec";
            const suplenteCargo = item.anexoA?.suplenteCargo || "Especialista TIC";

            const invTitular: InvitacionAnexoB = {
              id: `INV-B-${item.id.replace("SOL-", "")}-TIT`,
              solicitudId: item.id,
              destinatarioCedula: titularCedula,
              destinatarioNombre: titularNombre,
              destinatarioEmail: titularEmail,
              destinatarioCargo: titularCargo,
              institucion: item.institucion,
              rol: "TITULAR",
              token: `tok_sec_opaque_${Math.random().toString(36).substring(2, 12)}`,
              fechaEmision: now,
              fechaCaducidad: fechaCaducidadStr,
              estado: "PENDIENTE",
              canalEnvio: "CORREO_ELECTRONICO",
              fechaEnvio: now
            };

            const invSuplente: InvitacionAnexoB = {
              id: `INV-B-${item.id.replace("SOL-", "")}-SUP`,
              solicitudId: item.id,
              destinatarioCedula: suplenteCedula,
              destinatarioNombre: suplenteNombre,
              destinatarioEmail: suplenteEmail,
              destinatarioCargo: suplenteCargo,
              institucion: item.institucion,
              rol: "SUPLENTE",
              token: `tok_sec_opaque_${Math.random().toString(36).substring(2, 12)}`,
              fechaEmision: now,
              fechaCaducidad: fechaCaducidadStr,
              estado: "PENDIENTE",
              canalEnvio: "CORREO_ELECTRONICO",
              fechaEnvio: now
            };

            // Hito 3: Invitaciones generadas y enviadas
            nuevoHistorial.push({
              id: `hist-${Date.now()}-inv-tit`,
              fechaHora: now,
              accion: "Invitación B — Coordinador Titular generada",
              realizadoPor: "Sistema DINARP",
              rol: "Sistema",
              detalles: `Invitación individual ${invTitular.id} generada y notificada por correo a ${titularNombre} (${titularEmail}). Vigencia de 30 días calendario según PAR-05.`
            });

            nuevoHistorial.push({
              id: `hist-${Date.now()}-inv-sup`,
              fechaHora: now,
              accion: "Invitación B — Coordinador Suplente generada",
              realizadoPor: "Sistema DINARP",
              rol: "Sistema",
              detalles: `Invitación individual ${invSuplente.id} generada y notificada por correo a ${suplenteNombre} (${suplenteEmail}). Vigencia de 30 días calendario según PAR-05.`
            });

            const nuevosDocumentos = item.documentos.map((doc) =>
              doc.includes("Para_Firma") ? doc.replace("Para_Firma", "Firmada") : doc
            );
            if (!nuevosDocumentos.some((d) => d.includes("Firmada"))) {
              nuevosDocumentos.push(`${numRes}_Firmada.pdf`);
            }

            return {
              ...item,
              estado: "INSTITUCION_ACTIVA" as EstadoSolicitudIngreso,
              fechaRevision: now,
              documentos: nuevosDocumentos,
              datosFirmaResolucion: {
                firmante: firmanteNombre,
                cargo: "Máxima Autoridad DINARP",
                entidad: "Dirección Nacional de Registros Públicos",
                entidadCertificadora: "Banco Central del Ecuador (BCE)",
                algoritmo: "SHA-256 with RSA Encryption (2048-bit)",
                fechaHoraFirma: nowIso,
                verificada: true,
                hashDocumento: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              },
              invitacionesB: [invTitular, invSuplente],
              historial: nuevoHistorial
            };
          } else {
            // Caso demo de fallo en la firma
            nuevoHistorial.push({
              id: `hist-${Date.now()}-firma-fail`,
              fechaHora: now,
              accion: "Firma de resolución no concluida",
              realizadoPor: "FirmaEC · Servicio de Certificación",
              rol: "Sistema",
              detalles: motivoFallo || "El proceso de firma externa no concluyó exitosamente o el certificado reportó error de validación. La institución se mantiene en estado pendiente de firma y no se activan las invitaciones."
            });

            return {
              ...item,
              estado: "PENDIENTE_DE_FIRMA" as EstadoSolicitudIngreso,
              historial: nuevoHistorial
            };
          }
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const fallarGeneracionResolucion = useCallback((solicitudId: string, causa: string, falladoPor?: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fechaStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const nuevoHistorial = [...(item.historial || [])];
          nuevoHistorial.push({
            id: `hist-fallo-${Date.now()}`,
            fechaHora: fechaStr,
            accion: "Generación de resolución no completada",
            realizadoPor: falladoPor || item.revisorNormatividad || "Personal facultado de Normatividad",
            rol: "Personal facultado de Normatividad",
            detalles: `Causa: ${causa}. Trámite mantenido en estado pendiente para subsanación o reintento.`
          });

          return {
            ...item,
            estado: "GENERACION_PENDIENTE" as EstadoSolicitudIngreso,
            motivoRechazo: causa,
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const reintentarGeneracionResolucion = useCallback((solicitudId: string, reintentadoPor?: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fechaStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setSolicitudes((prev) => {
      const updated = prev.map((item) => {
        if (item.id === solicitudId) {
          const nuevoHistorial = [...(item.historial || [])];
          nuevoHistorial.push({
            id: `hist-reintento-${Date.now()}`,
            fechaHora: fechaStr,
            accion: "Reintento de generación de resolución",
            realizadoPor: reintentadoPor || item.revisorNormatividad || "Personal facultado de Normatividad",
            rol: "Personal facultado de Normatividad",
            detalles: "Se reanuda el proceso de formulación y vinculación de resolución institucional."
          });

          return {
            ...item,
            estado: "EN_GENERACION_RESOLUCION" as EstadoSolicitudIngreso,
            historial: nuevoHistorial
          };
        }
        return item;
      });
      saveStoredSolicitudesIngreso(updated);
      return updated;
    });
  }, []);

  const resetStore = useCallback(() => {
    saveStoredSolicitudesIngreso(INITIAL_SOLICITUDES_INGRESO);
    setSolicitudes(INITIAL_SOLICITUDES_INGRESO);
  }, []);

  return {
    solicitudes,
    isLoaded,
    aprobarSolicitud,
    rechazarSolicitud,
    actualizarEstado,
    asignarRevisorGestion,
    asignarRevisorMasivo,
    iniciarRevision,
    pausarRevision,
    aprobarGestion,
    asignarRevisorNormatividad,
    aprobarNormatividad,
    completarFirmaResolucion,
    fallarGeneracionResolucion,
    reintentarGeneracionResolucion,
    agregarRegistroInstitucion,
    agregarEnrolamientoCoordinador,
    agregarCambioCoordinador,
    buscarPreregistroPorCedula,
    resetStore
  };
}

