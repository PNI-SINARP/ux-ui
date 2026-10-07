"use client";

import { useState, useEffect, useCallback } from "react";

export interface SolicitudVinculada {
  id: string;
  fuentePrincipal: string;
  servicioPrincipal: string;
  estado: string;
  fecha: string;
  coordinador?: string;
  camposCount?: number;
}

export interface HistorialVersionProyecto {
  version: number;
  fecha: string;
  nombre: string;
  proposito: string;
  modificadoPor: string;
  motivo?: string;
}

export interface ProyectoInstitucional {
  id: string;
  nombre: string;
  proposito: string;
  institucion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  version: number;
  creadoPor: string;
  solicitudes: SolicitudVinculada[];
  historialVersiones: HistorialVersionProyecto[];
}

const STORAGE_KEY = "dinarp_proyectos_v3";

export const INITIAL_PROYECTOS: ProyectoInstitucional[] = [
  {
    id: "PRJ-2026-001",
    nombre: "Sistema Único de Registro y Matrícula Estudiantil",
    proposito: "Integración e interoperabilidad de registros de identidad civil y validación de filiación con el Registro Civil para automatizar el proceso de matrícula escolar a nivel nacional y reducir trámites presenciales.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-08-14 09:30",
    fechaActualizacion: "2026-08-14 09:30",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-001",
        fuentePrincipal: "Registro Civil de Ciudadanos",
        servicioPrincipal: "Validación de Identidad y Filiación",
        estado: "Acceso generado",
        fecha: "2026-08-15 09:00",
        camposCount: 3,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-08-14 09:30",
        nombre: "Sistema Único de Registro y Matrícula Estudiantil",
        proposito: "Integración e interoperabilidad de registros de identidad civil y validación de filiación con el Registro Civil para automatizar el proceso de matrícula escolar a nivel nacional y reducir trámites presenciales.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-002",
    nombre: "Plataforma Nacional de Validación de Títulos y Certificaciones",
    proposito: "Habilitar la consulta automatizada y verificación en tiempo real de títulos de bachillerato y actas de grado para instituciones de educación superior y empleadores públicos del sector productivo.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-09-02 11:20",
    fechaActualizacion: "2026-09-18 16:45",
    version: 2,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-09-02 11:20",
        nombre: "Plataforma Nacional de Validación de Títulos",
        proposito: "Habilitar la consulta automatizada y verificación de títulos de bachillerato.",
        modificadoPor: "Mariana Almeida",
      },
      {
        version: 2,
        fecha: "2026-09-18 16:45",
        nombre: "Plataforma Nacional de Validación de Títulos y Certificaciones",
        proposito: "Habilitar la consulta automatizada y verificación en tiempo real de títulos de bachillerato y actas de grado para instituciones de educación superior y empleadores públicos del sector productivo.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-003",
    nombre: "Interoperabilidad de Datos para Alimentación Escolar y Salud Preventiva",
    proposito: "Cruce interinstitucional de datos antropométricos y de salud con el Ministerio de Salud Pública para focalización oportuna de programas de nutrición en unidades educativas rurales y urbano marginales.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-09-25 15:00",
    fechaActualizacion: "2026-09-25 15:00",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-09-25 15:00",
        nombre: "Interoperabilidad de Datos para Alimentación Escolar y Salud Preventiva",
        proposito: "Cruce interinstitucional de datos antropométricos y de salud con el Ministerio de Salud Pública para focalización oportuna de programas de nutrición en unidades educativas rurales y urbano marginales.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-004",
    nombre: "Monitoreo y Asignación de Recursos y Plantilla Docente",
    proposito: "Verificación y cotejo periódico de hojas de vida, inhabilidades legales y títulos universitarios con el Registro Civil, Consejo de la Judicatura y Senescyt para nombramientos docentes del magisterio fiscal.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-09-28 10:15",
    fechaActualizacion: "2026-09-28 10:15",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-002",
        fuentePrincipal: "Registro Civil de Ciudadanos",
        servicioPrincipal: "Consulta de Estado Civil y Defunciones",
        estado: "Aprobada",
        fecha: "2026-09-29 14:00",
        camposCount: 4,
        coordinador: "Mariana Almeida",
      },
      {
        id: "SOL-2026-003",
        fuentePrincipal: "Senescyt - Sistema Nacional de Información de la Educación Superior",
        servicioPrincipal: "Consulta de Títulos de Educación Superior Registrados",
        estado: "Acceso generado",
        fecha: "2026-10-01 11:30",
        camposCount: 6,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-09-28 10:15",
        nombre: "Monitoreo y Asignación de Recursos y Plantilla Docente",
        proposito: "Verificación y cotejo periódico de hojas de vida, inhabilidades legales y títulos universitarios con el Registro Civil, Consejo de la Judicatura y Senescyt para nombramientos docentes del magisterio fiscal.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-005",
    nombre: "Integración de Becas y Ayudas Económicas con Registro Social",
    proposito: "Automatización de la calificación socioeconómica de postulantes a becas escolares mediante consumo seguro del índice de vulnerabilidad de la Unidad de Registro Social (URS).",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-02 08:30",
    fechaActualizacion: "2026-10-02 08:30",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-005",
        fuentePrincipal: "Unidad de Registro Social (URS)",
        servicioPrincipal: "Consulta de Decil Socioeconómico y Puntaje de Vulnerabilidad",
        estado: "En revisión",
        fecha: "2026-10-02 11:00",
        camposCount: 3,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-02 08:30",
        nombre: "Integración de Becas y Ayudas Económicas con Registro Social",
        proposito: "Automatización de la calificación socioeconómica de postulantes a becas escolares mediante consumo seguro del índice de vulnerabilidad de la Unidad de Registro Social (URS).",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-006",
    nombre: "Sistema de Auditoría de Trayectoria Educativa y Homologación",
    proposito: "Consolidación de la hoja de vida académica del estudiante entre sostenimientos fiscal, fiscomisional, municipal y particular para facilitar traslados inmediatos sin pérdida de historial de calificaciones.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-03 14:10",
    fechaActualizacion: "2026-10-03 14:10",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-03 14:10",
        nombre: "Sistema de Auditoría de Trayectoria Educativa y Homologación",
        proposito: "Consolidación de la hoja de vida académica del estudiante entre sostenimientos fiscal, fiscomisional, municipal y particular para facilitar traslados inmediatos sin pérdida de historial de calificaciones.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-007",
    nombre: "Ventanilla Única Digital de Legalización de Estudios Internacionales",
    proposito: "Interoperabilidad con el Ministerio de Relaciones Exteriores y Movilidad Humana para verificación transfronteriza y digital de apostillas y legalizaciones consulares de certificados de estudio.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-04 09:00",
    fechaActualizacion: "2026-10-04 09:00",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-007",
        fuentePrincipal: "Ministerio de Relaciones Exteriores y Movilidad Humana",
        servicioPrincipal: "Validación de Apostillas Electrónicas Internacionales",
        estado: "Aprobada",
        fecha: "2026-10-04 16:20",
        camposCount: 5,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-04 09:00",
        nombre: "Ventanilla Única Digital de Legalización de Estudios Internacionales",
        proposito: "Interoperabilidad con el Ministerio de Relaciones Exteriores y Movilidad Humana para verificación transfronteriza y digital de apostillas y legalizaciones consulares de certificados de estudio.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-008",
    nombre: "Portal de Transparencia de Infraestructura Escolar y Georreferenciación",
    proposito: "Vinculación de predios escolares con el catastro nacional y registros de la Secretaría de Gestión de Riesgos para mapas de vulnerabilidad sísmica e hidrometeorológica de unidades educativas.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-05 10:40",
    fechaActualizacion: "2026-10-05 10:40",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-05 10:40",
        nombre: "Portal de Transparencia de Infraestructura Escolar y Georreferenciación",
        proposito: "Vinculación de predios escolares con el catastro nacional y registros de la Secretaría de Gestión de Riesgos para mapas de vulnerabilidad sísmica e hidrometeorológica de unidades educativas.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-009",
    nombre: "Intercambio de Credenciales Digitales y Formación Continua Docente",
    proposito: "Validación de certificaciones de cursos de capacitación, maestrías y diplomados pedagógicos emitidos por universidades acreditadas para el escalafón docente nacional.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-05 16:30",
    fechaActualizacion: "2026-10-06 11:15",
    version: 2,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-009",
        fuentePrincipal: "Senescyt",
        servicioPrincipal: "Consulta de Registro de Posgrados y Maestrías",
        estado: "Acceso generado",
        fecha: "2026-10-06 14:00",
        camposCount: 4,
        coordinador: "Mariana Almeida",
      },
      {
        id: "SOL-2026-010",
        fuentePrincipal: "Instituto Nacional de Evaluación Educativa (INEVAL)",
        servicioPrincipal: "Resultados de Evaluaciones y Méritos Pedagógicos",
        estado: "Aprobada",
        fecha: "2026-10-06 16:00",
        camposCount: 5,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-05 16:30",
        nombre: "Intercambio de Credenciales Digitales",
        proposito: "Validación de cursos de capacitación para el escalafón docente nacional.",
        modificadoPor: "Mariana Almeida",
      },
      {
        version: 2,
        fecha: "2026-10-06 11:15",
        nombre: "Intercambio de Credenciales Digitales y Formación Continua Docente",
        proposito: "Validación de certificaciones de cursos de capacitación, maestrías y diplomados pedagógicos emitidos por universidades acreditadas para el escalafón docente nacional.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-010",
    nombre: "Sistema Integrado de Alerta Temprana para Prevención de Deserción Escolar",
    proposito: "Monitoreo en tiempo real de asistencia estudiantil e interoperabilidad con programas de protección integral de derechos de niñas, niños y adolescentes del MIES.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-06 09:00",
    fechaActualizacion: "2026-10-06 09:00",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-011",
        fuentePrincipal: "Ministerio de Inclusión Económica y Social (MIES)",
        servicioPrincipal: "Verificación de Núcleos Familiares con Bono de Desarrollo Humano",
        estado: "Aprobada",
        fecha: "2026-10-06 10:30",
        camposCount: 3,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-06 09:00",
        nombre: "Sistema Integrado de Alerta Temprana para Prevención de Deserción Escolar",
        proposito: "Monitoreo en tiempo real de asistencia estudiantil e interoperabilidad con programas de protección integral de derechos de niñas, niños y adolescentes del MIES.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-011",
    nombre: "Interoperabilidad de Competencias Laborales para Bachillerato Técnico",
    proposito: "Integración de mallas curriculares y certificaciones técnicas de estudiantes graduados con el catálogo de perfiles profesionales del Ministerio del Trabajo y la Red Socio Empleo.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-06 15:45",
    fechaActualizacion: "2026-10-06 15:45",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-06 15:45",
        nombre: "Interoperabilidad de Competencias Laborales para Bachillerato Técnico",
        proposito: "Integración de mallas curriculares y certificaciones técnicas de estudiantes graduados con el catálogo de perfiles profesionales del Ministerio del Trabajo y la Red Socio Empleo.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-012",
    nombre: "Censo y Trazabilidad de Necesidades Educativas Especiales (NEE)",
    proposito: "Intercambio de certificados de discapacidad con el Ministerio de Salud Pública y CONADIS para asignación prioritaria de docentes pedagogos de apoyo e inclusión en centros regulares.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 08:20",
    fechaActualizacion: "2026-10-07 08:20",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 08:20",
        nombre: "Censo y Trazabilidad de Necesidades Educativas Especiales (NEE)",
        proposito: "Intercambio de certificados de discapacidad con el Ministerio de Salud Pública y CONADIS para asignación prioritaria de docentes pedagogos de apoyo e inclusión en centros regulares.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-013",
    nombre: "Portal de Conectividad y Fibra Óptica para Escuelas Rurales",
    proposito: "Intercambio de coordenadas geográficas y capacidades técnicas de planteles educativos con MINTEL y ARCOTEL para priorizar el despliegue de conectividad satelital y fibra óptica en zonas de frontera.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 09:10",
    fechaActualizacion: "2026-10-07 09:10",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-015",
        fuentePrincipal: "Agencia de Regulación y Control de las Telecomunicaciones (ARCOTEL)",
        servicioPrincipal: "Catastro Georreferenciado de Cobertura de Telecomunicaciones",
        estado: "En revisión",
        fecha: "2026-10-07 09:30",
        camposCount: 4,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 09:10",
        nombre: "Portal de Conectividad y Fibra Óptica para Escuelas Rurales",
        proposito: "Intercambio de coordenadas geográficas y capacidades técnicas de planteles educativos con MINTEL y ARCOTEL para priorizar el despliegue de conectividad satelital y fibra óptica en zonas de frontera.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-014",
    nombre: "Verificación de Pensiones Alimenticias en Selección Docente (SUPA)",
    proposito: "Cotejo de registros de deudores de alimentos con el Consejo de la Judicatura para validar la idoneidad legal y cumplimiento de obligaciones familiares de aspirantes al magisterio nacional.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 09:40",
    fechaActualizacion: "2026-10-07 10:15",
    version: 2,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-016",
        fuentePrincipal: "Consejo de la Judicatura",
        servicioPrincipal: "Sistema Único de Pensiones Alimenticias (SUPA)",
        estado: "Acceso generado",
        fecha: "2026-10-07 10:00",
        camposCount: 3,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 09:40",
        nombre: "Verificación de Pensiones Alimenticias en Selección Docente",
        proposito: "Cotejo de registros de deudores de alimentos con el Consejo de la Judicatura.",
        modificadoPor: "Mariana Almeida",
      },
      {
        version: 2,
        fecha: "2026-10-07 10:15",
        nombre: "Verificación de Pensiones Alimenticias en Selección Docente (SUPA)",
        proposito: "Cotejo de registros de deudores de alimentos con el Consejo de la Judicatura para validar la idoneidad legal y cumplimiento de obligaciones familiares de aspirantes al magisterio nacional.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-015",
    nombre: "Validación de Registro Único de Contribuyentes para Proveedores de Uniformes",
    proposito: "Consulta automatizada de estado tributario, facturación electrónica y cumplimiento de obligaciones con el Servicio de Rentas Internas para artesanos del programa de compras públicas 'Hilando el Desarrollo'.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 10:20",
    fechaActualizacion: "2026-10-07 10:20",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-017",
        fuentePrincipal: "Servicio de Rentas Internas (SRI)",
        servicioPrincipal: "Consulta de RUC y Cumplimiento Tributario",
        estado: "Aprobada",
        fecha: "2026-10-07 10:35",
        camposCount: 5,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 10:20",
        nombre: "Validación de Registro Único de Contribuyentes para Proveedores de Uniformes",
        proposito: "Consulta automatizada de estado tributario, facturación electrónica y cumplimiento de obligaciones con el Servicio de Rentas Internas para artesanos del programa de compras públicas 'Hilando el Desarrollo'.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-016",
    nombre: "Integración de Afiliación y Aportes IESS para Personal Administrativo",
    proposito: "Interoperabilidad de planillas de aportaciones y tiempos de servicio con el Instituto Ecuatoriano de Seguridad Social para agilizar procesos de jubilación y liquidación patronal.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 10:45",
    fechaActualizacion: "2026-10-07 10:45",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 10:45",
        nombre: "Integración de Afiliación y Aportes IESS para Personal Administrativo",
        proposito: "Interoperabilidad de planillas de aportaciones y tiempos de servicio con el Instituto Ecuatoriano de Seguridad Social para agilizar procesos de jubilación y liquidación patronal.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-017",
    nombre: "Homologación y Convalidación de Estudios Internacionales para Refugiados",
    proposito: "Conexión de expedientes consulares y estatus de protección internacional con el Ministerio de Relaciones Exteriores para garantizar la inserción escolar inmediata de niños y adolescentes migrantes.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 11:00",
    fechaActualizacion: "2026-10-07 11:30",
    version: 2,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-018",
        fuentePrincipal: "Ministerio de Relaciones Exteriores y Movilidad Humana",
        servicioPrincipal: "Registro de Estatus Migratorio y Protección Internacional",
        estado: "Acceso generado",
        fecha: "2026-10-07 11:15",
        camposCount: 4,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 11:00",
        nombre: "Homologación de Estudios Internacionales",
        proposito: "Conexión de expedientes consulares con Cancillería.",
        modificadoPor: "Mariana Almeida",
      },
      {
        version: 2,
        fecha: "2026-10-07 11:30",
        nombre: "Homologación y Convalidación de Estudios Internacionales para Refugiados",
        proposito: "Conexión de expedientes consulares y estatus de protección internacional con el Ministerio de Relaciones Exteriores para garantizar la inserción escolar inmediata de niños y adolescentes migrantes.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-018",
    nombre: "Monitoreo Epidemiológico Escolar y Esquema Nacional de Vacunación",
    proposito: "Cruce de datos nominales de inmunización y salud preventiva con el Ministerio de Salud Pública para emitir alertas tempranas sobre brotes virales y coordinar brigadas de vacunación escolar.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 11:40",
    fechaActualizacion: "2026-10-07 11:40",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-019",
        fuentePrincipal: "Ministerio de Salud Pública (MSP)",
        servicioPrincipal: "Registro Nominal de Vacunación e Historial Clínico Pediátrico",
        estado: "En revisión",
        fecha: "2026-10-07 11:50",
        camposCount: 5,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 11:40",
        nombre: "Monitoreo Epidemiológico Escolar y Esquema Nacional de Vacunación",
        proposito: "Cruce de datos nominales de inmunización y salud preventiva con el Ministerio de Salud Pública para emitir alertas tempranas sobre brotes virales y coordinar brigadas de vacunación escolar.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-019",
    nombre: "Sistema de Alerta Temprana para Prevención del Abandono Escolar",
    proposito: "Modelo analítico que cruza registros de vulnerabilidad social de la URS, cambios de domicilio civil y defunciones familiares para activar apoyos psicopedagógicos y becas de retención educativa.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 12:00",
    fechaActualizacion: "2026-10-07 12:00",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-020",
        fuentePrincipal: "Ministerio de Inclusión Económica y Social (MIES)",
        servicioPrincipal: "Padrón de Beneficiarios de Bonos y Pensiones Sociales",
        estado: "Aprobada",
        fecha: "2026-10-07 12:15",
        camposCount: 3,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 12:00",
        nombre: "Sistema de Alerta Temprana para Prevención del Abandono Escolar",
        proposito: "Modelo analítico que cruza registros de vulnerabilidad social de la URS, cambios de domicilio civil y defunciones familiares para activar apoyos psicopedagógicos y becas de retención educativa.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-020",
    nombre: "Registro y Auditoría de Concursos de Méritos para Directivos Escolares",
    proposito: "Verificación de cauciones y responsabilidades administrativas con la Contraloría General del Estado para postulantes a cargos de rectores, vicerrectores e inspectores de planteles fiscales.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 12:20",
    fechaActualizacion: "2026-10-07 12:20",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 12:20",
        nombre: "Registro y Auditoría de Concursos de Méritos para Directivos Escolares",
        proposito: "Verificación de cauciones y responsabilidades administrativas con la Contraloría General del Estado para postulantes a cargos de rectores, vicerrectores e inspectores de planteles fiscales.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-021",
    nombre: "Trazabilidad Logística de Textos y Material Didáctico en Territorio",
    proposito: "Integración de capas de cartografía oficial con el Instituto Geográfico Militar (IGM) para optimizar rutas de distribución y entrega auditada de kits pedagógicos en zonas de difícil acceso.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 12:35",
    fechaActualizacion: "2026-10-07 12:35",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-021",
        fuentePrincipal: "Instituto Geográfico Militar (IGM)",
        servicioPrincipal: "Infraestructura Nacional de Datos Espaciales (Cartografía Base)",
        estado: "Acceso generado",
        fecha: "2026-10-07 12:45",
        camposCount: 4,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 12:35",
        nombre: "Trazabilidad Logística de Textos y Material Didáctico en Territorio",
        proposito: "Integración de capas de cartografía oficial con el Instituto Geográfico Militar (IGM) para optimizar rutas de distribución y entrega auditada de kits pedagógicos en zonas de difícil acceso.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-022",
    nombre: "Censo Nacional de Infraestructura Educativa y Amenazas Sísmicas",
    proposito: "Cotejo de mapas multiamenaza con la Secretaría Nacional de Gestión de Riesgos para formular planes de contingencia estructural, evacuación y habilitación de albergues en centros educativos.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 12:50",
    fechaActualizacion: "2026-10-07 13:10",
    version: 2,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-022",
        fuentePrincipal: "Secretaría Nacional de Gestión de Riesgos (SNGR)",
        servicioPrincipal: "Catálogo Nacional de Amenazas Geológicas e Hidrometeorológicas",
        estado: "Por revisar",
        fecha: "2026-10-07 13:00",
        camposCount: 6,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 12:50",
        nombre: "Censo de Infraestructura Educativa y Riesgos",
        proposito: "Cotejo de mapas con Gestión de Riesgos.",
        modificadoPor: "Mariana Almeida",
      },
      {
        version: 2,
        fecha: "2026-10-07 13:10",
        nombre: "Censo Nacional de Infraestructura Educativa y Amenazas Sísmicas",
        proposito: "Cotejo de mapas multiamenaza con la Secretaría Nacional de Gestión de Riesgos para formular planes de contingencia estructural, evacuación y habilitación de albergues en centros educativos.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-023",
    nombre: "Ecosistema de Formación Continua y Acreditación Pedagógica",
    proposito: "Validación digital de certificaciones académicas y diplomados docentes con universidades acreditadas por el CACES y Senescyt para escalafón magisterial meritocrático.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 13:15",
    fechaActualizacion: "2026-10-07 13:15",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 13:15",
        nombre: "Ecosistema de Formación Continua y Acreditación Pedagógica",
        proposito: "Validación digital de certificaciones académicas y diplomados docentes con universidades acreditadas por el CACES y Senescyt para escalafón magisterial meritocrático.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
  {
    id: "PRJ-2026-024",
    nombre: "Interoperabilidad de Datos para Deporte Escolar y Detección de Talentos",
    proposito: "Cruce de métricas biométricas, marcas formativas y fichas médicas con el Ministerio del Deporte para identificación y asignación de becas de alto rendimiento a talentos juveniles.",
    institucion: "Ministerio de Educación",
    fechaCreacion: "2026-10-07 13:30",
    fechaActualizacion: "2026-10-07 13:30",
    version: 1,
    creadoPor: "Mariana Almeida",
    solicitudes: [
      {
        id: "SOL-2026-023",
        fuentePrincipal: "Ministerio del Deporte",
        servicioPrincipal: "Padrón Nacional de Atletas Formativos y Federados",
        estado: "Aprobada",
        fecha: "2026-10-07 13:40",
        camposCount: 4,
        coordinador: "Mariana Almeida",
      },
    ],
    historialVersiones: [
      {
        version: 1,
        fecha: "2026-10-07 13:30",
        nombre: "Interoperabilidad de Datos para Deporte Escolar y Detección de Talentos",
        proposito: "Cruce de métricas biométricas, marcas formativas y fichas médicas con el Ministerio del Deporte para identificación y asignación de becas de alto rendimiento a talentos juveniles.",
        modificadoPor: "Mariana Almeida",
      },
    ],
  },
];

export function getStoredProyectos(): ProyectoInstitucional[] {
  if (typeof window === "undefined") return INITIAL_PROYECTOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROYECTOS));
      return INITIAL_PROYECTOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (parsed.length < INITIAL_PROYECTOS.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROYECTOS));
        return INITIAL_PROYECTOS;
      }
      return parsed;
    }
    return INITIAL_PROYECTOS;
  } catch (err) {
    console.error("Error reading proyectos from localStorage:", err);
    return INITIAL_PROYECTOS;
  }
}

