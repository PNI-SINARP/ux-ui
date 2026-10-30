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
  const ev = (
    n: number,
    acc: string,
    entregada: number,
    h: number,
    identificador?: string
  ): EventoConsumo => ({
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
    eventos: [
      ev(1, "ACC-API-001", 120_000, 30, "1712345678"),
      ev(2, "ACC-API-001", 345_000, 10, "1718956234"),
      ev(3, "ACC-API-002", 90_000, 20, "1715489621"),
    ],
    programaciones: [],
    ampliaciones: [],
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
    ticketsInc01: [],
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
      actor: Actor
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
      guardar({
        ...e,
        ampliaciones: [
          ...e.ampliaciones,
          {
            id,
            accesoId,
            tipo,
            campos,
            cupoAdicional,
            estado: inicial,
            version: 1,
            informeDpiFirmas: 0,
            firmasAdenda: 0,
            pagoConfirmado: false,
            historial: [
              traza(
                "Ampliación enviada",
                actor,
                tipo === "cupo"
                  ? "Pasa a Jurídica sin revisión de campos."
                  : "Pasa a revisión de Gestión (ADD-07)."
              ),
            ],
          },
        ],
      });
      void a;
      return { ok: true, mensaje: `Ampliación ${id} enviada.`, id };
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
