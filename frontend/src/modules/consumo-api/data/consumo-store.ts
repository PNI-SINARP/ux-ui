"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Consumo por API (API-01 a API-06), ampliaciones (ADD-01 a ADD-07) y PAR-18. Todo simulado en el navegador.
 */

export type TipoAcceso = "Privada" | "Pública";
export type TipoDatoPruebas = "Sintético" | "Anonimizado" | "Real" | "Indeterminado";

export interface CampoFuente {
  campo: string;
  clasificacion: "Accesible" | "Confidencial";
  sensible?: boolean;
}

export interface AccesoApi {
  id: string;
  institucion: string;
  proyecto: string;
  fuente: string;
  tipo: TipoAcceso;
  camposAutorizados: string[];
  catalogoCampos: CampoFuente[];
  cupoAutorizado: number; // privada: cupo_autorizado_vigente; pública: referencia de SOL-01
  credencial: string;
  token: string;
  tipoDatoPruebas: TipoDatoPruebas;
  estado: "Activa" | "Cerrada por reversión";
  versionAlcance: number;
}

export type EstadoEvento = "Confirmado" | "Pendiente de conciliación" | "Liberado";

export interface EventoConsumo {
  idEvento: string;
  idOperacion: string;
  idSegmento: string;
  accesoId: string;
  entorno: "Pruebas" | "Producción";
  origen: "API-01" | "API-02" | "API-03";
  resultado: string;
  reservada: number;
  entregada: number;
  estado: EstadoEvento;
  cursor?: string;
  identificador?: string;
  instante: string;
}

export type EstadoProgramacion =
  | "Borrador"
  | "Enviada"
  | "Observada"
  | "Coordinada"
  | "Aprobada"
  | "Rechazada"
  | "Pendiente de aplicación"
  | "En ejecución"
  | "Completada"
  | "Cancelada"
  | "Suspendida";

export interface ProgramacionMasiva {
  id: string;
  accesoId: string;
  inicioLocal: string;
  finLocal: string;
  cantidad: number;
  hilos: number;
  registrosPorHilo: number;
  forma: "Por script" | "Por petición única";
  justificacionHorario?: string;
  estado: EstadoProgramacion;
  versionPar18: number;
  observacion?: string;
  ventanaAlternativa?: string;
  ajuste?: string;
  motivoRechazo?: string;
  resumen?: { procesados: number; conError: number; rechazados: number };
  historial: { instante: string; accion: string; actor: string; detalle?: string }[];
}

export type TipoAmpliacion = "campos" | "cupo" | "mixta";
export type EstadoAmpliacion =
  | "Borrador"
  | "En revisión de Gestión"
  | "En revisión de DPI"
  | "Observada"
  | "Cerrada"
  | "Pendiente de firmas"
  | "Pendiente de pago"
  | "Pendiente de aprobación"
  | "Pendiente de corrección"
  | "Aplicada";

export interface Ampliacion {
  id: string;
  accesoId: string;
  tipo: TipoAmpliacion;
  campos: string[];
  camposConservados?: string[];
  justificacionesCampos?: Record<string, { finalidad: string; justificacionJuridica?: string }>;
  cupoAdicional: number;
  esRenovacionCupo?: boolean;
  estado: EstadoAmpliacion;
  version: number;
  asignacionGestion?: {
    idAsignacion: string;
    asignador: string;
    revisor: string;
    instante: string;
    motivoReasignacion?: string;
  };
  decisionGestion?: "Aprobada" | "Observada";
  asignacionDpi?: {
    idAsignacion: string;
    asignador: string;
    revisor: string;
    instante: string;
    motivoReasignacion?: string;
  };
  decisionDpi?: "Aprobada" | "Observada";
  informeDpiBorrador?: {
    criterioUso: string;
    criterioJuridico: string;
  };
  informeDpiFirmas: number;
  adendaPreparada?: boolean;
  firmasAdenda: number;
  facturaId?: string;
  pagoIniciado?: boolean;
  pagoConfirmado: boolean;
  correccion?: { area: string; motivo: string };
  reintentosApigee?: {
    pendiente: boolean;
    idOperacion: string;
    motivo: string;
    intentos: number;
  };
  fechaLimiteSubsanacion?: string;
  observaciones?: string;
  historial: { instante: string; accion: string; actor: string; detalle?: string }[];
}

export interface ParametrosMasivo {
  version: number;
  estado: "Publicada" | "Retirada";
  tasaMaxima: number;
  hilosEstandar: number;
  maxHilosPorConsumidor: number;
  franjaInicio: string;
  franjaFin: string;
  incluyeFinesDeSemana: boolean;
  anticipacionMinimaHoras: number;
  duracionMaximaHoras: number;
  autor: string;
  fecha: string;
}

export interface TicketInc01 {
  idTicket: string;
  accesoId: string;
  fuente: string;
  idEvento: string;
  codigoReferencia: string;
  mensaje: string;
  instante: string;
}

export interface EstadoConsumo {
  accesos: AccesoApi[];
  eventos: EventoConsumo[];
  programaciones: ProgramacionMasiva[];
  ampliaciones: Ampliacion[];
  parametros: ParametrosMasivo[];
  ticketsInc01?: TicketInc01[];
}

export const MAX_REGISTROS_POR_SEGMENTO = 1000; // PAR-13
export const PLAZO_SUBSANACION_DIAS = 3; // PAR-13

const CATALOGO_RC: CampoFuente[] = [
  { campo: "cedula", clasificacion: "Accesible" },
  { campo: "nombres", clasificacion: "Accesible" },
  { campo: "apellidos", clasificacion: "Accesible" },
  { campo: "fecha_nacimiento", clasificacion: "Accesible" },
  { campo: "nacionalidad", clasificacion: "Accesible" },
  { campo: "estado_civil", clasificacion: "Confidencial" },
  { campo: "lugar_nacimiento", clasificacion: "Confidencial" },
  { campo: "discapacidad", clasificacion: "Confidencial", sensible: true },
];

const CATALOGO_SRI: CampoFuente[] = [
  { campo: "ruc", clasificacion: "Accesible" },
  { campo: "razon_social", clasificacion: "Accesible" },
  { campo: "estado_contribuyente", clasificacion: "Accesible" },
  { campo: "actividad_economica", clasificacion: "Accesible" },
];

const CATALOGO_ANT: CampoFuente[] = [
  { campo: "cedula", clasificacion: "Accesible" },
  { campo: "tipo_licencia", clasificacion: "Accesible" },
  { campo: "puntos_licencia", clasificacion: "Accesible" },
  { campo: "placa_vehiculo", clasificacion: "Confidencial" },
  { campo: "infracciones_pendientes", clasificacion: "Confidencial" },
];

const CATALOGO_IESS: CampoFuente[] = [
  { campo: "cedula", clasificacion: "Accesible" },
  { campo: "estado_afiliacion", clasificacion: "Accesible" },
  { campo: "ruc_empleador", clasificacion: "Confidencial" },
  { campo: "remuneracion_declarada", clasificacion: "Confidencial", sensible: true },
];

export const aleatorio = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
export const idOpaco = (p: string) => `${p}-${aleatorio(8).toUpperCase()}`;
export const ahoraIso = () => new Date().toISOString();
export const numero = (n: number) => n.toLocaleString("es-EC");

export function formatoFecha(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
}

export function sumarDiasHabiles(iso: string, dias: number): string {
  const d = new Date(iso);
  let r = dias;
  while (r > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) r -= 1;
  }
  return d.toISOString();
}

/** TEC-00 CA9: Validación de cédula ecuatoriana (10 dígitos + módulo 10). */
export function validarCedulaEc(cedula: string): boolean {
  if (!/^[0-9]{10}$/.test(cedula)) return false;
  const prov = parseInt(cedula.slice(0, 2), 10);
  if (prov < 1 || (prov > 24 && prov !== 30)) return false;
  const coefs = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i += 1) {
    let prod = parseInt(cedula[i], 10) * coefs[i];
    if (prod >= 10) prod -= 9;
    suma += prod;
  }
  const digito = (10 - (suma % 10)) % 10;
  return digito === parseInt(cedula[9], 10);
}

function construirMuestraRegistro(
  camposAutorizados: string[],
  modo: "Sintético" | "Anonimizado" | "Producción",
  identificador?: string,
  indice = 1
): Record<string, string> {
  const registro: Record<string, string> = {};
  for (const c of camposAutorizados) {
    if (c === "cedula") {
      registro[c] =
        modo === "Anonimizado"
          ? "17******34"
          : modo === "Sintético"
            ? `99000000${String(indice).padStart(2, "0")}`
            : identificador || "1718956234";
    } else if (c === "nombres") {
      registro[c] =
        modo === "Anonimizado"
          ? "M*** A***"
          : modo === "Sintético"
            ? `CIUDADANO PRUEBA ${indice}`
            : "MARÍA ALEJANDRA";
    } else if (c === "apellidos") {
      registro[c] =
        modo === "Anonimizado"
          ? "C*** V***"
          : modo === "Sintético"
            ? `SINTÉTICO DEMO ${indice}`
            : "CEVALLOS VILLACÍS";
    } else if (c === "fecha_nacimiento") {
      registro[c] = modo === "Anonimizado" ? "1988-**-**" : "1988-05-14";
    } else if (c === "nacionalidad") {
      registro[c] = "ECUATORIANA";
    } else if (c === "estado_civil") {
      registro[c] = modo === "Anonimizado" ? "RESERVADO" : "CASADO/A";
    } else if (c === "lugar_nacimiento") {
      registro[c] = "PICHINCHA / QUITO";
    } else if (c === "discapacidad") {
      registro[c] = "NINGUNA";
    } else if (c === "ruc") {
      registro[c] =
        modo === "Anonimizado"
          ? "179******0001"
          : identificador && identificador.length === 13
            ? identificador
            : `${identificador || "1718956234"}001`;
    } else if (c === "razon_social") {
      registro[c] =
        modo === "Sintético"
          ? `ENTIDAD DEMO SINTÉTICA ${indice} S.A.`
          : modo === "Anonimizado"
            ? "COMPAÑÍA *** S.A."
            : "CORPORACIÓN NACIONAL DE SERVICIOS S.A.";
    } else if (c === "estado_contribuyente") {
      registro[c] = "ACTIVO";
    } else if (c === "actividad_economica") {
      registro[c] = "ACTIVIDADES DE PROCESAMIENTO DE DATOS";
    } else {
      registro[c] = `VALOR_${c.toUpperCase()}_${indice}`;
    }
  }
  return registro;
}

