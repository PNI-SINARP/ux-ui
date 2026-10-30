"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Entrega directa y excepcional (EXT-01 a EXT-08, PAR-17, PAR-04) según la Resolución 003-NG-DINARP-2023.
 * Todo es simulado: el reloj, FirmaEC, el almacenamiento y las extracciones se resuelven en el navegador.
 */

// ───────────────────────── Tipos ─────────────────────────

export type EstadoExcepcional =
  | "Borrador"
  | "Pendiente de firma"
  | "En calificación"
  | "Observada"
  | "Archivada"
  | "Admitida"
  | "En informe tecnológico"
  | "En informe DPI"
  | "En informe final"
  | "Pendiente de autorización"
  | "Autorizada"
  | "Rechazada"
  | "Suspendida"
  | "Vencida";

export type EstadoLote =
  | "Programado"
  | "En ejecución"
  | "Completado"
  | "Sin datos"
  | "Fallido"
  | "Escalado a TI"
  | "Cancelado por cupo"
  | "Cancelado por autorización"
  | "Descarga en conciliación"
  | "Eliminación pendiente"
  | "Descargado"
  | "Vencido";

export type EscenarioLote = "completado" | "sin_datos" | "fallido" | "supera_cupo";

export type HallazgoControl =
  | "Mal uso del dato"
  | "Falta de protección de los datos"
  | "Incumplimiento de la resolución"
  | "Desaparición de los supuestos"
  | "Sin avances en el plazo concedido";

export const HALLAZGOS: HallazgoControl[] = [
  "Mal uso del dato",
  "Falta de protección de los datos",
  "Incumplimiento de la resolución",
  "Desaparición de los supuestos",
  "Sin avances en el plazo concedido",
];

export interface SupuestoParametro {
  codigo: string;
  nombre: string;
  bastaSolo: boolean;
}

export interface ParametrosExcepcional {
  version: number;
  estado: "Borrador" | "Publicada" | "Retirada";
  supuestos: SupuestoParametro[];
  minSupuestos: number;
  plazoCalificacionDias: number;
  plazoCompletarDias: number;
  plazoInformeTecnologicoDias: number;
  plazoInformeDpiDias: number;
  plazoInformeFinalDias: number;
  vigenciaMaximaDias: number;
  maxRenovaciones: number;
  autor: string;
  aprobador: string;
  fechaEfecto: string;
}

export interface VigenciaEnlace {
  version: number;
  estado: "Publicada" | "Retirada";
  dias: number;
  motivo: string;
  autor: string;
  fecha: string;
}

export interface SupuestoDeclarado {
  codigo: string;
  justificacion: string;
}

export interface CampoSolicitado {
  campo: string;
  descripcion: string;
  categoria: "Accesible" | "Confidencial";
}

export interface FiltroExtraccion {
  parametro: string;
  operador: string;
  valor: string;
}

export interface Etapa {
  clave: "calificacion" | "tecnologico" | "dpi" | "final" | "autorizacion";
  ingreso: string;
  fechaLimite: string;
  versionParametros: number;
  resultado?: string;
  actor?: string;
  instante?: string;
  observacion?: string;
  hashFirma?: string;
}

export interface Ocurrencia {
  idOcurrencia: string;
  indice: number;
  localResuelta: string;
  desplazamiento: string;
  utc: string;
}

export interface ParteArchivo {
  numero: number;
  tamanoBytes: number;
  hashSha256: string;
  verificada: boolean;
}

export interface ArchivoTemporal {
  idArchivo: string;
  formato: "CSV" | "JSON" | "XML";
  tamanoBytes: number;
  cantidadRegistros: number;
  partes: ParteArchivo[];
  hashIndice: string;
  creado: string;
  estado: "Disponible" | "Descarga en conciliación" | "Eliminación pendiente" | "Eliminado";
}

export interface IntentoLote {
  idIntento: string;
  instante: string;
  resultado: "Fallido" | "Completado" | "Sin datos";
  manual: boolean;
  detalle: string;
}

export interface LoteExtraccion {
  id: string;
  idOcurrencia: string;
  indice: number;
  programadoLocal: string;
  programadoUtc: string;
  estado: EstadoLote;
  registrosPrevistos: number;
  cantidadRegistros?: number;
  reservaVigente: boolean;
  consumoConfirmado: number;
  causa?: string;
  referencia?: string;
  intentos: IntentoLote[];
  archivo?: ArchivoTemporal;
  enlaceCreado?: string;
  fechaExpiracion?: string;
  diasVigenciaEnlace?: number;
  versionPar04?: number;
  creado: string;
}

export interface ControlExcepcional {
  idControl: string;
  fecha: string;
  alcance: string;
  responsable: string;
  hallazgos: { tipo: HallazgoControl; evidencia: string }[];
  suspension?: string;
}

export interface Autorizacion {
  vigenciaDesde: string;
  vigenciaHasta: string;
  volumenAutorizado: number;
  renovacionesUsadas: number;
  historialVigencia: { desde: string; hasta: string; motivo: string; instante: string }[];
}

export interface EventoHistorial {
  instante: string;
  accion: string;
  actor: string;
  rol: string;
  detalle?: string;
  version: number;
}

export interface AsignacionExt {
  idAsignacion: string;
  idAsignador: string;
  idRevisor: string;
  nombreRevisor: string;
  instante: string;
  version: number;
  vigente: boolean;
  motivo?: string;
}

export interface SolicitudExcepcional {
  id: string;
  version: number;
  tipo: "Solicitud" | "Renovación";
  origenId?: string;
  institucion: string;
  coordinador: string;
  fuenteId: string;
  fuente: string;
  estado: EstadoExcepcional;
  versionParametros: number;
  supuestos: SupuestoDeclarado[];
  decreto?: { numero: string; fecha: string; vigenciaHasta: string };
  finalidad: string;
  campos: CampoSolicitado[];
  legitimacion: string;
  justificacionTecnica: string;
  temporalidadDias: number;
  volumenSolicitado: number;
  conservacion: string;
  estructuraBase: string;
  soportes: { tipo: string; archivo: string }[];
  criterio: FiltroExtraccion[];
  justificacionExtraccion: string;
  formato: "CSV" | "JSON" | "XML";
  tipoProgramacion: "Única" | "Periódica";
  zonaHoraria: string;
  primeraEjecucionLocal: string;
  primeraEjecucionUtc: string;
  desplazamientoUtc: string;
  regla?: { unidad: "dia" | "semana" | "mes"; intervalo: number };
  fechaFinalProgramacion?: string;
  firmante: string;
  hashFirmaSolicitud?: string;
  fechaCreacion: string;
  etapas: Etapa[];
  asignaciones: AsignacionExt[];
  observaciones?: { requisito: string; detalle: string }[];
  plazoRecomendadoDias?: number;
  motivoRechazo?: string;
  autorizacion?: Autorizacion;
  ocurrencias: Ocurrencia[];
  lotes: LoteExtraccion[];
  controles: ControlExcepcional[];
  historial: EventoHistorial[];
}

export interface EstadoStore {
  solicitudes: SolicitudExcepcional[];
  parametros: ParametrosExcepcional[];
  vigenciasEnlace: VigenciaEnlace[];
}

// ───────────────────────── Constantes y utilidades ─────────────────────────

export const MAX_REINTENTOS_LOTE = 3; // PAR-13
export const TAMANO_PARTE_BYTES = 64 * 1024 * 1024;

export const ZONAS_HORARIAS = [
  "America/Guayaquil",
  "Pacific/Galapagos",
  "America/Bogota",
  "America/New_York",
  "Europe/Madrid",
  "UTC",
];

