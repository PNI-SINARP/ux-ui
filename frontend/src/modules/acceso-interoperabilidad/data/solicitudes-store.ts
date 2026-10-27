"use client";

import { useState, useEffect, useCallback } from "react";

export interface CampoDetalle {
  id: string;
  nombre: string;
  nombreCampo?: string;
  etiquetaFuncional?: string;
  etiquetaSensibilidad?: string;
  descripcion: string;
  tipo?: string;
  clasificacion: "Accesible" | "Confidencial";
  finalidad: string;
  finalidadUso?: string;
  fundamento?: string;
  justificacionConfidencial?: string;
  adjuntoConfidencialNombre?: string;
  estado?: string;
}

export interface FuenteDetalle {
  id: string;
  nombre: string;
  institucion: string;
  campos: CampoDetalle[];
}

export interface DocumentoSoporte {
  id: string;
  nombre: string;
  tipo: string;
  tamano: string;
  fechaCarga: string;
  categoria: string;
}

export interface TrazabilidadEvento {
  fecha: string;
  evento: string;
  actor: string;
  detalle?: string;
}

export type SolicitudEstado =
  | "Borrador"
  | "Enviada"
  | "Pendiente de asignación en Gestión"
  | "Asignada a revisión de Gestión"
  | "En revisión de Gestión"
  | "En revisión"
  | "Observada"
  | "Requiere corrección"
  | "Pendiente de nueva asignación"
  | "Aprobada por Gestión"
  | "Pendiente de asignación en Normatividad"
  | "En revisión normativa"
  | "En revisión jurídica"
  | "Aprobada por Normatividad"
  | "Pendiente de integración"
  | "Pendiente de plantilla"
  | "En formalización"
  | "Pendiente de firma"
  | "Pendiente de firma de contrato"
  | "Contrato firmado"
  | "Pendiente de facturación"
  | "Divergencia de facturación"
  | "Pendiente de pago"
  | "Pago pendiente"
  | "Pago bloqueado por intentos"
  | "En conciliación"
  | "Pago en validación"
  | "Pago en verificación"
  | "Pago validado"
  | "Pago verificado"
  | "Cerrada por reversión"
  | "Aprobación final"
  | "Listo para aprobación final"
  | "Solicitud aprobada — habilitación técnica pendiente"
  | "Habilitación técnica"
  | "Acceso habilitado"
  | "Acceso generado"
  | "Acceso suspendido"
  | "Acceso revocado"
  | "Cerrada"
  | "Cerrada por vencimiento"
  | "Por asignar"
  | "Por revisar"
  | "Reenviada"
  | "Aprobada"
  | "Rechazada"
  | "Con observaciones"
  | "Pendiente de validación de pago"
  | "Creación de paquetes";

export type ModalidadAcceso = "API individual" | "API masiva" | "Ambas";

export type TipoElementoObservado =
  | "campo"
  | "finalidad"
  | "justificacion"
  | "modalidad"
  | "cupo"
  | "documento"
  | "general";

export interface ObservacionItem {
  id: string;
  tipo: TipoElementoObservado;
  elementoId?: string;
  elementoNombre?: string;
  descripcion: string;
  fecha: string;
  revisor: string;
  etapa: "Gestión" | "Normatividad" | "Protección de la Información (DPI)";
}

export interface AsignacionRegistro {
  id: string;
  director: string;
  revisorId: string;
  revisorNombre: string;
  fecha: string;
  versionExpediente: number;
  etapa: "Gestión" | "Normatividad";
  observacion?: string;
}

export interface InformeNormativa {
  numero?: string;
  titulo?: string;
  fechaEmision: string;
  dictamen?: "FAVORABLE" | "OBSERVADO";
  fundamento?: string;
  revisorNombre?: string;
  firmadoRevisor?: boolean;
  fechaFirmaRevisor?: string;
  directorNombre?: string;
  firmadoDirector?: boolean;
  fechaFirmaDirector?: string;
  archivoInforme?: string;
  cumple?: boolean;
  articulosAplicables?: string;
  observaciones?: string;
  emitidoPor?: string;
  firmaRevisor?: boolean;
  firmadoPorRevisorNombre?: string;
  firmaDirector?: boolean;
  firmadoPorDirectorNombre?: string;
}

export interface CredencialesAcceso {
  usuario: string;
  contrasena: string;
  endpoint: string;
  tipoAutenticacion?: string;
  ambiente?: string;
  fechaGeneracion?: string;
  fechaExpiracion?: string;
  camposAutorizados?: string[];
  esSecretoTemporal?: boolean;
  fechaSustitucionSecreto?: string;
  rotacionCount?: number;
  ultimaRotacionFecha?: string;
  ultimaRotacionMotivo?: string;
  alertaIncidenteSeguridad?: string;
  estadoApigee?: "ACTIVO" | "SUSPENDIDO" | "REVOCADO" | "ROTACION_FALLIDA";
  cupoAutorizadoVigente?: number;
  tipoPoliticaCupo?: "BLOQUEANTE_PRIVADA" | "REFERENCIA_ALERTA_PUBLICA";
}

export interface ContratoInteroperabilidad {
  id: string;
  numero: string;
  version: number;
  estado: "Borrador" | "Corrección pendiente" | "Pendiente de firmas" | "Firmado";
  fechaGeneracion: string;
  fechaEnvioFirmas?: string;
  firmadoCoordinador: boolean;
  fechaFirmaCoordinador?: string;
  coordinadorNombre: string;
  firmadoMaximaAutoridad: boolean;
  fechaFirmaMaximaAutoridad?: string;
  maximaAutoridadNombre: string;
  cantidadContratada: number;
  clausulas?: string;
  archivoPdf?: string;
  plantillaVersion?: string;
  historialVersiones?: {
    version: number;
    fecha: string;
    autor: string;
    cambios: string;
  }[];
}

export interface AprovisionamientoTecnico {
  estado: "PENDIENTE" | "ERROR" | "EXITOSO" | "SUSPENDIDO" | "REVOCADO";
  ultimoIntento?: string;
  reintentosCount: number;
  mensajeResultado?: string;
  referenciaTecnica?: string;
  fechaHabilitacion?: string;
  tipoFallo?: "HABILITACION_INICIAL" | "ROTACION_CREDENCIAL" | "ACTUALIZACION_ALCANCE" | "REVOCACION";
}

export interface PasarelaPagoInfo {
  ordenId: string;
  estadoPasarela: "PENDIENTE" | "CONFIRMADO" | "RECHAZADO" | "EXPIRADO" | "EN_CONCILIACION" | "BLOQUEADO_INTENTOS" | "REVERTIDO";
  intentosRealizados: number;
  maxIntentos: number;
  vigenciaOrdenMinutos: number;
  fechaCreacionOrden?: string;
  fechaConfirmacion?: string;
  referenciaTransaccion?: string;
  metodoPago?: string;
  montoConfirmado?: string;
  divergenciaDetalle?: string;
  desbloqueosAutorizados?: number;
  ultimoMotivoFallo?: string;
  motivoReversion?: string;
  fechaReversion?: string;
}

export interface SolicitudAcceso {
  id: string;
  institucion: string;
  tipoInstitucion: "Pública" | "Privada";
  coordinador: string;
  fecha: string; // Fecha de envío / radicación
  fechaAprobacion?: string;
  ultimaActualizacion: string;
  estado: SolicitudEstado;
  responsable: string;
  fuentesCount: number;
  camposCount: number;
  fuentePrincipal?: string;
  servicioPrincipal?: string;
  proyectoId?: string;
  proyectoCodigo?: string;
  proyectoNombre?: string;
  proyectoObjetivo?: string;
  justificacionGeneral?: string;
  documentoSustentoNombre?: string;
  solicitanteNombre?: string;
  solicitanteCargo?: string;
  trazabilidad?: { fecha: string; accion: string; actor: string; detalle?: string }[];
  modalidad?: ModalidadAcceso;
  cupo?: number;
  modalidadAprobada?: ModalidadAcceso;
  cupoAprobado?: number;
  versionExpediente?: number;
  revisorAsignado?: string;
  revisorAsignadoId?: string;
  fechaAsignacion?: string;
  historialAsignaciones?: AsignacionRegistro[];
  revisorNormativoAsignado?: string;
  revisorNormativoAsignadoId?: string;
  fechaAsignacionNormativa?: string;
  historialAsignacionesNormativa?: AsignacionRegistro[];
  observacionesEstructuradas?: ObservacionItem[];
  fechaLimiteSubsanacion?: string;
  diasRestantesSubsanacion?: number;
  detalleSubsanacion?: string;
  subsanable?: boolean;
  informeNormativa?: InformeNormativa;
  instrumento?: "Convenio" | "Contrato";
  contrato?: string;
  contratoDetalle?: ContratoInteroperabilidad;
  aprovisionamiento?: AprovisionamientoTecnico;
  integracionPendienteDetalle?: string;
  plantillaPendienteDetalle?: string;
  areaDevolucionFinal?: string;
  motivoRechazo?: string;
  observaciones?: string;
  fuentes: FuenteDetalle[];
  documentos: DocumentoSoporte[];
  informeJustificacion?: {
    nombre: string;
    tamano: string;
    fecha: string;
    firmadoPor: string;
  };
  factura?: {
    numero: string;
    fechaEmision: string;
    valor: string;
    estadoEmision?: "EMITIDA" | "PENDIENTE_EMISION" | "DIVERGENCIA_API";
    tipoEventoFacturable?: string;
    conceptoFacturable?: string;
    versionTarifaria?: string;
    cupoFacturado?: number;
    baseTarifaria?: string;
    descuentosAplicables?: string;
    impuestos?: string;
    modoRedondeo?: string;
    precisionDecimales?: number;
    errorApiDetalle?: string;
    detalleServicios?: { servicio: string; valor: string }[];
  };
  pasarelaPago?: PasarelaPagoInfo;
  cur?: {
    numeroCur: string;
    nombreArchivo: string;
    tamano: string;
    fechaRegistro: string;
    usuarioResponsable: string;
  };
  credenciales?: CredencialesAcceso;
  historial: TrazabilidadEvento[];
}

const STORAGE_KEY = "dinarp_solicitudes_v10";