export function saldoAcceso(a: AccesoApi, eventos: EventoConsumo[]) {
  const mios = eventos.filter((e) => e.accesoId === a.id && e.entorno === "Producción");
  const consumido = mios
    .filter((e) => e.estado === "Confirmado")
    .reduce((s, e) => s + e.entregada, 0);
  const reservado = mios
    .filter((e) => e.estado === "Pendiente de conciliación")
    .reduce((s, e) => s + e.reservada, 0);
  return { consumido, reservado, saldo: a.cupoAutorizado - consumido - reservado };
}

export function parametrosVigentes(p: ParametrosMasivo[]) {
  return [...p].reverse().find((x) => x.estado === "Publicada");
}

function semilla(): EstadoConsumo {
  const hace = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
  const en = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

  const accesos: AccesoApi[] = [
    {
      id: "ACC-API-001",
      institucion: "Banco del Pacífico S.A.",
      proyecto: "PRJ-2026-001 · Validación biométrica y KYC digital",
      fuente: "Registro Civil · Datos de identidad",
      tipo: "Privada",
      camposAutorizados: ["cedula", "nombres", "apellidos", "fecha_nacimiento"],
      catalogoCampos: CATALOGO_RC,
      cupoAutorizado: 500_000,
      credencial: "cred-rc-••••a41f",
      token: "tok-demo-privada",
      tipoDatoPruebas: "Sintético",
      estado: "Activa",
      versionAlcance: 2,
    },
    {
      id: "ACC-API-002",
      institucion: "Ministerio de Educación",
      proyecto: "PRJ-2026-002 · Asignación escolar y matrícula nacional",
      fuente: "Registro Civil · Datos de identidad",
      tipo: "Pública",
      camposAutorizados: ["cedula", "nombres", "apellidos", "fecha_nacimiento", "nacionalidad"],
      catalogoCampos: CATALOGO_RC,
      cupoAutorizado: 200_000,
      credencial: "cred-rc-••••b82c",
      token: "tok-demo-publica",
      tipoDatoPruebas: "Anonimizado",
      estado: "Activa",
      versionAlcance: 1,
    },
    {
      id: "ACC-API-003",
      institucion: "Dirección General de Registro Civil",
      proyecto: "PRJ-2026-004 · Cruce interinstitucional con contribuyentes",
      fuente: "SRI · Contribuyentes y RUC",
      tipo: "Pública",
      camposAutorizados: ["ruc", "razon_social", "estado_contribuyente"],
      catalogoCampos: CATALOGO_SRI,
      cupoAutorizado: 150_000,
      credencial: "cred-sri-••••77d2",
      token: "tok-demo-sri-pub",
      tipoDatoPruebas: "Sintético",
      estado: "Activa",
      versionAlcance: 1,
    },
    {
      id: "ACC-API-004",
      institucion: "Cooperativa Juventud Ecuatoriana Progresista (JEP)",
      proyecto: "PRJ-2026-008 · Calificación crediticia automatizada",
      fuente: "SRI · Contribuyentes y RUC",
      tipo: "Privada",
      camposAutorizados: ["ruc", "razon_social", "actividad_economica"],
      catalogoCampos: CATALOGO_SRI,
      cupoAutorizado: 100_000,
      credencial: "cred-sri-••••91e0",
      token: "tok-demo-jep-priv",
      tipoDatoPruebas: "Real",
      estado: "Activa",
      versionAlcance: 1,
    },
    {
      id: "ACC-API-005",
      institucion: "Aseguradora del Sur C.A.",
      proyecto: "PRJ-2026-011 · Suscripción vehicular en línea",
      fuente: "ANT · Licencias y matrículas vehiculares",
      tipo: "Privada",
      camposAutorizados: ["cedula", "tipo_licencia", "puntos_licencia"],
      catalogoCampos: CATALOGO_ANT,
      cupoAutorizado: 300_000,
      credencial: "cred-ant-••••34c9",
      token: "tok-demo-ant-priv",
      tipoDatoPruebas: "Indeterminado",
      estado: "Activa",
      versionAlcance: 1,
    },
    {
      id: "ACC-API-006",
      institucion: "Buró de Crédito Equifax Ecuador C.A.",
      proyecto: "PRJ-2025-019 · Historial de aportaciones (Revertida)",
      fuente: "IESS · Historia laboral y afiliación",
      tipo: "Privada",
      camposAutorizados: ["cedula", "estado_afiliacion"],
      catalogoCampos: CATALOGO_IESS,
      cupoAutorizado: 250_000,
      credencial: "cred-iess-••••09f1",
      token: "tok-demo-iess-rev",
      tipoDatoPruebas: "Sintético",
      estado: "Cerrada por reversión",
      versionAlcance: 1,
    },
  ];

  const eventos: EventoConsumo[] = [
    // ACC-API-001 (Privada): 465.000 confirmados + 5.000 reservados = 470.000 / 500.000 (Umbral > 90% activo + 1 evento pendiente de conciliación)
    {
      idEvento: "EVT-8F21A901",
      idOperacion: "OP-7102A110",
      idSegmento: "SEG-001",
      accesoId: "ACC-API-001",
      entorno: "Producción",
      origen: "API-03",
      resultado: "Entregado (segmento 1)",
      identificador: "1718956234",
      reservada: 250_000,
      entregada: 250_000,
      estado: "Confirmado",
      cursor: "cur_OP-7102A110_s1_250000",
      instante: hace(72),
    },
    {
      idEvento: "EVT-8F21A902",
      idOperacion: "OP-7102A110",
      idSegmento: "SEG-002",
      accesoId: "ACC-API-001",
      entorno: "Producción",
      origen: "API-03",
      resultado: "Entregado (segmento 2)",
      identificador: "1712345678",
      reservada: 215_000,
      entregada: 215_000,
      estado: "Confirmado",
      instante: hace(48),
    },
    {
      idEvento: "EVT-8F21A903",
      idOperacion: "OP-9920C401",
      idSegmento: "SEG-001",
      accesoId: "ACC-API-001",
      entorno: "Producción",
      origen: "API-02",
      resultado: "Entrega incierta",
      identificador: "1718956234",
      reservada: 5_000,
      entregada: 0,
      estado: "Pendiente de conciliación",
      instante: hace(6),
    },
    {
      idEvento: "EVT-8F21A904",
      idOperacion: "OP-9920C390",
      idSegmento: "SEG-001",
      accesoId: "ACC-API-001",
      entorno: "Producción",
      origen: "API-02",
      resultado: "Fallo antes de entregar",
      identificador: "1718956234",
      reservada: 1_000,
      entregada: 0,
      estado: "Liberado",
      instante: hace(12),
    },
    {
      idEvento: "EVT-8F21A905",
      idOperacion: "OP-4401B112",
      idSegmento: "—",
      accesoId: "ACC-API-001",
      entorno: "Pruebas",
      origen: "API-01",
      resultado: "Exitosa (cedula · Sintético)",
      reservada: 0,
      entregada: 0,
      estado: "Liberado",
      instante: hace(4),
    },
    {
      idEvento: "EVT-8F21A906",
      idOperacion: "OP-4401B115",
      idSegmento: "—",
      accesoId: "ACC-API-001",
      entorno: "Pruebas",
      origen: "API-01",
      resultado: "Bloqueada · CAMPO_NO_AUTORIZADO (estado_civil)",
      reservada: 0,
      entregada: 0,
      estado: "Liberado",
      instante: hace(2),
    },
    // ACC-API-002 (Pública): 140.000 / 200.000
    {
      idEvento: "EVT-7C10B201",
      idOperacion: "OP-3310D800",
      idSegmento: "SEG-001",
      accesoId: "ACC-API-002",
      entorno: "Producción",
      origen: "API-03",
      resultado: "Entregado (segmento 1)",
      identificador: "0912345678",
      reservada: 140_000,
      entregada: 140_000,
      estado: "Confirmado",
      instante: hace(36),
    },
    {
      idEvento: "EVT-7C10B202",
      idOperacion: "OP-3310D812",
      idSegmento: "—",
      accesoId: "ACC-API-002",
      entorno: "Pruebas",
      origen: "API-01",
      resultado: "Exitosa (nombres · Anonimizado)",
      reservada: 0,
      entregada: 0,
      estado: "Liberado",
      instante: hace(8),
    },
    // ACC-API-003 (Pública que supera referencia: 185.000 / 150.000 -> Alerta API-05 sin bloqueo)
    {
      idEvento: "EVT-6B90E101",
      idOperacion: "OP-2190F100",
      idSegmento: "SEG-001",
      accesoId: "ACC-API-003",
      entorno: "Producción",
      origen: "API-03",
      resultado: "Entregado (segmento 1)",
      identificador: "1790012345001",
      reservada: 185_000,
      entregada: 185_000,
      estado: "Confirmado",
      instante: hace(24),
    },
    // ACC-API-004 (Privada con Cupo Agotado: 100.000 / 100.000 -> Bloqueo 429 CUPO_AGOTADO y FUE-04 Real bloqueado en Pruebas)
    {
      idEvento: "EVT-5A40D301",
      idOperacion: "OP-1050A900",
      idSegmento: "SEG-001",
      accesoId: "ACC-API-004",
      entorno: "Producción",
      origen: "API-03",
      resultado: "Entregado (segmento 1)",
      identificador: "0190123456001",
      reservada: 100_000,
      entregada: 100_000,
      estado: "Confirmado",
      instante: hace(18),
    },
    {
      idEvento: "EVT-5A40D302",
      idOperacion: "OP-1050A920",
      idSegmento: "—",
      accesoId: "ACC-API-004",
      entorno: "Pruebas",
      origen: "API-01",
      resultado: "Bloqueada · DATOS_REALES_NO_PERMITIDOS_EN_PRUEBAS (FUE-04: Real)",
      reservada: 0,
      entregada: 0,
      estado: "Liberado",
      instante: hace(5),
    },
    // ACC-API-005 (Privada con FUE-04 Indeterminado en Pruebas y 45.000 consumidos en Producción)
    {
      idEvento: "EVT-4D12C501",
      idOperacion: "OP-8812B300",
      idSegmento: "SEG-001",
      accesoId: "ACC-API-005",
      entorno: "Producción",
      origen: "API-02",
      resultado: "Entregado",
      identificador: "1718956234",
      reservada: 45_000,
      entregada: 45_000,
      estado: "Confirmado",
      instante: hace(14),
    },
  ];

  const programaciones: ProgramacionMasiva[] = [
    {
      id: "PRG-001",
      accesoId: "ACC-API-001",
      inicioLocal: en(72).slice(0, 16),
      finLocal: en(76).slice(0, 16),
      cantidad: 80_000,
      hilos: 10,
      registrosPorHilo: 8_000,
      forma: "Por script",
      estado: "Enviada",
      versionPar18: 1,
      historial: [
        {
          instante: hace(10),
          accion: "Enviada (PAR-18 v1)",
          actor: "Coordinador SINARP · Banco del Pacífico S.A.",
          detalle: "Ventana nocturna solicitada dentro de franja permitida (20:00 a 06:00).",
        },
      ],
    },
    {
      id: "PRG-002",
      accesoId: "ACC-API-002",
      inicioLocal: en(96).slice(0, 16),
      finLocal: en(102).slice(0, 16),
      cantidad: 120_000,
      hilos: 12,
      registrosPorHilo: 10_000,
      forma: "Por script",
      justificacionHorario: "Proceso nacional de cierre de matrículas ordinarias.",
      estado: "Coordinada",
      versionPar18: 1,
      ajuste: "Se asigna ventana dedicada con prioridad media en nodo secundario RC.",
      historial: [
        {
          instante: hace(28),
          accion: "Enviada (PAR-18 v1)",
          actor: "Coordinador SINARP · Ministerio de Educación",
        },
        {
          instante: hace(12),
          accion: "Coordinada con la fuente",
          actor: "Dirección de Gestión y Registro (DGR)",
          detalle: "Capacidad confirmada con Registro Civil. Pasa a DTD para verificación técnica.",
        },
      ],
    },
    {
      id: "PRG-003",
      accesoId: "ACC-API-001",
      inicioLocal: en(52).slice(0, 16),
      finLocal: en(56).slice(0, 16),
      cantidad: 25_000,
      hilos: 10,
      registrosPorHilo: 2_500,
      forma: "Por petición única",
      estado: "Aprobada",
      versionPar18: 1,
      historial: [
        {
          instante: hace(40),
          accion: "Enviada (PAR-18 v1)",
          actor: "Coordinador SINARP · Banco del Pacífico S.A.",
        },
        {
          instante: hace(22),
          accion: "Coordinada con la fuente",
          actor: "Dirección de Gestión y Registro (DGR)",
        },
        {
          instante: hace(6),
          accion: "Aprobada técnicamente",
          actor: "Dirección de Tecnología y Desarrollo (DTD)",
          detalle: "Hilos (10) y tasa (50 reg/s) dentro de umbrales PAR-18. Lista para aplicar en Apigee.",
        },
      ],
    },
    {
      id: "PRG-004",
      accesoId: "ACC-API-003",
      inicioLocal: hace(2).slice(0, 16),
      finLocal: en(4).slice(0, 16),
      cantidad: 60_000,
      hilos: 10,
      registrosPorHilo: 6_000,
      forma: "Por script",
      estado: "En ejecución",
      versionPar18: 1,
      historial: [
        {
          instante: hace(60),
          accion: "Enviada (PAR-18 v1)",
          actor: "Coordinador SINARP · Registro Civil",
        },
        {
          instante: hace(30),
          accion: "Aprobada técnicamente",
          actor: "Dirección de Tecnología y Desarrollo (DTD)",
        },
        {
          instante: hace(2),
          accion: "Aplicada en Apigee → En ejecución",
          actor: "Administrador Técnico (TI)",
          detalle: "Cuota temporal y rate-limit activados en Apigee para ventana programada.",
        },
      ],
    },
    {
      id: "PRG-005",
      accesoId: "ACC-API-005",
      inicioLocal: en(50).slice(0, 16),
      finLocal: en(55).slice(0, 16),
      cantidad: 90_000,
      hilos: 15,
      registrosPorHilo: 6_000,
      forma: "Por script",
      justificacionHorario: "Actualización trimestral de cartera de pólizas.",
      estado: "Observada",
      versionPar18: 1,
      observacion: "La fuente ANT tiene mantenimiento preventivo entre 22:00 y 01:00.",
      ventanaAlternativa: "Reprogramar inicio a partir de las 01:30 AM del día siguiente con máximo 10 hilos.",
      historial: [
        {
          instante: hace(20),
          accion: "Enviada (PAR-18 v1)",
          actor: "Coordinador SINARP · Aseguradora del Sur C.A.",
        },
        {
          instante: hace(5),
          accion: "Observada con ventana alternativa",
          actor: "Dirección de Gestión y Registro (DGR)",
          detalle: "La fuente ANT tiene mantenimiento preventivo entre 22:00 y 01:00.",
        },
      ],
    },
  ];

  const ampliaciones: Ampliacion[] = [
    {
      id: "AMP-001",
      accesoId: "ACC-API-001",
      tipo: "mixta",
      campos: ["estado_civil", "lugar_nacimiento"],
      camposConservados: ["cedula", "nombres", "apellidos", "fecha_nacimiento"],
      justificacionesCampos: {
        estado_civil: {
          finalidad: "Validación de sociedad conyugal en otorgamiento de crédito hipotecario.",
          justificacionJuridica: "Art. 189 del Código Civil y normativa SB-2025-KYC.",
        },
        lugar_nacimiento: {
          finalidad: "Verificación de homónimos y jurisdicción de origen del solicitante.",
          justificacionJuridica: "Resolución UAFE-2025-014 sobre debida diligencia ampliada.",
        },
      },
      cupoAdicional: 300_000,
      estado: "En revisión de Gestión",
      version: 1,
      informeDpiFirmas: 0,
      firmasAdenda: 0,
      pagoConfirmado: false,
      historial: [
        {
          instante: hace(16),
          accion: "Ampliación mixta enviada (ADD-01)",
          actor: "Coordinador SINARP · Banco del Pacífico S.A.",
          detalle:
            "Incluye 2 campos nuevos (estado_civil, lugar_nacimiento) + 300.000 registros; conserva los 4 campos vigentes. Pendiente de que el Director de Gestión asigne revisor (ADD-07).",
        },
      ],
    },
    {
      id: "AMP-002",
      accesoId: "ACC-API-005",
      tipo: "campos",
      campos: ["placa_vehiculo"],
      camposConservados: ["cedula", "tipo_licencia", "puntos_licencia"],
      justificacionesCampos: {
        placa_vehiculo: {
          finalidad: "Cruce de titularidad vehicular para garantías prendarias y pólizas todo riesgo.",
          justificacionJuridica: "Art. 42 Ley de Comercio Electrónico y consentimiento expreso del asegurado.",
        },
      },
      cupoAdicional: 0,
      estado: "En revisión de Gestión",
      version: 1,
      asignacionGestion: {
        idAsignacion: "ASG-GES-88412",
        asignador: "Director de Gestión y Registro",
        revisor: "Ana Torres",
        instante: hace(10),
      },
      informeDpiFirmas: 0,
      firmasAdenda: 0,
      pagoConfirmado: false,
      historial: [
        {
          instante: hace(22),
          accion: "Ampliación de campos enviada (ADD-01)",
          actor: "Coordinador SINARP · Aseguradora del Sur C.A.",
          detalle: "Solicita campo confidencial placa_vehiculo; conserva 3 campos autorizados vigentes.",
        },
        {
          instante: hace(10),
          accion: "Revisión de cambios asignada en Gestión (ADD-07)",
          actor: "Director de Gestión y Registro",
          detalle: "id_asignacion: ASG-GES-88412 · Revisor asignado: Ana Torres (Analista de Gestión).",
        },
      ],
    },
    {
      id: "AMP-003",
      accesoId: "ACC-API-002",
      tipo: "campos",
      campos: ["estado_civil"],
      camposConservados: ["cedula", "nombres", "apellidos", "fecha_nacimiento", "nacionalidad"],
      justificacionesCampos: {
        estado_civil: {
          finalidad: "Verificación de representante legal y núcleo familiar en becas estudiantiles.",
          justificacionJuridica: "Art. 34 de la LOEI y Reglamento General de Asignación Escolar.",
        },
      },
      cupoAdicional: 0,
      estado: "En revisión de Gestión",
      version: 1,
      asignacionGestion: {
        idAsignacion: "ASG-GES-90115",
        asignador: "Director de Gestión y Registro",
        revisor: "Marcos Silva",
        instante: hace(12),
      },
      informeDpiFirmas: 0,
      firmasAdenda: 0,
      pagoConfirmado: true,
      historial: [
        {
          instante: hace(20),
          accion: "Ampliación pública de campos enviada (ADD-05)",
          actor: "Coordinador SINARP · Ministerio de Educación",
          detalle:
            "Solicitud pública: incluye campo confidencial estado_civil y conserva los 5 campos vigentes.",
        },
        {
          instante: hace(12),
          accion: "Revisión de cambios asignada en Gestión (ADD-07)",
          actor: "Director de Gestión y Registro",
          detalle: "id_asignacion: ASG-GES-90115 · Revisor asignado: Marcos Silva (Especialista de Gestión).",
        },
      ],
    },
    {
      id: "AMP-004",
      accesoId: "ACC-API-001",
      tipo: "campos",
      campos: ["discapacidad"],
      camposConservados: ["cedula", "nombres", "apellidos", "fecha_nacimiento"],
      justificacionesCampos: {
        discapacidad: {
          finalidad: "Aplicación automática de beneficios tarifarios y atención preferente (CONADIS).",
          justificacionJuridica: "Art. 74 Ley Orgánica de Discapacidades y Art. 26 LOPDP.",
        },
      },
      cupoAdicional: 0,
      estado: "En revisión de DPI",
      version: 1,
      asignacionGestion: {
        idAsignacion: "ASG-GES-77201",
        asignador: "Director de Gestión y Registro",
        revisor: "Ana Torres",
        instante: hace(26),
      },
      decisionGestion: "Aprobada",
      asignacionDpi: {
        idAsignacion: "ASG-DPI-31094",
        asignador: "Director de Protección de la Información (DPI)",
        revisor: "Dr. Carlos Mendoza",
        instante: hace(14),
      },
      decisionDpi: "Aprobada",
      informeDpiBorrador: {
        criterioUso: "Favorable: finalidad proporcional para exoneración legal a personas con discapacidad.",
        criterioJuridico: "Favorable: habilitación expresa en Ley Orgánica de Discapacidades y LOPDP.",
      },
      informeDpiFirmas: 1,
      firmasAdenda: 0,
      pagoConfirmado: false,
      historial: [
        {
          instante: hace(30),
          accion: "Ampliación de campos enviada (ADD-01)",
          actor: "Coordinador SINARP · Banco del Pacífico S.A.",
          detalle: "Campo confidencial sensible solicitado: discapacidad (requiere informe de DPI).",
        },
        {
          instante: hace(26),
          accion: "Revisión de cambios asignada en Gestión (ADD-07)",
          actor: "Director de Gestión y Registro",
          detalle: "id_asignacion: ASG-GES-77201 · Revisor: Ana Torres.",
        },
        {
          instante: hace(18),
          accion: "Gestión aprueba ampliación de campos (ADD-07)",
          actor: "Ana Torres (Equipo de Gestión)",
          detalle: "Contiene campo confidencial; pasa a Director de DPI para asignación.",
        },
        {
          instante: hace(14),
          accion: "Revisión asignada en DPI (ADD-07)",
          actor: "Director de Protección de la Información (DPI)",
          detalle: "id_asignacion: ASG-DPI-31094 · Revisor DPI: Dr. Carlos Mendoza.",
        },
        {
          instante: hace(8),
          accion: "Informe de recomendación elaborado y firmado en FirmaEC (1/2)",
          actor: "Dr. Carlos Mendoza (Equipo de DPI)",
          detalle: "Pendiente Visto Bueno y firma en FirmaEC (2/2) del Director de DPI.",
        },
      ],
    },
    {
      id: "AMP-005",
      accesoId: "ACC-API-002",
      tipo: "campos",
      campos: ["lugar_nacimiento"],
      camposConservados: ["cedula", "nombres", "apellidos", "fecha_nacimiento", "nacionalidad"],
      justificacionesCampos: {
        lugar_nacimiento: {
          finalidad: "Zonificación territorial para asignación de cupos en distritos educativos.",
          justificacionJuridica: "Acuerdo Ministerial MINEDUC-2025-0042 sobre zonificación escolar.",
        },
      },
      cupoAdicional: 0,
      estado: "Pendiente de aprobación",
      version: 1,
      asignacionGestion: {
        idAsignacion: "ASG-GES-61209",
        asignador: "Director de Gestión y Registro",
        revisor: "Elena Viteri",
        instante: hace(28),
      },
      decisionGestion: "Aprobada",
      asignacionDpi: {
        idAsignacion: "ASG-DPI-29011",
        asignador: "Director de Protección de la Información (DPI)",
        revisor: "Abg. Sofía Intriago",
        instante: hace(18),
      },
      decisionDpi: "Aprobada",
      informeDpiBorrador: {
        criterioUso: "Favorable: uso estadístico y de planificación educativa distrital.",
        criterioJuridico: "Favorable: competencia legal del Ministerio de Educación.",
      },
      informeDpiFirmas: 2,
      firmasAdenda: 0,
      pagoConfirmado: true,
      historial: [
        {
          instante: hace(34),
          accion: "Ampliación pública de campos enviada (ADD-05)",
          actor: "Coordinador SINARP · Ministerio de Educación",
        },
        {
          instante: hace(22),
          accion: "Aprobada en Gestión y DPI con 2/2 firmas en FirmaEC (ADD-07)",
          actor: "Director de Protección de la Información (DPI)",
          detalle:
            "Compuerta ¿Requiere adenda? = No (Institución Pública · ADD-05): no requiere adenda contractual ni pago. Pasa directo a Dirección de Gestión para Aprobar actualización y aplicar en Apigee (ACC-08).",
        },
      ],
    },
    {
      id: "AMP-006",
      accesoId: "ACC-API-004",
      tipo: "cupo",
      campos: [],
      camposConservados: ["ruc", "razon_social", "actividad_economica"],
      cupoAdicional: 250_000,
      esRenovacionCupo: true,
      estado: "Pendiente de firmas",
      version: 1,
      informeDpiFirmas: 0,
      adendaPreparada: false,
      firmasAdenda: 0,
      pagoConfirmado: false,
      historial: [
        {
          instante: hace(14),
          accion: "Renovación / Ampliación solo de cupo enviada (ADD-02 / ADD-03)",
          actor: "Coordinador SINARP · Cooperativa JEP",
          detalle:
            "Compuerta ¿Incluye campos? = No (Solo cupo +250.000 registros): conserva intactos los campos autorizados vigentes (ruc, razon_social, actividad_economica) y la fuente SRI. Pasa directo a Jurídica para Redactar adenda contractual (PAR-02) y Gestionar firmas (ADD-04).",
        },
      ],
    },
    {
      id: "AMP-007",
      accesoId: "ACC-API-001",
      tipo: "campos",
      campos: ["nacionalidad"],
      camposConservados: ["cedula", "nombres", "apellidos", "fecha_nacimiento"],
      justificacionesCampos: {
        nacionalidad: {
          finalidad: "Cumplimiento FATCA/CRS de residencia fiscal en apertura de cuentas.",
        },
      },
      cupoAdicional: 0,
      estado: "Pendiente de firmas",
      version: 1,
      asignacionGestion: {
        idAsignacion: "ASG-GES-71904",
        asignador: "Director de Gestión y Registro",
        revisor: "Ana Torres",
        instante: hace(24),
      },
      decisionGestion: "Aprobada",
      informeDpiFirmas: 0,
      adendaPreparada: true,
      firmasAdenda: 1,
      pagoConfirmado: false,
      historial: [
        {
          instante: hace(28),
          accion: "Ampliación de campos enviada (ADD-01)",
          actor: "Coordinador SINARP · Banco del Pacífico S.A.",
        },
        {
          instante: hace(20),
          accion: "Gestión aprueba cambios (ADD-07) → ¿Requiere adenda? = Sí (Privada)",
          actor: "Ana Torres (Equipo de Gestión)",
          detalle: "Campo accesible nacionalidad aprobado. Deriva a Jurídica para Redactar adenda contractual.",
        },
        {
          instante: hace(10),
          accion: "Adenda contractual redactada con plantilla PAR-02 (ADD-04)",
          actor: "Analista de Jurídica",
          detalle: "tipo_evento_facturable: adenda_campos · Enviada a FirmaEC para Gestionar firmas.",
        },
        {
          instante: hace(4),
          accion: "Firma de adenda en FirmaEC (1/2 · Coordinador SINARP)",
          actor: "Coordinador SINARP · Banco del Pacífico S.A.",
          detalle: "Pendiente firma (2/2) de Máxima Autoridad DINARP para emitir factura (FAC-01).",
        },
      ],
    },
    {
      id: "AMP-008",
      accesoId: "ACC-API-004",
      tipo: "campos",
      campos: ["estado_contribuyente"],
      camposConservados: ["ruc", "razon_social", "actividad_economica"],
      justificacionesCampos: {
        estado_contribuyente: {
          finalidad: "Verificación de estado activo del RUC previo a desembolso comercial.",
        },
      },
      cupoAdicional: 0,
      estado: "Pendiente de pago",
      version: 1,
      asignacionGestion: {
        idAsignacion: "ASG-GES-65012",
        asignador: "Director de Gestión y Registro",
        revisor: "Marcos Silva",
        instante: hace(32),
      },
      decisionGestion: "Aprobada",
      informeDpiFirmas: 0,
      adendaPreparada: true,
      firmasAdenda: 2,
      facturaId: "FAC-2026-00841",
      pagoIniciado: false,
      pagoConfirmado: false,
      historial: [
        {
          instante: hace(36),
          accion: "Ampliación de campos enviada (ADD-01)",
          actor: "Coordinador SINARP · Cooperativa JEP",
        },
        {
          instante: hace(28),
          accion: "Aprobada en Gestión (ADD-07) → Adenda firmada 2/2 (ADD-04)",
          actor: "Jurídica / FirmaEC",
          detalle: "Firmas completas (Coordinador SINARP y Máxima Autoridad DINARP). Factura FAC-2026-00841 emitida automáticamente (FAC-01).",
        },
      ],
    },
    {
      id: "AMP-009",
      accesoId: "ACC-API-005",
      tipo: "cupo",
      campos: [],
      camposConservados: ["cedula", "tipo_licencia", "puntos_licencia"],
      cupoAdicional: 150_000,
      estado: "Pendiente de aprobación",
      version: 1,
      informeDpiFirmas: 0,
      adendaPreparada: true,
      firmasAdenda: 2,
      facturaId: "FAC-2026-00819",
      pagoIniciado: true,
      pagoConfirmado: true,
      historial: [
        {
          instante: hace(36),
          accion: "Ampliación solo de cupo enviada (ADD-02)",
          actor: "Coordinador SINARP · Aseguradora del Sur C.A.",
          detalle:
            "Solo cupo (+150.000 registros): conserva campos vigentes (cedula, tipo_licencia, puntos_licencia) y fuente ANT sin revisión de Gestión ni DPI.",
        },
        {
          instante: hace(20),
          accion: "Adenda de cupo firmada en FirmaEC (2/2) (ADD-04)",
          actor: "Máxima Autoridad DINARP",
          detalle: "Factura FAC-2026-00819 emitida automáticamente (FAC-01).",
        },
        {
          instante: hace(12),
          accion: "Pago confirmado en Pasarela (PAG-02)",
          actor: "Analista de Facturación",
          detalle: "Compprobante BCE-2026-99412 validado. ¿Pago confirmado? = Sí → Pasa a Dirección de Gestión para Aprobar actualización (ADD-06).",
        },
      ],
    },
    {
      id: "AMP-010",
      accesoId: "ACC-API-003",
      tipo: "campos",
      campos: ["actividad_economica"],
      camposConservados: ["ruc", "razon_social", "estado_contribuyente"],
      justificacionesCampos: {
        actividad_economica: {
          finalidad: "Cruce general de datos tributarios.",
        },
      },
      cupoAdicional: 0,
      estado: "Observada",
      version: 1,
      asignacionGestion: {
        idAsignacion: "ASG-GES-54109",
        asignador: "Director de Gestión y Registro",
        revisor: "Ana Torres",
        instante: hace(18),
      },
      decisionGestion: "Observada",
      informeDpiFirmas: 0,
      firmasAdenda: 0,
      pagoConfirmado: false,
      observaciones: "Debe precisar la finalidad específica de uso del campo actividad_economica dentro del convenio interinstitucional.",
      fechaLimiteSubsanacion: sumarDiasHabiles(hace(1), PLAZO_SUBSANACION_DIAS),
      historial: [
        {
          instante: hace(24),
          accion: "Ampliación de campos enviada (ADD-05)",
          actor: "Coordinador SINARP · Dirección General de Registro Civil",
        },
        {
          instante: hace(18),
          accion: "Revisión de cambios asignada en Gestión (ADD-07)",
          actor: "Director de Gestión y Registro",
          detalle: "id_asignacion: ASG-GES-54109 · Revisor: Ana Torres.",
        },
        {
          instante: hace(2),
          accion: "Observada con plazo de 3 días hábiles (PAR-13)",
          actor: "Ana Torres (Equipo de Gestión)",
          detalle: "Debe precisar la finalidad específica de uso del campo actividad_economica dentro del convenio interinstitucional.",
        },
      ],
    },
  ];

  return {
    accesos,
    eventos,
    programaciones,
    ampliaciones,
    parametros: [
      {
        version: 1,
        estado: "Publicada",
        tasaMaxima: 50,
        hilosEstandar: 10,
        maxHilosPorConsumidor: 150,
        franjaInicio: "20:00",
        franjaFin: "06:00",
        incluyeFinesDeSemana: true,
        anticipacionMinimaHoras: 48,
        duracionMaximaHoras: 8,
        autor: "Director de Tecnología y Desarrollo",
        fecha: hace(24 * 20),
      },
    ],
    ticketsInc01: [
      {
        idTicket: "INC-2026-0841",
        accesoId: "ACC-API-001",
        fuente: "Registro Civil · Datos de identidad",
        idEvento: "EVT-8F21A904",
        codigoReferencia: "REF-5029A1",
        mensaje: "Intermitencia reportada en pruebas de conectividad VPN con nodo secundario.",
        instante: hace(12),
      },
    ],
  };
}