export const SOPORTES_REQUERIDOS = [
  "Informe de cumplimiento de protocolos de seguridad (art. 9)",
  "Análisis de riesgo y evaluación de impacto (art. 10)",
  "Acta de trabajo entre consumidora y fuente",
  "Acuerdos de uso y confidencialidad de los servidores",
];

export const SOPORTES_RENOVACION = [
  "Avance por etapas de los procedimientos para interoperar por el SINARP",
  "Justificación técnica de por qué todavía no es posible o requiere más tiempo",
];

export const OPERADORES_FILTRO = ["=", "≠", ">", "<", "entre", "contiene"];

export const PARAMETROS_FUENTE = ["fecha_inscripcion", "provincia", "tipo_documento", "estado_civil", "anio_nacimiento", "cedula"];

export const FUENTES_PUBLICADAS = [
  { id: "FNT-RC-001", nombre: "Registro Civil · Datos de identidad", institucion: "Dirección General de Registro Civil" },
  { id: "FNT-SRI-002", nombre: "SRI · Contribuyentes y RUC", institucion: "Servicio de Rentas Internas" },
  { id: "FNT-MT-004", nombre: "Movilidad · Licencias de conducir", institucion: "Agencia Nacional de Tránsito" },
];

export function ahoraIso(): string {
  return new Date().toISOString();
}

export function sumarDias(iso: string, dias: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString();
}

/** Calendario PAR-10 simplificado: se omiten sábados y domingos (los feriados los publica PAR-10). */
export function sumarDiasHabiles(iso: string, dias: number): string {
  const d = new Date(iso);
  let restantes = dias;
  while (restantes > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) restantes -= 1;
  }
  return d.toISOString();
}

export function formatoFecha(iso?: string, conHora = true): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-EC", conHora ? { dateStyle: "short", timeStyle: "short" } : { dateStyle: "medium" });
}

export function numero(n: number): string {
  return n.toLocaleString("es-EC");
}

