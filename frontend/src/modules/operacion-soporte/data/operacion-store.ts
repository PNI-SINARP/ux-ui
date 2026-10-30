"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Operación y soporte: monitoreo (OPS-02 a OPS-05), incidentes (INC-01 a INC-04), PAR-03 y PAR-06.
 * Los reportes y las alertas de consumo (OPS-01, REP-*) se calculan sobre los demás almacenes del prototipo.
 */

export type TipoComponente = "VPN" | "Conector" | "Proxy" | "Servicio" | "Cola";
export type Prioridad = "P1" | "P2" | "P3" | "P4";

export interface Componente {
  id: string;
  tipo: TipoComponente;
  entorno: "Pruebas" | "Producción";
  nombre: string;
  fuente?: string;
  destino: string;
  frecuenciaSegundos: number;
  estado: "Activo" | "En mantenimiento" | "Retirado";
  puntoSla: boolean;
  responsable: string;
}

export interface MetricaVentana {
  componenteId: string;
  ventana: string;
  muestrasEsperadas: number;
  muestrasExitosas: number;
  latenciaMaxMs: number | null;
  peticionesTotales: number;
  peticionesFallidas: number;
  profundidadCola: number;
  cpu: number;
  memoria: number;
  calidad: "Válido" | "Incompleto" | "Inválido";
  sinTelemetria: boolean;
}

export interface AlertaMonitoreo {
  id: string;
  componenteId: string;
  metrica: string;
  severidad: "Informativa" | "Advertencia" | "Crítica";
  valorMedido: string;
  umbral: string;
  versionPar06: number;
  instante: string;
  incidenteId?: string;
}

export interface ParametrosMonitoreo {
  version: number;
  estado: "Publicada" | "Retirada";
  umbralProximidad: number;
  duracionVentanaMin: number;
  ventanasLineaBase: number;
  umbralMinimo: number;
  factorDesviacion: number;
  maxHealthchecksFallidos: number;
  latenciaMaximaMs: number;
  tasaErrorMaxima: number;
  colaMaxima: number;
  cpuMaximo: number;
  memoriaMaxima: number;
  severidad: "Informativa" | "Advertencia" | "Crítica";
  disponibilidadObjetivo: number;
  autor: string;
  fecha: string;
}

export type EstadoRevision = "Pendiente" | "En análisis" | "Información solicitada" | "Confirmada" | "Descartada" | "Sin respuesta";
export interface RevisionAnomalia {
  id: string;
  accesoId: string;
  periodo: string;
  estado: EstadoRevision;
  revisor?: string;
  motivo?: string;
  notificacionEntregada?: boolean;
  fechaLimiteRespuesta?: string;
  historial: { instante: string; accion: string; actor: string }[];
}

export type EstadoIncidente = "Registrado" | "Clasificado" | "Asignado" | "En atención" | "En espera de información" | "Escalado" | "Resuelto" | "Reabierto" | "Cerrado";
export interface Incidente {
  id: string;
  origen: "Usuario" | "Sistema";
  solicitante: string;
  institucion: string;
  objetoTipo: "Solicitud" | "Fuente" | "API" | "Lote" | "Componente";
  objetoId: string;
  sintoma: string;
  evidencia: string[];
  estado: EstadoIncidente;
  registro: string;
  prioridad?: Prioridad;
  impacto?: { nivel: "Crítico" | "Alto" | "Medio" | "Bajo"; descripcion: string };
  tipo?: "Operativo" | "Seguridad";
  clasificacion?: string;
  responsable?: string;
  asignaciones: { id: string; responsable: string; asignador: string; instante: string; vigente: boolean }[];
  fechaLimiteAtencion?: string;
  diagnostico?: string;
  acciones: { id: string; descripcion: string; actor: string; instante: string; resultado: "Exitoso" | "Fallido" | "Pendiente" }[];
  escalamientos: { destino: string; tipoDestino: string; motivo: string; instante: string; acuse: "Pendiente" | "Confirmado" | "Fallido" }[];
  resolucion?: { causa: string; resultado: string; instante: string; instanteEntrega?: string; fechaLimiteRevision?: string };
  cierre?: { tipo: "Solución confirmada" | "Cierre por silencio tras plazo" | "Cierre administrativo motivado"; instante: string };
  historial: { instante: string; accion: string; actor: string; detalle?: string }[];
}