const KEY = "dinarp_consumo_api_v4";
let memoria: EstadoConsumo | null = null;
const oyentes = new Set<() => void>();

function cargar(): EstadoConsumo {
  if (memoria) return memoria;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    memoria = raw ? (JSON.parse(raw) as EstadoConsumo) : semilla();
  } catch {
    memoria = semilla();
  }
  return memoria;
}
function guardar(e: EstadoConsumo) {
  memoria = e;
  try {
    localStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    // sin almacenamiento
  }
  oyentes.forEach((f) => f());
}

type Actor = { nombre: string; rol: string };
const traza = (accion: string, actor: Actor, detalle?: string) => ({
  instante: ahoraIso(),
  accion,
  actor: actor.nombre,
  detalle,
});

export type EscenarioPruebaApi01 =
  | "ok"
  | "sin_datos"
  | "red_vpn"
  | "timeout";

export type EscenarioConsultaApi02 =
  | "ok"
  | "sin_datos"
  | "fallo"
  | "incierto";

export interface ResultadoConsulta {
  ok: boolean;
  httpStatus?: number;
  codigo?: string;
  codigoReferencia?: string;
  mensaje: string;
  accionSugerida?: string;
  registros: number;
  reservada?: number;
  entregada?: number;
  pendientes?: number;
  parcial?: "Parcial por cupo" | "Parcial por fallo";
  cursor?: string;
  segmentos?: number;
  idEvento?: string;
  idOperacion?: string;
  idSegmento?: string;
  resultadoPrueba?: "Exitosa" | "Sin datos" | "Fallida" | "Bloqueada";
  payload?: Record<string, unknown>;
}

