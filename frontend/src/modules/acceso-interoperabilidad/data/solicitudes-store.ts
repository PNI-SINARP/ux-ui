"use client";

import { useState, useEffect, useCallback } from "react";

export interface CampoDetalle {
  id: string;
  nombre: string;
  descripcion: string;
  tipo?: string;
  clasificacion: "Accesible" | "Confidencial";
  finalidad: string;
  fundamento?: string;
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
    | "Por asignar"
    | "Por revisar"
    | "En revisión"
    | "Reenviada"
    | "Aprobada"
    | "Rechazada"
    | "Observada"
    | "Pago pendiente"
  | "Con observaciones"
  | "Pago pendiente"
  | "Pendiente de validación de pago"
  | "Pago en validación"
  | "Pago validado"
  | "Pago verificado"
  | "Creación de paquetes"
  | "Acceso generado";

export interface CredencialesAcceso {
  usuario: string;
  contrasena: string;
  endpoint: string;
  tipoAutenticacion?: string;
  ambiente?: string;
  fechaGeneracion?: string;
  fechaExpiracion?: string;
  camposAutorizados?: string[];
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
  instrumento?: "Convenio" | "Contrato";
  contrato?: string;
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
    detalleServicios?: { servicio: string; valor: string }[];
  };
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

const STORAGE_KEY = "dinarp_solicitudes_v6";

export const INITIAL_SOLICITUDES: SolicitudAcceso[] = [
  {
    id: "SOL-2026-001",
    institucion: "Ministerio de Telecomunicaciones y de la Sociedad de la Información (MINTEL)",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    fecha: "2026-09-20 09:00",
    fechaAprobacion: "2026-09-22",
    ultimaActualizacion: "2026-09-23 10:30",
    estado: "Acceso generado",
    responsable: "Coordinador SINARP",
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
      camposAutorizados: ["cedulaCiudadania", "nombresCompletos", "fechaNacimiento"]
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
    fecha: "2026-09-22 09:30",
    ultimaActualizacion: "2026-09-22 11:00",
    estado: "Por revisar",
    responsable: "Director de Gestión",
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
      { fecha: "2026-09-22 11:00", evento: "Por revisar", actor: "Aprobador", detalle: "Asignado para validación de justificación y finalidad de uso de datos." }
    ]
  },
  {
    id: "SOL-2026-007",
    institucion: "IESS",
    tipoInstitucion: "Pública",
    coordinador: "Andrea López",
    fecha: "2026-09-21 14:00",
    ultimaActualizacion: "2026-09-23 08:45",
    estado: "Reenviada",
    responsable: "Aprobador",
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
      { fecha: "2026-09-21 16:00", evento: "En revisión", actor: "Aprobador" },
      { fecha: "2026-09-22 09:10", evento: "Solicitud rechazada con observaciones", actor: "Aprobador", detalle: "Se requirió fundamentar específicamente el campo confidencial con base legal vigente." },
      { fecha: "2026-09-23 08:45", evento: "Ajustes subsanados y reenviada", actor: "Coordinador SINARP", detalle: "Se adjuntó Memoria Técnica v2 y aclaración de fundamento legal. Reingreso para dictamen." }
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
    estado: "Pago pendiente",
    responsable: "Facturación",
    fuentesCount: 2,
    camposCount: 2,
    fuentePrincipal: "Servicio de Rentas Internas / Buró",
    servicioPrincipal: "Validación Tributaria y Score Financiero",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0019",
    factura: {
      numero: "FAC-0028",
      fechaEmision: "2026-09-22",
      valor: "$ 150.00",
      detalleServicios: [
        { servicio: "estadoContribuyente (SRI)", valor: "$ 50.00" },
        { servicio: "historialCrediticio (Buró)", valor: "$ 100.00" }
      ]
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
      { fecha: "2026-09-22 08:30", evento: "Pago pendiente", actor: "Sistema Financiero", detalle: "Generación de factura FAC-0028 por valor de $ 150.00. Pendiente de pago por la entidad privada." }
    ]
  },
  {
    id: "SOL-2026-008",
    institucion: "Produbanco S.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    fecha: "2026-09-17 08:30",
    fechaAprobacion: "2026-09-20",
    ultimaActualizacion: "2026-09-23 08:00",
    estado: "Pendiente de validación de pago",
    responsable: "Facturación",
    fuentesCount: 2,
    camposCount: 3,
    fuentePrincipal: "Registro Civil / SRI",
    servicioPrincipal: "Consulta de Datos Identidad y Capacidad Legal",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0022",
    factura: {
      numero: "FAC-0031",
      fechaEmision: "2026-09-20",
      valor: "$ 280.00",
      detalleServicios: [
        { servicio: "datosIdentidad (Registro Civil)", valor: "$ 140.00" },
        { servicio: "estadoContribuyente (SRI)", valor: "$ 140.00" }
      ]
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
      { fecha: "2026-09-17 10:00", evento: "Enviada a revisión", actor: "Coordinador SINARP" },
      { fecha: "2026-09-18 09:00", evento: "En revisión", actor: "Aprobador" },
      { fecha: "2026-09-20 12:30", evento: "Aprobada", actor: "Aprobador", detalle: "Aprobación formal otorgada. Instrumento: Contrato CONTR-2026-0022." },
      { fecha: "2026-09-20 12:45", evento: "Pago pendiente", actor: "Sistema Financiero", detalle: "Factura FAC-0031 emitida por $ 280.00." },
      { fecha: "2026-09-22 16:30", evento: "Pago realizado", actor: "Produbanco S.A.", detalle: "Acreditación bancaria registrada en cuenta única del Tesoro Nacional." },
      { fecha: "2026-09-23 08:00", evento: "Pendiente de validación de pago", actor: "Facturación", detalle: "Pendiente de verificación de ingreso de fondos en SIGEF y anexo de CUR." }
    ]
  },
  {
    id: "SOL-2026-009",
    institucion: "Banco Guayaquil S.A.",
    tipoInstitucion: "Privada",
    coordinador: "Andrea López",
    fecha: "2026-09-15 09:30",
    fechaAprobacion: "2026-09-18",
    ultimaActualizacion: "2026-09-19 14:15",
    estado: "Pago validado",
    responsable: "Facturación",
    fuentesCount: 2,
    camposCount: 4,
    fuentePrincipal: "Registro Civil / SRI",
    servicioPrincipal: "Fuente Integrada de Autenticación Bancaria",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0015",
    factura: {
      numero: "FAC-0022",
      fechaEmision: "2026-09-18",
      valor: "$ 420.00",
      detalleServicios: [
        { servicio: "autenticacionBiometrica (Registro Civil)", valor: "$ 300.00" },
        { servicio: "validacionRUC (SRI)", valor: "$ 120.00" }
      ]
    },
    cur: {
      numeroCur: "CUR-008814",
      nombreArchivo: "CUR_SIGEF_BancoGuayaquil_Val.pdf",
      tamano: "1.4 MB",
      fechaRegistro: "2026-09-19 14:15",
      usuarioResponsable: "Lcda. Patricia Morales (Facturación)"
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
      { fecha: "2026-09-15 11:00", evento: "Enviada a revisión", actor: "Coordinador SINARP" },
      { fecha: "2026-09-16 10:20", evento: "En revisión", actor: "Aprobador" },
      { fecha: "2026-09-18 15:45", evento: "Aprobada", actor: "Aprobador", detalle: "Dictamen formal favorable. Instrumento: Contrato CONTR-2026-0015." },
      { fecha: "2026-09-18 16:00", evento: "Pago pendiente", actor: "Sistema Financiero", detalle: "Factura FAC-0022 emitida por $ 420.00." },
      { fecha: "2026-09-19 10:15", evento: "Pago realizado", actor: "Banco Guayaquil S.A.", detalle: "Acreditación confirmada mediante transferencia fiscal." },
      { fecha: "2026-09-19 11:00", evento: "Pendiente de validación de pago", actor: "Facturación", detalle: "Expediente ingresado para comprobación en SIGEF." },
      { fecha: "2026-09-19 14:00", evento: "Pago validado", actor: "Facturación", detalle: "Acreditación de fondos verificada satisfactoriamente en plataforma SIGEF." },
      { fecha: "2026-09-19 14:15", evento: "CUR anexado", actor: "Facturación", detalle: "Comprobante Único de Registro CUR-008814 anexado al expediente por Lcda. Patricia Morales." }
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
    responsable: "Facturación",
    fuentesCount: 2,
    camposCount: 3,
    fuentePrincipal: "Registro Civil / SRI",
    servicioPrincipal: "Autenticación Biométrica y Validación Tributaria",
    instrumento: "Contrato",
    contrato: "CONTR-2026-0008",
    factura: {
      numero: "FAC-0015",
      fechaEmision: "2026-08-14",
      valor: "$ 350.00",
      detalleServicios: [
        { servicio: "autenticacionBiometrica (Registro Civil)", valor: "$ 250.00" },
        { servicio: "estadoContribuyente (SRI)", valor: "$ 100.00" }
      ]
    },
    cur: {
      numeroCur: "CUR-007204",
      nombreArchivo: "CUR_SIGEF_BancoBolivariano.pdf",
      tamano: "1.2 MB",
      fechaRegistro: "2026-08-16 11:20",
      usuarioResponsable: "Lcda. Patricia Morales (Facturación)"
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
    credenciales: {
      usuario: "ws_bbolivariano_dinarp_prod",
      contrasena: "B0l1v@r1an0_Sec#2026*Prod",
      endpoint: "https://interoperabilidad.dinarp.gob.ec/api/v2/bancos/autenticacion",
      tipoAutenticacion: "OAuth 2.0 (mTLS + Bearer)",
      ambiente: "Producción (Ambiente Seguro DINARP)",
      fechaGeneracion: "2026-08-18 16:45",
      fechaExpiracion: "2027-08-18 23:59 (Activa)",
      camposAutorizados: ["cedulaCiudadania", "fotografiaFacial", "estadoContribuyente"]
    },
    historial: [
      { fecha: "2026-08-10 11:00", evento: "Solicitud creada", actor: "Coordinador SINARP" },
      { fecha: "2026-08-14 15:00", evento: "Aprobada", actor: "Aprobador" },
      { fecha: "2026-08-16 11:20", evento: "Pago validado y CUR anexado", actor: "Facturación" },
      { fecha: "2026-08-18 16:45", evento: "Acceso generado", actor: "Administrador DINARP", detalle: "Credenciales de consumo emitidas formalmente para ambiente bancario." }
    ]
  }
];

export function getStoredSolicitudes(): SolicitudAcceso[] {
  if (typeof window === "undefined") return INITIAL_SOLICITUDES;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Limpiar versiones anteriores obsoletas
      ["dinarp_solicitudes_v1", "dinarp_solicitudes_v2", "dinarp_solicitudes_v3", "dinarp_solicitudes_v4", "dinarp_solicitudes_v5"].forEach(k => {
        try { sessionStorage.removeItem(k); } catch (_) {}
      });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOLICITUDES));
      return INITIAL_SOLICITUDES;
    }
    const parsed: SolicitudAcceso[] = JSON.parse(raw);
    // Si la sesión no tiene el caso de uso con "Acceso generado", refrescar con INITIAL_SOLICITUDES
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
    window.dispatchEvent(new CustomEvent("solicitudes_updated", { detail: data }));
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

  // Flujo Coordinador: Reenviar solicitud subsanada
  const reenviarSolicitud = useCallback((id: string, comentarioSubsanacion?: string, nuevasFuentes?: FuenteDetalle[]) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);

    const updated = current.map(s => {
      if (s.id === id) {
        const nuevoHistorial: TrazabilidadEvento[] = [
          ...s.historial,
          {
            fecha: now,
            evento: "Ajustes subsanados y reenviada",
            actor: "Coordinador SINARP",
            detalle: comentarioSubsanacion || "Se realizaron las correcciones y precisiones solicitadas por el Aprobador."
          },
          {
            fecha: now,
            evento: "Por asignar",
            actor: "Director de Gestión",
            detalle: "La solicitud subsanada volvió a la bandeja del Director de Gestión para una nueva asignación."
          }
        ];
        return {
          ...s,
          fuentes: nuevasFuentes || s.fuentes,
          fuentesCount: nuevasFuentes ? nuevasFuentes.length : s.fuentesCount,
          camposCount: nuevasFuentes
            ? nuevasFuentes.reduce((acc, f) => acc + (f.campos?.length || 0), 0)
            : s.camposCount,
          estado: "Por asignar" as const,
          responsable: "Director de Gestión",
          ultimaActualizacion: dateOnly,
          historial: nuevoHistorial
        };
      }
      return s;
    });

    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
  }, []);

  // Flujo Coordinador: Crear nueva solicitud y enviar a firmas
  const crearNuevaSolicitud = useCallback((nueva: Partial<SolicitudAcceso>) => {
    const current = getStoredSolicitudes();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    const dateOnly = now.substring(0, 10);
    const newId = `SOL-2026-0${current.length + 10}`;

    const solicitudCompleta: SolicitudAcceso = {
      id: nueva.id || newId,
      institucion: nueva.institucion || "Ministerio de Salud Pública",
      tipoInstitucion: nueva.tipoInstitucion || "Pública",
      coordinador: nueva.coordinador || "Andrea López",
      fecha: now,
      ultimaActualizacion: dateOnly,
      estado: "Por revisar",
      responsable: "Aprobador",
      fuentesCount: nueva.fuentes?.length || 1,
      camposCount: nueva.camposCount || 2,
      fuentePrincipal: nueva.fuentePrincipal || nueva.fuentes?.[0]?.nombre || "Dirección General de Registro Civil, Identificación y Cedulación",
      servicioPrincipal: nueva.servicioPrincipal || "Consulta de Datos de Identidad",
      instrumento: nueva.tipoInstitucion === "Privada" ? "Contrato" : "Convenio",
      fuentes: nueva.fuentes || [],
      documentos: nueva.documentos || [
        {
          id: `doc-${Date.now()}`,
          nombre: "Oficio_Solicitud_Interoperabilidad_Firmado.pdf",
          tipo: "PDF",
          tamano: "1.8 MB",
          fechaCarga: now,
          categoria: "Oficio de Solicitud"
        }
      ],
      historial: [
        {
          fecha: now,
          evento: "Solicitud creada y enviada a firmas",
          actor: "Coordinador SINARP",
          detalle: "Solicitud registrada mediante el asistente de 3 pasos y enviada formalmente al Aprobador."
        },
        {
          fecha: now,
          evento: "Por revisar",
          actor: "Aprobador",
          detalle: "Expediente disponible para revisión de pertinencia, finalidad y justificación jurídica."
        }
      ]
    };

    const updated = [solicitudCompleta, ...current];
    saveStoredSolicitudes(updated);
    setSolicitudes(updated);
    return solicitudCompleta;
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

  return {
    solicitudes,
    getSolicitudById,
    aprobarSolicitud,
    rechazarSolicitud,
    solicitarAjustes,
    reenviarSolicitud,
    crearNuevaSolicitud,
    simularPagoRealizado,
    validarPagoConCur,
    generarAcceso
  };
}