function aleatorio(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function hashSimulado(): string {
  return aleatorio(64);
}

function idOpaco(prefijo: string): string {
  return `${prefijo}-${aleatorio(8).toUpperCase()}`;
}

export function saldoAutorizacion(s: SolicitudExcepcional): { autorizado: number; consumido: number; reservado: number; saldo: number } {
  const autorizado = s.autorizacion?.volumenAutorizado ?? 0;
  const consumido = s.lotes.reduce((a, l) => a + l.consumoConfirmado, 0);
  const reservado = s.lotes.filter((l) => l.reservaVigente).reduce((a, l) => a + l.registrosPrevistos, 0);
  return { autorizado, consumido, reservado, saldo: autorizado - consumido - reservado };
}

export function estaVigente(s: SolicitudExcepcional, ahora = new Date()): boolean {
  return s.estado === "Autorizada" && !!s.autorizacion && new Date(s.autorizacion.vigenciaHasta) > ahora;
}

export function diasParaVencer(s: SolicitudExcepcional, ahora = new Date()): number | null {
  if (!s.autorizacion) return null;
  return Math.ceil((new Date(s.autorizacion.vigenciaHasta).getTime() - ahora.getTime()) / 86400000);
}

export function renovacionActiva(s: SolicitudExcepcional, todas: SolicitudExcepcional[]): SolicitudExcepcional | undefined {
  return todas.find((r) => r.origenId === s.id && !["Rechazada", "Archivada", "Vencida"].includes(r.estado) && !(r.estado === "Autorizada"));
}

export function ultimoParametrosPublicados(parametros: ParametrosExcepcional[]): ParametrosExcepcional | undefined {
  return [...parametros].reverse().find((p) => p.estado === "Publicada");
}

export function vigenciaEnlaceActiva(v: VigenciaEnlace[]): VigenciaEnlace | undefined {
  return [...v].reverse().find((x) => x.estado === "Publicada");
}

// ───────────────────────── Zona horaria (EXT-01 CA3 y CA6) ─────────────────────────

function desplazamientoMin(zona: string, utc: Date): number {
  const parte = new Intl.DateTimeFormat("en-US", { timeZone: zona, timeZoneName: "longOffset" })
    .formatToParts(utc)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = parte?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
}

export function formatoDesplazamiento(min: number): string {
  const signo = min < 0 ? "-" : "+";
  const abs = Math.abs(min);
  return `${signo}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

export interface ResolucionHora {
  estado: "ok" | "inexistente" | "ambigua" | "invalida";
  opciones: { desplazamiento: string; utc: string }[];
}

/** Convierte fecha y hora civil de una zona IANA a UTC; informa si la hora no existe o es ambigua por cambio horario. */
export function resolverHoraLocal(zona: string, fecha: string, hora: string): ResolucionHora {
  if (!ZONAS_HORARIAS.includes(zona) || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    return { estado: "invalida", opciones: [] };
  }
  const [y, mo, d] = fecha.split("-").map(Number);
  const [h, mi] = hora.split(":").map(Number);
  const comoUtc = Date.UTC(y, mo - 1, d, h, mi);
  const candidatos = new Map<number, string>();
  for (const off of [desplazamientoMin(zona, new Date(comoUtc - 86400000)), desplazamientoMin(zona, new Date(comoUtc)), desplazamientoMin(zona, new Date(comoUtc + 86400000))]) {
    const utc = new Date(comoUtc - off * 60000);
    if (desplazamientoMin(zona, utc) === off) candidatos.set(off, utc.toISOString());
  }
  const opciones = [...candidatos.entries()].map(([off, utc]) => ({ desplazamiento: formatoDesplazamiento(off), utc }));
  if (opciones.length === 0) return { estado: "inexistente", opciones: [] };
  if (opciones.length > 1) return { estado: "ambigua", opciones };
  return { estado: "ok", opciones };
}

/** EXT-01 CA6: la ocurrencia n suma n × intervalo en el calendario local (último día del mes si el ancla no existe). */
export function calcularOcurrencias(s: Pick<SolicitudExcepcional, "tipoProgramacion" | "zonaHoraria" | "primeraEjecucionLocal" | "primeraEjecucionUtc" | "desplazamientoUtc" | "regla" | "fechaFinalProgramacion">, cantidad = 6): Ocurrencia[] {
  const [fechaLocal, horaLocal] = s.primeraEjecucionLocal.split("T");
  const [y, mo, d] = fechaLocal.split("-").map(Number);
  const resultado: Ocurrencia[] = [];
  const total = s.tipoProgramacion === "Única" ? 1 : cantidad;
  for (let n = 0; n < total; n++) {
    let fecha: Date;
    if (n === 0) {
      fecha = new Date(Date.UTC(y, mo - 1, d));
    } else if (s.regla?.unidad === "dia") {
      fecha = new Date(Date.UTC(y, mo - 1, d + n * s.regla.intervalo));
    } else if (s.regla?.unidad === "semana") {
      fecha = new Date(Date.UTC(y, mo - 1, d + 7 * n * s.regla.intervalo));
    } else {
      const meses = mo - 1 + n * (s.regla?.intervalo ?? 1);
      const ultimo = new Date(Date.UTC(y, meses + 1, 0)).getUTCDate();
      fecha = new Date(Date.UTC(y, meses, Math.min(d, ultimo)));
    }
    const fechaStr = fecha.toISOString().slice(0, 10);
    if (s.fechaFinalProgramacion && fechaStr > s.fechaFinalProgramacion) break;
    if (n === 0) {
      resultado.push({ idOcurrencia: `OCU-${n}`, indice: 0, localResuelta: `${fechaStr} ${horaLocal}`, desplazamiento: s.desplazamientoUtc, utc: s.primeraEjecucionUtc });
      continue;
    }
    const r = resolverHoraLocal(s.zonaHoraria, fechaStr, horaLocal);
    const op = r.opciones[0];
    resultado.push({
      idOcurrencia: `OCU-${n}`,
      indice: n,
      localResuelta: `${fechaStr} ${horaLocal}`,
      desplazamiento: op?.desplazamiento ?? s.desplazamientoUtc,
      utc: op?.utc ?? fecha.toISOString(),
    });
  }
  return resultado;
}

// ───────────────────────── Semilla ─────────────────────────

const HOY = () => new Date();
const hace = (dias: number) => sumarDias(HOY().toISOString(), -dias);
const dentro = (dias: number) => sumarDias(HOY().toISOString(), dias);

export const PARAMETROS_INICIALES: ParametrosExcepcional = {
  version: 1,
  estado: "Publicada",
  supuestos: [
    { codigo: "ALTA_FRECUENCIA", nombre: "Alta frecuencia de actualización", bastaSolo: false },
    { codigo: "EFICIENCIA_TECNOLOGICA", nombre: "Eficiencia tecnológica demostrable", bastaSolo: false },
    { codigo: "ANALITICA", nombre: "Analítica de datos o estadística", bastaSolo: false },
    { codigo: "OBSOLESCENCIA", nombre: "Obsolescencia demostrada", bastaSolo: false },
    { codigo: "ESTADO_EXCEPCION", nombre: "Estado de excepción", bastaSolo: true },
  ],
  minSupuestos: 2,
  plazoCalificacionDias: 3,
  plazoCompletarDias: 5,
  plazoInformeTecnologicoDias: 4,
  plazoInformeDpiDias: 4,
  plazoInformeFinalDias: 3,
  vigenciaMaximaDias: 365,
  maxRenovaciones: 1,
  autor: "Director de Normatividad",
  aprobador: "Máxima Autoridad DINARP",
  fechaEfecto: hace(60),
};

function base(id: string, over: Partial<SolicitudExcepcional>): SolicitudExcepcional {
  const primeraUtc = dentro(7);
  const local = new Date(new Date(primeraUtc).getTime() - 5 * 3600000).toISOString().slice(0, 10) + "T02:00";
  const sol: SolicitudExcepcional = {
    id,
    version: 1,
    tipo: "Solicitud",
    institucion: "Dirección General de Registro Civil",
    coordinador: "Andrea López",
    fuenteId: "FNT-SRI-002",
    fuente: "SRI · Contribuyentes y RUC",
    estado: "En calificación",
    versionParametros: 1,
    supuestos: [
      { codigo: "ALTA_FRECUENCIA", justificacion: "La fuente se actualiza varias veces al día y la consulta uno a uno no alcanza." },
      { codigo: "ANALITICA", justificacion: "Se requiere procesar el universo completo para estadística de cobertura." },
    ],
    finalidad: "Cruce estadístico de cobertura de cédulas y RUC para el plan de depuración registral.",
    campos: [
      { campo: "ruc", descripcion: "Número de RUC del contribuyente", categoria: "Accesible" },
      { campo: "razon_social", descripcion: "Razón social o nombres", categoria: "Accesible" },
      { campo: "estado_contribuyente", descripcion: "Activo, suspendido o cancelado", categoria: "Accesible" },
    ],
    legitimacion: "Art. 7 numeral 5 de la LOPDP: ejercicio de competencias de la entidad pública sobre el registro de identidades.",
    justificacionTecnica: "La consulta uno a uno requeriría más de 40 millones de peticiones; el batch ordinario está acotado a 1.000 registros por petición.",
    temporalidadDias: 180,
    volumenSolicitado: 2_000_000,
    conservacion: "90 días tras la descarga; destrucción segura certificada.",
    estructuraBase: "Tabla única `contribuyentes` con 3 columnas y llave `ruc`.",
    soportes: SOPORTES_REQUERIDOS.map((tipo, i) => ({ tipo, archivo: `soporte_${i + 1}.pdf` })),
    criterio: [{ parametro: "provincia", operador: "=", valor: "Pichincha" }],
    justificacionExtraccion: "Limita el universo a la provincia del piloto.",
    formato: "CSV",
    tipoProgramacion: "Periódica",
    zonaHoraria: "America/Guayaquil",
    primeraEjecucionLocal: local,
    primeraEjecucionUtc: primeraUtc,
    desplazamientoUtc: "-05:00",
    regla: { unidad: "semana", intervalo: 1 },
    fechaFinalProgramacion: sumarDias(primeraUtc, 120).slice(0, 10),
    firmante: "Mgs. Patricio Salazar (Máxima Autoridad de la consumidora)",
    hashFirmaSolicitud: hashSimulado(),
    fechaCreacion: hace(10),
    etapas: [],
    asignaciones: [],
    ocurrencias: [],
    lotes: [],
    controles: [],
    historial: [{ instante: hace(10), accion: "Solicitud firmada y enviada", actor: "Andrea López", rol: "Coordinador SINARP", version: 1 }],
    ...over,
  };
  sol.ocurrencias = calcularOcurrencias(sol);
  return sol;
}

function etapa(clave: Etapa["clave"], ingresoHace: number, limiteDias: number, extra: Partial<Etapa> = {}): Etapa {
  const ingreso = hace(ingresoHace);
  return { clave, ingreso, fechaLimite: sumarDiasHabiles(ingreso, limiteDias), versionParametros: 1, ...extra };
}

function loteBase(id: string, indice: number, estado: EstadoLote, extra: Partial<LoteExtraccion> = {}): LoteExtraccion {
  return {
    id,
    idOcurrencia: `OCU-${indice}`,
    indice,
    programadoLocal: "",
    programadoUtc: hace(30 - indice * 7),
    estado,
    registrosPrevistos: 400_000,
    reservaVigente: false,
    consumoConfirmado: 0,
    intentos: [],
    creado: hace(30 - indice * 7),
    ...extra,
  };
}

function archivoSimulado(registros: number, formato: "CSV" | "JSON" | "XML" = "CSV", estado: ArchivoTemporal["estado"] = "Disponible"): ArchivoTemporal {
  const tamano = registros * 90;
  const partes = Math.max(1, Math.ceil(tamano / TAMANO_PARTE_BYTES));
  return {
    idArchivo: idOpaco("ARC"),
    formato,
    tamanoBytes: tamano,
    cantidadRegistros: registros,
    partes: Array.from({ length: partes }, (_, i) => ({
      numero: i + 1,
      tamanoBytes: i < partes - 1 ? TAMANO_PARTE_BYTES : tamano - TAMANO_PARTE_BYTES * (partes - 1),
      hashSha256: hashSimulado(),
      verificada: false,
    })),
    hashIndice: hashSimulado(),
    creado: hace(1),
    estado,
  };
}

export function crearSemilla(): EstadoStore {
  const autorizada = (desdeHace: number, dias: number, volumen: number, extra: Partial<Autorizacion> = {}): Autorizacion => {
    const desde = hace(desdeHace);
    return { vigenciaDesde: desde, vigenciaHasta: sumarDias(desde, dias), volumenAutorizado: volumen, renovacionesUsadas: 0, historialVigencia: [], ...extra };
  };

  const s1 = base("EXT-2026-001", {
    estado: "Autorizada",
    fechaCreacion: hace(50),
    etapas: [
      etapa("calificacion", 49, 3, { resultado: "Admitida", actor: "Ana Torres", instante: hace(47) }),
      etapa("tecnologico", 47, 4, { resultado: "Favorable", actor: "Ing. Carlos Mena", instante: hace(43), hashFirma: hashSimulado() }),
      etapa("dpi", 43, 4, { resultado: "Favorable", actor: "Daniela Ruiz", instante: hace(39), hashFirma: hashSimulado() }),
      etapa("final", 39, 3, { resultado: "Recomienda 180 días", actor: "Ana Torres", instante: hace(36) }),
      etapa("autorizacion", 36, 3, { resultado: "Autorizada", actor: "Dr. Roberto Méndez", instante: hace(30), hashFirma: hashSimulado() }),
    ],
    plazoRecomendadoDias: 180,
    autorizacion: autorizada(30, 180, 2_000_000),
    primeraEjecucionUtc: hace(23),
    primeraEjecucionLocal: new Date(new Date(hace(23)).getTime() - 5 * 3600000).toISOString().slice(0, 10) + "T02:00",
    historial: [
      { instante: hace(50), accion: "Solicitud firmada y enviada", actor: "Andrea López", rol: "Coordinador SINARP", version: 1 },
      { instante: hace(30), accion: "Autorización firmada", actor: "Dr. Roberto Méndez", rol: "Máxima Autoridad", detalle: "Volumen autorizado 2.000.000 registros por 180 días.", version: 1 },
    ],
  });
  s1.ocurrencias = calcularOcurrencias(s1);
  const aDescargado = archivoSimulado(380_000);
  s1.lotes = [
    loteBase("LOT-0001", 0, "Descargado", {
      cantidadRegistros: 380_000,
      consumoConfirmado: 380_000,
      archivo: { ...aDescargado, estado: "Eliminado", partes: aDescargado.partes.map((p) => ({ ...p, verificada: true })) },
      programadoLocal: s1.ocurrencias[0]?.localResuelta ?? "",
      programadoUtc: s1.ocurrencias[0]?.utc ?? hace(23),
    }),
    loteBase("LOT-0002", 1, "Sin datos", { cantidadRegistros: 0, programadoLocal: s1.ocurrencias[1]?.localResuelta ?? "", programadoUtc: s1.ocurrencias[1]?.utc ?? hace(16), causa: "La consulta no devolvió registros." }),
    loteBase("LOT-0003", 2, "Escalado a TI", {
      programadoLocal: s1.ocurrencias[2]?.localResuelta ?? "",
      programadoUtc: s1.ocurrencias[2]?.utc ?? hace(9),
      causa: "Tiempo de espera agotado al consultar el servicio de fuentes.",
      referencia: "TEC-4F2A19",
      intentos: Array.from({ length: MAX_REINTENTOS_LOTE }, (_, i) => ({
        idIntento: idOpaco("INT"),
        instante: hace(9 - i * 0.1),
        resultado: "Fallido" as const,
        manual: false,
        detalle: "Timeout 30 s en servicio-fuentes.",
      })),
    }),
    loteBase("LOT-0004", 3, "Completado", {
      programadoLocal: s1.ocurrencias[3]?.localResuelta ?? "",
      programadoUtc: s1.ocurrencias[3]?.utc ?? hace(2),
      cantidadRegistros: 410_000,
      reservaVigente: true,
      registrosPrevistos: 420_000,
      archivo: archivoSimulado(410_000),
      enlaceCreado: hace(0.5),
      fechaExpiracion: dentro(2.5),
      diasVigenciaEnlace: 3,
      versionPar04: 1,
    }),
  ];

  const s2 = base("EXT-2026-002", { estado: "En calificación", etapas: [etapa("calificacion", 1, 3)], fechaCreacion: hace(1) });
  s2.historial = [{ instante: hace(1), accion: "Solicitud firmada y enviada", actor: "Andrea López", rol: "Coordinador SINARP", version: 1 }];

  const s3 = base("EXT-2026-003", {
    estado: "En informe tecnológico",
    institucion: "Ministerio de Salud Pública",
    coordinador: "Dra. Lucía Benítez",
    fuenteId: "FNT-RC-001",
    fuente: "Registro Civil · Datos de identidad",
    asignaciones: [{ idAsignacion: idOpaco("ASG"), idAsignador: "Director Gestión", idRevisor: "1111111111", nombreRevisor: "Ana Torres", instante: hace(5), version: 1, vigente: true }],
    etapas: [etapa("calificacion", 6, 3, { resultado: "Admitida", actor: "Ana Torres", instante: hace(4) }), etapa("tecnologico", 4, 4)],
    fechaCreacion: hace(6),
  });
  const s4 = base("EXT-2026-004", {
    estado: "En informe DPI",
    institucion: "Ministerio de Salud Pública",
    coordinador: "Dra. Lucía Benítez",
    etapas: [
      etapa("calificacion", 12, 3, { resultado: "Admitida", actor: "Ana Torres", instante: hace(10) }),
      etapa("tecnologico", 10, 4, { resultado: "Favorable", actor: "Ing. Carlos Mena", instante: hace(7), hashFirma: hashSimulado() }),
      etapa("dpi", 7, 4),
    ],
    fechaCreacion: hace(12),
  });
  const s5 = base("EXT-2026-005", {
    estado: "En informe final",
    institucion: "Ministerio de Educación",
    coordinador: "Marco Villacís",
    etapas: [
      etapa("calificacion", 15, 3, { resultado: "Admitida", actor: "Ana Torres", instante: hace(13) }),
      etapa("tecnologico", 13, 4, { resultado: "Favorable", actor: "Ing. Carlos Mena", instante: hace(10), hashFirma: hashSimulado() }),
      etapa("dpi", 10, 4, { resultado: "Favorable", actor: "Daniela Ruiz", instante: hace(6), hashFirma: hashSimulado() }),
      etapa("final", 6, 3),
    ],
    fechaCreacion: hace(15),
  });
  const s6 = base("EXT-2026-006", {
    estado: "Pendiente de autorización",
    institucion: "Ministerio de Educación",
    coordinador: "Marco Villacís",
    plazoRecomendadoDias: 150,
    etapas: [
      etapa("calificacion", 20, 3, { resultado: "Admitida", actor: "Ana Torres", instante: hace(18) }),
      etapa("tecnologico", 18, 4, { resultado: "Favorable", actor: "Ing. Carlos Mena", instante: hace(14), hashFirma: hashSimulado() }),
      etapa("dpi", 14, 4, { resultado: "Favorable", actor: "Daniela Ruiz", instante: hace(10), hashFirma: hashSimulado() }),
      etapa("final", 10, 3, { resultado: "Recomienda 150 días", actor: "Ana Torres", instante: hace(8) }),
      etapa("autorizacion", 8, 3),
    ],
    fechaCreacion: hace(20),
  });
  const s7 = base("EXT-2026-007", {
    estado: "Autorizada",
    institucion: "Ministerio de Educación",
    coordinador: "Marco Villacís",
    fuenteId: "FNT-MT-004",
    fuente: "Movilidad · Licencias de conducir",
    tipoProgramacion: "Única",
    regla: undefined,
    fechaFinalProgramacion: undefined,
    plazoRecomendadoDias: 90,
    autorizacion: autorizada(80, 90, 500_000),
    etapas: [etapa("autorizacion", 85, 3, { resultado: "Autorizada", actor: "Dr. Roberto Méndez", instante: hace(80), hashFirma: hashSimulado() })],
    fechaCreacion: hace(95),
  });
  s7.ocurrencias = calcularOcurrencias(s7);
  s7.lotes = [
    loteBase("LOT-0001", 0, "Descargado", { cantidadRegistros: 180_000, consumoConfirmado: 180_000, archivo: { ...archivoSimulado(180_000), estado: "Eliminado" } }),
  ];
  const s8 = base("EXT-2026-008", {
    estado: "Suspendida",
    institucion: "Servicio de Rentas Internas",
    coordinador: "Ing. Paola Espín",
    fuenteId: "FNT-RC-001",
    fuente: "Registro Civil · Datos de identidad",
    autorizacion: autorizada(40, 180, 800_000),
    controles: [
      {
        idControl: idOpaco("CTL"),
        fecha: hace(5),
        alcance: "Revisión de uso de los datos entregados en los lotes 1 y 2.",
        responsable: "Lcda. Elena Paredes",
        hallazgos: [{ tipo: "Mal uso del dato", evidencia: "informe_control_001.pdf" }],
        suspension: "Los datos se compartieron con un tercero no declarado en la solicitud.",
      },
    ],
    historial: [{ instante: hace(5), accion: "Autorización suspendida", actor: "Lcda. Elena Paredes", rol: "Control y Evaluación", detalle: "Hallazgo: Mal uso del dato.", version: 1 }],
    fechaCreacion: hace(60),
  });
  s8.lotes = [loteBase("LOT-0001", 0, "Cancelado por autorización", { causa: "La autorización fue suspendida durante la extracción." })];
  const s9 = base("EXT-2026-009", {
    estado: "Observada",
    etapas: [etapa("calificacion", 3, 3, { resultado: "Observada", actor: "Ana Torres", instante: hace(2), observacion: "Falta el acta de trabajo firmada por la entidad fuente." })],
    observaciones: [{ requisito: "Acta de trabajo entre consumidora y fuente", detalle: "No se adjuntó el acta o no está firmada por la fuente." }],
    fechaCreacion: hace(3),
  });
  const s10 = base("EXT-2026-010", {
    estado: "Rechazada",
    institucion: "Ministerio de Salud Pública",
    coordinador: "Dra. Lucía Benítez",
    motivoRechazo: "Informe tecnológico desfavorable: la consulta por la vía general (art. 4) es técnicamente viable.",
    etapas: [
      etapa("calificacion", 25, 3, { resultado: "Admitida", actor: "Ana Torres", instante: hace(23) }),
      etapa("tecnologico", 23, 4, { resultado: "Desfavorable", actor: "Ing. Carlos Mena", instante: hace(19), hashFirma: hashSimulado(), observacion: "La consulta por la vía general (art. 4) es técnicamente viable." }),
    ],
    fechaCreacion: hace(25),
  });

  return {
    solicitudes: [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10],
    parametros: [PARAMETROS_INICIALES],
    vigenciasEnlace: [{ version: 1, estado: "Publicada", dias: 3, motivo: "Valor inicial", autor: "Administrador del Sistema", fecha: hace(60) }],
  };
}

// ───────────────────────── Persistencia ─────────────────────────

const STORAGE_KEY = "dinarp_excepcional_v1";
let memoria: EstadoStore | null = null;
const oyentes = new Set<() => void>();

function cargar(): EstadoStore {
  if (memoria) return memoria;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    memoria = raw ? (JSON.parse(raw) as EstadoStore) : crearSemilla();
  } catch {
    memoria = crearSemilla();
  }
  guardar(memoria);
  return memoria;
}

function guardar(estado: EstadoStore) {
  memoria = estado;
  try {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // Sin almacenamiento: el estado vive solo en memoria
  }
  oyentes.forEach((fn) => fn());
}

/** EXT-02 CA6: una autorización vencida deja de ser ejecutable; se refleja al leer, sin reescribir el historial. */
function conVencimientos(estado: EstadoStore): EstadoStore {
  const ahora = new Date();
  return {
    ...estado,
    solicitudes: estado.solicitudes.map((s) =>
      s.estado === "Autorizada" && s.autorizacion && new Date(s.autorizacion.vigenciaHasta) <= ahora ? { ...s, estado: "Vencida" as EstadoExcepcional } : s
    ),
  };
}

// ───────────────────────── Hook ─────────────────────────

type Actor = { nombre: string; rol: string };

function evento(s: SolicitudExcepcional, accion: string, actor: Actor, detalle?: string): EventoHistorial[] {
  return [...s.historial, { instante: ahoraIso(), accion, actor: actor.nombre, rol: actor.rol, detalle, version: s.version }];
}

export function useExcepcionalStore() {
  const [estado, setEstado] = useState<EstadoStore | null>(null);

  useEffect(() => {
    const sync = () => setEstado(memoria ? conVencimientos(memoria) : null);
    cargar();
    oyentes.add(sync);
    sync();
    return () => {
      oyentes.delete(sync);
    };
  }, []);

  const actualizar = useCallback((fn: (e: EstadoStore) => EstadoStore) => guardar(fn(cargar())), []);
  const actualizarSolicitud = useCallback(
    (id: string, fn: (s: SolicitudExcepcional, e: EstadoStore) => SolicitudExcepcional) =>
      actualizar((e) => ({ ...e, solicitudes: e.solicitudes.map((s) => (s.id === id ? fn(s, e) : s)) })),
    [actualizar]
  );

  // EXT-01: crear o corregir la solicitud ya firmada (FirmaEC simulado)
  const enviarSolicitud = useCallback(
    (datos: Omit<SolicitudExcepcional, "id" | "version" | "estado" | "etapas" | "asignaciones" | "ocurrencias" | "lotes" | "controles" | "historial" | "fechaCreacion" | "hashFirmaSolicitud" | "versionParametros">, actor: Actor, idExistente?: string): string => {
      const e = cargar();
      const params = ultimoParametrosPublicados(e.parametros);
      const ahora = ahoraIso();
      const existente = idExistente ? e.solicitudes.find((s) => s.id === idExistente) : undefined;
      const id = existente?.id ?? `EXT-2026-${String(e.solicitudes.length + 1).padStart(3, "0")}`;
      const version = existente ? existente.version + 1 : 1;
      const parcial = { ...datos } as SolicitudExcepcional;
      const nueva: SolicitudExcepcional = {
        ...parcial,
        id,
        version,
        estado: "En calificación",
        versionParametros: params?.version ?? 1,
        hashFirmaSolicitud: hashSimulado(),
        fechaCreacion: existente?.fechaCreacion ?? ahora,
        etapas: [{ clave: "calificacion", ingreso: ahora, fechaLimite: sumarDiasHabiles(ahora, params?.plazoCalificacionDias ?? 3), versionParametros: params?.version ?? 1 }],
        asignaciones: existente?.asignaciones.map((a) => ({ ...a, vigente: false })) ?? [],
        ocurrencias: calcularOcurrencias(parcial),
        lotes: [],
        controles: [],
        historial: [
          ...(existente?.historial ?? []),
          { instante: ahora, accion: existente ? `Versión ${version} firmada y reenviada` : datos.tipo === "Renovación" ? "Renovación firmada y enviada" : "Solicitud firmada y enviada", actor: actor.nombre, rol: actor.rol, detalle: "Firma verificada en FirmaEC; pasa a calificación.", version },
        ],
      };
      guardar({ ...e, solicitudes: existente ? e.solicitudes.map((s) => (s.id === id ? nueva : s)) : [...e.solicitudes, nueva] });
      return id;
    },
    []
  );

  // EXT-02 CA9: asignación del revisor por el Director de Gestión
  const asignarRevisor = useCallback(
    (id: string, revisor: { id: string; nombre: string }, actor: Actor, motivo?: string) =>
      actualizarSolicitud(id, (s) => ({
        ...s,
        asignaciones: [
          ...s.asignaciones.map((a) => (a.version === s.version ? { ...a, vigente: false } : a)),
          { idAsignacion: idOpaco("ASG"), idAsignador: actor.nombre, idRevisor: revisor.id, nombreRevisor: revisor.nombre, instante: ahoraIso(), version: s.version, vigente: true, motivo },
        ],
        historial: evento(s, s.asignaciones.some((a) => a.version === s.version) ? "Revisor reasignado" : "Revisor asignado", actor, `${revisor.nombre}${motivo ? ` · Motivo: ${motivo}` : ""}`),
      })),
    [actualizarSolicitud]
  );

  // EXT-02 CA1: calificación (art. 13)
  const calificar = useCallback(
    (id: string, resultado: "Admitida" | "Observada", observaciones: { requisito: string; detalle: string }[], actor: Actor) =>
      actualizarSolicitud(id, (s, e) => {
        const params = ultimoParametrosPublicados(e.parametros);
        const ahora = ahoraIso();
        const etapas = s.etapas.map((x) => (x.clave === "calificacion" && !x.resultado ? { ...x, resultado, actor: actor.nombre, instante: ahora, observacion: observaciones.map((o) => `${o.requisito}: ${o.detalle}`).join(" · ") || undefined } : x));
        if (resultado === "Observada") {
          const limite = sumarDiasHabiles(ahora, params?.plazoCompletarDias ?? 5);
          return { ...s, estado: "Observada", observaciones, etapas: [...etapas, { clave: "calificacion", ingreso: ahora, fechaLimite: limite, versionParametros: params?.version ?? 1 }], historial: evento(s, "Solicitud observada", actor, `La consumidora tiene hasta ${formatoFecha(limite, false)} para completar.`) };
        }
        return { ...s, estado: "En informe tecnológico", observaciones: undefined, etapas: [...etapas, { clave: "tecnologico", ingreso: ahora, fechaLimite: sumarDiasHabiles(ahora, params?.plazoInformeTecnologicoDias ?? 4), versionParametros: params?.version ?? 1 }], historial: evento(s, "Solicitud admitida", actor, "Pasa al informe tecnológico (art. 14).") };
      }),
    [actualizarSolicitud]
  );

  // EXT-02 CA1: no completó a tiempo → Archivada como no presentada
  const archivar = useCallback(
    (id: string, actor: Actor) => actualizarSolicitud(id, (s) => ({ ...s, estado: "Archivada", historial: evento(s, "Solicitud archivada como no presentada", actor, "Venció el plazo para completar los requisitos; puede presentarse de nuevo.") })),
    [actualizarSolicitud]
  );

  // EXT-02 CA2 y CA3: informes vinculantes firmados con FirmaEC
  const emitirInforme = useCallback(
    (id: string, clave: "tecnologico" | "dpi", resultado: "Favorable" | "Desfavorable", observacion: string, actor: Actor) =>
      actualizarSolicitud(id, (s, e) => {
        const params = ultimoParametrosPublicados(e.parametros);
        const ahora = ahoraIso();
        const etapas = s.etapas.map((x) => (x.clave === clave && !x.resultado ? { ...x, resultado, actor: actor.nombre, instante: ahora, observacion, hashFirma: hashSimulado() } : x));
        const nombre = clave === "tecnologico" ? "tecnológico" : "de protección de la información";
        if (resultado === "Desfavorable") {
          return { ...s, estado: "Rechazada", motivoRechazo: observacion, etapas, historial: evento(s, `Informe ${nombre} desfavorable`, actor, `Solicitud rechazada y notificada. ${observacion}`) };
        }
        if (clave === "tecnologico") {
          return { ...s, estado: "En informe DPI", etapas: [...etapas, { clave: "dpi", ingreso: ahora, fechaLimite: sumarDiasHabiles(ahora, params?.plazoInformeDpiDias ?? 4), versionParametros: params?.version ?? 1 }], historial: evento(s, "Informe tecnológico favorable", actor, "Pasa al informe de DPI (art. 15).") };
        }
        return { ...s, estado: "En informe final", etapas: [...etapas, { clave: "final", ingreso: ahora, fechaLimite: sumarDiasHabiles(ahora, params?.plazoInformeFinalDias ?? 3), versionParametros: params?.version ?? 1 }], historial: evento(s, "Informe de DPI favorable", actor, "Gestión elabora el informe final (art. 16).") };
      }),
    [actualizarSolicitud]
  );

  // EXT-02 CA4: informe final con plazo recomendado
  const elaborarInformeFinal = useCallback(
    (id: string, plazoRecomendadoDias: number, actor: Actor) =>
      actualizarSolicitud(id, (s, e) => {
        const params = ultimoParametrosPublicados(e.parametros);
        const ahora = ahoraIso();
        const etapas = s.etapas.map((x) => (x.clave === "final" && !x.resultado ? { ...x, resultado: `Recomienda ${plazoRecomendadoDias} días`, actor: actor.nombre, instante: ahora } : x));
        return {
          ...s,
          estado: "Pendiente de autorización",
          plazoRecomendadoDias,
          etapas: [...etapas, { clave: "autorizacion", ingreso: ahora, fechaLimite: sumarDiasHabiles(ahora, 3), versionParametros: params?.version ?? 1 }],
          historial: evento(s, "Informe final remitido a la Máxima Autoridad", actor, `Plazo recomendado: ${plazoRecomendadoDias} días.`),
        };
      }),
    [actualizarSolicitud]
  );

  // EXT-02 CA5 y EXT-07 CA3: resolución de la Máxima Autoridad
  const resolver = useCallback(
    (id: string, decision: { aprobar: boolean; volumenAutorizado?: number; motivo?: string }, actor: Actor) => {
      const e = cargar();
      const sol = e.solicitudes.find((x) => x.id === id);
      if (!sol) return;
      const ahora = ahoraIso();
      const etapas = sol.etapas.map((x) => (x.clave === "autorizacion" && !x.resultado ? { ...x, resultado: decision.aprobar ? "Autorizada" : "Rechazada", actor: actor.nombre, instante: ahora, observacion: decision.motivo, hashFirma: decision.aprobar ? hashSimulado() : undefined } : x));
      if (!decision.aprobar) {
        actualizarSolicitud(id, (s) => ({ ...s, estado: "Rechazada", motivoRechazo: decision.motivo, etapas, historial: evento(s, "Autorización rechazada", actor, decision.motivo) }));
        return;
      }
      const dias = sol.plazoRecomendadoDias ?? sol.temporalidadDias;
      if (sol.tipo === "Renovación" && sol.origenId) {
        const origen = e.solicitudes.find((x) => x.id === sol.origenId);
        if (origen?.autorizacion) {
          const nuevaHasta = sumarDias(origen.autorizacion.vigenciaHasta, dias);
          guardar({
            ...e,
            solicitudes: e.solicitudes.map((x) => {
              if (x.id === sol.origenId && x.autorizacion) {
                return {
                  ...x,
                  autorizacion: {
                    ...x.autorizacion,
                    vigenciaHasta: nuevaHasta,
                    renovacionesUsadas: x.autorizacion.renovacionesUsadas + 1,
                    historialVigencia: [...x.autorizacion.historialVigencia, { desde: x.autorizacion.vigenciaHasta, hasta: nuevaHasta, motivo: `Renovación ${sol.id}`, instante: ahora }],
                  },
                  historial: evento(x, "Autorización renovada", actor, `Nueva vigencia hasta ${formatoFecha(nuevaHasta, false)} (${sol.id}).`),
                };
              }
              if (x.id === id) return { ...x, estado: "Autorizada" as EstadoExcepcional, etapas, historial: evento(x, "Renovación firmada", actor, "Extiende la vigencia de la autorización original.") };
              return x;
            }),
          });
          return;
        }
      }
      actualizarSolicitud(id, (s) => ({
        ...s,
        estado: "Autorizada",
        etapas,
        autorizacion: { vigenciaDesde: ahora, vigenciaHasta: sumarDias(ahora, dias), volumenAutorizado: Math.min(decision.volumenAutorizado ?? s.volumenSolicitado, s.volumenSolicitado), renovacionesUsadas: 0, historialVigencia: [] },
        historial: evento(s, "Autorización firmada", actor, `Notificada a la consumidora y a la entidad fuente. Vigencia ${dias} días.`),
      }));
    },
    [actualizarSolicitud]
  );

  // EXT-03 CA1 a CA7: ejecución de un lote con reserva de cupo
  const ejecutarLote = useCallback(
    (id: string, escenario: EscenarioLote, actor: Actor): { ok: boolean; mensaje: string } => {
      const e = cargar();
      const s = e.solicitudes.find((x) => x.id === id);
      if (!s || !s.autorizacion) return { ok: false, mensaje: "La solicitud no tiene una autorización." };
      if (!estaVigente(s)) return { ok: false, mensaje: "La autorización no está vigente; no se crean lotes nuevos." };
      const siguiente = s.ocurrencias.find((o) => !s.lotes.some((l) => l.idOcurrencia === o.idOcurrencia));
      if (!siguiente) return { ok: false, mensaje: "No quedan ocurrencias por ejecutar dentro de la programación." };
      const { saldo } = saldoAutorizacion(s);
      const previstos = Math.min(400_000, Math.max(1, Math.floor(s.autorizacion.volumenAutorizado / 5)));
      if (saldo < previstos) return { ok: false, mensaje: `Sin saldo: quedan ${numero(saldo)} registros y el lote prevé ${numero(previstos)}. No se crea el lote.` };
      const ahora = ahoraIso();
      const base: LoteExtraccion = {
        id: `LOT-${String(s.lotes.length + 1).padStart(4, "0")}`,
        idOcurrencia: siguiente.idOcurrencia,
        indice: siguiente.indice,
        programadoLocal: siguiente.localResuelta,
        programadoUtc: siguiente.utc,
        estado: "Completado",
        registrosPrevistos: previstos,
        reservaVigente: true,
        consumoConfirmado: 0,
        intentos: [],
        creado: ahora,
      };
      let lote: LoteExtraccion = base;
      let mensaje = "";
      if (escenario === "sin_datos") {
        lote = { ...base, estado: "Sin datos", cantidadRegistros: 0, reservaVigente: false, causa: "La consulta no devolvió registros." };
        mensaje = "Lote sin datos: consumo cero, sin enlace ni reserva.";
      } else if (escenario === "fallido") {
        lote = { ...base, estado: "Fallido", reservaVigente: true, causa: "Error al generar las partes en el almacenamiento.", referencia: `TEC-${aleatorio(6).toUpperCase()}`, intentos: [{ idIntento: idOpaco("INT"), instante: ahora, resultado: "Fallido", manual: false, detalle: "Error de almacenamiento al escribir la parte 2." }] };
        mensaje = "El lote falló: no hay enlace ni consumo. Se abre la recuperación (EXT-04).";
      } else if (escenario === "supera_cupo") {
        const obtenidos = saldo + 50_000;
        lote = { ...base, estado: "Cancelado por cupo", cantidadRegistros: obtenidos, reservaVigente: false, causa: `Se obtuvieron ${numero(obtenidos)} registros y el saldo reservado era ${numero(previstos)}.` };
        mensaje = "Los datos superan el saldo: lote cancelado por cupo, partes borradas y reserva liberada.";
      } else {
        const registros = Math.round(previstos * 0.93);
        const vigencia = vigenciaEnlaceActiva(e.vigenciasEnlace);
        lote = {
          ...base,
          cantidadRegistros: registros,
          archivo: archivoSimulado(registros, s.formato),
          enlaceCreado: ahora,
          diasVigenciaEnlace: vigencia?.dias ?? 3,
          versionPar04: vigencia?.version,
          fechaExpiracion: sumarDias(ahora, vigencia?.dias ?? 3),
        };
        mensaje = vigencia ? "Lote completado: el archivo está listo para descargar por partes." : "Lote completado, pero sin vigencia PAR-04 publicada no se genera enlace.";
        if (!vigencia) lote = { ...lote, enlaceCreado: undefined, fechaExpiracion: undefined };
      }
      guardar({
        ...e,
        solicitudes: e.solicitudes.map((x) =>
          x.id === id ? { ...x, lotes: [...x.lotes, lote], historial: evento(x, `Lote ${lote.id}: ${lote.estado}`, actor, mensaje) } : x
        ),
      });
      return { ok: true, mensaje };
    },
    []
  );

  // EXT-04: reintento automático o manual de TI
  const reintentarLote = useCallback(
    (id: string, loteId: string, resultado: "completado" | "fallido", manual: boolean, actor: Actor): string => {
      let mensaje = "";
      actualizarSolicitud(id, (s, e) => {
        const ahora = ahoraIso();
        const lotes = s.lotes.map((l): LoteExtraccion => {
          if (l.id !== loteId) return l;
          if (!manual && l.intentos.filter((i) => !i.manual).length >= MAX_REINTENTOS_LOTE) return l;
          const intento: IntentoLote = { idIntento: idOpaco("INT"), instante: ahora, resultado: resultado === "completado" ? "Completado" : "Fallido", manual, detalle: resultado === "completado" ? "Reintento exitoso con los mismos campos y criterio." : "El reintento volvió a fallar." };
          if (resultado === "completado") {
            const registros = Math.round(l.registrosPrevistos * 0.9);
            const vigencia = vigenciaEnlaceActiva(e.vigenciasEnlace);
            mensaje = "Reintento exitoso: el lote queda Completado.";
            return { ...l, estado: "Completado", cantidadRegistros: registros, causa: undefined, referencia: undefined, reservaVigente: true, archivo: archivoSimulado(registros, s.formato), enlaceCreado: ahora, diasVigenciaEnlace: vigencia?.dias ?? 3, versionPar04: vigencia?.version, fechaExpiracion: sumarDias(ahora, vigencia?.dias ?? 3), intentos: [...l.intentos, intento] };
          }
          const intentos = [...l.intentos, intento];
          const automaticos = intentos.filter((i) => !i.manual).length;
          const escalar = !manual && automaticos >= MAX_REINTENTOS_LOTE;
          mensaje = escalar ? "Se agotaron los reintentos automáticos: el lote se escala a TI." : "El reintento falló.";
          return { ...l, intentos, estado: escalar ? "Escalado a TI" : manual ? "Escalado a TI" : "Fallido", reservaVigente: true };
        });
        return { ...s, lotes, historial: evento(s, `Reintento del lote ${loteId}${manual ? " (manual de TI)" : ""}`, actor, mensaje) };
      });
      return mensaje;
    },
    [actualizarSolicitud]
  );

  // EXT-05: descarga por partes con verificación SHA-256
  const descargarParte = useCallback(
    (id: string, loteId: string, numeroParte: number, interrumpir: boolean, actor: Actor): string => {
      let mensaje = "";
      actualizarSolicitud(id, (s) => {
        const lotes = s.lotes.map((l): LoteExtraccion => {
          if (l.id !== loteId || !l.archivo || l.estado !== "Completado") return l;
          if (l.fechaExpiracion && new Date(l.fechaExpiracion) <= new Date()) {
            mensaje = "El plazo de descarga venció.";
            return l;
          }
          if (interrumpir) {
            mensaje = `Parte ${numeroParte} interrumpida: no cuenta como entrega ni como consumo. Puedes reanudarla.`;
            return l;
          }
          const partes = l.archivo.partes.map((p) => (p.numero === numeroParte ? { ...p, verificada: true } : p));
          mensaje = `Parte ${numeroParte} descargada y verificada con SHA-256.`;
          if (partes.every((p) => p.verificada)) {
            mensaje = "Descarga íntegra verificada: el consumo se confirma y las partes se eliminan.";
            return { ...l, estado: "Descargado", reservaVigente: false, consumoConfirmado: l.cantidadRegistros ?? 0, archivo: { ...l.archivo, partes, estado: "Eliminado" } };
          }
          return { ...l, archivo: { ...l.archivo, partes } };
        });
        return { ...s, lotes, historial: mensaje.startsWith("Descarga íntegra") ? evento(s, `Lote ${loteId} descargado`, actor, mensaje) : s.historial };
      });
      return mensaje;
    },
    [actualizarSolicitud]
  );

  // EXT-05 CA3 y EXT-06 CA3: fallos al confirmar o borrar
  const simularFalloCierre = useCallback(
    (id: string, loteId: string, tipo: "conciliacion" | "eliminacion", actor: Actor) =>
      actualizarSolicitud(id, (s) => ({
        ...s,
        lotes: s.lotes.map((l) => (l.id === loteId && l.archivo ? { ...l, estado: tipo === "conciliacion" ? "Descarga en conciliación" : "Eliminación pendiente", archivo: { ...l.archivo, estado: tipo === "conciliacion" ? "Descarga en conciliación" : "Eliminación pendiente" } } : l)),
        historial: evento(s, tipo === "conciliacion" ? "Descarga en conciliación" : "Eliminación pendiente", actor, "Acceso bloqueado hasta que TI reintente la conciliación; sin consumo duplicado."),
      })),
    [actualizarSolicitud]
  );

  const conciliarLote = useCallback(
    (id: string, loteId: string, actor: Actor) =>
      actualizarSolicitud(id, (s) => ({
        ...s,
        lotes: s.lotes.map((l) => {
          if (l.id !== loteId || !l.archivo) return l;
          if (l.estado === "Descarga en conciliación") return { ...l, estado: "Descargado", reservaVigente: false, consumoConfirmado: l.cantidadRegistros ?? 0, archivo: { ...l.archivo, estado: "Eliminado" } };
          return { ...l, estado: "Vencido", reservaVigente: false, archivo: { ...l.archivo, estado: "Eliminado" } };
        }),
        historial: evento(s, `Conciliación del lote ${loteId}`, actor, "Acuse confirmado y archivo eliminado de forma idempotente."),
      })),
    [actualizarSolicitud]
  );

  // EXT-06: enlace vencido sin descarga
  const vencerEnlace = useCallback(
    (id: string, loteId: string, actor: Actor) =>
      actualizarSolicitud(id, (s) => ({
        ...s,
        lotes: s.lotes.map((l) => (l.id === loteId && l.archivo && l.estado === "Completado" ? { ...l, estado: "Vencido", reservaVigente: false, consumoConfirmado: 0, archivo: { ...l.archivo, estado: "Eliminado" }, fechaExpiracion: ahoraIso() } : l)),
        historial: evento(s, `Lote ${loteId} vencido sin descarga`, actor, "Enlace invalidado, reserva liberada y archivo eliminado; consumo cero."),
      })),
    [actualizarSolicitud]
  );

  // EXT-07: renovar
  const crearRenovacion = useCallback(
    (origenId: string, datos: { justificacionTecnica: string; soportes: { tipo: string; archivo: string }[]; firmante: string }, actor: Actor): string | null => {
      const e = cargar();
      const origen = e.solicitudes.find((x) => x.id === origenId);
      const params = ultimoParametrosPublicados(e.parametros);
      if (!origen || !origen.autorizacion || !estaVigente(origen) || origen.autorizacion.renovacionesUsadas >= (params?.maxRenovaciones ?? 1) || renovacionActiva(origen, e.solicitudes)) return null;
      const id = `EXT-2026-${String(e.solicitudes.length + 1).padStart(3, "0")}`;
      const ahora = ahoraIso();
      const dias = Math.ceil((new Date(origen.autorizacion.vigenciaHasta).getTime() - new Date(origen.autorizacion.vigenciaDesde).getTime()) / 86400000);
      guardar({
        ...e,
        solicitudes: [
          ...e.solicitudes,
          {
            ...origen,
            id,
            version: 1,
            tipo: "Renovación",
            origenId,
            estado: "En calificación",
            justificacionTecnica: datos.justificacionTecnica,
            soportes: datos.soportes,
            temporalidadDias: dias,
            firmante: datos.firmante,
            hashFirmaSolicitud: hashSimulado(),
            versionParametros: params?.version ?? 1,
            fechaCreacion: ahora,
            etapas: [{ clave: "calificacion", ingreso: ahora, fechaLimite: sumarDiasHabiles(ahora, params?.plazoCalificacionDias ?? 3), versionParametros: params?.version ?? 1 }],
            asignaciones: [],
            observaciones: undefined,
            plazoRecomendadoDias: undefined,
            motivoRechazo: undefined,
            autorizacion: undefined,
            lotes: [],
            controles: [],
            historial: [{ instante: ahora, accion: "Renovación firmada y enviada", actor: actor.nombre, rol: actor.rol, detalle: `Renueva ${origenId} por igual tiempo (${dias} días).`, version: 1 }],
          },
        ],
      });
      return id;
    },
    []
  );

  // EXT-08: control y suspensión
  const registrarControl = useCallback(
    (id: string, control: Omit<ControlExcepcional, "idControl" | "fecha">, actor: Actor): boolean => {
      let ok = false;
      actualizarSolicitud(id, (s) => {
        const ahora = ahoraIso();
        const suspende = !!control.suspension && control.hallazgos.length > 0 && s.estado === "Autorizada";
        ok = true;
        return {
          ...s,
          estado: suspende ? "Suspendida" : s.estado,
          lotes: suspende ? s.lotes.map((l) => (["Programado", "En ejecución"].includes(l.estado) ? { ...l, estado: "Cancelado por autorización" as EstadoLote, reservaVigente: false } : l.estado === "Completado" ? { ...l, estado: "Cancelado por autorización" as EstadoLote, reservaVigente: false, archivo: l.archivo ? { ...l.archivo, estado: "Eliminado" as const } : undefined } : l)) : s.lotes,
          controles: [...s.controles, { ...control, idControl: idOpaco("CTL"), fecha: ahora }],
          historial: evento(s, suspende ? "Autorización suspendida" : "Control registrado", actor, suspende ? `Hallazgos: ${control.hallazgos.map((h) => h.tipo).join(", ")}. Se bloquean ejecuciones y enlaces; se notificó a la consumidora y a la fuente.` : `Alcance: ${control.alcance}`),
        };
      });
      return ok;
    },
    [actualizarSolicitud]
  );

  // PAR-17 y PAR-04
  const publicarParametros = useCallback(
    (datos: Omit<ParametrosExcepcional, "version" | "estado" | "autor" | "aprobador" | "fechaEfecto">, actor: Actor) =>
      actualizar((e) => {
        const version = e.parametros.length + 1;
        return {
          ...e,
          parametros: [
            ...e.parametros.map((p) => (p.estado === "Publicada" ? { ...p, estado: "Retirada" as const } : p)),
            { ...datos, version, estado: "Publicada", autor: actor.nombre, aprobador: "Máxima Autoridad DINARP", fechaEfecto: ahoraIso() },
          ],
        };
      }),
    [actualizar]
  );

  const publicarVigenciaEnlace = useCallback(
    (dias: number, motivo: string, actor: Actor) =>
      actualizar((e) => ({
        ...e,
        vigenciasEnlace: [
          ...e.vigenciasEnlace.map((v) => (v.estado === "Publicada" ? { ...v, estado: "Retirada" as const } : v)),
          { version: e.vigenciasEnlace.length + 1, estado: "Publicada", dias, motivo, autor: actor.nombre, fecha: ahoraIso() },
        ],
      })),
    [actualizar]
  );

  const reiniciar = useCallback(() => guardar(crearSemilla()), []);

  return {
    listo: estado !== null,
    solicitudes: estado?.solicitudes ?? [],
    parametros: estado?.parametros ?? [],
    vigenciasEnlace: estado?.vigenciasEnlace ?? [],
    enviarSolicitud,
    asignarRevisor,
    calificar,
    archivar,
    emitirInforme,
    elaborarInformeFinal,
    resolver,
    ejecutarLote,
    reintentarLote,
    descargarParte,
    simularFalloCierre,
    conciliarLote,
    vencerEnlace,
    crearRenovacion,
    registrarControl,
    publicarParametros,
    publicarVigenciaEnlace,
    reiniciar,
  };
}