export interface PoliticaSoporte {
  version: number;
  estado: "Publicada" | "Retirada";
  p: Record<Prioridad, { minutos: number; reloj: "Continuo" | "Hábil" }>;
  escalamiento: { prioridad: Prioridad; nivel: number; minutos: number; tipoDestino: "Rol" | "Área" | "Proveedor"; destino: string }[];
  diasRevisionSolucion: number;
  fecha: string;
}

export interface ProveedorSoporte {
  id: string;
  nombre: string;
  correo: string;
  correoVerificado: boolean;
  activo: boolean;
}

export interface AccesoReporte {
  instante: string;
  cuenta: string;
  cedulaProtegida: string;
  finalidad: string;
  resultado: "Con resultados" | "Sin resultados" | "Error";
}

export interface EstadoOperacion {
  componentes: Componente[];
  metricas: MetricaVentana[];
  alertas: AlertaMonitoreo[];
  parametros: ParametrosMonitoreo[];
  revisiones: RevisionAnomalia[];
  incidentes: Incidente[];
  politicas: PoliticaSoporte[];
  proveedores: ProveedorSoporte[];
  accesosReporte: AccesoReporte[];
}

export const aleatorio = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
export const idOpaco = (p: string) => `${p}-${aleatorio(8).toUpperCase()}`;
export const ahoraIso = () => new Date().toISOString();
export function formatoFecha(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
}
export const numero = (n: number) => n.toLocaleString("es-EC");

export const AREAS_DESTINO = ["Infraestructura y Seguridad Informática", "Gestión y Registro", "Protección de la Información"];
export const ROLES_DESTINO = ["Equipo de TI", "Director de Gestión"];

export function parametrosActivos(p: ParametrosMonitoreo[]) {
  return [...p].reverse().find((x) => x.estado === "Publicada");
}
export function politicaActiva(p: PoliticaSoporte[]) {
  return [...p].reverse().find((x) => x.estado === "Publicada");
}

/** INC-02 CA6: reloj Continuo suma minutos corridos; reloj Hábil solo lunes a viernes de 08:00 a 17:00 hora de Ecuador (PAR-10 simplificado). */
export function calcularLimite(instante: string, minutos: number, reloj: "Continuo" | "Hábil"): string {
  if (reloj === "Continuo") return new Date(new Date(instante).getTime() + minutos * 60000).toISOString();
  let restantes = minutos * 60;
  let t = new Date(instante).getTime();
  const OFF = 5 * 3600000;
  for (let i = 0; i < 3650 && restantes > 0; i++) {
    const local = new Date(t - OFF);
    const dow = local.getUTCDay();
    const inicio = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 8) + OFF;
    const fin = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 17) + OFF;
    if (dow !== 0 && dow !== 6 && t < fin) {
      const desde = Math.max(t, inicio);
      const usado = Math.min(restantes, Math.max(0, (fin - desde) / 1000));
      restantes -= usado;
      if (restantes <= 0) return new Date(desde + usado * 1000).toISOString();
    }
    t = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1) + OFF;
  }
  return new Date(t).toISOString();
}