export const INITIAL_SOLICITUDES: SolicitudAcceso[] = [
  {
    id: "SOL-2026-015",
    institucion: "Ministerio de Inclusión Económica y Social (MIES)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-25 08:15",
    ultimaActualizacion: "2026-09-25 08:40",
    estado: "Borrador",
    responsable: "Coordinador SINARP",
    versionExpediente: 1,
    modalidad: "API individual",
    cupo: 35000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Consulta de Datos de Identidad y Hogar",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Validación de identidad del jefe de hogar para focalización de bonos sociales."
          },
          {
            id: "cmp-02",
            nombre: "estadoCivil",
            descripcion: "Condición civil actual registrada formalmente ante el Estado.",
            clasificacion: "Confidencial",
            finalidad: "Verificación de composición familiar en subsidios de protección social.",
            fundamento: "Ley Orgánica de Protección de Datos Personales Art. 12 y Acuerdo Ministerial MIES-2026-014."
          }
        ]
      }
    ],
    documentos: [],
    historial: [
      {
        fecha: "2026-09-25 08:40",
        evento: "Solicitud guardada como borrador (SOL-01)",
        actor: "Andrea López (Coordinadora SINARP)",
        detalle: "Borrador guardado en el asistente antes de su envío formal a la Dirección de Gestión."
      }
    ]
  },
  {
    id: "SOL-2026-001",
    institucion: "Ministerio de Telecomunicaciones y de la Sociedad de la Información (MINTEL)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    fecha: "2026-09-20 09:00",
    fechaAprobacion: "2026-09-22",
    ultimaActualizacion: "2026-09-23 10:30",
    estado: "Acceso habilitado",
    responsable: "Coordinador SINARP",
    aprovisionamiento: {
      estado: "EXITOSO",
      reintentosCount: 0,
      fechaHabilitacion: "2026-09-23 10:30",
      mensajeResultado: "Aprovisionamiento automático exitoso en API Gateway DINARP."
    },
    fuentesCount: 1,
    camposCount: 3,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Validación de Identidad y Filiación",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Validación de identidad ciudadana para trámites digitales del Portal Único gob.ec."
          },
          {
            id: "cmp-02",
            nombre: "nombresCompletos",
            descripcion: "Nombres y apellidos completos del ciudadano.",
            clasificacion: "Accesible",
            finalidad: "Autocompletado seguro en servicios gubernamentales en línea."
          },
          {
            id: "cmp-03",
            nombre: "fechaNacimiento",
            descripcion: "Fecha oficial de nacimiento registrada en acta.",
            clasificacion: "Accesible",
            finalidad: "Comprobación de mayoría de edad para firma electrónica ciudadana."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-mintel-1",
        nombre: "Convenio_MINTEL_DINARP_2026.pdf",
        tipo: "PDF",
        tamano: "3.8 MB",
        fechaCarga: "2026-08-15 09:00",
        categoria: "Convenio Marco"
      }
    ],
    informeJustificacion: {
      nombre: "Informe_Aprobacion_MINTEL.pdf",
      tamano: "2.1 MB",
      fecha: "2026-08-20 14:00",
      firmadoPor: "Dr. Roberto Méndez (Aprobador)"
    },
    credenciales: {
      usuario: "ws_mintel_interop_01",
      contrasena: "Dinarp$ec2026_Mintel*K9",
      endpoint: "https://interoperabilidad.dinarp.gob.ec/api/v2/registro-civil/identidad",
      tipoAutenticacion: "OAuth 2.0 (Bearer Token)",
      ambiente: "Producción (Ambiente Seguro DINARP)",
      fechaGeneracion: "2026-08-25 10:30",
      fechaExpiracion: "2027-08-25 23:59 (Activa)",
      camposAutorizados: ["cedulaCiudadania", "nombresCompletos", "fechaNacimiento"],
      esSecretoTemporal: true,
      estadoApigee: "ACTIVO",
      cupoAutorizadoVigente: 100000,
      tipoPoliticaCupo: "REFERENCIA_ALERTA_PUBLICA"
    },
    historial: [
      { fecha: "2026-08-15 09:00", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-08-15 11:00", evento: "Enviada a revisión", actor: "Coordinador SINARP" },
      { fecha: "2026-08-16 10:00", evento: "En revisión", actor: "Aprobador" },
      { fecha: "2026-08-20 14:00", evento: "Aprobada", actor: "Aprobador", detalle: "Informe técnico de justificación aprobado y suscrito digitalmente." },
      { fecha: "2026-08-25 10:30", evento: "Acceso generado", actor: "Administrador DINARP", detalle: "Credenciales de interoperabilidad generadas y vinculadas al catálogo de campos autorizados." }
    ]
  },
  {
    id: "SOL-2026-006",
    institucion: "Ministerio de Salud Pública",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-22 09:30",
    ultimaActualizacion: "2026-09-22 11:00",
    estado: "Pendiente de asignación en Gestión",
    responsable: "Director de Gestión",
    modalidad: "Ambas",
    cupo: 50000,
    versionExpediente: 1,
    historialAsignaciones: [],
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Consulta de Identidad y Filiación",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "fechaNacimiento",
            descripcion: "Fecha oficial de nacimiento del ciudadano registrada en acta.",
            clasificacion: "Accesible",
            finalidad: "Validación de edad para asignación prioritaria de turnos médicos y programas de vacunación pediátrica."
          },
          {
            id: "cmp-02",
            nombre: "estadoCivil",
            descripcion: "Condición civil actual registrada formalmente ante el Estado.",
            clasificacion: "Confidencial",
            finalidad: "Verificación de beneficiarios en cobertura de programas de salud familiar y maternidad asistida.",
            fundamento: "Art. 12 Ley Orgánica de Protección de Datos Personales, en concordancia con el Código de la Niñez y la Familia."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-1",
        nombre: "Oficio_Solicitud_Interoperabilidad_MSP_2026.pdf",
        tipo: "PDF",
        tamano: "2.4 MB",
        fechaCarga: "2026-09-22 09:30",
        categoria: "Oficio Formal"
      },
      {
        id: "doc-2",
        nombre: "Designacion_Coordinador_Interoperabilidad.pdf",
        tipo: "PDF",
        tamano: "1.1 MB",
        fechaCarga: "2026-09-22 09:35",
        categoria: "Acreditación Institucional"
      }
    ],
    historial: [
      { fecha: "2026-09-22 09:30", evento: "Solicitud creada", actor: "Coordinador SINARP", detalle: "Registro formal de requerimiento de interoperabilidad con 2 campos solicitados." },
      { fecha: "2026-09-22 10:15", evento: "Enviada a revisión", actor: "Coordinador SINARP", detalle: "Expediente formal remitido para dictamen técnico y legal." },
      { fecha: "2026-09-22 11:00", evento: "Pendiente de asignación en Gestión", actor: "Director de Gestión", detalle: "Expediente disponible en la bandeja exclusiva de asignación de Gestión." }
    ]
  },
  {
    id: "SOL-2026-007",
    institucion: "Instituto Ecuatoriano de Seguridad Social (IESS)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-21 14:00",
    ultimaActualizacion: "2026-09-23 08:45",
    estado: "Pendiente de nueva asignación",
    responsable: "Director de Gestión",
    modalidad: "API individual",
    cupo: 30000,
    versionExpediente: 2,
    detalleSubsanacion: "Se aclaró el fundamento legal específico del Art. 89 para el campo confidencial conforme a la observación recibida.",
    historialAsignaciones: [
      {
        id: "asig-prev-1",
        director: "Director Gestión",
        revisorId: "U-EQGEST",
        revisorNombre: "Ana Torres (Revisor)",
        fecha: "2026-09-21 15:00",
        versionExpediente: 1,
        etapa: "Gestión"
      }
    ],
    fuentesCount: 1,
    camposCount: 3,
    fuentePrincipal: "Registro Único de Contribuyentes (RUC)",
    servicioPrincipal: "Consulta de Estado Tributario Patronal",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-002",
        nombre: "Registro Único de Contribuyentes (RUC)",
        institucion: "Servicio de Rentas Internas",
        campos: [
          {
            id: "cmp-03",
            nombre: "estadoContribuyente",
            descripcion: "Estado de actividad tributaria (Activo, Pasivo, Suspendido).",
            clasificacion: "Accesible",
            finalidad: "Constatar la condición activa de los empleadores para cruce de aportaciones y aportes patronales."
          },
          {
            id: "cmp-04",
            nombre: "actividadEconomicaPrincipal",
            descripcion: "Código y descripción de la actividad comercial principal registrada.",
            clasificacion: "Accesible",
            finalidad: "Clasificación de riesgo laboral por actividad patronal."
          },
          {
            id: "cmp-05",
            nombre: "representanteLegalIdentificacion",
            descripcion: "Cédula o pasaporte del representante legal principal.",
            clasificacion: "Confidencial",
            finalidad: "Notificación de coactivas y formalización de convenios de purga de mora patronal.",
            fundamento: "Ley de Seguridad Social Art. 89 y Ley Orgánica de Protección de Datos Personales Disposición General Tercera."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-3",
        nombre: "Oficio_IESS_Interoperabilidad_SRI.pdf",
        tipo: "PDF",
        tamano: "3.2 MB",
        fechaCarga: "2026-09-21 14:00",
        categoria: "Oficio Formal"
      },
      {
        id: "doc-4",
        nombre: "Memoria_Tecnica_Subsanada_v2.pdf",
        tipo: "PDF",
        tamano: "1.8 MB",
        fechaCarga: "2026-09-23 08:30",
        categoria: "Subsanación de Inconsistencias"
      }
    ],
    motivoRechazo: "Se requirió fundamentar específicamente el campo confidencial con base en el Art. 89 de la Ley de Seguridad Social.",
    observaciones: "Se aclaró el fundamento legal específico del Art. 89 de la Ley de Seguridad Social para el campo confidencial conforme a la observación previa del Aprobador.",
    historial: [
      { fecha: "2026-09-21 14:00", evento: "Solicitud creada", actor: "Coordinador SINARP", detalle: "Registro inicial de solicitud institucional." },
      { fecha: "2026-09-21 14:20", evento: "Enviada a revisión", actor: "Coordinador SINARP" },
      { fecha: "2026-09-21 15:00", evento: "Revisor de Gestión asignado", actor: "Director Gestión", detalle: "Asignado a Ana Torres para revisión funcional v1." },
      { fecha: "2026-09-22 09:10", evento: "Solicitud observada por Gestión", actor: "Ana Torres (Revisor)", detalle: "Se requirió fundamentar específicamente el campo confidencial con base legal vigente." },
      { fecha: "2026-09-23 08:45", evento: "Solicitud subsanada y reenviada (v2)", actor: "Coordinador SINARP", detalle: "Se adjuntó Memoria Técnica v2 y aclaración de fundamento legal. Reingreso para dictamen." },
      { fecha: "2026-09-23 08:45", evento: "Pendiente de nueva asignación", actor: "Director de Gestión", detalle: "Vuelve a la bandeja de asignación para que el Director asigne revisor (no va directo al anterior)." }
    ]
  },
  {
    id: "SOL-2026-008",
    institucion: "Ministerio de Educación",
    tipoInstitucion: "Pública",
    coordinador: "Mariana Almeida",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-24 10:00",
    ultimaActualizacion: "2026-09-24 11:30",
    estado: "Asignada a revisión de Gestión",
    responsable: "Ana Torres (Revisor)",
    revisorAsignado: "Ana Torres (Revisor)",
    revisorAsignadoId: "U-EQGEST",
    fechaAsignacion: "2026-09-24 11:30",
    modalidad: "Ambas",
    cupo: 75000,
    versionExpediente: 1,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Validación de Identidad y Filiación",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Validación obligatoria de identidad de los postulantes escolares en el proceso de matrícula."
          },
          {
            id: "cmp-02",
            nombre: "lugarNacimiento",
            descripcion: "Provincia, cantón y parroquia de nacimiento según registro civil.",
            clasificacion: "Confidencial",
            finalidad: "Determinación de asignación de cupos por territorialidad y pertinencia intercultural bilingüe.",
            fundamento: "Ley Orgánica de Educación Intercultural Art. 47 y Ley Orgánica de Protección de Datos Personales Art. 12."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-008-1",
        nombre: "Oficio_MinEduc_Matriculas_2026.pdf",
        tipo: "PDF",
        tamano: "2.1 MB",
        fechaCarga: "2026-09-24 10:00",
        categoria: "Oficio Formal"
      }
    ],
    historialAsignaciones: [
      {
        id: "asig-008",
        director: "Director Gestión",
        revisorId: "U-EQGEST",
        revisorNombre: "Ana Torres (Revisor)",
        fecha: "2026-09-24 11:30",
        versionExpediente: 1,
        etapa: "Gestión"
      }
    ],
    historial: [
      { fecha: "2026-09-24 10:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP", detalle: "Expediente radicado para acceso a Registro Civil." },
      { fecha: "2026-09-24 11:30", evento: "Revisor de Gestión asignado", actor: "Director Gestión", detalle: "Asignado a Ana Torres para revisión técnica y funcional." }
    ]
  },
  {
    id: "SOL-2026-009",
    institucion: "Servicio de Rentas Internas",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-23 08:00",
    ultimaActualizacion: "2026-09-24 14:00",
    estado: "Requiere corrección",
    responsable: "Coordinador SINARP",
    versionExpediente: 1,
    modalidad: "API masiva",
    cupo: 120000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Consulta de Datos Registrales",
    instrumento: "Convenio",
    fechaLimiteSubsanacion: "2026-09-29",
    diasRestantesSubsanacion: 3,
    observacionesEstructuradas: [
      {
        id: "obs-1",
        tipo: "campo",
        elementoId: "cmp-02",
        elementoNombre: "estadoCivil",
        descripcion: "La finalidad indicada no explica por qué este dato es necesario para el proyecto educativo.",
        fecha: "2026-09-24 14:00",
        revisor: "Ana Torres (Revisor)",
        etapa: "Gestión"
      },
      {
        id: "obs-2",
        tipo: "cupo",
        elementoNombre: "Cupo solicitado",
        descripcion: "El cupo de 120,000 registros excede la estimación del proyecto. Se sugiere ajustar a máximo 50,000 registros.",
        fecha: "2026-09-24 14:00",
        revisor: "Ana Torres (Revisor)",
        etapa: "Gestión"
      }
    ],
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Validación de identidad para cruce de información tributaria."
          },
          {
            id: "cmp-02",
            nombre: "estadoCivil",
            descripcion: "Condición civil registrada ante el Estado.",
            clasificacion: "Confidencial",
            finalidad: "Cruce fiscal general sin detalle de vinculación.",
            fundamento: "Código Tributario Art. 96."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-009-1",
        nombre: "Oficio_SRI_Solicitud_RC.pdf",
        tipo: "PDF",
        tamano: "1.5 MB",
        fechaCarga: "2026-09-23 08:00",
        categoria: "Oficio Formal"
      }
    ],
    historial: [
      { fecha: "2026-09-23 08:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-23 10:00", evento: "Revisor asignado", actor: "Director Gestión", detalle: "Asignado a Ana Torres." },
      { fecha: "2026-09-24 14:00", evento: "Solicitud observada por Gestión (SOL-04 / SOL-06)", actor: "Ana Torres (Revisor)", detalle: "Se registraron 2 observaciones en finalidad de estado civil y cupo solicitado. Plazo inicial de 3 días hábiles (parametrizable según PAR-13 y calendario laboral PAR-10)." }
    ]
  },
  {
    id: "SOL-2026-011",
    institucion: "Agencia Nacional de Tránsito",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-08-10 09:00",
    ultimaActualizacion: "2026-08-25 18:00",
    estado: "Cerrada por vencimiento",
    responsable: "Coordinador SINARP",
    versionExpediente: 1,
    modalidad: "API individual",
    cupo: 15000,
    fuentesCount: 1,
    camposCount: 1,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Consulta de Licencias",
    instrumento: "Convenio",
    fechaLimiteSubsanacion: "2026-08-15",
    diasRestantesSubsanacion: 0,
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Validación para emisión de turnos de licencias."
          }
        ]
      }
    ],
    documentos: [],
    historial: [
      { fecha: "2026-08-10 09:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-08-12 11:00", evento: "Solicitud observada", actor: "Ana Torres (Revisor)", detalle: "Documento de soporte desactualizado. Plazo inicial de 3 días hábiles (PAR-13 / PAR-10)." },
      { fecha: "2026-08-25 18:00", evento: "Expediente cerrado por vencimiento de plazo (SOL-06)", actor: "Sistema DINARP", detalle: "El plazo de subsanación (3 días hábiles según PAR-13) venció sin que el Coordinador reenviara las correcciones requeridas. Se archiva el trámite." }
    ]
  },
  {
    id: "SOL-2026-012",
    institucion: "Ministerio de Salud Pública",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-20 08:30",
    ultimaActualizacion: "2026-09-23 16:00",
    estado: "Pendiente de asignación en Normatividad",
    responsable: "Director de Protección de la Información (DPI)",
    versionExpediente: 1,
    modalidad: "Ambas",
    cupo: 60000,
    modalidadAprobada: "Ambas",
    cupoAprobado: 60000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Validación de Nacimiento y Filiación",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "fechaNacimiento",
            descripcion: "Fecha oficial de nacimiento registrada en acta.",
            clasificacion: "Accesible",
            finalidad: "Validación de esquemas de vacunación por grupos etarios."
          },
          {
            id: "cmp-02",
            nombre: "datosMadrePadre",
            descripcion: "Filiación materna y paterna registrada en acta de nacimiento.",
            clasificacion: "Confidencial",
            finalidad: "Filiación legal para consentimiento informado en atención hospitalaria pediátrica.",
            fundamento: "Código de la Niñez Art. 21 y LOPDP Art. 12 numeral 4."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-012-1",
        nombre: "Oficio_MSP_PoblacionInfantil_2026.pdf",
        tipo: "PDF",
        tamano: "2.8 MB",
        fechaCarga: "2026-09-20 08:30",
        categoria: "Oficio Formal"
      }
    ],
    historial: [
      { fecha: "2026-09-20 08:30", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-21 10:00", evento: "Revisor de Gestión asignado", actor: "Director Gestión", detalle: "Asignado a Marcos Silva." },
      { fecha: "2026-09-23 16:00", evento: "Aprobada por Gestión", actor: "Marcos Silva (Revisor)", detalle: "Aprobación funcional emitida. Contiene campos confidenciales: remitida a la Dirección de Protección de la Información (DPI)." }
    ]
  },
  {
    id: "SOL-2026-013",
    institucion: "Ministerio de Gobierno",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-19 11:00",
    ultimaActualizacion: "2026-09-24 09:30",
    estado: "En revisión normativa",
    responsable: "Carlos Mora (Revisor DPI)",
    revisorNormativoAsignado: "Carlos Mora (Revisor DPI)",
    revisorNormativoAsignadoId: "U-EQNORM",
    fechaAsignacionNormativa: "2026-09-24 09:30",
    versionExpediente: 1,
    modalidad: "API individual",
    cupo: 40000,
    modalidadAprobada: "API individual",
    cupoAprobado: 40000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Identificación Ciudadana",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Cédula de identidad.",
            clasificacion: "Accesible",
            finalidad: "Validación de ciudadanías en proyectos de gobernanza."
          },
          {
            id: "cmp-02",
            nombre: "huellaDactilarHash",
            descripcion: "Código hash de cotejo dactiloscópico biométrico.",
            clasificacion: "Confidencial",
            finalidad: "Seguridad y cotejo en accesos biométricos de alta seguridad.",
            fundamento: "Ley de Seguridad Pública del Estado Art. 14 y LOPDP Art. 25."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-013-1",
        nombre: "Oficio_MinGobierno_Seguridad_2026.pdf",
        tipo: "PDF",
        tamano: "3.1 MB",
        fechaCarga: "2026-09-19 11:00",
        categoria: "Oficio Formal"
      }
    ],
    historial: [
      { fecha: "2026-09-19 11:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-21 14:00", evento: "Aprobada por Gestión", actor: "Elena Viteri (Revisor)", detalle: "Aprobación funcional emitida." },
      { fecha: "2026-09-24 09:30", evento: "Revisor de Protección de la Información (DPI) asignado", actor: "Director de Protección de la Información (DPI)", detalle: "Asignado a Carlos Mora para evaluación de sustento jurídico y emisión de informe DPI (SOL-07)." }
    ]
  },
  {
    id: "SOL-2026-016",
    institucion: "Fiscalía General del Estado (FGE)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-20 09:00",
    ultimaActualizacion: "2026-09-24 14:30",
    estado: "En revisión normativa",
    responsable: "Dra. Valentina Paz (Directora DPI)",
    revisorNormativoAsignado: "Carlos Mora (Revisor DPI)",
    revisorNormativoAsignadoId: "U-EQNORM",
    fechaAsignacionNormativa: "2026-09-23 11:00",
    versionExpediente: 1,
    modalidad: "API individual",
    cupo: 55000,
    modalidadAprobada: "API individual",
    cupoAprobado: 55000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Consulta de Filiación y Datos Registrales",
    instrumento: "Convenio",
    informeNormativa: {
      numero: "INF-DPI-2026-016",
      titulo: "Informe de Pertinencia Jurídica de Campos Confidenciales (DPI)",
      fechaEmision: "2026-09-24 14:30",
      dictamen: "FAVORABLE",
      fundamento: "Se valida el sustento jurídico conforme al Art. 195 de la Constitución de la República y Art. 12 de la LOPDP para acceso a campos confidenciales solicitados.",
      revisorNombre: "Carlos Mora (Revisor DPI)",
      firmadoRevisor: true,
      fechaFirmaRevisor: "2026-09-24 14:30",
      directorNombre: "Dra. Valentina Paz (Directora DPI)",
      firmadoDirector: false,
      archivoInforme: "Informe_Favorable_DPI_SOL-2026-016.pdf"
    },
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula.",
            clasificacion: "Accesible",
            finalidad: "Identificación de sujetos procesales en investigaciones previas."
          },
          {
            id: "cmp-02",
            nombre: "estadoCivil",
            descripcion: "Condición civil registrada formalmente.",
            clasificacion: "Confidencial",
            finalidad: "Determinación de vínculos de afinidad y parentesco legal en actuaciones fiscales.",
            fundamento: "Constitución Art. 195, COIP Art. 444 y LOPDP Art. 12."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-016-1",
        nombre: "Oficio_FGE_Interoperabilidad_2026.pdf",
        tipo: "PDF",
        tamano: "2.3 MB",
        fechaCarga: "2026-09-20 09:00",
        categoria: "Oficio Formal"
      }
    ],
    historial: [
      { fecha: "2026-09-20 09:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-22 10:30", evento: "Aprobada por Gestión", actor: "Ana Torres (Revisor)", detalle: "Aprobación funcional emitida. Derivada a Dirección de Protección de la Información (DPI)." },
      { fecha: "2026-09-23 11:00", evento: "Revisor DPI asignado", actor: "Dra. Valentina Paz (Directora DPI)", detalle: "Asignado a Carlos Mora (Revisor DPI)." },
      { fecha: "2026-09-24 14:30", evento: "Informe de Aprobación DPI emitido y firmado por Revisor (SOL-08)", actor: "Carlos Mora (Revisor DPI)", detalle: "Informe INF-DPI-2026-016 suscrito por Revisor DPI. Pendiente de firma electrónica de la Directora de Protección de la Información (DPI)." }
    ]
  },
  {
    id: "SOL-2026-017",
    institucion: "Contraloría General del Estado (CGE)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-18 10:00",
    fechaAprobacion: "2026-09-24",
    ultimaActualizacion: "2026-09-24 17:00",
    estado: "Aprobada por Normatividad",
    responsable: "Coordinador SINARP",
    revisorNormativoAsignado: "Carlos Mora (Revisor DPI)",
    revisorNormativoAsignadoId: "U-EQNORM",
    fechaAsignacionNormativa: "2026-09-21 09:00",
    versionExpediente: 1,
    modalidad: "Ambas",
    cupo: 90000,
    modalidadAprobada: "Ambas",
    cupoAprobado: 90000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Único de Contribuyentes (RUC)",
    servicioPrincipal: "Verificación Patrimonial y Societaria",
    instrumento: "Convenio",
    informeNormativa: {
      numero: "INF-DPI-2026-017",
      titulo: "Informe de Aprobación de Protección de la Información (DPI)",
      fechaEmision: "2026-09-23 15:00",
      dictamen: "FAVORABLE",
      fundamento: "Cumple con los principios de legalidad, finalidad y proporcionalidad de la LOPDP y Ley Orgánica de la Contraloría General del Estado Art. 31.",
      revisorNombre: "Carlos Mora (Revisor DPI)",
      firmadoRevisor: true,
      fechaFirmaRevisor: "2026-09-23 15:00",
      directorNombre: "Dra. Valentina Paz (Directora DPI)",
      firmadoDirector: true,
      fechaFirmaDirector: "2026-09-24 17:00",
      archivoInforme: "Informe_Aprobacion_DPI_SOL-2026-017_Firmado.pdf"
    },
    fuentes: [
      {
        id: "FNT-002",
        nombre: "Registro Único de Contribuyentes (RUC)",
        institucion: "Servicio de Rentas Internas",
        campos: [
          {
            id: "cmp-01",
            nombre: "estadoContribuyente",
            descripcion: "Estado de actividad tributaria.",
            clasificacion: "Accesible",
            finalidad: "Control de proveedores del Estado."
          },
          {
            id: "cmp-02",
            nombre: "representanteLegalIdentificacion",
            descripcion: "Identificación del representante legal.",
            clasificacion: "Confidencial",
            finalidad: "Auditoría de declaraciones patrimoniales juradas y cruce de nepotismo.",
            fundamento: "Ley Orgánica de la Contraloría General del Estado Art. 31 y LOPDP Art. 12."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-017-1",
        nombre: "Oficio_CGE_ControlPatrimonial_2026.pdf",
        tipo: "PDF",
        tamano: "2.9 MB",
        fechaCarga: "2026-09-18 10:00",
        categoria: "Oficio Formal"
      }
    ],
    historial: [
      { fecha: "2026-09-18 10:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-20 11:00", evento: "Aprobada por Gestión", actor: "Ana Torres (Revisor)" },
      { fecha: "2026-09-23 15:00", evento: "Informe DPI firmado por Revisor (SOL-08)", actor: "Carlos Mora (Revisor DPI)" },
      { fecha: "2026-09-24 17:00", evento: "Aprobada por Protección de la Información (DPI) y lista para formalización (SOL-08)", actor: "Dra. Valentina Paz (Directora DPI)", detalle: "Doble firma electrónica completada sobre el informe INF-DPI-2026-017. La solicitud avanza a formalización (BN-08)." }
    ]
  },
  {
    id: "SOL-2026-014",
    institucion: "Secretaría de Educación Superior (SENESCYT)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-001",
    proyectoNombre: "Sistema Único de Registro y Matrícula Estudiantil",
    fecha: "2026-09-22 14:00",
    ultimaActualizacion: "2026-09-24 16:00",
    estado: "Aprobada por Gestión",
    responsable: "Coordinador SINARP",
    versionExpediente: 1,
    modalidad: "API individual",
    cupo: 25000,
    modalidadAprobada: "API individual",
    cupoAprobado: 25000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Verificación de Títulos y Datos Civiles",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula.",
            clasificacion: "Accesible",
            finalidad: "Validación para registro nacional de cupos universitarios."
          },
          {
            id: "cmp-02",
            nombre: "nombresCompletos",
            descripcion: "Nombres y apellidos completos.",
            clasificacion: "Accesible",
            finalidad: "Emisión de comprobante de asignación académica oficial."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-014-1",
        nombre: "Oficio_SENESCYT_Admision2026.pdf",
        tipo: "PDF",
        tamano: "1.9 MB",
        fechaCarga: "2026-09-22 14:00",
        categoria: "Oficio Formal"
      }
    ],
    historial: [
      { fecha: "2026-09-22 14:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-23 10:00", evento: "Revisor asignado", actor: "Director Gestión", detalle: "Asignado a Ana Torres." },
      { fecha: "2026-09-24 16:00", evento: "Aprobada por Gestión", actor: "Ana Torres (Revisor)", detalle: "Aprobada. Solo contiene campos accesibles: continúa directamente a formalización pública." }
    ]
  },
  {
    id: "SOL-2026-002",
    institucion: "Ministerio de Inclusión Económica y Social (MIES)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    fecha: "2026-09-18 11:30",
    ultimaActualizacion: "2026-09-19 15:40",
    estado: "Rechazada",
    responsable: "Coordinador SINARP",
    fuentesCount: 1,
    camposCount: 1,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Ficha de Parentesco y Tutela",
    instrumento: "Convenio",
    motivoRechazo: "Falta adjuntar el respaldo de la finalidad de uso para datos de menores de edad y actualizar la resolución de delegación institucional vigente.",
    observaciones: "Falta adjuntar el respaldo de la finalidad de uso para datos de menores de edad y actualizar la resolución de delegación institucional vigente.",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-07",
            nombre: "actaNacimientoTomo",
            descripcion: "Tomo y folio del acta de nacimiento.",
            clasificacion: "Confidencial",
            finalidad: "Validación de tutela legal para subsidio infantil.",
            fundamento: "Código de la Niñez y Adolescencia."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-6",
        nombre: "Expediente_MIES_002.pdf",
        tipo: "PDF",
        tamano: "2.1 MB",
        fechaCarga: "2026-09-18 11:30",
        categoria: "Oficio Formal"
      }
    ],
    historial: [
      { fecha: "2026-09-18 11:30", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-18 12:00", evento: "Enviada a revisión", actor: "Coordinador SINARP" },
      { fecha: "2026-09-19 10:00", evento: "En revisión", actor: "Aprobador" },
      { fecha: "2026-09-19 15:40", evento: "Solicitud rechazada con observaciones", actor: "Aprobador", detalle: "Inconsistencias detectadas: Falta adjuntar el respaldo de la finalidad de uso para datos de menores de edad y actualizar la resolución de delegación institucional vigente." }
    ]
  },
  {
    id: "SOL-2026-004",
    institucion: "Ministerio de Educación",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    fecha: "2026-09-01 10:00",
    fechaAprobacion: "2026-09-05",
    ultimaActualizacion: "2026-09-05 16:30",
    estado: "Aprobada",
    responsable: "Coordinador SINARP",
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Validación de Matrículas Escolares",
    instrumento: "Convenio",
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-06",
            nombre: "nombresCompletos",
            descripcion: "Nombres y apellidos completos.",
            clasificacion: "Accesible",
            finalidad: "Asignación de cupos estudiantiles en el régimen Costa y Sierra."
          },
          {
            id: "cmp-08",
            nombre: "fechaNacimiento",
            descripcion: "Fecha oficial de nacimiento.",
            clasificacion: "Accesible",
            finalidad: "Verificación de edad mínima para ingreso a Educación Inicial."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-5",
        nombre: "Convenio_MinEduc_DINARP_2026.pdf",
        tipo: "PDF",
        tamano: "4.1 MB",
        fechaCarga: "2026-09-01 10:00",
        categoria: "Convenio Marco"
      }
    ],
    informeJustificacion: {
      nombre: "Informe_Tecnico_Justificacion_Aprobado.pdf",
      tamano: "3.4 MB",
      fecha: "2026-09-05 16:30",
      firmadoPor: "Dr. Roberto Méndez (Aprobador)"
    },
    historial: [
      { fecha: "2026-09-01 10:00", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-01 11:30", evento: "Enviada a revisión", actor: "Coordinador SINARP" },
      { fecha: "2026-09-02 09:00", evento: "En revisión", actor: "Aprobador" },
      { fecha: "2026-09-05 16:30", evento: "Aprobada", actor: "Aprobador", detalle: "Informe de justificación firmado digitalmente. Continuación de habilitación de fuente mediante Convenio interinstitucional (sin componente de pago)." }
    ]
  },
  {
    id: "SOL-2026-005",
    institucion: "Banco Pichincha C.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    fecha: "2026-09-19 14:00",
    fechaAprobacion: "2026-09-21",
    ultimaActualizacion: "2026-09-22 08:30",
    estado: "Pendiente de pago",
    responsable: "Coordinador SINARP",
    fuentesCount: 2,
    camposCount: 2,
    fuentePrincipal: "Servicio de Rentas Internas / Buró",
    servicioPrincipal: "Validación Tributaria y Score Financiero",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0019",
    contratoDetalle: {
      id: "CONTR-2026-0019",
      numero: "CONTR-2026-0019",
      version: 1,
      estado: "Firmado",
      fechaGeneracion: "2026-09-20 10:00",
      fechaEnvioFirmas: "2026-09-20 11:30",
      firmadoCoordinador: true,
      fechaFirmaCoordinador: "2026-09-21 09:15",
      coordinadorNombre: "Andrea López (Coordinadora SINARP)",
      firmadoMaximaAutoridad: true,
      fechaFirmaMaximaAutoridad: "2026-09-21 16:40",
      maximaAutoridadNombre: "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)",
      cantidadContratada: 50000,
      clausulas: "Cláusula Primera: Objeto del Intercambio de Información Tributaria y Validación Financiera. Cláusula Segunda: Tarifas aprobadas y recaudación según ordenanza institucional.",
      historialVersiones: [
        {
          version: 1,
          fecha: "2026-09-20 10:00",
          autor: "Abg. Santiago Valdivieso (Jurídica)",
          cambios: "Generación de contrato formal para entidad financiera privada"
        }
      ]
    },
    factura: {
      numero: "FAC-2026-0028",
      fechaEmision: "2026-09-22",
      valor: "$ 150.00",
      estadoEmision: "EMITIDA",
      tipoEventoFacturable: "contrato_inicial",
      conceptoFacturable: "TAR-PRIV-001 (Paquete Base Interoperabilidad 50,000 consultas)",
      versionTarifaria: "TAR-2026-V2 (Vigente)",
      cupoFacturado: 50000,
      baseTarifaria: "$ 150.00",
      descuentosAplicables: "$ 0.00",
      impuestos: "$ 0.00 (Tasa administrativa exenta)",
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      detalleServicios: [
        { servicio: "estadoContribuyente (SRI) — Tramo 50,000 consultas", valor: "$ 50.00" },
        { servicio: "historialCrediticio (Buró) — Tramo 50,000 consultas", valor: "$ 100.00" }
      ]
    },
    pasarelaPago: {
      ordenId: "ORD-PAG-2026-0028",
      estadoPasarela: "PENDIENTE",
      intentosRealizados: 1,
      maxIntentos: 3,
      vigenciaOrdenMinutos: 45,
      fechaCreacionOrden: "2026-09-22 08:30",
      ultimoMotivoFallo: "Intento #1 rechazado por entidad emisora (Fondos insuficientes / Límite diario)"
    },
    fuentes: [
      {
        id: "FNT-002",
        nombre: "Registro Único de Contribuyentes (RUC)",
        institucion: "SRI",
        campos: [
          {
            id: "cmp-09",
            nombre: "estadoContribuyente",
            descripcion: "Estado de actividad tributaria.",
            clasificacion: "Accesible",
            finalidad: "Validación de solvencia crediticia y apertura de cuentas corrientes."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-bp-1",
        nombre: "Contrato_Prestacion_Interoperabilidad_BP.pdf",
        tipo: "PDF",
        tamano: "2.8 MB",
        fechaCarga: "2026-09-19 14:00",
        categoria: "Contrato Privado"
      }
    ],
    informeJustificacion: {
      nombre: "Informe_Aprobacion_BancoPichincha.pdf",
      tamano: "2.5 MB",
      fecha: "2026-09-21 16:00",
      firmadoPor: "Dr. Roberto Méndez (Aprobador)"
    },
    historial: [
      { fecha: "2026-09-19 14:00", evento: "Solicitud creada", actor: "Coordinador SINARP", detalle: "Registro de solicitud para institución privada sujeta a tarifa de interoperabilidad." },
      { fecha: "2026-09-20 09:15", evento: "Enviada a revisión", actor: "Coordinador SINARP" },
      { fecha: "2026-09-20 11:30", evento: "En revisión", actor: "Aprobador" },
      { fecha: "2026-09-21 16:00", evento: "Aprobada", actor: "Aprobador", detalle: "Aprobación jurídica y técnica confirmada. Instrumento: Contrato CONTR-2026-0019." },
      { fecha: "2026-09-22 08:30", evento: "Factura electrónica emitida automáticamente (FAC-01)", actor: "Motor Tarifario + API Facturación DINARP", detalle: "Generación automática de factura FAC-2026-0028 por valor de $ 150.00 según versión tarifaria TAR-2026-V2. Orden de pasarela ORD-PAG-2026-0028 habilitada." }
    ]
  },
  {
    id: "SOL-2026-018",
    institucion: "Produbanco S.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    fecha: "2026-09-17 08:30",
    fechaAprobacion: "2026-09-20",
    ultimaActualizacion: "2026-09-23 08:00",
    estado: "Pago verificado",
    responsable: "Director de Gestión",
    cupo: 100000,
    cupoAprobado: 100000,
    modalidad: "API individual",
    modalidadAprobada: "API individual",
    fuentesCount: 2,
    camposCount: 3,
    fuentePrincipal: "Registro Civil / SRI",
    servicioPrincipal: "Consulta de Datos Identidad y Capacidad Legal",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0022",
    contratoDetalle: {
      id: "CONTR-2026-0022",
      numero: "CONTR-2026-0022",
      version: 1,
      estado: "Firmado",
      fechaGeneracion: "2026-09-19 10:00",
      fechaEnvioFirmas: "2026-09-19 11:30",
      firmadoCoordinador: true,
      fechaFirmaCoordinador: "2026-09-20 09:15",
      coordinadorNombre: "Andrea López (Coordinadora SINARP)",
      firmadoMaximaAutoridad: true,
      fechaFirmaMaximaAutoridad: "2026-09-20 11:40",
      maximaAutoridadNombre: "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)",
      cantidadContratada: 100000,
      clausulas: "Cláusula Primera: Objeto del Intercambio de Información de Identidad y Capacidad Legal. Cláusula Segunda: Tarifario vigente TAR-2026-V2."
    },
    factura: {
      numero: "FAC-2026-0031",
      fechaEmision: "2026-09-20",
      valor: "$ 280.00",
      estadoEmision: "EMITIDA",
      tipoEventoFacturable: "contrato_inicial",
      conceptoFacturable: "TAR-PRIV-002 (Paquete Corporativo 100,000 consultas)",
      versionTarifaria: "TAR-2026-V2 (Vigente)",
      cupoFacturado: 100000,
      baseTarifaria: "$ 280.00",
      descuentosAplicables: "$ 0.00",
      impuestos: "$ 0.00 (Tasa exenta)",
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      detalleServicios: [
        { servicio: "datosIdentidad (Registro Civil)", valor: "$ 140.00" },
        { servicio: "estadoContribuyente (SRI)", valor: "$ 140.00" }
      ]
    },
    pasarelaPago: {
      ordenId: "ORD-PAG-2026-0031",
      estadoPasarela: "CONFIRMADO",
      intentosRealizados: 1,
      maxIntentos: 3,
      vigenciaOrdenMinutos: 45,
      fechaCreacionOrden: "2026-09-20 12:45",
      fechaConfirmacion: "2026-09-22 16:30",
      referenciaTransaccion: "TX-PASARELA-884920",
      metodoPago: "Pasarela Electrónica Institucional (Débito Corporativo)",
      montoConfirmado: "$ 280.00"
    },
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-10",
            nombre: "nombresCompletos",
            descripcion: "Identidad del titular.",
            clasificacion: "Accesible",
            finalidad: "Onboarding digital de clientes bancarios."
          },
          {
            id: "cmp-11",
            nombre: "estadoCivil",
            descripcion: "Estado civil registrado.",
            clasificacion: "Confidencial",
            finalidad: "Validación de cónyuge para créditos hipotecarios mancomunados.",
            fundamento: "Ley de Instituciones del Sistema Financiero Art. 54."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-pdb-1",
        nombre: "Contrato_Servicios_Produbanco.pdf",
        tipo: "PDF",
        tamano: "3.1 MB",
        fechaCarga: "2026-09-17 08:30",
        categoria: "Contrato Privado"
      }
    ],
    informeJustificacion: {
      nombre: "Informe_Tecnico_Produbanco_Aprobado.pdf",
      tamano: "2.1 MB",
      fecha: "2026-09-20 12:30",
      firmadoPor: "Dr. Roberto Méndez (Aprobador)"
    },
    historial: [
      { fecha: "2026-09-17 08:30", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-18 09:00", evento: "Aprobada por Gestión y Normatividad", actor: "Revisión DINARP" },
      { fecha: "2026-09-20 11:40", evento: "Contrato firmado por ambas partes (DOC-02)", actor: "Coordinador / Máxima Autoridad", detalle: "Contrato CONTR-2026-0022 perfeccionado." },
      { fecha: "2026-09-20 12:45", evento: "Factura emitida automáticamente (FAC-01)", actor: "API Facturación Electrónica", detalle: "Factura FAC-2026-0031 emitida por $ 280.00 según versión tarifaria TAR-2026-V2." },
      { fecha: "2026-09-22 16:30", evento: "Pago confirmado en pasarela electrónica (PAG-02)", actor: "Pasarela de Pagos DINARP", detalle: "Webhook firmado verificado. Transacción TX-PASARELA-884920 por $ 280.00. Expediente listo para aprobación final (SOL-10)." }
    ]
  },
  {
    id: "SOL-2026-019",
    institucion: "Banco Guayaquil S.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    fecha: "2026-09-15 09:30",
    fechaAprobacion: "2026-09-18",
    ultimaActualizacion: "2026-09-19 14:15",
    estado: "Pago validado",
    responsable: "Director de Gestión",
    cupo: 150000,
    cupoAprobado: 150000,
    modalidad: "Ambas",
    modalidadAprobada: "Ambas",
    fuentesCount: 2,
    camposCount: 4,
    fuentePrincipal: "Registro Civil / SRI",
    servicioPrincipal: "Fuente Integrada de Autenticación Bancaria",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0015",
    contratoDetalle: {
      id: "CONTR-2026-0015",
      numero: "CONTR-2026-0015",
      version: 1,
      estado: "Firmado",
      fechaGeneracion: "2026-09-17 10:00",
      fechaEnvioFirmas: "2026-09-17 14:00",
      firmadoCoordinador: true,
      fechaFirmaCoordinador: "2026-09-18 10:15",
      coordinadorNombre: "Andrea López (Coordinadora SINARP)",
      firmadoMaximaAutoridad: true,
      fechaFirmaMaximaAutoridad: "2026-09-18 15:40",
      maximaAutoridadNombre: "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)",
      cantidadContratada: 150000,
      clausulas: "Cláusula Primera: Servicio de Autenticación Bancaria. Cláusula Segunda: Sujeto a cupo bloqueante de 150,000 consultas."
    },
    factura: {
      numero: "FAC-2026-0022",
      fechaEmision: "2026-09-18",
      valor: "$ 420.00",
      estadoEmision: "EMITIDA",
      tipoEventoFacturable: "contrato_inicial",
      conceptoFacturable: "TAR-PRIV-003 (Paquete Alta Demanda 150,000 consultas)",
      versionTarifaria: "TAR-2026-V2 (Vigente)",
      cupoFacturado: 150000,
      baseTarifaria: "$ 420.00",
      descuentosAplicables: "$ 0.00",
      impuestos: "$ 0.00 (Tasa exenta)",
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      detalleServicios: [
        { servicio: "autenticacionBiometrica (Registro Civil)", valor: "$ 300.00" },
        { servicio: "validacionRUC (SRI)", valor: "$ 120.00" }
      ]
    },
    pasarelaPago: {
      ordenId: "ORD-PAG-2026-0022",
      estadoPasarela: "CONFIRMADO",
      intentosRealizados: 1,
      maxIntentos: 3,
      vigenciaOrdenMinutos: 45,
      fechaCreacionOrden: "2026-09-18 16:00",
      fechaConfirmacion: "2026-09-19 10:15",
      referenciaTransaccion: "TX-PASARELA-771209",
      metodoPago: "Pasarela Electrónica Institucional (Tarjeta Corporativa)",
      montoConfirmado: "$ 420.00"
    },
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-12",
            nombre: "cedulaCiudadania",
            descripcion: "Número de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Verificación de identidad en apertura remota."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-bg-1",
        nombre: "Contrato_Banco_Guayaquil_DINARP.pdf",
        tipo: "PDF",
        tamano: "3.5 MB",
        fechaCarga: "2026-09-15 09:30",
        categoria: "Contrato Privado"
      }
    ],
    informeJustificacion: {
      nombre: "Informe_Aprobacion_BancoGuayaquil.pdf",
      tamano: "2.3 MB",
      fecha: "2026-09-18 15:45",
      firmadoPor: "Dr. Roberto Méndez (Aprobador)"
    },
    historial: [
      { fecha: "2026-09-15 09:30", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-18 15:40", evento: "Contrato firmado (DOC-02)", actor: "Coordinador / Máxima Autoridad", detalle: "Contrato CONTR-2026-0015 firmado digitalmente." },
      { fecha: "2026-09-18 16:00", evento: "Factura automática emitida (FAC-01)", actor: "API Facturación Electrónica", detalle: "Factura FAC-2026-0022 emitida automáticamente por $ 420.00." },
      { fecha: "2026-09-19 10:15", evento: "Pago confirmado en pasarela (PAG-02)", actor: "Pasarela de Pagos DINARP", detalle: "Confirmación idempotente TX-PASARELA-771209 recibida. Expediente listo para aprobación final del Director de Gestión." }
    ]
  },
  {
    id: "SOL-2026-010",
    institucion: "Banco Bolivariano C.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    fecha: "2026-08-10 11:00",
    fechaAprobacion: "2026-08-14",
    ultimaActualizacion: "2026-08-18 16:45",
    estado: "Acceso generado",
    responsable: "Coordinador SINARP",
    cupo: 120000,
    cupoAprobado: 120000,
    fuentesCount: 2,
    camposCount: 3,
    fuentePrincipal: "Registro Civil / SRI",
    servicioPrincipal: "Autenticación Biométrica y Validación Tributaria",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0008",
    factura: {
      numero: "FAC-2026-0015",
      fechaEmision: "2026-08-14",
      valor: "$ 350.00",
      estadoEmision: "EMITIDA",
      tipoEventoFacturable: "contrato_inicial",
      conceptoFacturable: "TAR-PRIV-002 (Paquete Corporativo Biométrico)",
      versionTarifaria: "TAR-2026-V2 (Vigente)",
      cupoFacturado: 120000,
      baseTarifaria: "$ 350.00",
      descuentosAplicables: "$ 0.00",
      impuestos: "$ 0.00",
      detalleServicios: [
        { servicio: "autenticacionBiometrica (Registro Civil)", valor: "$ 250.00" },
        { servicio: "estadoContribuyente (SRI)", valor: "$ 100.00" }
      ]
    },
    pasarelaPago: {
      ordenId: "ORD-PAG-2026-0015",
      estadoPasarela: "CONFIRMADO",
      intentosRealizados: 1,
      maxIntentos: 3,
      vigenciaOrdenMinutos: 45,
      fechaConfirmacion: "2026-08-16 11:20",
      referenciaTransaccion: "TX-PASARELA-602114",
      metodoPago: "Pasarela Electrónica Institucional",
      montoConfirmado: "$ 350.00"
    },
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-101",
            nombre: "cedulaCiudadania",
            descripcion: "Número de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Verificación en ventanilla bancaria."
          },
          {
            id: "cmp-102",
            nombre: "fotografiaFacial",
            descripcion: "Registro biométrico facial digitalizado.",
            clasificacion: "Confidencial",
            finalidad: "Validación biométrica contra suplantación en apertura remota.",
            fundamento: "Resolución SB-2025-042 de Prevención de Fraude Bancario."
          }
        ]
      },
      {
        id: "FNT-002",
        nombre: "Registro Único de Contribuyentes (RUC)",
        institucion: "SRI",
        campos: [
          {
            id: "cmp-103",
            nombre: "estadoContribuyente",
            descripcion: "Estado de actividad tributaria.",
            clasificacion: "Accesible",
            finalidad: "Constatación de estado activo para apertura de cuentas."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-bb-1",
        nombre: "Contrato_Servicios_BancoBolivariano.pdf",
        tipo: "PDF",
        tamano: "3.2 MB",
        fechaCarga: "2026-08-10 11:00",
        categoria: "Contrato Privado"
      }
    ],
    aprovisionamiento: {
      estado: "EXITOSO",
      reintentosCount: 0,
      fechaHabilitacion: "2026-08-18 16:45",
      mensajeResultado: "Aprovisionamiento exitoso en Apigee con política de cupo bloqueante (120,000 consultas)."
    },
    credenciales: {
      usuario: "ws_bbolivariano_dinarp_prod",
      contrasena: "B0l1v@r1an0_Sec#2026*Prod",
      endpoint: "https://interoperabilidad.dinarp.gob.ec/api/v2/bancos/autenticacion",
      tipoAutenticacion: "OAuth 2.0 (mTLS + Bearer)",
      ambiente: "Producción (Ambiente Seguro DINARP)",
      fechaGeneracion: "2026-08-18 16:45",
      fechaExpiracion: "2027-08-18 23:59 (Activa)",
      camposAutorizados: ["cedulaCiudadania", "fotografiaFacial", "estadoContribuyente"],
      esSecretoTemporal: false,
      fechaSustitucionSecreto: "2026-08-18 17:10",
      estadoApigee: "ACTIVO",
      cupoAutorizadoVigente: 120000,
      tipoPoliticaCupo: "BLOQUEANTE_PRIVADA"
    },
    historial: [
      { fecha: "2026-08-10 11:00", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-08-14 15:00", evento: "Contrato firmado y factura emitida (FAC-01)", actor: "Motor Tarifario DINARP" },
      { fecha: "2026-08-16 11:20", evento: "Pago confirmado en pasarela electrónica (PAG-02)", actor: "Pasarela de Pagos DINARP" },
      { fecha: "2026-08-18 16:45", evento: "Aprobación final y aprovisionamiento en Apigee (SOL-10 / ACC-01)", actor: "Director de Gestión / Apigee", detalle: "Credenciales emitidas con cupo bloqueante de 120,000 consultas." },
      { fecha: "2026-08-18 17:10", evento: "Secreto temporal sustituido (ACC-09)", actor: "Andrea López (Coordinadora SINARP)", detalle: "Secreto inicial reemplazado por secreto definitivo de alta entropía en Apigee." }
    ]
  },
  {
    id: "SOL-2026-020",
    institucion: "Aseguradora del Sur C.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-015",
    proyectoNombre: "Validación de Siniestros y Coberturas Familiares",
    fecha: "2026-09-22 10:00",
    ultimaActualizacion: "2026-09-24 16:30",
    estado: "En formalización",
    responsable: "Abg. Santiago Valdivieso (Jurídica)",
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Filiación y Datos Conyugales",
    instrumento: "Contrato",
    modalidad: "API individual",
    cupo: 45000,
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          {
            id: "cmp-01",
            nombre: "cedulaCiudadania",
            descripcion: "Número oficial de cédula de ciudadanía.",
            clasificacion: "Accesible",
            finalidad: "Identificación unívoca del asegurado titular."
          },
          {
            id: "cmp-02",
            nombre: "estadoCivil",
            descripcion: "Condición civil registrada formalmente ante el Estado.",
            clasificacion: "Confidencial",
            finalidad: "Verificación de beneficiarios legales en pólizas de vida y asistencia conyugal.",
            fundamento: "Código Orgánico Monetario y Financiero Art. 42 y LOPDP Art. 12."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-seguros-1",
        nombre: "Peticion_Aseguradora_Sur_2026.pdf",
        tipo: "PDF",
        tamano: "2.4 MB",
        fechaCarga: "2026-09-22 10:00",
        categoria: "Oficio Formal"
      }
    ],
    informeNormativa: {
      cumple: true,
      articulosAplicables: "Art. 12 LOPDP, Art. 42 Código Monetario y Financiero",
      observaciones: "Se verifica legitimidad jurídica para consulta de datos conyugales para cobertura de siniestros.",
      emitidoPor: "Carlos Mora (Revisor Normativo)",
      fechaEmision: "2026-09-24",
      firmaRevisor: true,
      fechaFirmaRevisor: "2026-09-24 11:00",
      firmadoPorRevisorNombre: "Carlos Mora (Revisor Normativo)",
      firmaDirector: true,
      fechaFirmaDirector: "2026-09-24 15:30",
      firmadoPorDirectorNombre: "Dra. Valentina Paz (Directora de Normatividad)",
      archivoInforme: "Informe_Juridico_Favorable_SOL-2026-020.pdf"
    },
    historial: [
      { fecha: "2026-09-22 10:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-22 11:30", evento: "Revisor de Gestión asignado", actor: "Director de Gestión" },
      { fecha: "2026-09-23 09:15", evento: "Revisión técnica de Gestión aprobada", actor: "Ana Torres (Revisor)" },
      { fecha: "2026-09-23 10:00", evento: "Expediente remitido a Normatividad", actor: "Gestión", detalle: "Derivada por contener campo confidencial (estadoCivil)." },
      { fecha: "2026-09-24 15:30", evento: "Informe Jurídico Favorable suscrito", actor: "Directora de Normatividad", detalle: "Doble firma confirmada (Revisor y Directora). Derivada a Jurídica para formalización de contrato privado." }
    ]
  },
  {
    id: "SOL-2026-030",
    institucion: "Agencia de Regulación y Control de las Telecomunicaciones (ARCOTEL)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-022",
    proyectoNombre: "Catastro y Fiscalización del Espectro Radioeléctrico",
    fecha: "2026-09-21 09:00",
    ultimaActualizacion: "2026-09-24 11:15",
    estado: "Habilitación técnica",
    responsable: "Equipo TI",
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro de Títulos Habilitantes",
    servicioPrincipal: "Consulta de Operadores y Frecuencias",
    instrumento: "Convenio",
    modalidad: "API individual",
    cupo: 80000,
    aprovisionamiento: {
      estado: "ERROR",
      reintentosCount: 1,
      ultimoIntento: "2026-09-24 11:15",
      mensajeResultado: "Error de conexión con API Gateway DINARP: Gateway Timeout (HTTP 504) al propagar políticas de cuota.",
      referenciaTecnica: "ERR_GATEWAY_TIMEOUT_PROV_030"
    },
    fuentes: [
      {
        id: "FNT-008",
        nombre: "Registro de Títulos Habilitantes",
        institucion: "ARCOTEL",
        campos: [
          {
            id: "cmp-arc-1",
            nombre: "codigoOperador",
            descripcion: "Identificador asignado al operador de telecomunicaciones.",
            clasificacion: "Accesible",
            finalidad: "Validación de títulos habilitantes en tiempo real."
          },
          {
            id: "cmp-arc-2",
            nombre: "estadoFrecuencia",
            descripcion: "Vigencia y estado técnico de la frecuencia concesionada.",
            clasificacion: "Accesible",
            finalidad: "Fiscalización técnica del espectro electromagnético nacional."
          }
        ]
      }
    ],
    documentos: [
      {
        id: "doc-arcotel-1",
        nombre: "Convenio_Interoperabilidad_ARCOTEL_DINARP.pdf",
        tipo: "PDF",
        tamano: "3.1 MB",
        fechaCarga: "2026-09-21 09:00",
        categoria: "Convenio Marco"
      }
    ],
    historial: [
      { fecha: "2026-09-21 09:00", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-22 14:00", evento: "Revisión técnica y funcional aprobada", actor: "Revisión Gestión" },
      { fecha: "2026-09-23 16:00", evento: "Aprobación final otorgada", actor: "Director de Gestión", detalle: "Expediente completo. Orden de habilitación técnica remitida a API Gateway." },
      { fecha: "2026-09-24 11:15", evento: "Error en aprovisionamiento técnico", actor: "Plataforma de Interoperabilidad DINARP", detalle: "Fallo de respuesta HTTP 504 en Gateway al registrar política de cuota. Requiere reintento del Equipo TI." }
    ]
  },
  {
    id: "SOL-2026-031",
    institucion: "Cooperativa Juventud Ecuatoriana Progresista (JEP)",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-031",
    proyectoNombre: "Originación de Microcréditos Digitales",
    fecha: "2026-09-23 09:00",
    fechaAprobacion: "2026-09-24",
    ultimaActualizacion: "2026-09-24 17:10",
    estado: "Divergencia de facturación",
    responsable: "Administrador / Conciliación Financiera",
    modalidad: "API individual",
    modalidadAprobada: "API individual",
    cupo: 80000,
    cupoAprobado: 80000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Consulta de Identidad y Estado Civil",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0031",
    contratoDetalle: {
      id: "CONTR-2026-0031",
      numero: "CONTR-2026-0031",
      version: 1,
      estado: "Firmado",
      fechaGeneracion: "2026-09-24 10:00",
      fechaEnvioFirmas: "2026-09-24 11:00",
      firmadoCoordinador: true,
      fechaFirmaCoordinador: "2026-09-24 14:20",
      coordinadorNombre: "Andrea López (Coordinadora SINARP)",
      firmadoMaximaAutoridad: true,
      fechaFirmaMaximaAutoridad: "2026-09-24 16:50",
      maximaAutoridadNombre: "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)",
      cantidadContratada: 80000,
      clausulas: "Cláusula Primera: Consumo de datos de identificación para evaluación crediticia cooperativa."
    },
    factura: {
      numero: "PEND-FAC-0031",
      fechaEmision: "2026-09-24",
      valor: "$ 210.00",
      estadoEmision: "DIVERGENCIA_API",
      tipoEventoFacturable: "contrato_inicial",
      conceptoFacturable: "TAR-PRIV-002 (Tramo Cooperativo 80,000 consultas)",
      versionTarifaria: "TAR-2026-V2 (Vigente)",
      cupoFacturado: 80000,
      baseTarifaria: "$ 210.00",
      descuentosAplicables: "$ 0.00",
      impuestos: "$ 0.00",
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      errorApiDetalle: "HTTP 502 Bad Gateway / Divergencia de secuencial en servicio externo SRI-Facturación. Cobro bloqueado hasta conciliación (FAC-02).",
      detalleServicios: [
        { servicio: "cedulaCiudadania + estadoCivil (80,000 consultas)", valor: "$ 210.00" }
      ]
    },
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          { id: "cmp-31-1", nombre: "cedulaCiudadania", descripcion: "Cédula de ciudadanía.", clasificacion: "Accesible", finalidad: "Validación de socio." },
          { id: "cmp-31-2", nombre: "estadoCivil", descripcion: "Estado civil.", clasificacion: "Confidencial", finalidad: "Verificación de firma conyugal.", fundamento: "Código Monetario Art. 48." }
        ]
      }
    ],
    documentos: [
      { id: "doc-031-1", nombre: "Contrato_Firmado_JEP_2026.pdf", tipo: "PDF", tamano: "2.6 MB", fechaCarga: "2026-09-24 16:50", categoria: "Contrato Firmado" }
    ],
    historial: [
      { fecha: "2026-09-23 09:00", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-24 16:50", evento: "Contrato firmado por ambas partes (DOC-02)", actor: "Coordinador / Máxima Autoridad", detalle: "Contrato CONTR-2026-0031 perfeccionado. Se dispara emisión automática de factura." },
      { fecha: "2026-09-24 17:10", evento: "Fallo / Divergencia en emisión de factura (FAC-02)", actor: "API Facturación Electrónica", detalle: "HTTP 502 en servicio de facturación electrónica. La solicitud no avanza a pasarela de pago hasta conciliar emisión sin duplicar documento." }
    ]
  },
  {
    id: "SOL-2026-032",
    institucion: "Banco Internacional S.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-032",
    proyectoNombre: "Validación Patrimonial y Cumplimiento UAFE",
    fecha: "2026-09-20 10:00",
    fechaAprobacion: "2026-09-22",
    ultimaActualizacion: "2026-09-24 18:20",
    estado: "Pago bloqueado por intentos",
    responsable: "Administrador (Desbloqueo PAG-05)",
    modalidad: "Ambas",
    modalidadAprobada: "Ambas",
    cupo: 90000,
    cupoAprobado: 90000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Servicio de Rentas Internas (SRI)",
    servicioPrincipal: "Consulta de Actividad Económica y RUC",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0032",
    contratoDetalle: {
      id: "CONTR-2026-0032",
      numero: "CONTR-2026-0032",
      version: 1,
      estado: "Firmado",
      fechaGeneracion: "2026-09-22 09:00",
      fechaEnvioFirmas: "2026-09-22 10:00",
      firmadoCoordinador: true,
      fechaFirmaCoordinador: "2026-09-22 14:00",
      coordinadorNombre: "Andrea López (Coordinadora SINARP)",
      firmadoMaximaAutoridad: true,
      fechaFirmaMaximaAutoridad: "2026-09-22 16:30",
      maximaAutoridadNombre: "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)",
      cantidadContratada: 90000,
      clausulas: "Cláusula Primera: Validación tributaria automatizada bajo contrato de cobro por paquete."
    },
    factura: {
      numero: "FAC-2026-0039",
      fechaEmision: "2026-09-22",
      valor: "$ 240.00",
      estadoEmision: "EMITIDA",
      tipoEventoFacturable: "contrato_inicial",
      conceptoFacturable: "TAR-PRIV-002 (Paquete 90,000 consultas)",
      versionTarifaria: "TAR-2026-V2 (Vigente)",
      cupoFacturado: 90000,
      baseTarifaria: "$ 240.00",
      descuentosAplicables: "$ 0.00",
      impuestos: "$ 0.00",
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      detalleServicios: [
        { servicio: "estadoContribuyente + actividadEconomica (90,000 consultas)", valor: "$ 240.00" }
      ]
    },
    pasarelaPago: {
      ordenId: "ORD-PAG-2026-0039",
      estadoPasarela: "BLOQUEADO_INTENTOS",
      intentosRealizados: 3,
      maxIntentos: 3,
      vigenciaOrdenMinutos: 45,
      fechaCreacionOrden: "2026-09-22 17:00",
      ultimoMotivoFallo: "3 de 3 intentos agotados (PAG-03): Rechazo 3DSecure / Expiración de sesión de pago. Requiere autorización excepcional (PAG-05).",
      desbloqueosAutorizados: 0
    },
    fuentes: [
      {
        id: "FNT-002",
        nombre: "Registro Único de Contribuyentes (RUC)",
        institucion: "SRI",
        campos: [
          { id: "cmp-32-1", nombre: "estadoContribuyente", descripcion: "Estado RUC.", clasificacion: "Accesible", finalidad: "Debida diligencia bancaria." }
        ]
      }
    ],
    documentos: [
      { id: "doc-032-1", nombre: "Contrato_BancoInternacional_2026.pdf", tipo: "PDF", tamano: "2.9 MB", fechaCarga: "2026-09-22 16:30", categoria: "Contrato Firmado" }
    ],
    historial: [
      { fecha: "2026-09-22 16:30", evento: "Contrato firmado (DOC-02)", actor: "Coordinador / Máxima Autoridad" },
      { fecha: "2026-09-22 16:35", evento: "Factura emitida automáticamente (FAC-01)", actor: "API Facturación Electrónica", detalle: "Factura FAC-2026-0039 emitida por $ 240.00." },
      { fecha: "2026-09-23 11:00", evento: "Intento de pago #1 fallido (PAG-03)", actor: "Pasarela de Pagos DINARP", detalle: "Rechazo por timeout de autorización 3DS." },
      { fecha: "2026-09-24 09:30", evento: "Intento de pago #2 fallido (PAG-03)", actor: "Pasarela de Pagos DINARP", detalle: "Orden expirada tras 45 minutos." },
      { fecha: "2026-09-24 18:20", evento: "Pago bloqueado por límite de intentos (PAG-03)", actor: "Pasarela de Pagos DINARP", detalle: "Se alcanzó max_intentos_pago (3/3). La solicitud no avanza a aprobación final ni habilitación técnica hasta desbloqueo administrativo (PAG-05)." }
    ]
  },
  {
    id: "SOL-2026-033",
    institucion: "Ministerio de Transporte y Obras Públicas (MTOP)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-033",
    proyectoNombre: "Control de Pesos y Dimensiones en Red Vial Estatal",
    fecha: "2026-09-21 08:30",
    fechaAprobacion: "2026-09-24",
    ultimaActualizacion: "2026-09-24 16:45",
    estado: "Pendiente de integración",
    responsable: "Director de Gestión",
    modalidad: "API individual",
    modalidadAprobada: "API individual",
    cupo: 65000,
    cupoAprobado: 65000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Agencia Nacional de Tránsito / SRI",
    servicioPrincipal: "Consulta de Matrícula y Propietario Vehicular",
    instrumento: "Convenio",
    integracionPendienteDetalle: "El informe jurídico firmado INF-NORM-2026-041 no completó su indexación documental en el gestor de expedientes por intermitencia de almacenamiento. Requiere reintento idempotente (SOL-09 Criterio 3).",
    informeNormativa: {
      numero: "INF-NORM-2026-041",
      titulo: "Informe Jurídico Favorable para Red Vial MTOP",
      fechaEmision: "2026-09-24",
      dictamen: "FAVORABLE",
      revisorNombre: "Carlos Mora (Revisor Normativo)",
      firmadoRevisor: true,
      fechaFirmaRevisor: "2026-09-24 12:00",
      directorNombre: "Dra. Valentina Paz (Directora de Normatividad)",
      firmadoDirector: true,
      fechaFirmaDirector: "2026-09-24 16:30",
      archivoInforme: "Informe_Juridico_MTOP_SOL-2026-033.pdf"
    },
    fuentes: [
      {
        id: "FNT-002",
        nombre: "Registro Único de Contribuyentes (RUC)",
        institucion: "SRI",
        campos: [
          { id: "cmp-33-1", nombre: "estadoContribuyente", descripcion: "Estado tributario del operador de carga.", clasificacion: "Accesible", finalidad: "Emisión de certificados de operación regular." }
        ]
      }
    ],
    documentos: [
      { id: "doc-033-1", nombre: "Convenio_Marco_MTOP_DINARP.pdf", tipo: "PDF", tamano: "3.0 MB", fechaCarga: "2026-09-21 08:30", categoria: "Convenio Marco" }
    ],
    historial: [
      { fecha: "2026-09-21 08:30", evento: "Solicitud creada y enviada", actor: "Coordinador SINARP" },
      { fecha: "2026-09-23 11:00", evento: "Aprobada por Gestión", actor: "Ana Torres (Revisor)" },
      { fecha: "2026-09-24 16:30", evento: "Aprobada por Normatividad", actor: "Dra. Valentina Paz (Directora de Normatividad)" },
      { fecha: "2026-09-24 16:45", evento: "Pendiente de integración de expediente público (SOL-09)", actor: "Sistema DINARP", detalle: "Fallo temporal al vincular metadatos del informe INF-NORM-2026-041. Pendiente de reintento idempotente antes de pasar a Listo para aprobación final." }
    ]
  },
  {
    id: "SOL-2026-034",
    institucion: "Diners Club del Ecuador S.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    proyectoId: "PRJ-2026-034",
    proyectoNombre: "Evaluación de Riesgo Crediticio Automatizado",
    fecha: "2026-09-21 10:00",
    fechaAprobacion: "2026-09-23",
    ultimaActualizacion: "2026-09-24 15:20",
    estado: "En conciliación",
    responsable: "Administrador / Conciliación de Pasarela",
    modalidad: "API individual",
    modalidadAprobada: "API individual",
    cupo: 70000,
    cupoAprobado: 70000,
    fuentesCount: 1,
    camposCount: 2,
    fuentePrincipal: "Registro Civil de Ciudadanos",
    servicioPrincipal: "Verificación de Identidad Titular",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0034",
    contratoDetalle: {
      id: "CONTR-2026-0034",
      numero: "CONTR-2026-0034",
      version: 1,
      estado: "Firmado",
      fechaGeneracion: "2026-09-23 11:00",
      fechaEnvioFirmas: "2026-09-23 12:00",
      firmadoCoordinador: true,
      fechaFirmaCoordinador: "2026-09-23 15:00",
      coordinadorNombre: "Andrea López (Coordinadora SINARP)",
      firmadoMaximaAutoridad: true,
      fechaFirmaMaximaAutoridad: "2026-09-23 17:10",
      maximaAutoridadNombre: "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)",
      cantidadContratada: 70000,
      clausulas: "Cláusula Primera: Servicio de interoperabilidad para emisores financieros autorizados."
    },
    factura: {
      numero: "FAC-2026-0044",
      fechaEmision: "2026-09-23",
      valor: "$ 195.00",
      estadoEmision: "EMITIDA",
      tipoEventoFacturable: "contrato_inicial",
      conceptoFacturable: "TAR-PRIV-002 (Paquete 70,000 consultas)",
      versionTarifaria: "TAR-2026-V2 (Vigente)",
      cupoFacturado: 70000,
      baseTarifaria: "$ 195.00",
      descuentosAplicables: "$ 0.00",
      impuestos: "$ 0.00",
      detalleServicios: [
        { servicio: "cedulaCiudadania + nombresCompletos (70,000 consultas)", valor: "$ 195.00" }
      ]
    },
    pasarelaPago: {
      ordenId: "ORD-PAG-2026-0044",
      estadoPasarela: "EN_CONCILIACION",
      intentosRealizados: 1,
      maxIntentos: 3,
      vigenciaOrdenMinutos: 45,
      fechaCreacionOrden: "2026-09-23 17:15",
      referenciaTransaccion: "TX-PASARELA-990142",
      montoConfirmado: "$ 190.00",
      divergenciaDetalle: "Divergencia de monto en notificación de pasarela (PAG-02 Criterio 3): Factura emitida por $ 195.00 vs. webhook reportado por $ 190.00 (retención bancaria no parametrizada). Bloqueado el paso a SOL-10."
    },
    fuentes: [
      {
        id: "FNT-001",
        nombre: "Registro Civil de Ciudadanos",
        institucion: "Dirección General de Registro Civil",
        campos: [
          { id: "cmp-34-1", nombre: "cedulaCiudadania", descripcion: "Cédula de ciudadanía.", clasificacion: "Accesible", finalidad: "Verificación de titular." }
        ]
      }
    ],
    documentos: [
      { id: "doc-034-1", nombre: "Contrato_DinersClub_2026.pdf", tipo: "PDF", tamano: "2.7 MB", fechaCarga: "2026-09-23 17:10", categoria: "Contrato Firmado" }
    ],
    historial: [
      { fecha: "2026-09-23 17:10", evento: "Contrato firmado (DOC-02)", actor: "Coordinador / Máxima Autoridad" },
      { fecha: "2026-09-23 17:15", evento: "Factura automática emitida (FAC-01)", actor: "API Facturación Electrónica", detalle: "Factura FAC-2026-0044 emitida por $ 195.00." },
      { fecha: "2026-09-24 15:20", evento: "Pago retenido en conciliación por divergencia (PAG-02)", actor: "Pasarela de Pagos DINARP", detalle: "Notificación TX-PASARELA-990142 recibida con diferencia de importe ($ 190.00 vs $ 195.00). El expediente queda En conciliación sin pasar a aprobación final." }
    ]
  }
];

