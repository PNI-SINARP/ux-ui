"use client";

import { useEffect, useState } from "react";

export interface BloqueTextoAyudaBN07 {
  codigoParametro: "PAR-11" | "PAR-12" | "PAR-12-LOPDP";
  titulo: string;
  criterioOrientacion: string;
  instruccion: string;
  ejemploReferencial: string;
  esProvisional: boolean;
  etiquetaProvisional: string;
}

export interface OverrideAyudaPorCampoBN07 {
  campoId: string;
  campoNombre: string;
  servicioNombre: string;
  institucionNombre: string;
  clasificacion: "Accesible" | "Confidencial";
  esSensible?: boolean;
  criterioFinalidad?: string;
  instruccionFinalidad?: string;
  ejemploFinalidad?: string;
  criterioJustificacion?: string;
  instruccionJustificacion?: string;
  ejemploJustificacion?: string;
  esProvisional: boolean;
}

export interface HistorialCambioAyudaBN07 {
  id: string;
  fecha: string;
  usuario: string;
  resumen: string;
  version: string;
}

export interface ConfiguracionAyudaBN07 {
  version: string;
  ultimaActualizacion: string;
  actualizadoPor: string;
  mostrarEjemplosReferenciales: boolean;
  bloques: {
    finalidadAccesible: BloqueTextoAyudaBN07;
    finalidadConfidencial: BloqueTextoAyudaBN07;
    finalidadConfidencialSensible: BloqueTextoAyudaBN07;
    justificacionConfidencial: BloqueTextoAyudaBN07;
    justificacionConfidencialSensible: BloqueTextoAyudaBN07;
  };
  overridesPorCampo: Record<string, OverrideAyudaPorCampoBN07>;
  historialCambios: HistorialCambioAyudaBN07[];
}

const STORAGE_KEY_AYUDA_BN07 = "sinarp_bn07_textos_ayuda_v3";
const EVENT_AYUDA_BN07_UPDATED = "sinarp-bn07-ayuda-updated";