function semilla(): EstadoOperacion {
  const hace = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
  const comp = (id: string, tipo: TipoComponente, nombre: string, fuente: string | undefined, destino: string, sla = false, estado: Componente["estado"] = "Activo"): Componente => ({ id, tipo, entorno: "Producción", nombre, fuente, destino, frecuenciaSegundos: 60, estado, puntoSla: sla, responsable: "Ing. Carlos Mena" });
  const componentes = [
    comp("CMP-VPN-001", "VPN", "VPN institucional Registro Civil", "Registro Civil · Datos de identidad", "vpn.registrocivil.gob.ec:443"),
    comp("CMP-CNX-001", "Conector", "Conector PostgreSQL Registro Civil", "Registro Civil · Datos de identidad", "db.registrocivil.gob.ec:5432"),
    comp("CMP-API-001", "Proxy", "Proxy API Registro Civil v2", "Registro Civil · Datos de identidad", "https://api.dinarp.gob.ec/rc/v2/health", true),
    comp("CMP-API-002", "Proxy", "Proxy API SRI v1", "SRI · Contribuyentes y RUC", "https://api.dinarp.gob.ec/sri/v1/health", true),
    comp("CMP-SRV-001", "Servicio", "servicio-fuentes (en línea)", undefined, "https://servicio-fuentes.interno/health"),
    comp("CMP-COL-001", "Cola", "Tópico eventos-integracion", undefined, "pubsub:eventos-integracion"),
  ];
  const m = (id: string, ok: number, lat: number | null, tot: number, fall: number, cola: number, cpu: number, mem: number, sin = false): MetricaVentana => ({ componenteId: id, ventana: "Última ventana de 60 min", muestrasEsperadas: 60, muestrasExitosas: ok, latenciaMaxMs: lat, peticionesTotales: tot, peticionesFallidas: fall, profundidadCola: cola, cpu, memoria: mem, calidad: sin ? "Incompleto" : "Válido", sinTelemetria: sin });
  const metricas = [
    m("CMP-VPN-001", 60, 45, 0, 0, 0, 12, 30),
    m("CMP-CNX-001", 59, 180, 0, 0, 0, 35, 55),
    m("CMP-API-001", 60, 210, 4200, 8, 0, 41, 58),
    m("CMP-API-002", 41, 640, 1800, 160, 0, 78, 83),
    m("CMP-SRV-001", 60, 95, 2100, 3, 2, 33, 47),
    m("CMP-COL-001", 0, null, 0, 0, 0, 0, 0, true),
  ];
  return {
    componentes,
    metricas,
    alertas: [],
    parametros: [{ version: 1, estado: "Publicada", umbralProximidad: 0.8, duracionVentanaMin: 1440, ventanasLineaBase: 1, umbralMinimo: 50, factorDesviacion: 2, maxHealthchecksFallidos: 5, latenciaMaximaMs: 500, tasaErrorMaxima: 0.05, colaMaxima: 100, cpuMaximo: 85, memoriaMaxima: 90, severidad: "Advertencia", disponibilidadObjetivo: 99.5, autor: "Administrador técnico", fecha: hace(24 * 15) }],
    revisiones: [],
    incidentes: [
      {
        id: "INC-2026-001",
        origen: "Usuario",
        solicitante: "Andrea López",
        institucion: "Dirección General de Registro Civil",
        objetoTipo: "API",
        objetoId: "ACC-API-001",
        sintoma: "Las consultas masivas devuelven tiempo de espera agotado desde ayer a las 14:00.",
        evidencia: ["captura_error_429.png"],
        estado: "Registrado",
        registro: hace(5),
        asignaciones: [],
        acciones: [],
        escalamientos: [],
        historial: [{ instante: hace(5), accion: "Ticket de soporte registrado", actor: "Andrea López" }],
      },
    ],
    politicas: [
      {
        version: 1,
        estado: "Publicada",
        p: { P1: { minutos: 60, reloj: "Continuo" }, P2: { minutos: 240, reloj: "Hábil" }, P3: { minutos: 1440, reloj: "Hábil" }, P4: { minutos: 4320, reloj: "Hábil" } },
        escalamiento: [
          { prioridad: "P1", nivel: 1, minutos: 30, tipoDestino: "Área", destino: "Infraestructura y Seguridad Informática" },
          { prioridad: "P1", nivel: 2, minutos: 60, tipoDestino: "Proveedor", destino: "PROV-001" },
        ],
        diasRevisionSolucion: 3,
        fecha: hace(24 * 40),
      },
    ],
    proveedores: [{ id: "PROV-001", nombre: "Proveedor de la Plataforma (soporte nivel 3)", correo: "soporte@proveedor.example", correoVerificado: true, activo: true }],
    accesosReporte: [],
  };
}