export function getStoredSolicitudes(): SolicitudAcceso[] {
  if (typeof window === "undefined") return INITIAL_SOLICITUDES;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Limpiar versiones anteriores obsoletas
      ["dinarp_solicitudes_v1", "dinarp_solicitudes_v2", "dinarp_solicitudes_v3", "dinarp_solicitudes_v4", "dinarp_solicitudes_v5", "dinarp_solicitudes_v6", "dinarp_solicitudes_v7", "dinarp_solicitudes_v8", "dinarp_solicitudes_v9"].forEach(k => {
        try { sessionStorage.removeItem(k); } catch (_) {}
      });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOLICITUDES));
      return INITIAL_SOLICITUDES;
    }
    const parsed: SolicitudAcceso[] = JSON.parse(raw);
    if (!parsed.some(s => s.estado === "Acceso generado")) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOLICITUDES));
      return INITIAL_SOLICITUDES;
    }
    return parsed;
  } catch (e) {
    return INITIAL_SOLICITUDES;
  }
}

export function saveStoredSolicitudes(data: SolicitudAcceso[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("solicitudes_updated", { detail: data }));
    }, 0);
  } catch (e) {}
}

export function useSolicitudesStore() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>(() => {
    if (typeof window !== "undefined") {
      return getStoredSolicitudes();
    }
    return INITIAL_SOLICITUDES;
  });

  useEffect(() => {
    setSolicitudes(getStoredSolicitudes());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSolicitudes(e.detail);
      } else {
        setSolicitudes(getStoredSolicitudes());
      }
    };

    window.addEventListener("solicitudes_updated", handleUpdate);
    return () => window.removeEventListener("solicitudes_updated", handleUpdate);
  }, []);

  const getSolicitudById = useCallback((id: string): SolicitudAcceso | undefined => {
    return solicitudes.find(s => s.id === id) || INITIAL_SOLICITUDES.find(s => s.id === id);
  }, [solicitudes]);

  // Flujo Aprobador: Aprobar solicitud
  const aprobarSolicitud = useCallback((id: string, informeFileName: string, fileSize = "2.4 MB") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const esPrivada = s.tipoInstitucion === "Privada";
        const nuevoEstado: SolicitudEstado = esPrivada ? "Pago pendiente" : "Aprobada";
        const nuevoResponsable = esPrivada ? "Facturación" : "Coordinador SINARP";

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Aprobada",
            actor: "Aprobador",
            detalle: `Informe de justificación "${informeFileName}" cargado y firmado digitalmente por el Aprobador. Instrumento: ${esPrivada ? "Contrato" : "Convenio"}.`
          }
        ];

        if (esPrivada) {
          nuevosEventos.push({
            fecha: now,
            evento: "Pago pendiente",
            actor: "Facturación",
            detalle: `Se generó la orden de cobro asociada y la factura ${s.factura?.numero || "FAC-0035"} por valor de ${s.factura?.valor || "$ 150.00"}.`
          });
        }

        return {
          ...s,
          estado: nuevoEstado,
          responsable: nuevoResponsable,
          fechaAprobacion: dateOnly,
          ultimaActualizacion: dateOnly,
          instrumento: esPrivada ? ("Contrato" as const) : ("Convenio" as const),
          contrato: esPrivada ? (s.contrato || `CONTR-2026-00${Math.floor(Math.random() * 80 + 10)}`) : undefined,
          factura: esPrivada
            ? s.factura || {
                numero: `FAC-00${Math.floor(Math.random() * 50 + 30)}`,
                fechaEmision: dateOnly,
                valor: "$ 150.00",
                detalleServicios: [{ servicio: s.servicioPrincipal || "Fuente de Interoperabilidad", valor: "$ 150.00" }]
              }
            : undefined,
          informeJustificacion: {
            nombre: informeFileName,
            tamano: fileSize,
            fecha: now,
            firmadoPor: "Dr. Roberto Méndez (Aprobador)"
          },
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo Aprobador: Rechazar solicitud
  const rechazarSolicitud = useCallback((id: string, motivo: string) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const nuevoHistorial: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Solicitud rechazada con observaciones",
            actor: "Aprobador",
            detalle: `Motivo del rechazo: ${motivo}`
          }
        ];
        return {
          ...s,
          estado: "Rechazada" as const,
          responsable: "Coordinador SINARP",
          motivoRechazo: motivo,
          observaciones: motivo,
          ultimaActualizacion: dateOnly,
          historial: nuevoHistorial
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Compatibilidad con solicitarAjustes previo
  const solicitarAjustes = rechazarSolicitud;

  // Flujo Coordinador: Reenviar solicitud subsanada o enviar borrador inicial
  const reenviarSolicitud = useCallback((id: string, comentarioSubsanacion?: string, nuevasFuentes?: FuenteDetalle[]) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const esBorradorPrevio = s.estado === "Borrador";
        const nextVersion = esBorradorPrevio ? 1 : (s.versionExpediente || 1) + 1;
        const nuevoHistorial: TrazabilidadEvento[] = esBorradorPrevio
          ? [
              ...s.historial,
              {
                fecha: now,
                evento: "Solicitud enviada formalmente a Dirección de Gestión (v1)",
                actor: "Coordinador SINARP",
                detalle: comentarioSubsanacion || "Se completó el borrador y se envió el expediente a la Dirección de Gestión para su primera asignación."
              },
              {
                fecha: now,
                evento: "Pendiente de asignación en Gestión",
                actor: "Director de Gestión",
                detalle: "La solicitud ingresó a la bandeja del Director de Gestión para asignar un revisor técnico."
              }
            ]
          : [
              ...s.historial,
              {
                fecha: now,
                evento: `Solicitud subsanada y reenviada (v${nextVersion})`,
                actor: "Coordinador SINARP",
                detalle: comentarioSubsanacion || "Se realizaron las correcciones y precisiones solicitadas en el expediente."
              },
              {
                fecha: now,
                evento: "Pendiente de nueva asignación",
                actor: "Director de Gestión",
                detalle: "La solicitud subsanada volvió a la bandeja del Director de Gestión para una nueva asignación."
              }
            ];
        return {
          ...s,
          versionExpediente: nextVersion,
          fuentes: nuevasFuentes || s.fuentes,
          fuentesCount: nuevasFuentes ? nuevasFuentes.length : s.fuentesCount,
          camposCount: nuevasFuentes
            ? nuevasFuentes.reduce((acc, f) => acc + (f.campos?.length || 0), 0)
            : s.camposCount,
          estado: (esBorradorPrevio ? "Pendiente de asignación en Gestión" : "Pendiente de nueva asignación") as SolicitudAcceso["estado"],
          responsable: "Director de Gestión",
          revisorAsignado: undefined,
          revisorAsignadoId: undefined,
          detalleSubsanacion: esBorradorPrevio ? undefined : comentarioSubsanacion,
          ultimaActualizacion: dateOnly,
          historial: nuevoHistorial
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo Coordinador: Crear nueva solicitud (o guardar borrador) y enviar a firmas / asignación
  const crearNuevaSolicitud = useCallback((nueva: Partial<SolicitudAcceso>) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const maxNum = current.reduce((max, item) => {
      const match = item.id.match(/SOL-2026-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 34);
    const newId = `SOL-2026-${String(maxNum + 1).padStart(3, "0")}`;
    const esBorrador = nueva.estado === "Borrador";

    const solicitudCompleta: SolicitudAcceso = {
      id: nueva.id || newId,
      institucion: nueva.institucion || "Ministerio de Salud Pública",
      tipoInstitucion: nueva.tipoInstitucion || "Pública",
      coordinador: nueva.coordinador || "Andrea López",
      fecha: now,
      ultimaActualizacion: dateOnly,
      estado: esBorrador ? "Borrador" : "Pendiente de asignación en Gestión",
      responsable: esBorrador ? "Coordinador SINARP" : "Director de Gestión",
      proyectoId: nueva.proyectoId || "PRJ-2026-001",
      proyectoNombre: nueva.proyectoNombre || "Sistema Único de Registro y Matrícula Estudiantil",
      modalidad: nueva.modalidad || "API individual",
      cupo: nueva.cupo || 50000,
      versionExpediente: 1,
      historialAsignaciones: [],
      fuentesCount: nueva.fuentes?.length || 1,
      camposCount: nueva.camposCount || 2,
      fuentePrincipal: nueva.fuentePrincipal || nueva.fuentes?.[0]?.nombre || "Dirección General de Registro Civil, Identificación y Cedulación",
      servicioPrincipal: nueva.servicioPrincipal || "Consulta de Datos de Identidad",
      instrumento: nueva.tipoInstitucion === "Privada" ? "Contrato" : "Convenio",
      fuentes: nueva.fuentes || [],
      documentos: nueva.documentos || (esBorrador ? [] : [
        {
          id: `doc-${Date.now()}`,
          nombre: "Oficio_Solicitud_Interoperabilidad_Firmado.pdf",
          tipo: "PDF",
          tamano: "1.8 MB",
          fechaCarga: now,
          categoria: "Oficio de Solicitud"
        }
      ]),
      historial: esBorrador
        ? [
            {
              fecha: now,
              evento: "Solicitud guardada como borrador (SOL-01)",
              actor: "Coordinador SINARP",
              detalle: "Borrador guardado en el asistente antes del envío formal a la Dirección de Gestión."
            }
          ]
        : [
            {
              fecha: now,
              evento: "Solicitud creada y enviada (SOL-01 / SOL-02)",
              actor: "Coordinador SINARP",
              detalle: "Solicitud registrada mediante el asistente y enviada a la Dirección de Gestión para asignación."
            },
            {
              fecha: now,
              evento: "Pendiente de asignación en Gestión",
              actor: "Director de Gestión",
              detalle: "Expediente disponible en la bandeja exclusiva de asignación de Gestión."
            }
          ]
    };

    const updated = [solicitudCompleta, ...current];
    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
    return solicitudCompleta;
  }, []);

  // Flujo BN-07: Director de Gestión asigna Revisor
  const asignarRevisorGestion = useCallback((
    id: string,
    revisorId: string,
    revisorNombre: string,
    directorNombre = "Director Gestión",
    observacion?: string
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const version = s.versionExpediente || 1;
        const nuevaAsignacion: AsignacionRegistro = {
          id: `asig-${Date.now()}`,
          director: directorNombre,
          revisorId,
          revisorNombre,
          fecha: now,
          versionExpediente: version,
          etapa: "Gestión",
          observacion
        };

        const historialAsignaciones = [nuevaAsignacion, ...(s.historialAsignaciones || [])];

        const esReasig = Boolean(s.revisorAsignado);
        const revisorAnterior = s.revisorAsignado;
        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: esReasig ? "Reasignación de revisor de Gestión (SOL-03)" : "Revisor de Gestión asignado (SOL-03)",
            actor: directorNombre,
            detalle: esReasig
              ? `Revisor anterior: ${revisorAnterior}. Recuperada y reasignada a ${revisorNombre} conservando trazabilidad previa.${observacion ? ` Motivo: ${observacion}` : ""}`
              : `Asignado a ${revisorNombre} para revisión funcional y de interoperabilidad del expediente (versión ${version}).${observacion ? ` Observación: ${observacion}` : ""}`
          }
        ];

        return {
          ...s,
          estado: "Asignada a revisión de Gestión" as const,
          responsable: revisorNombre,
          revisorAsignado: revisorNombre,
          revisorAsignadoId: revisorId,
          fechaAsignacion: now,
          historialAsignaciones,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07: Revisor de Gestión aprueba solicitud
  const aprobarGestion = useCallback((
    id: string,
    params: {
      revisor: string;
      camposAprobados: string[];
      modalidadesAutorizadas: ModalidadAcceso;
      cupoAprobado: number;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        // Determinar si contiene campos confidenciales
        const tieneConfidencial = s.fuentes.some(f =>
          f.campos?.some(c => c.clasificacion === "Confidencial")
        );

        const version = s.versionExpediente || 1;
        const esPrivada = s.tipoInstitucion === "Privada";

        const nuevoEstado: SolicitudEstado = tieneConfidencial
          ? "Pendiente de asignación en Normatividad"
          : "Aprobada por Gestión";

        const nuevoResponsable = tieneConfidencial
          ? "Director de Protección de la Información (DPI)"
          : (esPrivada ? "Facturación" : "Coordinador SINARP");

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Aprobada por Gestión (SOL-04)",
            actor: params.revisor,
            detalle: `Revisión funcional aprobada (Expediente v${version}). Modalidad autorizada: ${params.modalidadesAutorizadas}. Cupo aprobado: ${params.cupoAprobado.toLocaleString()} registros. ${
              tieneConfidencial
                ? "Contiene campos confidenciales: derivada a la Dirección de Protección de la Información (DPI)."
                : "Solo campos accesibles: continúa directamente a formalización (BN-08)."
            }`
          }
        ];

        if (tieneConfidencial) {
          nuevosEventos.push({
            fecha: now,
            evento: "Pendiente de asignación en Protección de la Información (DPI)",
            actor: "Director de Protección de la Información (DPI)",
            detalle: "Expediente con campos confidenciales remitido a la Dirección de Protección de la Información (DPI) para asignación de revisor (SOL-07)."
          });
        }

        return {
          ...s,
          estado: nuevoEstado,
          responsable: nuevoResponsable,
          modalidadAprobada: params.modalidadesAutorizadas,
          cupoAprobado: params.cupoAprobado,
          fechaAprobacion: dateOnly,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07: Revisor de Gestión observa solicitud
  const observarGestion = useCallback((
    id: string,
    params: {
      revisor: string;
      observaciones: ObservacionItem[];
      diasPlazo?: number;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const dias = params.diasPlazo || 3;

    // Calcular fecha límite (3 días hábiles según PAR-13 y calendario PAR-10)
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + dias);
    const fechaLimiteStr = limitDate.toISOString().substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const resumenObs = params.observaciones.map(o => `[${o.tipo.toUpperCase()}] ${o.elementoNombre ? o.elementoNombre + ": " : ""}${o.descripcion}`).join(" | ");

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Solicitud observada por Gestión (SOL-04 / SOL-06)",
            actor: params.revisor,
            detalle: `Se registraron ${params.observaciones.length} observaciones. Plazo inicial de subsanación: ${dias} días hábiles según PAR-13 y calendario laboral PAR-10 (hasta ${fechaLimiteStr}).`
          }
        ];

        return {
          ...s,
          estado: "Observada" as const,
          responsable: "Coordinador SINARP",
          observacionesEstructuradas: params.observaciones,
          fechaLimiteSubsanacion: fechaLimiteStr,
          diasRestantesSubsanacion: dias,
          observaciones: resumenObs,
          motivoRechazo: resumenObs,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07: Subsanar y Reenviar
  const subsanarYReenviar = useCallback((
    id: string,
    params: {
      comentario: string;
      fuentesActualizadas: FuenteDetalle[];
      modalidad?: ModalidadAcceso;
      cupo?: number;
      documentos?: DocumentoSoporte[];
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const nextVersion = (s.versionExpediente || 1) + 1;
        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: `Solicitud subsanada y reenviada (v${nextVersion}) (SOL-05)`,
            actor: "Coordinador SINARP",
            detalle: params.comentario || "Expediente corregido conforme a las observaciones recibidas."
          },
          {
            fecha: now,
            evento: "Pendiente de nueva asignación",
            actor: "Director de Gestión",
            detalle: "Expediente subsanado remitido a /acceso-interoperabilidad/asignacion para nueva asignación manual."
          }
        ];

        return {
          ...s,
          versionExpediente: nextVersion,
          fuentes: params.fuentesActualizadas,
          fuentesCount: params.fuentesActualizadas.length,
          camposCount: params.fuentesActualizadas.reduce((acc, f) => acc + (f.campos?.length || 0), 0),
          modalidad: params.modalidad || s.modalidad,
          cupo: params.cupo || s.cupo,
          documentos: params.documentos || s.documentos,
          estado: "Pendiente de nueva asignación" as const,
          responsable: "Director de Gestión",
          revisorAsignado: undefined,
          revisorAsignadoId: undefined,
          detalleSubsanacion: params.comentario,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07: Cerrar por vencimiento de plazo de subsanación
  const cerrarPorVencimiento = useCallback((id: string) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Expediente cerrado por vencimiento de plazo (SOL-06)",
            actor: "Sistema DINARP",
            detalle: "El plazo de subsanación (3 días hábiles según PAR-13 y calendario PAR-10) venció sin que el Coordinador reenviara las correcciones requeridas. Se archiva el trámite."
          }
        ];

        return {
          ...s,
          estado: "Cerrada" as const,
          responsable: "Archivo Histórico",
          diasRestantesSubsanacion: 0,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07 DPI (Protección de la Información): Director DPI asigna o reasigna revisor
  const asignarRevisorNormativa = useCallback((
    id: string,
    revisorId: string,
    revisorNombre: string,
    directorNombre = "Director de Protección de la Información (DPI)",
    observacion?: string
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const version = s.versionExpediente || 1;
        const esReasignacion = Boolean(s.revisorNormativoAsignado);
        const revisorAnterior = s.revisorNormativoAsignado;

        const nuevaAsignacion: AsignacionRegistro = {
          id: `asig-dpi-${Date.now()}`,
          director: directorNombre,
          revisorId,
          revisorNombre,
          fecha: now,
          versionExpediente: version,
          etapa: "Normatividad",
          observacion
        };

        const historialAsignacionesNormativa = [
          nuevaAsignacion,
          ...(s.historialAsignacionesNormativa || [])
        ];

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: esReasignacion
              ? "Reasignación de revisor de Protección de la Información (DPI) (SOL-07)"
              : "Revisor de Protección de la Información (DPI) asignado (SOL-07)",
            actor: directorNombre,
            detalle: esReasignacion
              ? `Revisor anterior: ${revisorAnterior}. Reasignado a ${revisorNombre} conservando trazabilidad previa.${observacion ? ` Motivo: ${observacion}` : ""}`
              : `Asignado a ${revisorNombre} para evaluación de sustento jurídico sobre campos confidenciales (Expediente v${version}).${observacion ? ` Observación: ${observacion}` : ""}`
          }
        ];

        return {
          ...s,
          estado: "En revisión normativa" as const,
          responsable: revisorNombre,
          revisorNormativoAsignado: revisorNombre,
          revisorNormativoAsignadoId: revisorId,
          fechaAsignacionNormativa: now,
          historialAsignacionesNormativa,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07 DPI: Aprobar y generar informe de aprobación de Protección de la Información
  const aprobarNormativa = useCallback((
    id: string,
    params: {
      revisor: string;
      director: string;
      fundamento?: string;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const informe: InformeNormativa = {
          numero: `INF-DPI-2026-0${Math.floor(Math.random() * 80 + 10)}`,
          titulo: "Informe de Pertinencia Jurídica de Campos Confidenciales (DPI)",
          fechaEmision: now,
          dictamen: "FAVORABLE",
          fundamento: params.fundamento || "Conforme a la Ley Orgánica de Protección de Datos Personales, se valida la pertinencia y sustento jurídico de los campos confidenciales solicitados.",
          revisorNombre: params.revisor,
          firmadoRevisor: true,
          fechaFirmaRevisor: now,
          directorNombre: params.director,
          firmadoDirector: false
        };

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Informe de Aprobación DPI emitido y firmado por Revisor (SOL-08)",
            actor: params.revisor,
            detalle: `Informe ${informe.numero} suscrito electrónicamente por ${params.revisor} (Equipo DPI). Pendiente de firma electrónica de refrenda por ${params.director} (Director DPI).`
          }
        ];

        return {
          ...s,
          informeNormativa: informe,
          responsable: params.director,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07 DPI: Firmar informe de aprobación (Revisor DPI o Director DPI)
  const firmarInformeNormativa = useCallback((
    id: string,
    rol: "REVISOR" | "DIRECTOR",
    firmante: string
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id && s.informeNormativa) {
        const inf = { ...s.informeNormativa };
        if (rol === "REVISOR") {
          inf.firmadoRevisor = true;
          inf.fechaFirmaRevisor = now;
        } else {
          inf.firmadoDirector = true;
          inf.fechaFirmaDirector = now;
        }

        const ambasFirmas = inf.firmadoRevisor && inf.firmadoDirector;
        const esPrivada = s.tipoInstitucion === "Privada";

        const nuevoEstado = ambasFirmas ? ("Aprobada por Normatividad" as SolicitudEstado) : s.estado;
        const nuevoResponsable = ambasFirmas
          ? (esPrivada ? "Facturación" : "Coordinador SINARP")
          : s.responsable;

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: `Informe suscrito por ${rol === "DIRECTOR" ? "Director de Protección de la Información (DPI)" : "Revisor de Protección de la Información (DPI)"} (SOL-08)`,
            actor: firmante,
            detalle: ambasFirmas
              ? "Ambas firmas electrónicas registradas exitosamente en DPI. El trámite queda formalmente aprobado y avanza a formalización (BN-08)."
              : "Firma electrónica registrada. Pendiente de firma de refrenda del Director DPI."
          }
        ];

        return {
          ...s,
          informeNormativa: inf,
          estado: nuevoEstado,
          responsable: nuevoResponsable,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo BN-07 DPI: Observar solicitud jurídica en campos confidenciales
  const observarNormativa = useCallback((
    id: string,
    params: {
      revisor: string;
      observaciones: ObservacionItem[];
      diasPlazo?: number;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const dias = params.diasPlazo || 3;

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + dias);
    const fechaLimiteStr = limitDate.toISOString().substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const resumenObs = params.observaciones.map(o => `[DPI JURÍDICO - ${o.tipo.toUpperCase()}] ${o.elementoNombre ? o.elementoNombre + ": " : ""}${o.descripcion}`).join(" | ");

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Solicitud observada por Protección de la Información (DPI) (SOL-07 / SOL-06)",
            actor: params.revisor,
            detalle: `Observaciones jurídicas en campos confidenciales registradas por DPI. Plazo inicial de subsanación: ${dias} días hábiles según PAR-13 y calendario PAR-10 (hasta ${fechaLimiteStr}). Tras subsanar volverá a Gestión antes de reingresar a DPI.`
          }
        ];

        return {
          ...s,
          estado: "Observada" as const,
          responsable: "Coordinador SINARP",
          observacionesEstructuradas: params.observaciones,
          fechaLimiteSubsanacion: fechaLimiteStr,
          diasRestantesSubsanacion: dias,
          observaciones: resumenObs,
          motivoRechazo: resumenObs,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Simulación: entidad privada realiza pago externamente
  const simularPagoRealizado = useCallback((id: string) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const nuevoHistorial: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Pago realizado",
            actor: s.institucion,
            detalle: "Transferencia bancaria por concepto de tarifa de interoperabilidad efectuada en cuenta fiscal del Estado."
          },
          {
            fecha: now,
            evento: "Pendiente de validación de pago",
            actor: "Sistema Financiero",
            detalle: "Pendiente de verificación en plataforma SIGEF y anexo del CUR correspondiente."
          }
        ];
        return {
          ...s,
          estado: "Pendiente de validación de pago" as const,
          responsable: "Facturación",
          ultimaActualizacion: dateOnly,
          historial: nuevoHistorial
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo Facturación: Validar pago y anexar CUR
  const validarPagoConCur = useCallback((
    id: string,
    curData: {
      numeroCur: string;
      nombreArchivo: string;
      tamano?: string;
      usuarioResponsable?: string;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const usuario = curData.usuarioResponsable || "Lcda. Patricia Morales (Facturación)";

    const updated = current.map(s => {
      if (s.id === id) {
        const nuevoHistorial: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Pago validado",
            actor: "Facturación",
            detalle: `Verificación exitosa en SIGEF. Acreditación de fondos confirmada por ${usuario}.`
          },
          {
            fecha: now,
            evento: "CUR anexado",
            actor: "Facturación",
            detalle: `Comprobante Único de Registro ${curData.numeroCur} (${curData.nombreArchivo}) anexado al expediente.`
          }
        ];
        return {
          ...s,
          estado: "Pago validado" as const,
          responsable: "Facturación",
          ultimaActualizacion: dateOnly,
          cur: {
            numeroCur: curData.numeroCur,
            nombreArchivo: curData.nombreArchivo,
            tamano: curData.tamano || "1.2 MB",
            fechaRegistro: now,
            usuarioResponsable: usuario
          },
          historial: nuevoHistorial
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo Técnico / Administrador: Generar credenciales de acceso
  const generarAcceso = useCallback((
    id: string,
    credencialesPersonalizadas?: Partial<CredencialesAcceso>
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const defaultCampos = s.fuentes?.flatMap(f => f.campos?.map(c => c.nombre) || []) || [];
        const cleanName = s.institucion.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
        const creds: CredencialesAcceso = {
          usuario: credencialesPersonalizadas?.usuario || `ws_${cleanName}_${s.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          contrasena: credencialesPersonalizadas?.contrasena || `Dinarp$ec_${Math.random().toString(36).slice(-6)}*2026`,
          endpoint: credencialesPersonalizadas?.endpoint || `https://interoperabilidad.dinarp.gob.ec/api/v2/servicios/${s.id.toLowerCase()}`,
          tipoAutenticacion: credencialesPersonalizadas?.tipoAutenticacion || "OAuth 2.0 (Bearer Token)",
          ambiente: credencialesPersonalizadas?.ambiente || "Producción (Ambiente Seguro DINARP)",
          fechaGeneracion: now,
          fechaExpiracion: "2027-09-23 23:59 (Activa)",
          camposAutorizados: credencialesPersonalizadas?.camposAutorizados || (defaultCampos.length > 0 ? defaultCampos : ["cedulaCiudadania", "nombresCompletos"])
        };

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Acceso generado",
            actor: "Administrador DINARP",
            detalle: `Credenciales de interoperabilidad generadas y emitidas satisfactoriamente para el usuario ${creds.usuario}.`
          }
        ];

        return {
          ...s,
          estado: "Acceso generado" as const,
          ultimaActualizacion: dateOnly,
          credenciales: creds,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // DOC-01: Generar contrato para institución privada (Jurídica)
  const generarContrato = useCallback((id: string, params?: { cantidadContratada?: number; clausulas?: string; autor?: string }) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const contrato: ContratoInteroperabilidad = {
          id: `CONTR-${s.id.replace("SOL-", "")}`,
          numero: `CONTR-2026-${s.id.slice(-4)}`,
          version: 1,
          estado: "Borrador",
          fechaGeneracion: now,
          firmadoCoordinador: false,
          coordinadorNombre: s.coordinador || "Coordinador Institucional",
          firmadoMaximaAutoridad: false,
          maximaAutoridadNombre: "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)",
          cantidadContratada: params?.cantidadContratada || s.cupo || 100000,
          clausulas: params?.clausulas || "Cláusula Primera: Objeto del Intercambio de Información. La entidad solicitante se compromete a consumir los datos exclusivamente para las finalidades autorizadas por DINARP, bajo estricto cumplimiento de la Ley Orgánica de Protección de Datos Personales (LOPDP). Cláusula Segunda: Tarifas y Vigencia. Rige por el plazo de un año prorrogable.",
          historialVersiones: [
            {
              version: 1,
              fecha: now,
              autor: "Abg. Santiago Valdivieso (Jurídica)",
              cambios: "Generación inicial de borrador de contrato de interoperabilidad"
            }
          ]
        };

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Borrador de contrato generado",
            actor: "Abg. Santiago Valdivieso (Jurídica)",
            detalle: `Generado borrador inicial ${contrato.numero} v1 para revisión y circuito de firmas.`
          }
        ];

        return {
          ...s,
          estado: "En formalización" as const,
          contratoDetalle: contrato,
          instrumento: "Contrato" as const,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // DOC-03: Editar borrador de contrato (si ya estaba en firmas, requiere nuevas firmas)
  const editarBorradorContrato = useCallback((id: string, params: { clausulas: string; cantidadContratada?: number; notaCambio?: string; cambios?: string; autor?: string }) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id && s.contratoDetalle) {
        const prevVersion = s.contratoDetalle.version;
        const newVersion = prevVersion + 1;
        const resetFirmas = s.contratoDetalle.estado === "Pendiente de firmas";

        const historialVersiones = [
          ...(s.contratoDetalle.historialVersiones || []),
          {
            version: newVersion,
            fecha: now,
            autor: params.autor || "Abg. Santiago Valdivieso (Jurídica)",
            cambios: params.cambios || params.notaCambio || `Modificación de cláusulas. ${resetFirmas ? "Se reinicia el circuito de firmas." : ""}`
          }
        ];

        const updatedContrato: ContratoInteroperabilidad = {
          ...s.contratoDetalle,
          version: newVersion,
          clausulas: params.clausulas,
          cantidadContratada: params.cantidadContratada ?? s.contratoDetalle.cantidadContratada,
          estado: resetFirmas ? "Corrección pendiente" : "Borrador",
          firmadoCoordinador: false,
          fechaFirmaCoordinador: undefined,
          firmadoMaximaAutoridad: false,
          fechaFirmaMaximaAutoridad: undefined,
          historialVersiones
        };

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: `Contrato modificado a v${newVersion}`,
            actor: params.autor || "Jurídica",
            detalle: `Se actualizaron las cláusulas del contrato. ${resetFirmas ? "Las firmas previas fueron invalidadas y se requiere un nuevo circuito de firma." : ""}`
          }
        ];

        return {
          ...s,
          contratoDetalle: updatedContrato,
          estado: (resetFirmas ? "En formalización" : s.estado) as SolicitudEstado,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // DOC-02: Enviar contrato a circuito de firmas
  const enviarContratoAFirmas = useCallback((id: string, autor?: string) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id && s.contratoDetalle) {
        const updatedContrato: ContratoInteroperabilidad = {
          ...s.contratoDetalle,
          estado: "Pendiente de firmas",
          fechaEnvioFirmas: now
        };

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Contrato enviado a firmas",
            actor: autor || "Abg. Santiago Valdivieso (Jurídica)",
            detalle: `El contrato ${s.contratoDetalle.numero} v${s.contratoDetalle.version} fue remitido para firma del Coordinador y Máxima Autoridad.`
          }
        ];

        return {
          ...s,
          estado: "Pendiente de firma" as const,
          contratoDetalle: updatedContrato,
          responsable: "Coordinador SINARP / Máxima Autoridad",
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // DOC-02: Firmar contrato digitalmente
  const firmarContrato = useCallback((id: string, rolFirmante: "COORDINADOR" | "MAXIMA_AUTORIDAD" | "COORDINADOR_SINARP", firmanteNombre: string) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const isCoordinador = rolFirmante === "COORDINADOR" || rolFirmante === "COORDINADOR_SINARP";

    const updated = current.map(s => {
      if (s.id === id && s.contratoDetalle) {
        const c = s.contratoDetalle;
        const coordSigned = isCoordinador ? true : c.firmadoCoordinador;
        const maxSigned = rolFirmante === "MAXIMA_AUTORIDAD" ? true : c.firmadoMaximaAutoridad;
        const bothSigned = coordSigned && maxSigned;

        const updatedContrato: ContratoInteroperabilidad = {
          ...c,
          firmadoCoordinador: coordSigned,
          fechaFirmaCoordinador: isCoordinador ? now : c.fechaFirmaCoordinador,
          coordinadorNombre: isCoordinador ? firmanteNombre : c.coordinadorNombre,
          firmadoMaximaAutoridad: maxSigned,
          fechaFirmaMaximaAutoridad: rolFirmante === "MAXIMA_AUTORIDAD" ? now : c.fechaFirmaMaximaAutoridad,
          maximaAutoridadNombre: rolFirmante === "MAXIMA_AUTORIDAD" ? firmanteNombre : c.maximaAutoridadNombre,
          estado: bothSigned ? "Firmado" : "Pendiente de firmas"
        };

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: `Firma de contrato registrada (${isCoordinador ? "Coordinador" : "Máxima Autoridad"})`,
            actor: firmanteNombre,
            detalle: bothSigned
              ? `Ambas firmas confirmadas para el contrato ${c.numero}. Instrumento legal formalizado.`
              : `Firma digital estampada por ${firmanteNombre}. Pendiente firma complementaria.`
          }
        ];

        let nuevoEstado: SolicitudEstado = s.estado;
        let nuevoResponsable = s.responsable;
        let nuevaFactura = s.factura;
        let nuevaPasarela = s.pasarelaPago;

        if (bothSigned) {
          if (s.tipoInstitucion === "Privada") {
            nuevoEstado = "Pendiente de pago";
            nuevoResponsable = "Coordinador SINARP";
            const cupoFact = updatedContrato.cantidadContratada || s.cupoAprobado || s.cupo || 50000;
            const montoNum = cupoFact <= 50000 ? 150 : cupoFact <= 100000 ? 280 : 420;
            const valorStr = `$ ${montoNum.toFixed(2)}`;
            if (!nuevaFactura) {
              nuevaFactura = {
                numero: `FAC-2026-${s.id.slice(-4)}`,
                fechaEmision: dateOnly,
                valor: valorStr,
                estadoEmision: "EMITIDA",
                tipoEventoFacturable: "contrato_inicial",
                conceptoFacturable: `TAR-PRIV-001 (Paquete ${cupoFact.toLocaleString()} consultas)`,
                versionTarifaria: "TAR-2026-V2 (Vigente)",
                cupoFacturado: cupoFact,
                baseTarifaria: valorStr,
                descuentosAplicables: "$ 0.00",
                impuestos: "$ 0.00 (Tasa administrativa exenta)",
                modoRedondeo: "HALF_UP",
                precisionDecimales: 2,
                detalleServicios: [
                  { servicio: "Tasa de habilitación de interoperabilidad (Contrato inicial)", valor: "$ 100.00" },
                  { servicio: `Consumo autorizado (${cupoFact.toLocaleString()} consultas)`, valor: `$ ${(montoNum - 100).toFixed(2)}` }
                ]
              };
            }
            if (!nuevaPasarela) {
              nuevaPasarela = {
                ordenId: `ORD-PAG-2026-${s.id.slice(-4)}`,
                estadoPasarela: "PENDIENTE",
                intentosRealizados: 0,
                maxIntentos: 3,
                vigenciaOrdenMinutos: 45,
                fechaCreacionOrden: now
              };
            }
            nuevosEventos.push({
              fecha: now,
              evento: "Factura automática emitida vía API (FAC-01)",
              actor: "Motor Tarifario + API Facturación Electrónica",
              detalle: `Factura ${nuevaFactura.numero} emitida por ${nuevaFactura.valor} según versión tarifaria ${nuevaFactura.versionTarifaria}. Orden de pasarela ${nuevaPasarela.ordenId} habilitada.`
            });
          } else {
            nuevoEstado = "Aprobación final";
            nuevoResponsable = "Director de Gestión";
          }
        }

        return {
          ...s,
          contratoDetalle: updatedContrato,
          estado: nuevoEstado,
          responsable: nuevoResponsable,
          factura: nuevaFactura,
          pasarelaPago: nuevaPasarela,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // FAC-01 + PAG-01 + PAG-02: Pagar factura electrónica en pasarela y confirmar idempotentemente
  const pagarFacturaElectronica = useCallback((id: string, params?: { metodo?: string; referencia?: string }) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const refTrans = params?.referencia || `TX-PASARELA-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated = current.map(s => {
      if (s.id === id) {
        const prevIntentos = s.pasarelaPago?.intentosRealizados || 0;
        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Pago confirmado en pasarela electrónica (PAG-02)",
            actor: "Pasarela de Pagos DINARP",
            detalle: `Webhook firmado verificado idempotentemente mediante ${params?.metodo || "Tarjeta Corporativa / Débito Bancario"}. Ref: ${refTrans}. Monto conciliado: ${s.factura?.valor || "$ 150.00"}. Expediente pasa a Listo para aprobación final (SOL-10).`
          }
        ];

        return {
          ...s,
          estado: "Pago verificado" as const,
          responsable: "Director de Gestión",
          pasarelaPago: {
            ordenId: s.pasarelaPago?.ordenId || `ORD-PAG-2026-${s.id.slice(-4)}`,
            estadoPasarela: "CONFIRMADO" as const,
            intentosRealizados: prevIntentos + 1,
            maxIntentos: s.pasarelaPago?.maxIntentos || 3,
            vigenciaOrdenMinutos: s.pasarelaPago?.vigenciaOrdenMinutos || 45,
            fechaCreacionOrden: s.pasarelaPago?.fechaCreacionOrden || now,
            fechaConfirmacion: now,
            referenciaTransaccion: refTrans,
            metodoPago: params?.metodo || "Tarjeta Corporativa / Débito Bancario",
            montoConfirmado: s.factura?.valor || "$ 150.00",
            desbloqueosAutorizados: s.pasarelaPago?.desbloqueosAutorizados || 0
          },
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // FAC-02: Simular fallo / divergencia en emisión automática de factura
  const simularDivergenciaFactura = useCallback((id: string, detalleError?: string) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const msg = detalleError || "HTTP 502 Bad Gateway / Divergencia de secuencial en servicio externo de Facturación Electrónica. Cobro bloqueado hasta conciliación.";
        return {
          ...s,
          estado: "Divergencia de facturación" as const,
          responsable: "Administrador / Conciliación Financiera",
          factura: {
            numero: s.factura?.numero || `PEND-FAC-${s.id.slice(-4)}`,
            fechaEmision: s.factura?.fechaEmision || dateOnly,
            valor: s.factura?.valor || "$ 150.00",
            estadoEmision: "DIVERGENCIA_API" as const,
            tipoEventoFacturable: s.factura?.tipoEventoFacturable || "contrato_inicial",
            conceptoFacturable: s.factura?.conceptoFacturable || "TAR-PRIV-001 (Paquete Base Interoperabilidad)",
            versionTarifaria: s.factura?.versionTarifaria || "TAR-2026-V2 (Vigente)",
            cupoFacturado: s.factura?.cupoFacturado || s.cupoAprobado || s.cupo || 50000,
            baseTarifaria: s.factura?.baseTarifaria || s.factura?.valor || "$ 150.00",
            descuentosAplicables: s.factura?.descuentosAplicables || "$ 0.00",
            impuestos: s.factura?.impuestos || "$ 0.00",
            modoRedondeo: "HALF_UP",
            precisionDecimales: 2,
            errorApiDetalle: msg,
            detalleServicios: s.factura?.detalleServicios || [{ servicio: "Habilitación y cupo contratado", valor: s.factura?.valor || "$ 150.00" }]
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Fallo o divergencia en emisión de factura (FAC-02)",
              actor: "API Facturación Electrónica",
              detalle: `${msg} No se habilita el cobro en pasarela hasta conciliar emisión.`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // FAC-02: Conciliar o reintentar emisión de factura sin duplicar documento
  const conciliarEmisionFactura = useCallback((id: string, actor = "Administrador Financiero DINARP") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const numFac = s.factura?.numero?.startsWith("PEND-")
          ? s.factura.numero.replace("PEND-", "FAC-2026-")
          : (s.factura?.numero || `FAC-2026-${s.id.slice(-4)}`);
        return {
          ...s,
          estado: "Pendiente de pago" as const,
          responsable: "Coordinador SINARP",
          factura: {
            ...(s.factura || { fechaEmision: dateOnly, valor: "$ 150.00" }),
            numero: numFac,
            estadoEmision: "EMITIDA" as const,
            errorApiDetalle: undefined
          },
          pasarelaPago: s.pasarelaPago || {
            ordenId: `ORD-PAG-2026-${s.id.slice(-4)}`,
            estadoPasarela: "PENDIENTE",
            intentosRealizados: 0,
            maxIntentos: 3,
            vigenciaOrdenMinutos: 45,
            fechaCreacionOrden: now
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Emisión de factura conciliada exitosamente (FAC-02)",
              actor,
              detalle: `Se verificó e integró sin duplicidad la factura electrónica ${numFac}. Se habilita el cobro en pasarela de pagos (PAG-01).`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // PAG-03: Registrar intento de pago fallido o expirado; bloquea al llegar a max_intentos_pago
  const registrarIntentoPagoFallido = useCallback((id: string, motivo = "Rechazo de autorización 3DSecure / Fondos insuficientes") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const maxInt = s.pasarelaPago?.maxIntentos || 3;
        const nuevosIntentos = (s.pasarelaPago?.intentosRealizados || 0) + 1;
        const bloqueado = nuevosIntentos >= maxInt;

        return {
          ...s,
          estado: (bloqueado ? "Pago bloqueado por intentos" : "Pendiente de pago") as SolicitudEstado,
          responsable: bloqueado ? "Administrador (Desbloqueo PAG-05)" : "Coordinador SINARP",
          pasarelaPago: {
            ordenId: s.pasarelaPago?.ordenId || `ORD-PAG-2026-${s.id.slice(-4)}`,
            estadoPasarela: (bloqueado ? "BLOQUEADO_INTENTOS" : "RECHAZADO") as PasarelaPagoInfo["estadoPasarela"],
            intentosRealizados: nuevosIntentos,
            maxIntentos: maxInt,
            vigenciaOrdenMinutos: s.pasarelaPago?.vigenciaOrdenMinutos || 45,
            fechaCreacionOrden: s.pasarelaPago?.fechaCreacionOrden || now,
            ultimoMotivoFallo: motivo,
            desbloqueosAutorizados: s.pasarelaPago?.desbloqueosAutorizados || 0
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: bloqueado
                ? `Pago bloqueado por límite de intentos (${nuevosIntentos}/${maxInt}) (PAG-03)`
                : `Intento de pago #${nuevosIntentos} fallido (${nuevosIntentos}/${maxInt}) (PAG-03)`,
              actor: "Pasarela de Pagos DINARP",
              detalle: bloqueado
                ? `Motivo: ${motivo}. Se alcanzó max_intentos_pago (${maxInt}). La solicitud queda sin habilitación hasta autorización administrativa (PAG-05).`
                : `Motivo: ${motivo}. Quedan ${maxInt - nuevosIntentos} intento(s) disponible(s) sobre la misma factura.`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // PAG-02 Criterio 3: Simular divergencia de monto/referencia en pasarela (En conciliación)
  const simularPagoDivergenteConciliacion = useCallback((id: string, detalleDivergencia?: string) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const msg = detalleDivergencia || `Divergencia de importe entre factura (${s.factura?.valor || "$ 150.00"}) y notificación de pasarela ($ 142.50). Se bloquea el paso a aprobación final hasta conciliación.`;
        return {
          ...s,
          estado: "En conciliación" as const,
          responsable: "Administrador / Conciliación de Pasarela",
          pasarelaPago: {
            ordenId: s.pasarelaPago?.ordenId || `ORD-PAG-2026-${s.id.slice(-4)}`,
            estadoPasarela: "EN_CONCILIACION" as const,
            intentosRealizados: (s.pasarelaPago?.intentosRealizados || 0) + 1,
            maxIntentos: s.pasarelaPago?.maxIntentos || 3,
            vigenciaOrdenMinutos: s.pasarelaPago?.vigenciaOrdenMinutos || 45,
            referenciaTransaccion: `TX-DIV-${Math.floor(100000 + Math.random() * 900000)}`,
            montoConfirmado: "$ 142.50",
            divergenciaDetalle: msg
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Pago retenido en conciliación por divergencia (PAG-02)",
              actor: "Pasarela de Pagos DINARP",
              detalle: msg
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // PAG-02 Criterio 3: Conciliar pago divergente en pasarela
  const conciliarPagoPasarela = useCallback((id: string, notaConciliacion: string, actor = "Administrador Financiero DINARP") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        return {
          ...s,
          estado: "Pago verificado" as const,
          responsable: "Director de Gestión",
          pasarelaPago: {
            ...(s.pasarelaPago || {
              ordenId: `ORD-PAG-2026-${s.id.slice(-4)}`,
              intentosRealizados: 1,
              maxIntentos: 3,
              vigenciaOrdenMinutos: 45
            }),
            estadoPasarela: "CONFIRMADO" as const,
            fechaConfirmacion: now,
            montoConfirmado: s.factura?.valor || "$ 150.00",
            divergenciaDetalle: undefined
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Divergencia de pago conciliada y confirmada (PAG-02)",
              actor,
              detalle: `Conciliación aprobada: ${notaConciliacion}. El expediente avanza a Listo para aprobación final (SOL-10).`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // PAG-05: Autorizar nuevo intento seguro de pago tras bloqueo por intentos
  const autorizarNuevosIntentosPago = useCallback((id: string, motivo: string, actor = "Administrador Autorizado DINARP") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const prevMax = s.pasarelaPago?.maxIntentos || 3;
        const nuevoMax = prevMax + 1;
        const desbloqueos = (s.pasarelaPago?.desbloqueosAutorizados || 0) + 1;

        return {
          ...s,
          estado: "Pendiente de pago" as const,
          responsable: "Coordinador SINARP",
          pasarelaPago: {
            ordenId: s.pasarelaPago?.ordenId || `ORD-PAG-2026-${s.id.slice(-4)}`,
            estadoPasarela: "PENDIENTE" as const,
            intentosRealizados: s.pasarelaPago?.intentosRealizados || 3,
            maxIntentos: nuevoMax,
            vigenciaOrdenMinutos: s.pasarelaPago?.vigenciaOrdenMinutos || 45,
            fechaCreacionOrden: now,
            ultimoMotivoFallo: undefined,
            desbloqueosAutorizados: desbloqueos
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Nuevo intento de pago autorizado sobre la misma factura (PAG-05)",
              actor,
              detalle: `Se habilitó 1 intento adicional seguro (límite ampliado a ${nuevoMax}) manteniendo la factura vigente ${s.factura?.numero || ""}. Motivo: ${motivo}`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // PAG-04: Revertir o anular pago confirmado posterior -> Cerrada por reversión + Revocación Apigee (ACC-06)
  const revertirPagoConfirmado = useCallback((id: string, motivo: string, actor = "Administrador / Pasarela de Pagos DINARP") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const teniaCredenciales = Boolean(s.credenciales);
        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Reversión / Contracargo de pago confirmado (PAG-04)",
            actor,
            detalle: `Pago revertido sobre factura ${s.factura?.numero || "N/A"}. Motivo: ${motivo}. La solicitud pasa a Cerrada por reversión.`
          }
        ];

        if (teniaCredenciales) {
          nuevosEventos.push({
            fecha: now,
            evento: "Revocación inmediata de acceso técnico en Apigee (ACC-06)",
            actor: "Plataforma de Interoperabilidad DINARP (Apigee)",
            detalle: `Credencial ${s.credenciales?.usuario} revocada automáticamente por reversión posterior del pago (PAG-04).`
          });
        }

        return {
          ...s,
          estado: "Cerrada por reversión" as const,
          responsable: "Archivo / Control Financiero",
          pasarelaPago: s.pasarelaPago
            ? {
                ...s.pasarelaPago,
                estadoPasarela: "REVERTIDO" as const,
                motivoReversion: motivo,
                fechaReversion: now
              }
            : undefined,
          aprovisionamiento: teniaCredenciales
            ? {
                estado: "REVOCADO" as const,
                reintentosCount: s.aprovisionamiento?.reintentosCount || 0,
                ultimoIntento: now,
                mensajeResultado: "Acceso revocado en Apigee por reversión de pago confirmado (PAG-04 / ACC-06)."
              }
            : s.aprovisionamiento,
          credenciales: s.credenciales
            ? {
                ...s.credenciales,
                estadoApigee: "REVOCADO" as const,
                fechaExpiracion: `${now} (Revocada por reversión de pago)`
              }
            : undefined,
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // SOL-09 Criterio 3: Reintentar integración idempotente de expediente público
  const reintentarIntegracionExpedientePublico = useCallback((id: string, actor = "Director de Gestión") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        return {
          ...s,
          estado: "Listo para aprobación final" as const,
          responsable: "Director de Gestión",
          integracionPendienteDetalle: undefined,
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Integración de expediente público completada (SOL-09)",
              actor,
              detalle: "Reintento idempotente exitoso: revisiones e informes vinculados al expediente sin duplicar registros. Pasa a Listo para aprobación final."
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // DOC-01 Criterio 3: Simular o resolver estado Pendiente de plantilla (PAR-02)
  const simularPendientePlantillaContrato = useCallback((id: string, activarPlantilla: boolean, actor = "Abg. Santiago Valdivieso (Jurídica)") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        if (!activarPlantilla) {
          return {
            ...s,
            estado: "Pendiente de plantilla" as const,
            plantillaPendienteDetalle: "No existe versión activa publicada de plantilla de contrato privado en el catálogo PAR-02. La generación de borrador queda bloqueada hasta su publicación.",
            ultimaActualizacion: dateOnly,
            historial: [
              ...s.historial,
              {
                fecha: now,
                evento: "Solicitud en espera de plantilla activa (DOC-01 / PAR-02)",
                actor,
                detalle: "Se detectó ausencia de plantilla activa en PAR-02. Estado actualizado a Pendiente de plantilla."
              }
            ]
          };
        } else {
          return {
            ...s,
            estado: "En formalización" as const,
            plantillaPendienteDetalle: undefined,
            ultimaActualizacion: dateOnly,
            historial: [
              ...s.historial,
              {
                fecha: now,
                evento: "Plantilla activa PAR-02 vinculada (DOC-01)",
                actor,
                detalle: "Se verificó plantilla institucional activa PLM-CONTR-2026-V3. Habilitada la generación del borrador de contrato."
              }
            ]
          };
        }
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // SOL-10 Criterio 2: Observar y devolver al área correspondiente desde Aprobación Final (sin rechazo definitivo ni ACC-01)
  const devolverDesdeAprobacionFinal = useCallback((
    id: string,
    params: {
      areaDestino: "Gestión" | "Normatividad" | "Jurídica" | "Jurídica (Contratos)" | "Facturación / Pasarela";
      observacion: string;
      director?: string;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const directorStr = params.director || "Dr. Roberto Andrade (Director de Gestión)";

    const updated = current.map(s => {
      if (s.id === id) {
        let nuevoEstado: SolicitudEstado = "En revisión de Gestión";
        let nuevoResponsable = "Revisor de Gestión";

        if (params.areaDestino === "Normatividad") {
          nuevoEstado = "En revisión normativa";
          nuevoResponsable = "Director de Normatividad";
        } else if (params.areaDestino === "Jurídica (Contratos)" || params.areaDestino === "Jurídica") {
          nuevoEstado = "En formalización";
          nuevoResponsable = "Abg. Santiago Valdivieso (Jurídica)";
        } else if (params.areaDestino === "Facturación / Pasarela") {
          nuevoEstado = "En conciliación";
          nuevoResponsable = "Administrador / Conciliación de Pasarela";
        }

        return {
          ...s,
          estado: nuevoEstado,
          responsable: nuevoResponsable,
          areaDevolucionFinal: params.areaDestino,
          observaciones: params.observacion,
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: `Observada en Aprobación Final y devuelta a ${params.areaDestino} (SOL-10)`,
              actor: directorStr,
              detalle: `Inconsistencia detectada antes de emitir resolución final: "${params.observacion}". Se devuelve al área de ${params.areaDestino} sin rechazo definitivo y sin ejecutar aprovisionamiento ACC-01.`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // SOL-10 + ACC-01: Aprobación final por Director de Gestión (con opción de simular fallo inicial en Apigee ACC-02)
  const aprobarFinalGestion = useCallback((id: string, params: { director?: string; directorNombre?: string; resolucionNumero?: string; notas?: string; simularFalloApigee?: boolean }) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const directorStr = params.director || params.directorNombre || "Dr. Roberto Andrade (Director de Gestión de la Información)";

    const updated = current.map(s => {
      if (s.id === id) {
        const cupoVigente = s.contratoDetalle?.cantidadContratada || s.cupoAprobado || s.cupo || 50000;
        const esPrivada = s.tipoInstitucion === "Privada";

        if (params.simularFalloApigee) {
          const nuevosEventosErr: TrazabilidadEvento[] = [
            ...s.historial,
            {
              fecha: now,
              evento: "Aprobación final otorgada (SOL-10)",
              actor: directorStr,
              detalle: `Expediente aprobado mediante ${params.resolucionNumero || "RES-DINARP-2026"}. Solicitud aprobada — habilitación técnica pendiente.`
            },
            {
              fecha: now,
              evento: "Fallo en aprovisionamiento técnico en Apigee (ACC-01 / ACC-02)",
              actor: "API Gateway Apigee DINARP",
              detalle: "HTTP 504 Gateway Timeout al configurar Developer App y política de cuota en Apigee. La aprobación administrativa se conserva y pasa a cola de reintento TI."
            }
          ];

          return {
            ...s,
            estado: "Habilitación técnica" as const,
            fechaAprobacion: dateOnly,
            responsable: "Equipo TI",
            aprovisionamiento: {
              estado: "ERROR" as const,
              reintentosCount: 1,
              ultimoIntento: now,
              mensajeResultado: "Error de conexión con Apigee: HTTP 504 Gateway Timeout al propagar política de cuota.",
              referenciaTecnica: `ERR_APIGEE_PROV_${s.id.slice(-3)}`,
              tipoFallo: "HABILITACION_INICIAL" as const
            },
            ultimaActualizacion: dateOnly,
            historial: nuevosEventosErr
          };
        }

        const defaultCampos = s.fuentes?.flatMap(f => f.campos?.map(c => c.nombre) || []) || [];
        const cleanName = s.institucion.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
        const creds: CredencialesAcceso = s.credenciales || {
          usuario: `ws_${cleanName}_${s.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          contrasena: `Temp$ec_${Math.random().toString(36).slice(-6)}*2026`,
          endpoint: `https://interoperabilidad.dinarp.gob.ec/api/v2/servicios/${s.id.toLowerCase()}`,
          tipoAutenticacion: "OAuth 2.0 (Bearer Token)",
          ambiente: "Producción (Ambiente Seguro DINARP - Apigee)",
          fechaGeneracion: now,
          fechaExpiracion: "2027-09-30 23:59 (Activa)",
          camposAutorizados: defaultCampos.length > 0 ? defaultCampos : ["cedulaCiudadania", "nombresCompletos"],
          esSecretoTemporal: true,
          estadoApigee: "ACTIVO",
          cupoAutorizadoVigente: cupoVigente,
          tipoPoliticaCupo: esPrivada ? "BLOQUEANTE_PRIVADA" : "REFERENCIA_ALERTA_PUBLICA"
        };

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Aprobación final otorgada (SOL-10)",
            actor: directorStr,
            detalle: params.resolucionNumero
              ? `Expediente aprobado mediante ${params.resolucionNumero}. Orden de aprovisionamiento técnico emitida hacia Apigee.`
              : `Expediente de interoperabilidad aprobado formalmente. Orden de aprovisionamiento técnico emitida hacia Apigee.`
          },
          {
            fecha: now,
            evento: "Acceso técnico habilitado en Apigee (ACC-01)",
            actor: "Plataforma de Interoperabilidad DINARP (Apigee)",
            detalle: `Aprovisionamiento completado con éxito. Cupo autorizado vigente: ${cupoVigente.toLocaleString()} consultas (${esPrivada ? "Límite bloqueante privado" : "Referencia no bloqueante con alerta pública"}). Secreto temporal inicial generado (requiere sustitución ACC-09).`
          }
        ];

        return {
          ...s,
          estado: "Acceso habilitado" as const,
          fechaAprobacion: dateOnly,
          responsable: "Coordinador SINARP",
          credenciales: creds,
          aprovisionamiento: {
            estado: "EXITOSO" as const,
            reintentosCount: 0,
            fechaHabilitacion: now,
            mensajeResultado: `Aprovisionamiento exitoso en Apigee. Cupo vigente: ${cupoVigente.toLocaleString()} consultas (${esPrivada ? "Bloqueante" : "Referencia/Alerta"}).`
          },
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // ACC-02: Reintentar aprovisionamiento técnico (Equipo TI)
  const reintentarAprovisionamiento = useCallback((id: string, params?: { usuarioTI?: string }) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const cupoVigente = s.contratoDetalle?.cantidadContratada || s.cupoAprobado || s.cupo || 80000;
        const esPrivada = s.tipoInstitucion === "Privada";
        const defaultCampos = s.fuentes?.flatMap(f => f.campos?.map(c => c.nombre) || []) || [];
        const cleanName = s.institucion.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
        const creds: CredencialesAcceso = s.credenciales || {
          usuario: `ws_${cleanName}_${s.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          contrasena: `Temp$ec_${Math.random().toString(36).slice(-6)}*2026`,
          endpoint: `https://interoperabilidad.dinarp.gob.ec/api/v2/servicios/${s.id.toLowerCase()}`,
          tipoAutenticacion: "OAuth 2.0 (Bearer Token)",
          ambiente: "Producción (Ambiente Seguro DINARP - Apigee)",
          fechaGeneracion: now,
          fechaExpiracion: "2027-09-30 23:59 (Activa)",
          camposAutorizados: defaultCampos.length > 0 ? defaultCampos : ["codigoOperador", "estadoFrecuencia"],
          esSecretoTemporal: true,
          estadoApigee: "ACTIVO",
          cupoAutorizadoVigente: cupoVigente,
          tipoPoliticaCupo: esPrivada ? "BLOQUEANTE_PRIVADA" : "REFERENCIA_ALERTA_PUBLICA"
        };

        const reintentos = (s.aprovisionamiento?.reintentosCount || 0) + 1;

        const nuevosEventos: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Reintento de aprovisionamiento exitoso en Apigee (ACC-02)",
            actor: params?.usuarioTI || "Ing. Carlos Mena (Equipo TI)",
            detalle: `Reintento #${reintentos} ejecutado idempotentemente. Sincronización de alcance y cupo (${cupoVigente.toLocaleString()} consultas) completada en API Gateway.`
          },
          {
            fecha: now,
            evento: "Acceso técnico habilitado (ACC-01)",
            actor: "Plataforma de Interoperabilidad DINARP",
            detalle: `Credenciales de consumo emitidas con secreto temporal inicial y activadas para la institución.`
          }
        ];

        return {
          ...s,
          estado: "Acceso habilitado" as const,
          responsable: "Coordinador SINARP",
          credenciales: creds,
          aprovisionamiento: {
            estado: "EXITOSO" as const,
            reintentosCount: reintentos,
            fechaHabilitacion: now,
            mensajeResultado: "Aprovisionamiento reintentado y validado con éxito en Apigee tras resolución de contingencia."
          },
          ultimaActualizacion: dateOnly,
          historial: nuevosEventos
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // ACC-09: Sustituir secreto técnico temporal por secreto definitivo generado por la plataforma
  const sustituirSecretoTemporal = useCallback((id: string, actor = "Andrea López (Coordinadora SINARP)") => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id && s.credenciales) {
        const highEntropySecret = `Dinarp#Def_${Math.random().toString(36).slice(-5).toUpperCase()}$${Math.floor(1000 + Math.random() * 9000)}!Apg`;
        return {
          ...s,
          credenciales: {
            ...s.credenciales,
            contrasena: highEntropySecret,
            esSecretoTemporal: false,
            fechaSustitucionSecreto: now,
            estadoApigee: "ACTIVO" as const
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Secreto técnico temporal sustituido por definitivo (ACC-09)",
              actor,
              detalle: "Reautenticación verificada. Apigee generó nuevo secreto definitivo de alta entropía e invalidó el secreto temporal inicial."
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // ACC-05 y ACC-07: Rotar credencial por decisión institucional o incidente (con opción de simular fallo en Apigee)
  const rotarCredencialInstitucional = useCallback((
    id: string,
    params: {
      motivo: string;
      actor?: string;
      simularFalloApigee?: boolean;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const actorStr = params.actor || "Andrea López (Coordinadora SINARP)";

    const updated = current.map(s => {
      if (s.id === id && s.credenciales) {
        if (params.simularFalloApigee) {
          return {
            ...s,
            credenciales: {
              ...s.credenciales,
              alertaIncidenteSeguridad: `Fallo de rotación en Apigee (${now}): La credencial anterior permanece activa hasta confirmar reemplazo (ACC-05 / ACC-07).`,
              estadoApigee: "ROTACION_FALLIDA" as const
            },
            aprovisionamiento: {
              estado: "ERROR" as const,
              reintentosCount: (s.aprovisionamiento?.reintentosCount || 0) + 1,
              ultimoIntento: now,
              mensajeResultado: "Fallo al rotar Consumer Secret en Apigee (HTTP 503). Se mantiene credencial previa para no interrumpir operación y se alerta a TI.",
              referenciaTecnica: `ERR_APIGEE_ROT_${s.id.slice(-3)}`,
              tipoFallo: "ROTACION_CREDENCIAL" as const
            },
            ultimaActualizacion: dateOnly,
            historial: [
              ...s.historial,
              {
                fecha: now,
                evento: "Fallo en rotación de credencial y alerta a TI (ACC-05 / ACC-07)",
                actor: "API Gateway Apigee DINARP",
                detalle: `Intento de rotación solicitado por ${actorStr} (${params.motivo}) falló en Apigee. No se invalidó la credencial anterior sin reemplazo confirmado.`
              }
            ]
          };
        }

        const rotatedSecret = `Rot#Apg2026_${Math.random().toString(36).slice(-6).toUpperCase()}*${Math.floor(100 + Math.random() * 899)}`;
        const rotCount = (s.credenciales.rotacionCount || 0) + 1;

        return {
          ...s,
          credenciales: {
            ...s.credenciales,
            contrasena: rotatedSecret,
            esSecretoTemporal: false,
            rotacionCount: rotCount,
            ultimaRotacionFecha: now,
            ultimaRotacionMotivo: params.motivo,
            alertaIncidenteSeguridad: undefined,
            estadoApigee: "ACTIVO" as const
          },
          aprovisionamiento: {
            estado: "EXITOSO" as const,
            reintentosCount: s.aprovisionamiento?.reintentosCount || 0,
            fechaHabilitacion: now,
            mensajeResultado: `Rotación de credencial #${rotCount} sincronizada exitosamente en Apigee.`
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: `Credencial técnica rotada exitosamente (#${rotCount}) (ACC-05)`,
              actor: actorStr,
              detalle: `Nueva credencial emitida en Apigee e invalidada la anterior. Motivo: ${params.motivo}`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // ACC-06: Suspender o revocar acceso técnico en Apigee
  const suspenderRevocarAccesoTecnico = useCallback((
    id: string,
    params: {
      tipoAccion: "SUSPENDER" | "REVOCAR" | "REACTIVAR";
      causa: string;
      actor?: string;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const actorStr = params.actor || "Ing. Carlos Mena (Equipo TI / Seguridad)";

    const updated = current.map(s => {
      if (s.id === id) {
        const esSuspender = params.tipoAccion === "SUSPENDER";
        const esRevocar = params.tipoAccion === "REVOCAR";
        const nuevoEstado: SolicitudEstado = esRevocar
          ? "Acceso revocado"
          : esSuspender
            ? "Acceso suspendido"
            : "Acceso habilitado";

        const nuevoEstadoApigee = esRevocar
          ? ("REVOCADO" as const)
          : esSuspender
            ? ("SUSPENDIDO" as const)
            : ("ACTIVO" as const);

        return {
          ...s,
          estado: nuevoEstado,
          credenciales: s.credenciales
            ? {
                ...s.credenciales,
                estadoApigee: nuevoEstadoApigee,
                fechaExpiracion: esRevocar
                  ? `${now} (Revocada definitivamente)`
                  : esSuspender
                    ? `${now} (Suspendida temporalmente)`
                    : "2027-09-30 23:59 (Activa)"
              }
            : undefined,
          aprovisionamiento: {
            estado: (esRevocar ? "REVOCADO" : esSuspender ? "SUSPENDIDO" : "EXITOSO") as AprovisionamientoTecnico["estado"],
            reintentosCount: s.aprovisionamiento?.reintentosCount || 0,
            ultimoIntento: now,
            mensajeResultado: `${esRevocar ? "Revocación definitiva" : esSuspender ? "Suspensión temporal" : "Reactivación"} ejecutada en Apigee. Causa: ${params.causa}`
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: `${esRevocar ? "Acceso técnico revocado" : esSuspender ? "Acceso técnico suspendido" : "Acceso técnico reactivado"} en Apigee (ACC-06)`,
              actor: actorStr,
              detalle: `Causa institucional/técnica: ${params.causa}. Sincronizado con API Gateway Apigee.`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // ACC-08: Actualizar alcance o cupo_autorizado_vigente en Apigee
  const actualizarAlcanceCupoApigee = useCallback((
    id: string,
    params: {
      nuevoCupo: number;
      nuevosCampos?: string[];
      motivo: string;
      actor?: string;
    }
  ) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const actorStr = params.actor || "Dr. Roberto Andrade (Director de Gestión)";

    const updated = current.map(s => {
      if (s.id === id) {
        const cupoAnterior = s.credenciales?.cupoAutorizadoVigente || s.cupoAprobado || s.cupo || 50000;
        return {
          ...s,
          cupoAprobado: params.nuevoCupo,
          credenciales: s.credenciales
            ? {
                ...s.credenciales,
                cupoAutorizadoVigente: params.nuevoCupo,
                camposAutorizados: params.nuevosCampos || s.credenciales.camposAutorizados
              }
            : undefined,
          aprovisionamiento: {
            estado: "EXITOSO" as const,
            reintentosCount: s.aprovisionamiento?.reintentosCount || 0,
            fechaHabilitacion: now,
            mensajeResultado: `Actualización de alcance/cupo sincronizada en Apigee (ACC-08): ${cupoAnterior.toLocaleString()} -> ${params.nuevoCupo.toLocaleString()} consultas.`
          },
          ultimaActualizacion: dateOnly,
          historial: [
            ...s.historial,
            {
              fecha: now,
              evento: "Alcance y cupo autorizado actualizados en Apigee (ACC-08)",
              actor: actorStr,
              detalle: `Cupo autorizado vigente actualizado de ${cupoAnterior.toLocaleString()} a ${params.nuevoCupo.toLocaleString()} consultas sin perder trazabilidad del acceso anterior. Motivo: ${params.motivo}`
            }
          ]
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Reset para demostración
  const resetSimulacion = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }, []);

  return {
    solicitudes,
    getSolicitudById,
    aprobarSolicitud,
    rechazarSolicitud,
    solicitarAjustes,
    reenviarSolicitud,
    crearNuevaSolicitud,
    asignarRevisorGestion,
    aprobarGestion,
    observarGestion,
    subsanarYReenviar,
    cerrarPorVencimiento,
    asignarRevisorNormativa,
    aprobarNormativa,
    firmarInformeNormativa,
    observarNormativa,
    simularPagoRealizado,
    validarPagoConCur,
    generarAcceso,
    generarContrato,
    editarBorradorContrato,
    enviarContratoAFirmas,
    firmarContrato,
    pagarFacturaElectronica,
    simularDivergenciaFactura,
    conciliarEmisionFactura,
    registrarIntentoPagoFallido,
    simularPagoDivergenteConciliacion,
    conciliarPagoPasarela,
    autorizarNuevosIntentosPago,
    revertirPagoConfirmado,
    reintentarIntegracionExpedientePublico,
    simularPendientePlantillaContrato,
    devolverDesdeAprobacionFinal,
    aprobarFinalGestion,
    reintentarAprovisionamiento,
    sustituirSecretoTemporal,
    rotarCredencialInstitucional,
    suspenderRevocarAccesoTecnico,
    actualizarAlcanceCupoApigee,
    resetSimulacion
  };
}