export const DEFAULT_CONFIGURACION_AYUDA_BN07: ConfiguracionAyudaBN07 = {
  version: "v3.0-minimal",
  ultimaActualizacion: "28/10/2026 12:00",
  actualizadoPor: "DPI / Administración DINARP",
  mostrarEjemplosReferenciales: true,
  bloques: {
    finalidadAccesible: {
      codigoParametro: "PAR-11",
      titulo: "Orientación para Finalidad de uso",
      criterioOrientacion: "Indica en qué trámite utilizarás el campo “{campo}” y por qué es necesario.",
      instruccion:
        "Indica en qué trámite utilizarás el campo “{campo}” y por qué es necesario.",
      ejemploReferencial:
        "Se consulta el campo {campo} en el proceso de gestión de trámites en línea para verificar la información del solicitante antes de emitir la resolución.",
      esProvisional: false,
      etiquetaProvisional: "Aprobado por DINARP",
    },
    finalidadConfidencial: {
      codigoParametro: "PAR-11",
      titulo: "Orientación para Finalidad de uso (Dato confidencial)",
      criterioOrientacion: "Indica en qué trámite utilizarás el campo confidencial “{campo}” y por qué es necesario.",
      instruccion:
        "Indica en qué trámite utilizarás el campo confidencial “{campo}” y por qué es necesario este dato.",
      ejemploReferencial:
        "Se requiere el campo {campo} dentro del proceso de calificación y control administrativo con la necesidad específica de verificar requisitos legales del expediente.",
      esProvisional: false,
      etiquetaProvisional: "Aprobado por DINARP",
    },
    finalidadConfidencialSensible: {
      codigoParametro: "PAR-11",
      titulo: "Orientación para Finalidad de uso (Dato sensible LOPDP)",
      criterioOrientacion: "Indica en qué trámite utilizarás el dato sensible “{campo}” y la justificación específica que lo requiere.",
      instruccion:
        "Indica el trámite donde utilizarás el dato sensible “{campo}” y la justificación técnica de su necesidad.",
      ejemploReferencial:
        "Se requiere el campo {campo} en el proceso de atención prioritaria exclusivamente para acreditar de forma automática el beneficio legal sin exigir respaldos físicos.",
      esProvisional: false,
      etiquetaProvisional: "Aprobado por DINARP",
    },
    justificacionConfidencial: {
      codigoParametro: "PAR-12",
      titulo: "Orientación para Justificación jurídica",
      criterioOrientacion: "Indica la norma legal (ley, decreto o resolución y artículo) que faculta a tu entidad a consultar el campo “{campo}”.",
      instruccion:
        "Indica la norma legal (ley, decreto o resolución y artículo) que faculta a tu entidad a consultar el campo “{campo}”.",
      ejemploReferencial:
        "El Art. 14 de la Ley Orgánica institucional faculta a la entidad a verificar el campo {campo} como requisito obligatorio previo a la emisión del acto administrativo.",
      esProvisional: false,
      etiquetaProvisional: "Aprobado por DINARP",
    },
    justificacionConfidencialSensible: {
      codigoParametro: "PAR-12-LOPDP",
      titulo: "Orientación para Justificación jurídica (Dato sensible LOPDP)",
      criterioOrientacion: "Indica la norma legal habilitante y el supuesto del Art. 26 de la LOPDP aplicable para consultar “{campo}”.",
      instruccion:
        "Indica la norma legal habilitante y el supuesto del Art. 26 de la LOPDP aplicable para consultar “{campo}”.",
      ejemploReferencial:
        "Conforme al Art. 26 numeral 2 de la LOPDP y la norma sectorial vigente, la institución está habilitada para consultar {campo} con el fin de aplicar beneficios de ley bajo reserva.",
      esProvisional: false,
      etiquetaProvisional: "Aprobado por DINARP",
    },
  },
  overridesPorCampo: {
    "c-01": {
      campoId: "c-01",
      campoNombre: "numeroIdentificacion",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo numeroIdentificacion en el proceso de recepción de solicitudes en línea para validar de forma unívoca la identidad del ciudadano titular del trámite.",
      esProvisional: true,
    },
    "c-02": {
      campoId: "c-02",
      campoNombre: "nombres",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se utiliza el campo nombres en el proceso de apertura de expediente electrónico para autocompletar los datos del solicitante y evitar errores de digitación.",
      esProvisional: true,
    },
    "c-03": {
      campoId: "c-03",
      campoNombre: "apellidos",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo apellidos en el proceso de emisión de certificados institucionales para verificar la correspondencia nominal del titular antes de firmar el documento.",
      esProvisional: true,
    },
    "c-04": {
      campoId: "c-04",
      campoNombre: "fechaNacimiento",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo fechaNacimiento en el proceso de postulación a programas institucionales para comprobar automáticamente el requisito de mayoría de edad o grupo etario.",
      esProvisional: true,
    },
    "c-05": {
      campoId: "c-05",
      campoNombre: "estadoCivil",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo estadoCivil en el proceso de evaluación socioeconómica de beneficiarios para validar la conformación del hogar declarada en la solicitud.",
      esProvisional: true,
    },
    "c-06": {
      campoId: "c-06",
      campoNombre: "condicionCedulado",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo condicionCedulado en el proceso de habilitación de usuarios y pago de prestaciones para confirmar la supervivencia y vigencia civil del ciudadano.",
      esProvisional: true,
    },
    "c-07": {
      campoId: "c-07",
      campoNombre: "nombrePadre",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Confidencial",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo nombrePadre en el proceso de control previo de vinculación de personal y contratación pública para verificar posibles inhabilidades por parentesco.",
      ejemploJustificacion:
        "El Art. 6 de la Ley Orgánica del Servicio Público (LOSEP) y el Art. 62 de la LOSNCP facultan a la institución a verificar vínculos de consanguinidad (nombrePadre) para prevenir nepotismo.",
      esProvisional: true,
    },
    "c-08": {
      campoId: "c-08",
      campoNombre: "nombreMadre",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Confidencial",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo nombreMadre en el proceso de auditoría de declaraciones de conflicto de interés para corroborar vínculos familiares de primer grado en adjudicaciones.",
      ejemploJustificacion:
        "El Art. 6 de la LOSEP y el Art. 62 de la LOSNCP otorgan competencia legal a la entidad para contrastar la filiación materna (nombreMadre) en controles de probidad administrativa.",
      esProvisional: true,
    },
    "c-09": {
      campoId: "c-09",
      campoNombre: "domicilioDetallado",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Confidencial",
      esSensible: true,
      ejemploFinalidad:
        "Se requiere el campo domicilioDetallado en el proceso de inspecciones técnicas de campo y notificaciones administrativas para ubicar el predio cuando el administrado no registra casillero electrónico.",
      ejemploJustificacion:
        "Conforme al Art. 26 numeral 2 de la LOPDP y al Art. 164 del Código Orgánico Administrativo (COA), la entidad está facultada para acceder a domicilioDetallado a fin de practicar notificaciones personales oficiales.",
      esProvisional: true,
    },
    "c-09b": {
      campoId: "c-09b",
      campoNombre: "condicionDiscapacidad",
      servicioNombre: "Datos Demográficos e Identidad",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Confidencial",
      esSensible: true,
      ejemploFinalidad:
        "Se requiere el campo condicionDiscapacidad en el proceso de ventanilla única y liquidación de tasas para aplicar de forma automática la exoneración arancelaria sin exigir carné físico.",
      ejemploJustificacion:
        "El Art. 26 numeral 2 de la LOPDP, en concordancia con los Arts. 4 y 74 de la Ley Orgánica de Discapacidades, autoriza verificar condicionDiscapacidad para otorgar beneficios legales bajo reserva.",
      esProvisional: true,
    },
    "rc-condicion-discapacidad": {
      campoId: "rc-condicion-discapacidad",
      campoNombre: "condicion_discapacidad",
      servicioNombre: "Datos Demográficos y Condición Ciudadana",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Confidencial",
      esSensible: true,
      ejemploFinalidad:
        "Se requiere el campo condicion_discapacidad en el proceso de ventanilla única y recaudación para aplicar automáticamente la tarifa preferencial y atención prioritaria.",
      ejemploJustificacion:
        "El Art. 26 numeral 2 de la LOPDP y los Arts. 4 y 74 de la Ley Orgánica de Discapacidades facultan a la entidad a consultar condicion_discapacidad sin exigir carné físico.",
      esProvisional: true,
    },
    "c-10": {
      campoId: "c-10",
      campoNombre: "numeroPasaporte",
      servicioNombre: "Pasaportes y Documentos de Viaje",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo numeroPasaporte en el proceso de registro de usuarios extranjeros y movilidad para validar la numeración oficial del documento de viaje presentado.",
      esProvisional: true,
    },
    "c-11": {
      campoId: "c-11",
      campoNombre: "fechaEmision",
      servicioNombre: "Pasaportes y Documentos de Viaje",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo fechaEmision en el proceso de validación documental de pasaportes para corroborar la fecha de expedición del documento de viaje.",
      esProvisional: true,
    },
    "c-12": {
      campoId: "c-12",
      campoNombre: "fechaCaducidad",
      servicioNombre: "Pasaportes y Documentos de Viaje",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo fechaCaducidad en el proceso de habilitación de trámites migratorios y consulares para comprobar que el pasaporte se encuentre vigente.",
      esProvisional: true,
    },
    "c-13": {
      campoId: "c-13",
      campoNombre: "estadoDocumento",
      servicioNombre: "Pasaportes y Documentos de Viaje",
      institucionNombre: "Dirección General de Registro Civil, Identificación y Cedulación",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo estadoDocumento en el proceso de control de identidad documental para descartar pasaportes anulados o reportados como sustraídos.",
      esProvisional: true,
    },
    "c-14": {
      campoId: "c-14",
      campoNombre: "numeroRuc",
      servicioNombre: "Registro Único de Contribuyentes (RUC)",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo numeroRuc en el proceso de calificación de proveedores y emisión de permisos económicos para verificar la inscripción tributaria del solicitante.",
      esProvisional: true,
    },
    "c-15": {
      campoId: "c-15",
      campoNombre: "razonSocial",
      servicioNombre: "Registro Único de Contribuyentes (RUC)",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo razonSocial en el proceso de suscripción de convenios y resoluciones administrativas para consignar la denominación legal exacta de la persona jurídica.",
      esProvisional: true,
    },
    "c-16": {
      campoId: "c-16",
      campoNombre: "estadoContribuyente",
      servicioNombre: "Registro Único de Contribuyentes (RUC)",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo estadoContribuyente en el proceso de habilitación de contratistas y otorgamiento de licencias para comprobar que el RUC se encuentre en estado Activo.",
      esProvisional: true,
    },
    "c-17": {
      campoId: "c-17",
      campoNombre: "tipoContribuyente",
      servicioNombre: "Registro Único de Contribuyentes (RUC)",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo tipoContribuyente en el proceso de recepción de trámites empresariales para aplicar los requisitos diferenciados entre persona natural y sociedad.",
      esProvisional: true,
    },
    "c-18": {
      campoId: "c-18",
      campoNombre: "actividadEconomicaPrincipal",
      servicioNombre: "Registro Único de Contribuyentes (RUC)",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo actividadEconomicaPrincipal en el proceso de autorización de funcionamiento comercial para validar que el giro declarado coincida con el catastro CIIU.",
      esProvisional: true,
    },
    "c-19": {
      campoId: "c-19",
      campoNombre: "obligadoLlevarContabilidad",
      servicioNombre: "Registro Único de Contribuyentes (RUC)",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo obligadoLlevarContabilidad en el proceso de evaluación financiera y liquidación de pagos para determinar los respaldos contables exigibles al proveedor.",
      esProvisional: true,
    },
    "c-20": {
      campoId: "c-20",
      campoNombre: "placaVehiculo",
      servicioNombre: "Catastro de Vehículos y Avalúos Fiscales",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo placaVehiculo en el proceso de matriculación y control de transporte para identificar de manera unívoca al vehículo objeto del trámite.",
      esProvisional: true,
    },
    "c-21": {
      campoId: "c-21",
      campoNombre: "marcaModelo",
      servicioNombre: "Catastro de Vehículos y Avalúos Fiscales",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo marcaModelo en el proceso de emisión de permisos de circulación para verificar las características técnicas del automotor registrado.",
      esProvisional: true,
    },
    "c-22": {
      campoId: "c-22",
      campoNombre: "anioFabricacion",
      servicioNombre: "Catastro de Vehículos y Avalúos Fiscales",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo anioFabricacion en el proceso de habilitación de flota de transporte para validar que la unidad cumpla con los años de vida útil permitidos.",
      esProvisional: true,
    },
    "c-23": {
      campoId: "c-23",
      campoNombre: "avaluoFiscal",
      servicioNombre: "Catastro de Vehículos y Avalúos Fiscales",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo avaluoFiscal en el proceso de liquidación de tasas e impuestos vehiculares para calcular el tributo exacto sobre la base imponible vigente.",
      esProvisional: true,
    },
    "c-24": {
      campoId: "c-24",
      campoNombre: "historialExoneraciones",
      servicioNombre: "Catastro de Vehículos y Avalúos Fiscales",
      institucionNombre: "Servicio de Rentas Internas",
      clasificacion: "Confidencial",
      esSensible: true,
      ejemploFinalidad:
        "Se requiere el campo historialExoneraciones en el proceso de calificación de beneficios tributarios vehiculares para verificar que el solicitante no registre otro vehículo exonerado activo.",
      ejemploJustificacion:
        "Conforme al Art. 26 numeral 2 de la LOPDP, el Art. 73 de la Ley Orgánica de Discapacidades y el Art. 14 de la Ley Orgánica de las Personas Adultas Mayores, la institución está facultada a verificar historialExoneraciones para controlar el límite legal de un vehículo exonerado por beneficiario.",
      esProvisional: true,
    },
    "c-25": {
      campoId: "c-25",
      campoNombre: "tipoLicencia",
      servicioNombre: "Licencias de Conducir y Puntos",
      institucionNombre: "Agencia Nacional de Tránsito",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo tipoLicencia en el proceso de autorización de permisos de operación para comprobar que el conductor posea la categoría profesional requerida.",
      esProvisional: true,
    },
    "c-26": {
      campoId: "c-26",
      campoNombre: "puntosDisponibles",
      servicioNombre: "Licencias de Conducir y Puntos",
      institucionNombre: "Agencia Nacional de Tránsito",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo puntosDisponibles en el proceso de control de habilitaciones de tránsito para confirmar que el conductor mantiene saldo de puntos activo.",
      esProvisional: true,
    },
    "c-27": {
      campoId: "c-27",
      campoNombre: "fechaCaducidad",
      servicioNombre: "Licencias de Conducir y Puntos",
      institucionNombre: "Agencia Nacional de Tránsito",
      clasificacion: "Accesible",
      esSensible: false,
      ejemploFinalidad:
        "Se consulta el campo fechaCaducidad en el proceso de validación de operadores de transporte para verificar que la licencia de conducir no haya expirado.",
      esProvisional: true,
    },
    "c-27b": {
      campoId: "c-27b",
      campoNombre: "historialSuspensiones",
      servicioNombre: "Licencias de Conducir y Puntos",
      institucionNombre: "Agencia Nacional de Tránsito",
      clasificacion: "Confidencial",
      esSensible: false,
      ejemploFinalidad:
        "Se requiere el campo historialSuspensiones en el proceso de acreditación de conductores de servicio público para verificar que no pesen sanciones de suspensión vigentes.",
      ejemploJustificacion:
        "Los Arts. 97 y 100 de la Ley Orgánica de Transporte Terrestre, Tránsito y Seguridad Vial (LOTTTSV) facultan a la autoridad de tránsito a verificar historialSuspensiones previo a emitir habilitaciones operacionales.",
      esProvisional: true,
    },
    "c-28": {
      campoId: "c-28",
      campoNombre: "restriccionesMedicas",
      servicioNombre: "Licencias de Conducir y Puntos",
      institucionNombre: "Agencia Nacional de Tránsito",
      clasificacion: "Confidencial",
      esSensible: true,
      ejemploFinalidad:
        "Se requiere el campo restriccionesMedicas en el proceso de control de seguridad vial y homologación de unidades adaptadas para verificar las condiciones técnicas exigidas al conductor.",
      ejemploJustificacion:
        "En apego al Art. 26 numeral 2 de la LOPDP y al Art. 94 de la LOTTTSV, la entidad tiene competencia legal para consultar restriccionesMedicas con el fin de garantizar la seguridad vial y las adaptaciones obligatorias.",
      esProvisional: true,
    },
  },
  historialCambios: [
    {
      id: "hist-ayuda-1",
      fecha: "28/10/2026 11:15",
      usuario: "DPI / Administración DINARP",
      resumen:
        "Actualización a formato compacto y práctico con criterios de orientación y ejemplos concretos por campo seleccionado (provisionales pendientes de aprobación DINARP).",
      version: "v2.0-provisional",
    },
  ],
};