const KEY = "dinarp_operacion_v1";
let memoria: EstadoOperacion | null = null;
const oyentes = new Set<() => void>();
function cargar(): EstadoOperacion {
  if (memoria) return memoria;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    memoria = raw ? (JSON.parse(raw) as EstadoOperacion) : semilla();
  } catch {
    memoria = semilla();
  }
  return memoria;
}
function guardar(e: EstadoOperacion) {
  memoria = e;
  try {
    localStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    // sin almacenamiento
  }
  oyentes.forEach((f) => f());
}

type Actor = { nombre: string; rol: string };
const tr = (accion: string, actor: Actor, detalle?: string) => ({ instante: ahoraIso(), accion, actor: actor.nombre, detalle });

export function useOperacionStore() {
  const [estado, setEstado] = useState<EstadoOperacion | null>(null);
  useEffect(() => {
    const sync = () => setEstado(memoria ? { ...memoria } : null);
    cargar();
    oyentes.add(sync);
    sync();
    return () => {
      oyentes.delete(sync);
    };
  }, []);
  const actualizar = useCallback((fn: (e: EstadoOperacion) => EstadoOperacion) => guardar(fn(cargar())), []);

  // OPS-04
  const guardarComponente = useCallback((c: Omit<Componente, "id"> & { id?: string }): { ok: boolean; mensaje: string; id?: string } => {
    if (!/^(https:\/\/\S+|[\w.-]+:\d+|pubsub:\S+)$/.test(c.destino)) return { ok: false, mensaje: "No se guardó el componente; corrige el destino del healthcheck (HTTPS o host:puerto)." };
    const e = cargar();
    const id = c.id ?? `CMP-${c.tipo.slice(0, 3).toUpperCase()}-${String(e.componentes.length + 1).padStart(3, "0")}`;
    const nuevo: Componente = { ...c, id } as Componente;
    guardar({ ...e, componentes: c.id ? e.componentes.map((x) => (x.id === id ? nuevo : x)) : [...e.componentes, nuevo], metricas: c.id ? e.metricas : [...e.metricas, { componenteId: id, ventana: "Sin ventana completa", muestrasEsperadas: 0, muestrasExitosas: 0, latenciaMaxMs: null, peticionesTotales: 0, peticionesFallidas: 0, profundidadCola: 0, cpu: 0, memoria: 0, calidad: "Incompleto", sinTelemetria: true }] });
    return { ok: true, mensaje: c.id ? `Componente actualizado (${id})` : `Componente creado (${id})`, id };
  }, []);

  const cambiarEstadoComponente = useCallback(
    (id: string, estado: Componente["estado"]): { ok: boolean; mensaje: string } => {
      const e = cargar();
      const c = e.componentes.find((x) => x.id === id)!;
      let componentes = e.componentes;
      if (c.puntoSla && estado !== "Activo") {
        const sucesor = e.componentes.find((x) => x.id !== id && x.fuente === c.fuente && x.entorno === c.entorno && x.estado === "Activo" && !x.puntoSla);
        if (!sucesor) return { ok: false, mensaje: "Para poner en mantenimiento o retirar el punto SLA exige un sucesor Activo." };
        componentes = componentes.map((x) => (x.id === id ? { ...x, estado, puntoSla: false } : x.id === sucesor.id ? { ...x, puntoSla: true } : x));
        guardar({ ...e, componentes });
        return { ok: true, mensaje: `Cambio de estado programado: el punto SLA pasa a ${sucesor.id} al límite de la ventana.` };
      }
      guardar({ ...e, componentes: componentes.map((x) => (x.id === id ? { ...x, estado } : x)) });
      return { ok: true, mensaje: "Cambio de estado aplicado." };
    },
    []
  );

  // OPS-05: recolecta una ventana y evalúa las reglas de PAR-06
  const recolectar = useCallback((escenario: "normal" | "degradada" | "sin_telemetria") => {
    const e = cargar();
    const par = parametrosActivos(e.parametros);
    const nuevas: AlertaMonitoreo[] = [];
    const metricas = e.metricas.map((m) => {
      const c = e.componentes.find((x) => x.id === m.componenteId);
      if (!c || c.estado !== "Activo") return m;
      const esperadas = Math.ceil((par?.duracionVentanaMin ?? 60) * 60 / c.frecuenciaSegundos);
      const nueva: MetricaVentana =
        escenario === "sin_telemetria"
          ? { ...m, ventana: "Última ventana recolectada", muestrasEsperadas: esperadas, muestrasExitosas: 0, latenciaMaxMs: null, calidad: "Incompleto", sinTelemetria: true }
          : escenario === "degradada"
            ? { ...m, ventana: "Última ventana recolectada", muestrasEsperadas: esperadas, muestrasExitosas: Math.floor(esperadas * 0.7), latenciaMaxMs: 900, peticionesTotales: Math.max(m.peticionesTotales, 1000), peticionesFallidas: 120, profundidadCola: 180, cpu: 92, memoria: 91, calidad: "Válido", sinTelemetria: false }
            : { ...m, ventana: "Última ventana recolectada", muestrasEsperadas: esperadas, muestrasExitosas: esperadas, latenciaMaxMs: 120, peticionesFallidas: Math.floor(m.peticionesTotales * 0.002), profundidadCola: 1, cpu: 30, memoria: 45, calidad: "Válido", sinTelemetria: false };
      if (!par || nueva.sinTelemetria) return nueva;
      const reglas: [string, number, number, string][] = [
        ["latencia_ms", nueva.latenciaMaxMs ?? 0, par.latenciaMaximaMs, "ms"],
        ["tasa_error", nueva.peticionesTotales > 0 ? nueva.peticionesFallidas / nueva.peticionesTotales : 0, par.tasaErrorMaxima, "proporción"],
        ["profundidad_cola", nueva.profundidadCola, par.colaMaxima, "elementos"],
        ["cpu_porcentaje", nueva.cpu, par.cpuMaximo, "%"],
        ["memoria_porcentaje", nueva.memoria, par.memoriaMaxima, "%"],
      ];
      reglas.forEach(([metrica, valor, umbral, unidad]) => {
        if (valor > umbral) nuevas.push({ id: idOpaco("ALR"), componenteId: nueva.componenteId, metrica, severidad: par.severidad, valorMedido: `${Number.isInteger(valor) ? valor : valor.toFixed(3)} ${unidad}`, umbral: `${umbral} ${unidad}`, versionPar06: par.version, instante: ahoraIso() });
      });
      return nueva;
    });
    guardar({ ...e, metricas, alertas: [...e.alertas, ...nuevas] });
    return nuevas.length;
  }, []);

  // OPS-02
  const abrirRevision = useCallback(
    (accesoId: string, periodo: string, actor: Actor) =>
      actualizar((e) => (e.revisiones.some((r) => r.accesoId === accesoId && r.periodo === periodo) ? e : { ...e, revisiones: [...e.revisiones, { id: `REV-${String(e.revisiones.length + 1).padStart(3, "0")}`, accesoId, periodo, estado: "Pendiente", historial: [tr("Anomalía registrada para revisión", actor)] }] })),
    [actualizar]
  );
  const mutarRevision = useCallback(
    (id: string, estado: EstadoRevision, actor: Actor, accion: string, extra: Partial<RevisionAnomalia> = {}) =>
      actualizar((e) => ({ ...e, revisiones: e.revisiones.map((r) => (r.id === id ? { ...r, ...extra, estado, revisor: extra.revisor ?? r.revisor ?? actor.nombre, historial: [...r.historial, tr(accion, actor, extra.motivo)] } : r)) })),
    [actualizar]
  );

  // INC-01 a INC-04
  const crearIncidente = useCallback(
    (d: { objetoTipo: Incidente["objetoTipo"]; objetoId: string; sintoma: string; evidencia: string[]; institucion: string; origen: Incidente["origen"] }, actor: Actor): { ok: boolean; mensaje: string; id?: string } => {
      if (!d.sintoma.trim() || !d.objetoId) return { ok: false, mensaje: "Indica el objeto afectado y el síntoma; no se crea un ticket vacío." };
      const e = cargar();
      const id = `INC-2026-${String(e.incidentes.length + 1).padStart(3, "0")}`;
      guardar({ ...e, incidentes: [...e.incidentes, { id, ...d, solicitante: actor.nombre, estado: "Registrado", registro: ahoraIso(), asignaciones: [], acciones: [], escalamientos: [], historial: [tr("Ticket de soporte registrado", actor)] }] });
      return { ok: true, mensaje: `Ticket de soporte registrado: ${id}`, id };
    },
    []
  );
  const mutarIncidente = useCallback(
    (id: string, fn: (i: Incidente, e: EstadoOperacion) => Incidente, actor: Actor, accion: string, detalle?: string) =>
      actualizar((e) => ({ ...e, incidentes: e.incidentes.map((i) => (i.id === id ? { ...fn(i, e), historial: [...i.historial, tr(accion, actor, detalle)] } : i)) })),
    [actualizar]
  );

  // PAR-03 y PAR-06
  const publicarPolitica = useCallback((p: Omit<PoliticaSoporte, "version" | "estado" | "fecha">) => actualizar((e) => ({ ...e, politicas: [...e.politicas.map((x) => (x.estado === "Publicada" ? { ...x, estado: "Retirada" as const } : x)), { ...p, version: e.politicas.length + 1, estado: "Publicada", fecha: ahoraIso() }] })), [actualizar]);
  const guardarProveedor = useCallback((p: ProveedorSoporte) => actualizar((e) => ({ ...e, proveedores: e.proveedores.some((x) => x.id === p.id) ? e.proveedores.map((x) => (x.id === p.id ? p : x)) : [...e.proveedores, p] })), [actualizar]);
  const publicarParametros = useCallback((p: Omit<ParametrosMonitoreo, "version" | "estado" | "autor" | "fecha">, actor: Actor) => actualizar((e) => ({ ...e, parametros: [...e.parametros.map((x) => (x.estado === "Publicada" ? { ...x, estado: "Retirada" as const } : x)), { ...p, version: e.parametros.length + 1, estado: "Publicada", autor: actor.nombre, fecha: ahoraIso() }] })), [actualizar]);

  const registrarAccesoReporte = useCallback((a: AccesoReporte) => actualizar((e) => ({ ...e, accesosReporte: [...e.accesosReporte, a] })), [actualizar]);
  const reiniciar = useCallback(() => guardar(semilla()), []);

  return {
    listo: estado !== null,
    componentes: estado?.componentes ?? [],
    metricas: estado?.metricas ?? [],
    alertas: estado?.alertas ?? [],
    parametros: estado?.parametros ?? [],
    revisiones: estado?.revisiones ?? [],
    incidentes: estado?.incidentes ?? [],
    politicas: estado?.politicas ?? [],
    proveedores: estado?.proveedores ?? [],
    accesosReporte: estado?.accesosReporte ?? [],
    guardarComponente,
    cambiarEstadoComponente,
    recolectar,
    abrirRevision,
    mutarRevision,
    crearIncidente,
    mutarIncidente,
    publicarPolitica,
    guardarProveedor,
    publicarParametros,
    registrarAccesoReporte,
    reiniciar,
  };
}