export function saveStoredProyectos(data: ProyectoInstitucional[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving proyectos to localStorage:", err);
  }
}

export interface CrearProyectoPayload {
  nombre: string;
  proposito: string;
  institucion: string;
  creadoPor: string;
}

export interface ActualizarProyectoPayload {
  nombre: string;
  proposito: string;
  modificadoPor: string;
  motivo?: string;
}

export interface StoreResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useProyectosStore() {
  const [proyectos, setProyectos] = useState<ProyectoInstitucional[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredProyectos();
    setProyectos(stored);
    setIsLoaded(true);
  }, []);

  const getProyectosPorInstitucion = useCallback(
    (institucion?: string): ProyectoInstitucional[] => {
      if (!institucion || institucion === "ALL" || institucion === "DINARP") {
        return proyectos;
      }
      const filtered = proyectos.filter(
        (p) => p.institucion.toLowerCase() === institucion.toLowerCase()
      );
      return filtered.length > 0 ? filtered : proyectos;
    },
    [proyectos]
  );

  const getProyectoById = useCallback(
    (id: string): ProyectoInstitucional | undefined => {
      return proyectos.find((p) => p.id.toLowerCase() === id.toLowerCase());
    },
    [proyectos]
  );

  const formatCurrentTimestamp = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  const crearProyecto = useCallback(
    (payload: CrearProyectoPayload): StoreResponse<ProyectoInstitucional> => {
      const nombreTrim = payload.nombre?.trim() || "";
      const propositoTrim = payload.proposito?.trim() || "";
      const institucionTrim = payload.institucion?.trim() || "";

      // Validaciones obligatorias PRJ-01
      if (!nombreTrim) {
        return {
          success: false,
          error: "El nombre del proyecto es obligatorio.",
        };
      }
      if (nombreTrim.length < 3) {
        return {
          success: false,
          error: "El nombre del proyecto debe tener al menos 3 caracteres.",
        };
      }
      if (!propositoTrim) {
        return {
          success: false,
          error: "El propósito del proyecto es obligatorio.",
        };
      }
      if (propositoTrim.length < 10) {
        return {
          success: false,
          error: "El propósito debe tener al menos 10 caracteres explicativos.",
        };
      }
      if (!institucionTrim) {
        return {
          success: false,
          error: "La institución responsable es requerida.",
        };
      }

      // Validar duplicidad en la misma institución
      const existeDuplicado = proyectos.some(
        (p) =>
          p.institucion.toLowerCase() === institucionTrim.toLowerCase() &&
          p.nombre.toLowerCase() === nombreTrim.toLowerCase()
      );

      if (existeDuplicado) {
        return {
          success: false,
          error: `Ya existe un proyecto registrado con el nombre "${nombreTrim}" en ${institucionTrim}.`,
        };
      }

      // Generar correlativo ID (PRJ-2026-00X)
      const currentYear = new Date().getFullYear();
      const nextIndex = proyectos.length + 1;
      const nuevoId = `PRJ-${currentYear}-${String(nextIndex).padStart(3, "0")}`;
      const nowFormatted = formatCurrentTimestamp();

      const nuevoProyecto: ProyectoInstitucional = {
        id: nuevoId,
        nombre: nombreTrim,
        proposito: propositoTrim,
        institucion: institucionTrim,
        fechaCreacion: nowFormatted,
        fechaActualizacion: nowFormatted,
        version: 1,
        creadoPor: payload.creadoPor || "Coordinador Institucional",
        solicitudes: [],
        historialVersiones: [
          {
            version: 1,
            fecha: nowFormatted,
            nombre: nombreTrim,
            proposito: propositoTrim,
            modificadoPor: payload.creadoPor || "Coordinador Institucional",
          },
        ],
      };

      const updated = [nuevoProyecto, ...proyectos];
      setProyectos(updated);
      saveStoredProyectos(updated);

      return {
        success: true,
        data: nuevoProyecto,
      };
    },
    [proyectos]
  );

  const actualizarProyecto = useCallback(
    (
      id: string,
      payload: ActualizarProyectoPayload
    ): StoreResponse<ProyectoInstitucional> => {
      const proyectoIndex = proyectos.findIndex(
        (p) => p.id.toLowerCase() === id.toLowerCase()
      );

      if (proyectoIndex === -1) {
        return {
          success: false,
          error: "El proyecto solicitado no existe.",
        };
      }

      const nombreTrim = payload.nombre?.trim() || "";
      const propositoTrim = payload.proposito?.trim() || "";

      if (!nombreTrim) {
        return {
          success: false,
          error: "El nombre del proyecto es obligatorio.",
        };
      }
      if (nombreTrim.length < 3) {
        return {
          success: false,
          error: "El nombre del proyecto debe tener al menos 3 caracteres.",
        };
      }
      if (!propositoTrim) {
        return {
          success: false,
          error: "El propósito del proyecto es obligatorio.",
        };
      }
      if (propositoTrim.length < 10) {
        return {
          success: false,
          error: "El propósito debe tener al menos 10 caracteres explicativos.",
        };
      }

      const actual = proyectos[proyectoIndex];
      const nuevaVersion = actual.version + 1;
      const nowFormatted = formatCurrentTimestamp();

      const nuevaVersionRegistro: HistorialVersionProyecto = {
        version: nuevaVersion,
        fecha: nowFormatted,
        nombre: nombreTrim,
        proposito: propositoTrim,
        modificadoPor: payload.modificadoPor || "Coordinador Institucional",
        motivo: payload.motivo?.trim() || "Actualización de metadatos descriptivos",
      };

      const actualizado: ProyectoInstitucional = {
        ...actual,
        nombre: nombreTrim,
        proposito: propositoTrim,
        version: nuevaVersion,
        fechaActualizacion: nowFormatted,
        historialVersiones: [nuevaVersionRegistro, ...actual.historialVersiones],
      };

      const updatedList = [...proyectos];
      updatedList[proyectoIndex] = actualizado;

      setProyectos(updatedList);
      saveStoredProyectos(updatedList);

      return {
        success: true,
        data: actualizado,
      };
    },
    [proyectos]
  );

  const vincularSolicitud = useCallback(
    (proyectoId: string, solicitud: SolicitudVinculada): boolean => {
      const proyectoIndex = proyectos.findIndex(
        (p) => p.id.toLowerCase() === proyectoId.toLowerCase()
      );
      if (proyectoIndex === -1) return false;

      const actual = proyectos[proyectoIndex];
      const yaExiste = actual.solicitudes.some((s) => s.id === solicitud.id);
      if (yaExiste) return true;

      const actualizado: ProyectoInstitucional = {
        ...actual,
        solicitudes: [solicitud, ...actual.solicitudes],
      };

      const updatedList = [...proyectos];
      updatedList[proyectoIndex] = actualizado;

      setProyectos(updatedList);
      saveStoredProyectos(updatedList);
      return true;
    },
    [proyectos]
  );

  const restablecerDatosDemo = useCallback(() => {
    setProyectos(INITIAL_PROYECTOS);
    saveStoredProyectos(INITIAL_PROYECTOS);
  }, []);

  return {
    proyectos,
    isLoaded,
    getProyectosPorInstitucion,
    getProyectoById,
    crearProyecto,
    actualizarProyecto,
    vincularSolicitud,
    restablecerDatosDemo,
  };
}