export function useConsumoStore() {
  const [estado, setEstado] = useState<EstadoConsumo | null>(null);
  useEffect(() => {
    const sync = () => setEstado(memoria ? { ...memoria } : null);
    cargar();
    oyentes.add(sync);
    sync();
    return () => {
      oyentes.delete(sync);
    };
  }, []);

  const actualizar = useCallback(
    (fn: (e: EstadoConsumo) => EstadoConsumo) => guardar(fn(cargar())),
    []
  );

  // Permite simular el cambio de clasificación FUE-04 en Pruebas (Sintético, Anonimizado, Real, Indeterminado)
  const cambiarTipoDatoPruebas = useCallback(
    (accesoId: string, tipoDatoPruebas: TipoDatoPruebas) =>
      actualizar((e) => ({
        ...e,
        accesos: e.accesos.map((a) =>
          a.id === accesoId ? { ...a, tipoDatoPruebas } : a
        ),
      })),
    [actualizar]
  );

  // API-01: prueba con credencial en el ambiente de Pruebas
  const probar = useCallback(
    (
      accesoId: string,
      token: string,
      campo: string,
      escenarioSimulado: EscenarioPruebaApi01 = "ok"
    ): ResultadoConsulta => {
      const e = cargar();
      const a = e.accesos.find((x) => x.id === accesoId)!;
      const idEvento = idOpaco("EVT");
      const idOperacion = idOpaco("OP");
      const instante = ahoraIso();
      const base = {
        idEvento,
        idOperacion,
        idSegmento: "—",
        accesoId,
        entorno: "Pruebas" as const,
        origen: "API-01" as const,
        reservada: 0,
        entregada: 0,
        estado: "Liberado" as const,
        instante,
      };
      let res: ResultadoConsulta;
      let resultado: "Exitosa" | "Sin datos" | "Fallida" | "Bloqueada" = "Exitosa";

      if (token !== a.token) {
        resultado = "Fallida";
        const ref = `REF-${aleatorio(6).toUpperCase()}`;
        const esVencido = token === "tok-vencido";
        const msg = esVencido
          ? "El token venció. Solicita uno nuevo."
          : "No se pudo autenticar el token. Revisa la credencial.";
        res = {
          ok: false,
          httpStatus: 401,
          codigo: esVencido ? "TOKEN_VENCIDO" : "TOKEN_INVALIDO",
          codigoReferencia: ref,
          mensaje: msg,
          accionSugerida: esVencido
            ? "Genera un nuevo token OAuth 2.0 en Apigee con tu client_id y client_secret."
            : "Verifica que la credencial corresponda al ambiente de Pruebas de esta solicitud.",
          registros: 0,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            codigo: esVencido ? "TOKEN_VENCIDO" : "TOKEN_INVALIDO",
            mensaje: msg,
            codigo_referencia: ref,
            id_evento: idEvento,
          },
        };
      } else if (!a.camposAutorizados.includes(campo)) {
        resultado = "Fallida";
        const ref = `REF-${aleatorio(6).toUpperCase()}`;
        const msg = "Parámetro no autorizado para esta solicitud.";
        res = {
          ok: false,
          httpStatus: 403,
          codigo: "PARAMETRO_NO_AUTORIZADO",
          codigoReferencia: ref,
          mensaje: msg,
          accionSugerida:
            "Consulta únicamente los campos incluidos en el alcance vigente o solicita una ampliación de campos (ADD-01).",
          registros: 0,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            codigo: "PARAMETRO_NO_AUTORIZADO",
            mensaje: msg,
            campo_solicitado: campo,
            campos_autorizados: a.camposAutorizados,
            codigo_referencia: ref,
            id_evento: idEvento,
          },
        };
      } else if (a.tipoDatoPruebas === "Real") {
        resultado = "Bloqueada";
        const msg = "No se permiten datos reales en el ambiente de Pruebas";
        res = {
          ok: false,
          httpStatus: 403,
          codigo: "DATOS_REALES_NO_PERMITIDOS_EN_PRUEBAS",
          mensaje: msg,
          accionSugerida:
            "El Administrador de la fuente debe configurar datos Sintéticos o Anonimizados en FUE-04 antes de habilitar pruebas.",
          registros: 0,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            codigo: "DATOS_REALES_NO_PERMITIDOS_EN_PRUEBAS",
            mensaje: msg,
            entorno: "Pruebas",
            tipo_dato_pruebas: a.tipoDatoPruebas,
            id_evento: idEvento,
          },
        };
      } else if (a.tipoDatoPruebas === "Indeterminado") {
        resultado = "Bloqueada";
        const msg = "Tipo de datos de prueba pendiente de clasificación";
        res = {
          ok: false,
          httpStatus: 403,
          codigo: "CLASIFICACION_PRUEBAS_PENDIENTE",
          mensaje: msg,
          accionSugerida:
            "Completa la clasificación de tipo_dato_pruebas en FUE-04 para este servicio.",
          registros: 0,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            codigo: "CLASIFICACION_PRUEBAS_PENDIENTE",
            mensaje: msg,
            entorno: "Pruebas",
            tipo_dato_pruebas: a.tipoDatoPruebas,
            id_evento: idEvento,
          },
        };
      } else if (escenarioSimulado === "red_vpn") {
        resultado = "Fallida";
        const ref = `REF-${aleatorio(6).toUpperCase()}`;
        const msg = "La red o VPN no es accesible. Revisa el canal configurado.";
        res = {
          ok: false,
          httpStatus: 502,
          codigo: "RED_VPN_INACCESIBLE",
          codigoReferencia: ref,
          mensaje: msg,
          accionSugerida:
            "Verifica el túnel IPSec/VPN o enlace dedicado registrado en la ficha técnica (FUE-04).",
          registros: 0,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            codigo: "RED_VPN_INACCESIBLE",
            mensaje: msg,
            codigo_referencia: ref,
            id_evento: idEvento,
          },
        };
      } else if (escenarioSimulado === "timeout") {
        resultado = "Fallida";
        const ref = `REF-${aleatorio(6).toUpperCase()}`;
        const msg = "Se agotó el tiempo de espera de la fuente. Intenta de nuevo.";
        res = {
          ok: false,
          httpStatus: 504,
          codigo: "TIEMPO_ESPERA_AGOTADO",
          codigoReferencia: ref,
          mensaje: msg,
          accionSugerida:
            "Reintenta la prueba; si el tiempo de espera persiste, levanta un ticket en INC-01 con el código de referencia.",
          registros: 0,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            codigo: "TIEMPO_ESPERA_AGOTADO",
            mensaje: msg,
            codigo_referencia: ref,
            id_evento: idEvento,
          },
        };
      } else if (escenarioSimulado === "sin_datos") {
        resultado = "Sin datos";
        res = {
          ok: true,
          httpStatus: 200,
          mensaje:
            "Prueba exitosa sin coincidencias (Sin datos): la fuente respondió 200 OK con 0 registros. No descuenta cupo.",
          registros: 0,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            entorno: "Pruebas",
            tipo_dato_pruebas: a.tipoDatoPruebas,
            resultado_prueba: "Sin datos",
            descuenta_cupo: false,
            id_evento: idEvento,
            registros: [],
          },
        };
      } else {
        resultado = "Exitosa";
        const modoMuestra = a.tipoDatoPruebas === "Anonimizado" ? "Anonimizado" : "Sintético";
        res = {
          ok: true,
          httpStatus: 200,
          mensaje: `Respuesta de prueba (${a.tipoDatoPruebas.toLowerCase()}) con los ${a.camposAutorizados.length} campos autorizados. No descuenta cupo.`,
          registros: 2,
          idEvento,
          idOperacion,
          resultadoPrueba: resultado,
          payload: {
            entorno: "Pruebas",
            tipo_dato_pruebas: a.tipoDatoPruebas,
            resultado_prueba: "Exitosa",
            descuenta_cupo: false,
            id_evento: idEvento,
            id_operacion: idOperacion,
            campos_entregados: a.camposAutorizados,
            registros: [
              construirMuestraRegistro(a.camposAutorizados, modoMuestra, undefined, 1),
              construirMuestraRegistro(a.camposAutorizados, modoMuestra, undefined, 2),
            ],
          },
        };
      }

      guardar({ ...e, eventos: [...e.eventos, { ...base, resultado }] });
      return res;
    },
    []
  );

  // API-01 CA3: Crear ticket INC-01 vinculado a solicitud, fuente, id_evento y codigo_referencia sin secretos
  const crearTicketInc01 = useCallback(
    (accesoId: string, idEvento: string, codigoReferencia: string, mensaje: string): TicketInc01 => {
      const e = cargar();
      const a = e.accesos.find((x) => x.id === accesoId)!;
      const ticket: TicketInc01 = {
        idTicket: `INC-${String((e.ticketsInc01?.length ?? 0) + 1).padStart(4, "0")}`,
        accesoId: a.id,
        fuente: a.fuente,
        idEvento,
        codigoReferencia,
        mensaje,
        instante: ahoraIso(),
      };
      guardar({
        ...e,
        ticketsInc01: [...(e.ticketsInc01 ?? []), ticket],
      });
      return ticket;
    },
    []
  );

  // API-02 y API-04: un consumo individual con reserva y confirmación
  const consultar = useCallback(
    (
      accesoId: string,
      opciones: {
        campo: string;
        devuelve: number;
        escenario: EscenarioConsultaApi02;
        identificador?: string;
      }
    ): ResultadoConsulta => {
      const e = cargar();
      const a = e.accesos.find((x) => x.id === accesoId)!;
      const idEvento = idOpaco("EVT");
      const idOperacion = idOpaco("OP");
      const idSegmento = idOpaco("SEG");

      // API-02 CA2: Solicitud cerrada, fuera de alcance o campo no autorizado -> 403 FUERA_DE_ALCANCE
      if (a.estado !== "Activa" || !a.camposAutorizados.includes(opciones.campo)) {
        const msg = "La solicitud no autoriza este acceso";
        return {
          ok: false,
          httpStatus: 403,
          codigo: "FUERA_DE_ALCANCE",
          mensaje: msg,
          accionSugerida:
            "Verifica que el campo pertenezca al alcance vigente de la solicitud o solicita una ampliación (ADD-01).",
          registros: 0,
          idOperacion,
          payload: {
            codigo: "FUERA_DE_ALCANCE",
            mensaje: msg,
          },
        };
      }

      // TEC-00 CA9: si la fuente requiere cédula (es_identificador_persona en Registro Civil), validar formato y módulo 10
      const idLimpio = opciones.identificador?.trim() ?? "";
      if (a.catalogoCampos.some((c) => c.campo === "cedula") && idLimpio) {
        if (!validarCedulaEc(idLimpio)) {
          return {
            ok: false,
            httpStatus: 422,
            codigo: "CEDULA_INVALIDA_MOD10",
            mensaje:
              "El identificador de persona no cumple el patrón ^[0-9]{10}$ o el dígito verificador módulo 10 (TEC-00).",
            accionSugerida:
              "Ingresa una cédula ecuatoriana válida de 10 dígitos (ej. 1718956234 o 1712345678).",
            registros: 0,
            idOperacion,
            payload: {
              codigo: "CEDULA_INVALIDA_MOD10",
              mensaje: "Identificador rechazado antes de invocar a la fuente (TEC-00 CA9).",
              identificador_recibido: idLimpio,
            },
          };
        }
      }

      const { saldo } = saldoAcceso(a, e.eventos);
      if (a.tipo === "Privada" && saldo <= 0) {
        return {
          ok: false,
          httpStatus: 429,
          codigo: "CUPO_AGOTADO",
          mensaje: "Cupo agotado. Genera una renovación (ADD-03).",
          accionSugerida:
            "Dirígete a la pestaña Ampliaciones (ADD-01..07) para solicitar cupo adicional sobre la misma credencial.",
          registros: 0,
          idOperacion,
          payload: {
            codigo: "CUPO_AGOTADO",
            mensaje: "Cupo agotado para la solicitud privada; no se creó reserva en API-04.",
            saldo_cupo_disponible: 0,
          },
        };
      }

      // API-02 CA1: Si la fuente responde sin coincidencias, registra evento con cantidad_entregada = 0
      if (opciones.escenario === "sin_datos") {
        guardar({
          ...e,
          eventos: [
            ...e.eventos,
            {
              idEvento,
              idOperacion,
              idSegmento,
              accesoId,
              entorno: "Producción",
              origen: "API-02",
              identificador: idLimpio || undefined,
              resultado: "Sin datos",
              reservada: 0,
              entregada: 0,
              estado: "Liberado",
              instante: ahoraIso(),
            },
          ],
        });
        return {
          ok: true,
          httpStatus: 200,
          mensaje:
            "La fuente respondió sin coincidencias: se registró el evento con cantidad_entregada = 0 y la reserva se liberó sin descontar cupo.",
          registros: 0,
          reservada: 0,
          entregada: 0,
          idEvento,
          idOperacion,
          idSegmento,
          payload: {
            id_operacion: idOperacion,
            id_segmento: idSegmento,
            id_evento: idEvento,
            resultado: "Sin datos",
            cantidad_reservada: 0,
            cantidad_entregada: 0,
            saldo_cupo_disponible: saldo,
            registros: [],
          },
        };
      }

      const reservada =
        a.tipo === "Privada" ? Math.min(opciones.devuelve, saldo) : opciones.devuelve;
      const entregada = opciones.escenario === "fallo" ? 0 : reservada;
      const estadoEvento: EstadoEvento =
        opciones.escenario === "incierto"
          ? "Pendiente de conciliación"
          : opciones.escenario === "fallo"
            ? "Liberado"
            : "Confirmado";
      const parcial =
        a.tipo === "Privada" && opciones.devuelve > saldo && opciones.escenario === "ok";

      guardar({
        ...e,
        eventos: [
          ...e.eventos,
          {
            idEvento,
            idOperacion,
            idSegmento,
            accesoId,
            entorno: "Producción",
            origen: "API-02",
            identificador: idLimpio || undefined,
            resultado:
              opciones.escenario === "fallo"
                ? "Fallo antes de entregar"
                : opciones.escenario === "incierto"
                  ? "Entrega incierta"
                  : parcial
                    ? "Parcial por cupo"
                    : "Entregado",
            reservada,
            entregada: estadoEvento === "Pendiente de conciliación" ? 0 : entregada,
            estado: estadoEvento,
            instante: ahoraIso(),
          },
        ],
      });

      if (opciones.escenario === "fallo") {
        const ref = `REF-${aleatorio(6).toUpperCase()}`;
        return {
          ok: false,
          httpStatus: 502,
          codigo: "FALLO_ANTES_DE_ENTREGAR",
          codigoReferencia: ref,
          mensaje:
            "Fallo antes de entregar: cantidad_entregada = 0, la reserva durable se liberó automáticamente en API-04.",
          accionSugerida:
            "Puedes reintentar la operación de forma segura; el cupo no fue descontado.",
          registros: 0,
          reservada,
          entregada: 0,
          idEvento,
          idOperacion,
          idSegmento,
          payload: {
            codigo: "FALLO_ANTES_DE_ENTREGAR",
            mensaje: "La entrega falló antes de confirmarse; reserva liberada.",
            codigo_referencia: ref,
            id_operacion: idOperacion,
            id_segmento: idSegmento,
            id_evento: idEvento,
            cantidad_reservada: reservada,
            cantidad_entregada: 0,
            estado_reserva: "Liberado",
          },
        };
      }

      if (opciones.escenario === "incierto") {
        return {
          ok: false,
          httpStatus: 504,
          codigo: "ENTREGA_INCIERTA_PENDIENTE_CONCILIACION",
          mensaje: `La entrega quedó incierta: ${numero(reservada)} registro(s) reservados en estado Pendiente de conciliación; se bloquea la reentrega hasta conciliar.`,
          accionSugerida:
            "Concilia este evento en la pestaña «Saldo y eventos» (Se entregó / No se entregó) para confirmar o liberar la reserva.",
          registros: 0,
          reservada,
          entregada: 0,
          idEvento,
          idOperacion,
          idSegmento,
          payload: {
            codigo: "ENTREGA_INCIERTA_PENDIENTE_CONCILIACION",
            mensaje:
              "No se recibió confirmación final de entrega; la reserva queda retenida preventivamente.",
            id_operacion: idOperacion,
            id_segmento: idSegmento,
            id_evento: idEvento,
            cantidad_reservada: reservada,
            cantidad_entregada: 0,
            estado_reserva: "Pendiente de conciliación",
          },
        };
      }

      const muestrasCount = Math.min(entregada, 3);
      const muestras = Array.from({ length: muestrasCount }, (_, idx) =>
        construirMuestraRegistro(a.camposAutorizados, "Producción", idLimpio || undefined, idx + 1)
      );
      const nuevoSaldo = a.tipo === "Privada" ? saldo - entregada : saldo;

      return {
        ok: true,
        httpStatus: parcial ? 206 : 200,
        mensaje: parcial
          ? `Parcial por cupo: la fuente devolvió ${numero(opciones.devuelve)}, pero el saldo disponible era ${numero(saldo)}. Se entregaron ${numero(entregada)} y no se promete el resto.`
          : `Entregados ${numero(entregada)} registro(s) con los campos autorizados. Evento confirmado en API-04.`,
        registros: entregada,
        reservada,
        entregada,
        parcial: parcial ? "Parcial por cupo" : undefined,
        idEvento,
        idOperacion,
        idSegmento,
        payload: {
          id_operacion: idOperacion,
          id_segmento: idSegmento,
          id_evento: idEvento,
          estado_reserva: "Confirmado",
          resultado: parcial ? "Parcial por cupo" : "Entregado",
          cantidad_reservada: reservada,
          cantidad_entregada: entregada,
          saldo_cupo_disponible: nuevoSaldo,
          campos_autorizados: a.camposAutorizados,
          registros_muestra: muestras,
        },
      };
    },
    []
  );

  // API-03 y API-04: consumo masivo por segmentos secuenciales
  const consultarMasivo = useCallback(
    (
      accesoId: string,
      solicitados: number,
      fallaEnSegmento: number | null,
      reanudacion?: { idOperacion: string; cursorPrevio: string; segmentoInicial: number }
    ): ResultadoConsulta => {
      const e = cargar();
      const a = e.accesos.find((x) => x.id === accesoId)!;
      if (a.estado !== "Activa") {
        return {
          ok: false,
          httpStatus: 403,
          codigo: "FUERA_DE_ALCANCE",
          mensaje: "La solicitud no autoriza este acceso",
          registros: 0,
          payload: {
            codigo: "FUERA_DE_ALCANCE",
            mensaje: "La solicitud no autoriza este acceso",
          },
        };
      }
      const idOperacion = reanudacion?.idOperacion ?? idOpaco("OP");
      let entregadoTotal = 0;
      let saldo = saldoAcceso(a, e.eventos).saldo;
      if (a.tipo === "Privada" && saldo <= 0) {
        return {
          ok: false,
          httpStatus: 429,
          codigo: "CUPO_AGOTADO",
          mensaje: "Cupo agotado. Genera una renovación (ADD-03).",
          registros: 0,
          idOperacion,
          payload: {
            codigo: "CUPO_AGOTADO",
            mensaje: "No hay saldo disponible para iniciar segmentos masivos.",
            saldo_cupo_disponible: 0,
          },
        };
      }

      const nuevos: EventoConsumo[] = [];
      let parcial: ResultadoConsulta["parcial"];
      let cursor: string | undefined;
      let n = 0;
      const offsetSeg = reanudacion?.segmentoInicial ?? 0;

      while (entregadoTotal < solicitados && n < 200) {
        const pendientes = solicitados - entregadoTotal;
        const reservada = Math.min(
          pendientes,
          MAX_REGISTROS_POR_SEGMENTO,
          a.tipo === "Privada" ? saldo : Infinity
        );
        if (reservada <= 0) {
          parcial = "Parcial por cupo";
          break;
        }
        n += 1;
        const numSegmentoGlobal = offsetSeg + n;
        const falla = fallaEnSegmento === n;
        const entregada = falla ? Math.floor(reservada / 2) : reservada;
        cursor = `CUR-${a.id}-V${a.versionAlcance}-S${numSegmentoGlobal}-${aleatorio(4).toUpperCase()}`;
        nuevos.push({
          idEvento: idOpaco("EVT"),
          idOperacion,
          idSegmento: `${idOperacion}-S${numSegmentoGlobal}`,
          accesoId,
          entorno: "Producción",
          origen: "API-03",
          resultado: falla ? "Parcial por fallo" : "Entregado",
          reservada,
          entregada,
          estado: "Confirmado",
          cursor,
          instante: ahoraIso(),
        });
        entregadoTotal += entregada;
        saldo -= entregada;
        if (falla) {
          parcial = "Parcial por fallo";
          break;
        }
      }

      guardar({ ...e, eventos: [...e.eventos, ...nuevos] });
      const pendientesRestantes = Math.max(0, solicitados - entregadoTotal);
      const ultimoEvento = nuevos[nuevos.length - 1];

      return {
        ok: entregadoTotal > 0,
        httpStatus: parcial ? 206 : 200,
        mensaje:
          parcial === "Parcial por cupo"
            ? `Parcial por cupo: se entregaron ${numero(entregadoTotal)} de ${numero(solicitados)} registros; el cupo se agotó y no se promete el resto.`
            : parcial === "Parcial por fallo"
              ? `Parcial por fallo en el segmento ${offsetSeg + n}: se confirmaron ${numero(entregadoTotal)} registros y quedaron ${numero(pendientesRestantes)} pendientes. Puedes reanudar desde el cursor sin duplicar los segmentos ya confirmados.`
              : reanudacion
                ? `Reanudación con cursor completada: se entregaron los ${numero(entregadoTotal)} registros faltantes bajo la misma operación ${idOperacion} sin duplicar.`
                : `Entregados ${numero(entregadoTotal)} registros en ${n} segmento(s) secuenciales de hasta ${numero(MAX_REGISTROS_POR_SEGMENTO)}.`,
        registros: entregadoTotal,
        reservada: solicitados,
        entregada: entregadoTotal,
        pendientes: pendientesRestantes,
        parcial,
        cursor: parcial === "Parcial por fallo" ? cursor : undefined,
        segmentos: offsetSeg + n,
        idOperacion,
        idEvento: ultimoEvento?.idEvento,
        idSegmento: ultimoEvento?.idSegmento,
        payload: {
          id_operacion: idOperacion,
          segmentos_confirmados: nuevos.map((seg) => ({
            id_segmento: seg.idSegmento,
            id_evento: seg.idEvento,
            reservada: seg.reservada,
            entregada: seg.entregada,
            resultado: seg.resultado,
          })),
          total_entregado: entregadoTotal,
          registros_solicitados_pendientes: pendientesRestantes,
          cursor_reanudacion: parcial === "Parcial por fallo" ? cursor : null,
          saldo_cupo_disponible: saldo,
          muestra_primer_registro: construirMuestraRegistro(
            a.camposAutorizados,
            "Producción",
            undefined,
            1
          ),
        },
      };
    },
    []
  );

  const conciliarEvento = useCallback(
    (idEvento: string, entregar: boolean) =>
      actualizar((e) => ({
        ...e,
        eventos: e.eventos.map((x) =>
          x.idEvento === idEvento
            ? {
                ...x,
                estado: entregar ? "Confirmado" : "Liberado",
                entregada: entregar ? x.reservada : 0,
                resultado: entregar ? "Entregado (conciliado)" : "Liberado tras conciliar",
              }
            : x
        ),
      })),
    [actualizar]
  );

  // API-06
  const crearProgramacion = useCallback(
    (
      datos: Omit<ProgramacionMasiva, "id" | "estado" | "versionPar18" | "historial">,
      actor: Actor
    ): string => {
      const e = cargar();
      const id = `PRG-${String(e.programaciones.length + 1).padStart(3, "0")}`;
      const par = parametrosVigentes(e.parametros);
      guardar({
        ...e,
        programaciones: [
          ...e.programaciones,
          {
            ...datos,
            id,
            estado: "Enviada",
            versionPar18: par?.version ?? 1,
            historial: [traza("Programación enviada", actor)],
          },
        ],
      });
      return id;
    },
    []
  );

  const mutarProgramacion = useCallback(
    (
      id: string,
      estado: EstadoProgramacion,
      actor: Actor,
      accion: string,
      extra: Partial<ProgramacionMasiva> = {},
      detalle?: string
    ) =>
      actualizar((e) => ({
        ...e,
        programaciones: e.programaciones.map((p) =>
          p.id === id
            ? {
                ...p,
                ...extra,
                estado,
                historial: [...p.historial, traza(accion, actor, detalle)],
              }
            : p
        ),
      })),
    [actualizar]
  );

  // ADD-01 a ADD-07
  const crearAmpliacion = useCallback(
    (
      accesoId: string,
      campos: string[],
      cupoAdicional: number,
      actor: Actor,
      opciones?: {
        justificacionesCampos?: Record<string, { finalidad: string; justificacionJuridica?: string }>;
        esRenovacionCupo?: boolean;
      }
    ): { ok: boolean; mensaje: string; id?: string } => {
      const e = cargar();
      const a = e.accesos.find((x) => x.id === accesoId)!;
      const abiertas = e.ampliaciones.filter(
        (x) => x.accesoId === accesoId && !["Aplicada", "Cerrada"].includes(x.estado)
      );
      if (cupoAdicional > 0 && abiertas.some((x) => x.cupoAdicional > 0))
        return {
          ok: false,
          mensaje: "Ya existe una ampliación de cupo abierta para esta solicitud.",
        };
      if (campos.length === 0 && cupoAdicional <= 0)
        return { ok: false, mensaje: "Elige al menos un campo o un cupo adicional." };
      const tipo: TipoAmpliacion =
        campos.length && cupoAdicional > 0 ? "mixta" : campos.length ? "campos" : "cupo";
      const id = `AMP-${String(e.ampliaciones.length + 1).padStart(3, "0")}`;
      const inicial: EstadoAmpliacion =
        tipo === "cupo" ? "Pendiente de firmas" : "En revisión de Gestión";
      const camposConservados = [...a.camposAutorizados];
      const etiquetaAccion =
        tipo === "cupo"
          ? opciones?.esRenovacionCupo
            ? "Renovación de cupo enviada (ADD-03)"
            : "Ampliación solo de cupo enviada (ADD-02)"
          : a.tipo === "Pública"
            ? "Ampliación pública de campos enviada (ADD-05)"
            : tipo === "mixta"
              ? "Ampliación mixta enviada (ADD-01)"
              : "Ampliación de campos enviada (ADD-01)";
      const detalleEnvio =
        tipo === "cupo"
          ? `Solo cupo (+${numero(cupoAdicional)} registros): conserva intactos los ${camposConservados.length} campos autorizados vigentes (${camposConservados.join(", ")}) y la fuente ${a.fuente}. Pasa directo a Jurídica (ADD-04) sin revisión de cambios en Gestión ni DPI.`
          : `Incluye ${campos.length} campo(s) nuevo(s) (${campos.join(", ")})${cupoAdicional > 0 ? ` y +${numero(cupoAdicional)} registros` : ""}; conserva ${camposConservados.length} campos vigentes. Pasa a Director de Gestión para asignar revisión de cambios (ADD-07).`;
      guardar({
        ...e,
        ampliaciones: [
          ...e.ampliaciones,
          {
            id,
            accesoId,
            tipo,
            campos,
            camposConservados,
            justificacionesCampos: opciones?.justificacionesCampos,
            cupoAdicional,
            esRenovacionCupo: opciones?.esRenovacionCupo,
            estado: inicial,
            version: 1,
            informeDpiFirmas: 0,
            adendaPreparada: false,
            firmasAdenda: 0,
            pagoConfirmado: false,
            historial: [traza(etiquetaAccion, actor, detalleEnvio)],
          },
        ],
      });
      return {
        ok: true,
        mensaje:
          tipo === "cupo"
            ? `Ampliación ${id} enviada (Solo cupo): conserva los ${camposConservados.length} campos vigentes y pasa directo a Jurídica (ADD-04) sin revisión de Gestión ni DPI.`
            : `Ampliación ${id} enviada: incluye cambios de alcance (${campos.length} campo(s)) y pasa a Director de Gestión para asignar revisión de cambios (ADD-07).`,
        id,
      };
    },
    []
  );

  const mutarAmpliacion = useCallback(
    (
      id: string,
      fn: (a: Ampliacion, acceso: AccesoApi) => Ampliacion,
      actor: Actor,
      accion: string,
      detalle?: string
    ) =>
      actualizar((e) => ({
        ...e,
        ampliaciones: e.ampliaciones.map((x) =>
          x.id === id
            ? {
                ...fn(x, e.accesos.find((a) => a.id === x.accesoId)!),
                historial: [...x.historial, traza(accion, actor, detalle)],
              }
            : x
        ),
      })),
    [actualizar]
  );

  /** ACC-08: aplica el alcance nuevo sobre la misma solicitud y credencial. */
  const aplicarAmpliacion = useCallback(
    (id: string, actor: Actor) =>
      actualizar((e) => {
        const amp = e.ampliaciones.find((x) => x.id === id);
        if (!amp) return e;
        return {
          ...e,
          accesos: e.accesos.map((a) =>
            a.id === amp.accesoId
              ? {
                  ...a,
                  camposAutorizados: [...new Set([...a.camposAutorizados, ...amp.campos])],
                  cupoAutorizado:
                    a.cupoAutorizado + (a.tipo === "Privada" ? amp.cupoAdicional : 0),
                  versionAlcance: a.versionAlcance + 1,
                }
              : a
          ),
          ampliaciones: e.ampliaciones.map((x) =>
            x.id === id
              ? {
                  ...x,
                  estado: "Aplicada",
                  historial: [
                    ...x.historial,
                    traza(
                      "Alcance aplicado en Apigee (ACC-08)",
                      actor,
                      "Misma solicitud y credencial; versión de alcance incrementada."
                    ),
                  ],
                }
              : x
          ),
        };
      }),
    [actualizar]
  );

  const publicarParametros = useCallback(
    (
      datos: Omit<ParametrosMasivo, "version" | "estado" | "autor" | "fecha">,
      actor: Actor
    ) =>
      actualizar((e) => ({
        ...e,
        parametros: [
          ...e.parametros.map((p) =>
            p.estado === "Publicada" ? { ...p, estado: "Retirada" as const } : p
          ),
          {
            ...datos,
            version: e.parametros.length + 1,
            estado: "Publicada",
            autor: actor.nombre,
            fecha: ahoraIso(),
          },
        ],
      })),
    [actualizar]
  );

  const reiniciar = useCallback(() => guardar(semilla()), []);

  return {
    listo: estado !== null,
    accesos: estado?.accesos ?? [],
    eventos: estado?.eventos ?? [],
    programaciones: estado?.programaciones ?? [],
    ampliaciones: estado?.ampliaciones ?? [],
    parametros: estado?.parametros ?? [],
    ticketsInc01: estado?.ticketsInc01 ?? [],
    cambiarTipoDatoPruebas,
    probar,
    crearTicketInc01,
    consultar,
    consultarMasivo,
    conciliarEvento,
    crearProgramacion,
    mutarProgramacion,
    crearAmpliacion,
    mutarAmpliacion,
    aplicarAmpliacion,
    publicarParametros,
    reiniciar,
  };
}
