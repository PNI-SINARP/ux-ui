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
  cupoAdicional: number;
  estado: EstadoAmpliacion;
  version: number;
  decisionGestion?: "Aprobada" | "Observada";
  decisionDpi?: "Aprobada" | "Observada";
  informeDpiFirmas: number;
  firmasAdenda: number;
  pagoConfirmado: boolean;
  correccion?: { area: string; motivo: string };
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

export interface EstadoConsumo {
  accesos: AccesoApi[];
  eventos: EventoConsumo[];
  programaciones: ProgramacionMasiva[];
  ampliaciones: Ampliacion[];
  parametros: ParametrosMasivo[];
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

export const aleatorio = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
export const idOpaco = (p: string) => `${p}-${aleatorio(8).toUpperCase()}`;
export const ahoraIso = () => new Date().toISOString();
export const numero = (n: number) => n.toLocaleString("es-EC");
export function formatoFecha(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
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

export function saldoAcceso(a: AccesoApi, eventos: EventoConsumo[]) {
  const mios = eventos.filter((e) => e.accesoId === a.id && e.entorno === "Producción");
  const consumido = mios.filter((e) => e.estado === "Confirmado").reduce((s, e) => s + e.entregada, 0);
  const reservado = mios.filter((e) => e.estado === "Pendiente de conciliación").reduce((s, e) => s + e.reservada, 0);
  return { consumido, reservado, saldo: a.cupoAutorizado - consumido - reservado };
}

export function parametrosVigentes(p: ParametrosMasivo[]) {
  return [...p].reverse().find((x) => x.estado === "Publicada");
}

function semilla(): EstadoConsumo {
  const hace = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
  const accesos: AccesoApi[] = [
    {
      id: "ACC-API-001",
      institucion: "Dirección General de Registro Civil",
      proyecto: "PRJ-2026-001 · Depuración registral",
      fuente: "Registro Civil · Datos de identidad",
      tipo: "Privada",
      camposAutorizados: ["cedula", "nombres", "apellidos", "fecha_nacimiento"],
      catalogoCampos: CATALOGO_RC,
      cupoAutorizado: 500_000,
      credencial: "cred-rc-••••a41f",
      token: "tok-demo-privada",
      tipoDatoPruebas: "Sintético",
      estado: "Activa",
      versionAlcance: 1,
    },
    {
      id: "ACC-API-002",
      institucion: "Dirección General de Registro Civil",
      proyecto: "PRJ-2026-004 · Cruce con contribuyentes",
      fuente: "SRI · Contribuyentes y RUC",
      tipo: "Pública",
      camposAutorizados: ["ruc", "razon_social"],
      catalogoCampos: CATALOGO_SRI,
      cupoAutorizado: 200_000,
      credencial: "cred-sri-••••77d2",
      token: "tok-demo-publica",
      tipoDatoPruebas: "Real",
      estado: "Activa",
      versionAlcance: 1,
    },
  ];
  const ev = (n: number, acc: string, entregada: number, h: number, identificador?: string): EventoConsumo => ({
    idEvento: idOpaco("EVT"),
    idOperacion: idOpaco("OP"),
    idSegmento: idOpaco("SEG"),
    accesoId: acc,
    entorno: "Producción",
    origen: "API-03",
    resultado: "Entregado",
    identificador,
    reservada: entregada,
    entregada,
    estado: "Confirmado",
    instante: hace(h + n),
  });
  return {
    accesos,
    eventos: [ev(1, "ACC-API-001", 120_000, 30, "1712345678"), ev(2, "ACC-API-001", 345_000, 10, "1718956234"), ev(3, "ACC-API-002", 90_000, 20, "1715489621")],
    programaciones: [],
    ampliaciones: [],
    parametros: [{ version: 1, estado: "Publicada", tasaMaxima: 50, hilosEstandar: 10, maxHilosPorConsumidor: 150, franjaInicio: "20:00", franjaFin: "06:00", incluyeFinesDeSemana: true, anticipacionMinimaHoras: 48, duracionMaximaHoras: 8, autor: "Director de Tecnología y Desarrollo", fecha: hace(24 * 20) }],
  };
}

const KEY = "dinarp_consumo_api_v1";
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
const traza = (accion: string, actor: Actor, detalle?: string) => ({ instante: ahoraIso(), accion, actor: actor.nombre, detalle });

export interface ResultadoConsulta {
  ok: boolean;
  codigo?: string;
  mensaje: string;
  registros: number;
  parcial?: "Parcial por cupo" | "Parcial por fallo";
  cursor?: string;
  segmentos?: number;
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

  const actualizar = useCallback((fn: (e: EstadoConsumo) => EstadoConsumo) => guardar(fn(cargar())), []);

  // API-01: prueba con credencial en el ambiente de Pruebas
  const probar = useCallback((accesoId: string, token: string, campo: string): ResultadoConsulta => {
    const e = cargar();
    const a = e.accesos.find((x) => x.id === accesoId)!;
    const base = { idEvento: idOpaco("EVT"), idOperacion: idOpaco("OP"), idSegmento: "—", accesoId, entorno: "Pruebas" as const, origen: "API-01" as const, reservada: 0, entregada: 0, estado: "Liberado" as const, instante: ahoraIso() };
    let res: ResultadoConsulta;
    let resultado = "Exitosa";
    if (token !== a.token) {
      resultado = "Fallida";
      res = { ok: false, codigo: `REF-${aleatorio(6).toUpperCase()}`, mensaje: token === "tok-vencido" ? "El token venció. Solicita uno nuevo." : "No se pudo autenticar el token. Revisa la credencial.", registros: 0 };
    } else if (!a.camposAutorizados.includes(campo)) {
      resultado = "Fallida";
      res = { ok: false, codigo: `REF-${aleatorio(6).toUpperCase()}`, mensaje: "Parámetro no autorizado para esta solicitud.", registros: 0 };
    } else if (a.tipoDatoPruebas === "Real") {
      resultado = "Bloqueada";
      res = { ok: false, codigo: "DATOS_REALES_NO_PERMITIDOS_EN_PRUEBAS", mensaje: "No se permiten datos reales en el ambiente de Pruebas", registros: 0 };
    } else if (a.tipoDatoPruebas === "Indeterminado") {
      resultado = "Bloqueada";
      res = { ok: false, codigo: "CLASIFICACION_PRUEBAS_PENDIENTE", mensaje: "Tipo de datos de prueba pendiente de clasificación", registros: 0 };
    } else {
      res = { ok: true, mensaje: `Respuesta de prueba (${a.tipoDatoPruebas.toLowerCase()}) con los campos autorizados.`, registros: 3 };
    }
    guardar({ ...e, eventos: [...e.eventos, { ...base, resultado }] });
    return res;
  }, []);

  // API-02 y API-04: un consumo individual con reserva y confirmación
  const consultar = useCallback(
    (accesoId: string, opciones: { campo: string; devuelve: number; escenario: "ok" | "fallo" | "incierto"; identificador?: string }): ResultadoConsulta => {
      const e = cargar();
      const a = e.accesos.find((x) => x.id === accesoId)!;
      if (a.estado !== "Activa" || !a.camposAutorizados.includes(opciones.campo)) {
        return { ok: false, codigo: "FUERA_DE_ALCANCE", mensaje: "La solicitud no autoriza este acceso", registros: 0 };
      }
      const { saldo } = saldoAcceso(a, e.eventos);
      if (a.tipo === "Privada" && saldo <= 0) return { ok: false, codigo: "CUPO_AGOTADO", mensaje: "Cupo agotado. Genera una renovación (ADD-03).", registros: 0 };
      const reservada = a.tipo === "Privada" ? Math.min(opciones.devuelve, saldo) : opciones.devuelve;
      const entregada = opciones.escenario === "fallo" ? 0 : reservada;
      const estadoEvento: EstadoEvento = opciones.escenario === "incierto" ? "Pendiente de conciliación" : opciones.escenario === "fallo" ? "Liberado" : "Confirmado";
      const parcial = a.tipo === "Privada" && opciones.devuelve > saldo && opciones.escenario === "ok";
      guardar({
        ...e,
        eventos: [...e.eventos, { idEvento: idOpaco("EVT"), idOperacion: idOpaco("OP"), idSegmento: idOpaco("SEG"), accesoId, entorno: "Producción", origen: "API-02", identificador: opciones.identificador, resultado: opciones.escenario === "fallo" ? "Fallo antes de entregar" : parcial ? "Parcial por cupo" : "Entregado", reservada, entregada: estadoEvento === "Pendiente de conciliación" ? 0 : entregada, estado: estadoEvento, instante: ahoraIso() }],
      });
      if (opciones.escenario === "fallo") return { ok: false, mensaje: "Fallo antes de entregar: consumo cero, la reserva se liberó.", registros: 0 };
      if (opciones.escenario === "incierto") return { ok: false, mensaje: `La entrega quedó incierta: ${numero(reservada)} registros reservados Pendientes de conciliación; se bloquea la reentrega.`, registros: 0 };
      return { ok: true, mensaje: parcial ? `Entrega parcial: el saldo era ${numero(saldo)}.` : `Entregados ${numero(entregada)} registros.`, registros: entregada, parcial: parcial ? "Parcial por cupo" : undefined };
    },
    []
  );

  // API-03 y API-04: consumo masivo por segmentos secuenciales
  const consultarMasivo = useCallback((accesoId: string, solicitados: number, fallaEnSegmento: number | null): ResultadoConsulta => {
    const e = cargar();
    const a = e.accesos.find((x) => x.id === accesoId)!;
    if (a.estado !== "Activa") return { ok: false, codigo: "FUERA_DE_ALCANCE", mensaje: "La solicitud no autoriza este acceso", registros: 0 };
    const idOperacion = idOpaco("OP");
    let entregadoTotal = 0;
    let saldo = saldoAcceso(a, e.eventos).saldo;
    const nuevos: EventoConsumo[] = [];
    let parcial: ResultadoConsulta["parcial"];
    let cursor: string | undefined;
    let n = 0;
    while (entregadoTotal < solicitados && n < 200) {
      const pendientes = solicitados - entregadoTotal;
      const reservada = Math.min(pendientes, MAX_REGISTROS_POR_SEGMENTO, a.tipo === "Privada" ? saldo : Infinity);
      if (reservada <= 0) {
        parcial = "Parcial por cupo";
        break;
      }
      n += 1;
      const falla = fallaEnSegmento === n;
      const entregada = falla ? Math.floor(reservada / 2) : reservada;
      cursor = `CUR-${aleatorio(10).toUpperCase()}`;
      nuevos.push({ idEvento: idOpaco("EVT"), idOperacion, idSegmento: `${idOperacion}-S${n}`, accesoId, entorno: "Producción", origen: "API-03", resultado: falla ? "Parcial por fallo" : "Entregado", reservada, entregada, estado: "Confirmado", cursor, instante: ahoraIso() });
      entregadoTotal += entregada;
      saldo -= entregada;
      if (falla) {
        parcial = "Parcial por fallo";
        break;
      }
    }
    guardar({ ...e, eventos: [...e.eventos, ...nuevos] });
    return {
      ok: entregadoTotal > 0,
      mensaje: parcial === "Parcial por cupo" ? `Parcial por cupo: se entregaron ${numero(entregadoTotal)} de ${numero(solicitados)}; no se promete el resto.` : parcial === "Parcial por fallo" ? `Parcial por fallo: se confirmaron ${numero(entregadoTotal)} registros; puedes reintentar los faltantes con el cursor sin duplicar.` : `Entregados ${numero(entregadoTotal)} registros en ${n} segmento(s).`,
      registros: entregadoTotal,
      parcial,
      cursor: parcial ? cursor : undefined,
      segmentos: n,
    };
  }, []);

  const conciliarEvento = useCallback(
    (idEvento: string, entregar: boolean) =>
      actualizar((e) => ({ ...e, eventos: e.eventos.map((x) => (x.idEvento === idEvento ? { ...x, estado: entregar ? "Confirmado" : "Liberado", entregada: entregar ? x.reservada : 0, resultado: entregar ? "Entregado (conciliado)" : "Liberado tras conciliar" } : x)) })),
    [actualizar]
  );

  // API-06
  const crearProgramacion = useCallback(
    (datos: Omit<ProgramacionMasiva, "id" | "estado" | "versionPar18" | "historial">, actor: Actor): string => {
      const e = cargar();
      const id = `PRG-${String(e.programaciones.length + 1).padStart(3, "0")}`;
      const par = parametrosVigentes(e.parametros);
      guardar({ ...e, programaciones: [...e.programaciones, { ...datos, id, estado: "Enviada", versionPar18: par?.version ?? 1, historial: [traza("Programación enviada", actor)] }] });
      return id;
    },
    []
  );

  const mutarProgramacion = useCallback(
    (id: string, estado: EstadoProgramacion, actor: Actor, accion: string, extra: Partial<ProgramacionMasiva> = {}, detalle?: string) =>
      actualizar((e) => ({ ...e, programaciones: e.programaciones.map((p) => (p.id === id ? { ...p, ...extra, estado, historial: [...p.historial, traza(accion, actor, detalle)] } : p)) })),
    [actualizar]
  );

  // ADD-01 a ADD-07
  const crearAmpliacion = useCallback(
    (accesoId: string, campos: string[], cupoAdicional: number, actor: Actor): { ok: boolean; mensaje: string; id?: string } => {
      const e = cargar();
      const a = e.accesos.find((x) => x.id === accesoId)!;
      const abiertas = e.ampliaciones.filter((x) => x.accesoId === accesoId && !["Aplicada", "Cerrada"].includes(x.estado));
      if (cupoAdicional > 0 && abiertas.some((x) => x.cupoAdicional > 0)) return { ok: false, mensaje: "Ya existe una ampliación de cupo abierta para esta solicitud." };
      if (campos.length === 0 && cupoAdicional <= 0) return { ok: false, mensaje: "Elige al menos un campo o un cupo adicional." };
      const tipo: TipoAmpliacion = campos.length && cupoAdicional > 0 ? "mixta" : campos.length ? "campos" : "cupo";
      const id = `AMP-${String(e.ampliaciones.length + 1).padStart(3, "0")}`;
      const inicial: EstadoAmpliacion = tipo === "cupo" ? "Pendiente de firmas" : "En revisión de Gestión";
      guardar({ ...e, ampliaciones: [...e.ampliaciones, { id, accesoId, tipo, campos, cupoAdicional, estado: inicial, version: 1, informeDpiFirmas: 0, firmasAdenda: 0, pagoConfirmado: false, historial: [traza("Ampliación enviada", actor, tipo === "cupo" ? "Pasa a Jurídica sin revisión de campos." : "Pasa a revisión de Gestión (ADD-07).")] }] });
      void a;
      return { ok: true, mensaje: `Ampliación ${id} enviada.`, id };
    },
    []
  );

  const mutarAmpliacion = useCallback(
    (id: string, fn: (a: Ampliacion, acceso: AccesoApi) => Ampliacion, actor: Actor, accion: string, detalle?: string) =>
      actualizar((e) => ({
        ...e,
        ampliaciones: e.ampliaciones.map((x) => (x.id === id ? { ...fn(x, e.accesos.find((a) => a.id === x.accesoId)!), historial: [...x.historial, traza(accion, actor, detalle)] } : x)),
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
          accesos: e.accesos.map((a) => (a.id === amp.accesoId ? { ...a, camposAutorizados: [...new Set([...a.camposAutorizados, ...amp.campos])], cupoAutorizado: a.cupoAutorizado + (a.tipo === "Privada" ? amp.cupoAdicional : 0), versionAlcance: a.versionAlcance + 1 } : a)),
          ampliaciones: e.ampliaciones.map((x) => (x.id === id ? { ...x, estado: "Aplicada", historial: [...x.historial, traza("Alcance aplicado en Apigee (ACC-08)", actor, "Misma solicitud y credencial; versión de alcance incrementada.")] } : x)),
        };
      }),
    [actualizar]
  );

  const publicarParametros = useCallback(
    (datos: Omit<ParametrosMasivo, "version" | "estado" | "autor" | "fecha">, actor: Actor) =>
      actualizar((e) => ({ ...e, parametros: [...e.parametros.map((p) => (p.estado === "Publicada" ? { ...p, estado: "Retirada" as const } : p)), { ...datos, version: e.parametros.length + 1, estado: "Publicada", autor: actor.nombre, fecha: ahoraIso() }] })),
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
    probar,
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