export function getConfiguracionAyudaBN07(): ConfiguracionAyudaBN07 {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIGURACION_AYUDA_BN07;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_AYUDA_BN07);
    if (!raw) return DEFAULT_CONFIGURACION_AYUDA_BN07;
    const parsed = JSON.parse(raw) as Partial<ConfiguracionAyudaBN07>;
    return {
      ...DEFAULT_CONFIGURACION_AYUDA_BN07,
      ...parsed,
      bloques: {
        ...DEFAULT_CONFIGURACION_AYUDA_BN07.bloques,
        ...(parsed.bloques || {}),
      },
      overridesPorCampo: {
        ...DEFAULT_CONFIGURACION_AYUDA_BN07.overridesPorCampo,
        ...(parsed.overridesPorCampo || {}),
      },
      historialCambios: parsed.historialCambios?.length
        ? parsed.historialCambios
        : DEFAULT_CONFIGURACION_AYUDA_BN07.historialCambios,
    };
  } catch {
    return DEFAULT_CONFIGURACION_AYUDA_BN07;
  }
}

export function saveConfiguracionAyudaBN07(
  nextConfig: ConfiguracionAyudaBN07,
  resumenCambio?: string,
  usuario = "DPI / Administrador DINARP"
): ConfiguracionAyudaBN07 {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fechaFormateada = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`;

  const algunoProvisional =
    Object.values(nextConfig.bloques).some((b) => b.esProvisional) ||
    Object.values(nextConfig.overridesPorCampo).some((o) => o.esProvisional);

  const nuevaVersion = algunoProvisional ? "v2.1-provisional" : "v2.0-oficial-DINARP";

  const updated: ConfiguracionAyudaBN07 = {
    ...nextConfig,
    version: nuevaVersion,
    ultimaActualizacion: fechaFormateada,
    actualizadoPor: usuario,
    historialCambios: resumenCambio
      ? [
          {
            id: `hist-${Date.now()}`,
            fecha: fechaFormateada,
            usuario,
            resumen: resumenCambio,
            version: nuevaVersion,
          },
          ...(nextConfig.historialCambios || []),
        ]
      : nextConfig.historialCambios,
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY_AYUDA_BN07, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_AYUDA_BN07_UPDATED));
    } catch {
      // Ignore storage errors
    }
  }
  return updated;
}

export function resetConfiguracionAyudaBN07(): ConfiguracionAyudaBN07 {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY_AYUDA_BN07);
      window.dispatchEvent(new CustomEvent(EVENT_AYUDA_BN07_UPDATED));
    } catch {
      // Ignore storage errors
    }
  }
  return DEFAULT_CONFIGURACION_AYUDA_BN07;
}

export function useConfiguracionAyudaBN07() {
  const [config, setConfig] = useState<ConfiguracionAyudaBN07>(DEFAULT_CONFIGURACION_AYUDA_BN07);

  useEffect(() => {
    setConfig(getConfiguracionAyudaBN07());

    const handleUpdate = () => {
      setConfig(getConfiguracionAyudaBN07());
    };

    window.addEventListener(EVENT_AYUDA_BN07_UPDATED, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_AYUDA_BN07_UPDATED, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    config,
    saveConfig: (next: ConfiguracionAyudaBN07, resumen?: string, usuario?: string) => {
      const saved = saveConfiguracionAyudaBN07(next, resumen, usuario);
      setConfig(saved);
      return saved;
    },
    resetConfig: () => {
      const reset = resetConfiguracionAyudaBN07();
      setConfig(reset);
      return reset;
    },
  };
}

export interface AyudaResueltaCampoBN07 {
  finalidad: {
    codigoParametro: string;
    titulo: string;
    criterioOrientacion: string;
    instruccion: string;
    ejemploReferencial: string;
    esProvisional: boolean;
    etiquetaProvisional: string;
    tieneOverrideCampo: boolean;
  };
  justificacion: {
    codigoParametro: string;
    titulo: string;
    criterioOrientacion: string;
    instruccion: string;
    ejemploReferencial: string;
    esProvisional: boolean;
    etiquetaProvisional: string;
    tieneOverrideCampo: boolean;
  } | null;
}

function interpolarTextoCampo(
  texto: string,
  campoNombre: string,
  campoDescripcion?: string
): string {
  return texto
    .replace(/\{campo\}/g, campoNombre)
    .replace(/\{descripcion\}/g, campoDescripcion || campoNombre);
}

export function resolverAyudaParaCampo(
  config: ConfiguracionAyudaBN07,
  campo: {
    id: string;
    nombre?: string;
    descripcion?: string;
    clasificacion: "Accesible" | "Confidencial";
    esSensible?: boolean;
  }
): AyudaResueltaCampoBN07 {
  const esConfidencial = campo.clasificacion === "Confidencial";
  const esSensible = esConfidencial && Boolean(campo.esSensible);
  const nombreCampo = campo.nombre || campo.id;

  const override =
    config.overridesPorCampo[campo.id] ||
    Object.values(config.overridesPorCampo).find(
      (o) => o.campoNombre.toLowerCase() === nombreCampo.toLowerCase()
    );

  const bloqueFinalidadBase = !esConfidencial
    ? config.bloques.finalidadAccesible
    : esSensible
    ? config.bloques.finalidadConfidencialSensible
    : config.bloques.finalidadConfidencial;

  const tieneOverrideFinalidad = Boolean(
    override?.instruccionFinalidad?.trim() || override?.ejemploFinalidad?.trim()
  );

  const instruccionFinalidadRaw = override?.instruccionFinalidad?.trim()
    ? override.instruccionFinalidad
    : bloqueFinalidadBase.instruccion;

  const ejemploFinalidadRaw = override?.ejemploFinalidad?.trim()
    ? override.ejemploFinalidad
    : bloqueFinalidadBase.ejemploReferencial;

  const finalidad = {
    codigoParametro: bloqueFinalidadBase.codigoParametro,
    titulo: bloqueFinalidadBase.titulo,
    criterioOrientacion:
      override?.criterioFinalidad?.trim() ||
      bloqueFinalidadBase.criterioOrientacion ||
      "Incluya: nombre del campo + proceso institucional + necesidad específica",
    instruccion: interpolarTextoCampo(instruccionFinalidadRaw, nombreCampo, campo.descripcion),
    ejemploReferencial: interpolarTextoCampo(ejemploFinalidadRaw, nombreCampo, campo.descripcion),
    esProvisional: tieneOverrideFinalidad
      ? Boolean(override?.esProvisional)
      : bloqueFinalidadBase.esProvisional,
    etiquetaProvisional: bloqueFinalidadBase.etiquetaProvisional,
    tieneOverrideCampo: tieneOverrideFinalidad,
  };

  if (!esConfidencial) {
    return {
      finalidad,
      justificacion: null,
    };
  }

  const bloqueJustificacionBase = esSensible
    ? config.bloques.justificacionConfidencialSensible
    : config.bloques.justificacionConfidencial;

  const tieneOverrideJustificacion = Boolean(
    override?.instruccionJustificacion?.trim() || override?.ejemploJustificacion?.trim()
  );

  const instruccionJustificacionRaw = override?.instruccionJustificacion?.trim()
    ? override.instruccionJustificacion
    : bloqueJustificacionBase.instruccion;

  const ejemploJustificacionRaw = override?.ejemploJustificacion?.trim()
    ? override.ejemploJustificacion
    : bloqueJustificacionBase.ejemploReferencial;

  const justificacion = {
    codigoParametro: bloqueJustificacionBase.codigoParametro,
    titulo: bloqueJustificacionBase.titulo,
    criterioOrientacion:
      override?.criterioJustificacion?.trim() ||
      bloqueJustificacionBase.criterioOrientacion ||
      "Incluya: norma legal vigente + artículo aplicable + relación con el acceso solicitado",
    instruccion: interpolarTextoCampo(instruccionJustificacionRaw, nombreCampo, campo.descripcion),
    ejemploReferencial: interpolarTextoCampo(
      ejemploJustificacionRaw,
      nombreCampo,
      campo.descripcion
    ),
    esProvisional: tieneOverrideJustificacion
      ? Boolean(override?.esProvisional)
      : bloqueJustificacionBase.esProvisional,
    etiquetaProvisional: bloqueJustificacionBase.etiquetaProvisional,
    tieneOverrideCampo: tieneOverrideJustificacion,
  };

  return {
    finalidad,
    justificacion,
  };
}
