"use client";

import { useCallback, useEffect, useState } from "react";
import { codigoReferencia, idOperacion } from "@/lib/tec00";

/**
 * Administración del Portal: parámetros restantes (PAR-08, 09, 14, 15, 16), ciclo de vida de la fuente
 * (FUE-08 a FUE-11, ECO-01), instituciones (INS-08 a INS-10) y bootstrap (ID-00). Todo simulado.
 */

export type EstadoVersion = "Borrador" | "Publicada" | "Retirada";
export const ahoraIso = () => new Date().toISOString();
export const formatoFecha = (iso?: string, hora = true) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("es-EC", hora ? { dateStyle: "short", timeStyle: "short" } : { dateStyle: "medium" });
};

export interface MetodoRecuperacion {
  codigo: string;
  descripcion: string;
  evidencias: string[];
  rol: string;
  diasRetencion: number;
  estado: "Publicado" | "Retirado";
}
export interface VigenciaSinCuenta {
  version: number;
  estado: "Publicada" | "Retirada";
  horas: number;
  intentos: number;
  autor: string;
  fecha: string;
}
export type TipoPlantilla = "Resolución de incorporación" | "Informe de recomendación de acceso" | "Informe final de entrega excepcional";
export interface SeccionPlantilla {
  orden: number;
  titulo: string;
  tipo: "Fija" | "Variable" | "Editable";
  texto: string;
}
export interface PlantillaDocumento {
  id: string;
  tipo: TipoPlantilla;
  version: number;
  estado: "Borrador" | "Publicada" | "Retirada";
  secciones: SeccionPlantilla[];
  autor: string;
  fecha: string;
}
export interface VersionTextos {
  version: number;
  estado: "Publicada" | "Retirada";
  interfaz: { clave: string; pantalla: string; texto: string }[];
  ayuda: { campo: "Finalidad de uso" | "Justificación jurídica"; aplica: "Accesible" | "Confidencial" | "Ambas"; texto: string; ejemplo: string }[];
  autor: string;
  fecha: string;
}
export interface VersionVistos {
  version: number;
  estado: "Publicada" | "Retirada";
  analista: boolean;
  director: boolean;
  motivo: string;
  autor: string;
  fecha: string;
}

export interface Aviso {
  diasAntes: number;
  programadoUtc: string;
  estado: "Programado" | "Enviado" | "Fallido";
  reintentos: number;
}
export type EstadoBaja = "Solicitada" | "Devuelta" | "Programada" | "Retiro técnico pendiente" | "Retirada";
export interface Baja {
  id: string;
  fuente: string;
  institucion: string;
  fechaBaja: string;
  instantePrograma: string;
  estado: EstadoBaja;
  impacto: { consumidores: number; solicitudes: number; contratos: number; credenciales: number; lotes: number };
  decision?: { resultado: "Aprobada" | "Devuelta"; motivo: string; actor: string; instante: string };
  avisos: Aviso[];
  diasAnticipacion: number[];
  historial: { instante: string; accion: string; actor: string }[];
}
export interface Suspension {
  id: string;
  fuente: string;
  metrica: string;
  ventana: string;
  estado: "Suspensión técnica pendiente" | "Suspendida" | "Restablecida";
  incidente: string;
  correccion?: { causa: string; accion: string; responsable: string; instante: string };
  pruebas?: { conectividad: boolean; lectura: boolean; respuesta: boolean };
  decision?: { resultado: "Aprobada" | "Devuelta"; motivo: string; actor: string; instante: string };
  instante: string;
}
export interface CasoEconomico {
  id: string;
  causa: "Baja programada" | "Inactivación de proveedora";
  evento: string;
  fuente: string;
  solicitud: string;
  contrato: string;
  factura: { numero: string; estado: string };
  pago: { referencia: string; estado: string };
  importe: string;
  estado: "Pendiente de regularización" | "Regularizado con ajuste" | "Cerrado sin ajuste";
  decision?: { resultado: "Ajuste externo confirmado" | "Cerrar sin ajuste"; motivo: string; soporte?: string; actor: string; instante: string };
}
export interface Institucion {
  ruc: string;
  nombre: string;
  estado: "Activa" | "Inactivación técnica pendiente" | "Inactiva" | "Sin_registro_activo";
  proyectos: number;
  solicitudes: number;
  fuentes: string[];
  consumidoras: number;
  fechaEfecto?: string;
  motivo?: string;
  efectos?: { bloqueo: boolean; revocaciones: boolean; retiroFuentes: boolean; cancelaciones: boolean; eco: boolean };
}
export interface Fusion {
  id: string;
  rucsOrigen: string[];
  acto: string;
  documento: string;
  rucNuevo: string;
  estadoOrigen: Record<string, Institucion["estado"] | "No_verificada">;
  estado: "Pendiente de verificación" | "Pendiente de cierre de origen" | "Completada";
  fecha: string;
}
export interface ConfigPrecarga {
  version: number;
  entorno: "Pruebas" | "Producción";
  servicio: string;
  operacion: string;
  campoEntrada: string;
  mapeo: { origen: string; destino: string; tipo: "Texto" | "Fecha" | "Numero" }[];
  estado: "Borrador" | "Activa" | "Retirada";
  prueba?: "Conectividad" | "Respuesta" | "Mapeo" | "Satisfactoria";
}
export interface IntentoBootstrap {
  id: string;
  instante: string;
  resultado: "Habilitado" | "Pendiente de recuperación" | "Denegado";
  detalle: string;
}

export interface EstadoAdmin {
  metodos: MetodoRecuperacion[];
  vigencias: VigenciaSinCuenta[];
  plantillas: PlantillaDocumento[];
  textos: VersionTextos[];
  vistos: VersionVistos[];
  bajas: Baja[];
  suspensiones: Suspension[];
  casos: CasoEconomico[];
  instituciones: Institucion[];
  fusiones: Fusion[];
  precarga: ConfigPrecarga[];
  bootstrap: { habilitado: boolean; intentos: IntentoBootstrap[] };
}

export const ROLES_CATALOGO = ["Administrador", "Mesa de ayuda", "Director de Gestión", "Equipo de Gestión"];
export const EVIDENCIAS = ["Documento de identidad", "Fotografía con documento", "Correo institucional verificado", "Oficio de la máxima autoridad"];
export const PLANTILLAS_TIPOS: { tipo: TipoPlantilla; responsable: string }[] = [
  { tipo: "Resolución de incorporación", responsable: "Director de Normatividad" },
  { tipo: "Informe de recomendación de acceso", responsable: "Director de DPI" },
  { tipo: "Informe final de entrega excepcional", responsable: "Director de Gestión" },
];

const hace = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

function semilla(): EstadoAdmin {
  const sec = (t: string, tipo: SeccionPlantilla["tipo"], texto: string, orden: number): SeccionPlantilla => ({ orden, titulo: t, tipo, texto });
  const plantilla = (tipo: TipoPlantilla, firmante: string): PlantillaDocumento => ({
    id: `PLT-${tipo.slice(0, 3).toUpperCase()}-1`,
    tipo,
    version: 1,
    estado: "Publicada",
    secciones: [sec("Encabezado", "Fija", "DIRECCIÓN NACIONAL DE REGISTROS PÚBLICOS", 1), sec("Considerandos", "Editable", "Que, …", 2), sec("Datos de la institución", "Variable", "{{institucion}} · {{ruc}}", 3), sec("Resuelve", "Editable", "Artículo 1.- …", 4), sec("Firmas", "Fija", firmante, 5)],
    autor: "Director del área",
    fecha: hace(40),
  });
  const fuentes = ["Registro Civil · Datos de identidad", "SRI · Contribuyentes y RUC", "Movilidad · Licencias de conducir"];
  const baja = (id: string, fuente: string, inst: string, dias: number, estado: EstadoBaja): Baja => {
    const fecha = new Date(Date.now() + dias * 86400000);
    return { id, fuente, institucion: inst, fechaBaja: fecha.toISOString().slice(0, 10), instantePrograma: hace(2), estado, impacto: { consumidores: 3, solicitudes: 4, contratos: 2, credenciales: 4, lotes: 1 }, avisos: [30, 15, 7, 1].map((d) => ({ diasAntes: d, programadoUtc: new Date(fecha.getTime() - d * 86400000).toISOString(), estado: "Programado" as const, reintentos: 0 })), diasAnticipacion: [30, 15, 7, 1], historial: [{ instante: hace(2), accion: "Baja solicitada", actor: "Coordinador proveedor" }] };
  };
  return {
    metodos: [{ codigo: "OFICIO_AUTORIDAD", descripcion: "Oficio firmado por la máxima autoridad de la institución", evidencias: ["Oficio de la máxima autoridad", "Documento de identidad"], rol: "Mesa de ayuda", diasRetencion: 365, estado: "Publicado" }],
    vigencias: [{ version: 1, estado: "Publicada", horas: 24, intentos: 5, autor: "Administrador del Sistema", fecha: hace(30) }],
    plantillas: PLANTILLAS_TIPOS.map((p) => plantilla(p.tipo, p.responsable)),
    textos: [{ version: 1, estado: "Publicada", interfaz: [{ clave: "sol.paso1.titulo", pantalla: "solicitud-nueva", texto: "Proyecto y respaldo" }], ayuda: [{ campo: "Finalidad de uso", aplica: "Ambas", texto: "Describe para qué usarás el dato y cómo se relaciona con tu competencia.", ejemplo: "Verificar la identidad del solicitante para emitir el carné." }, { campo: "Justificación jurídica", aplica: "Confidencial", texto: "Cita la norma que te habilita a tratar este dato confidencial.", ejemplo: "Art. 7 numeral 5 de la LOPDP." }], autor: "Administrador del Sistema", fecha: hace(20) }],
    vistos: [{ version: 1, estado: "Publicada", analista: true, director: true, motivo: "Valor inicial", autor: "Administrador del Sistema", fecha: hace(15) }],
    bajas: [baja("BAJ-001", fuentes[2], "Agencia Nacional de Tránsito", 20, "Solicitada"), baja("BAJ-002", fuentes[1], "Servicio de Rentas Internas", 45, "Programada")],
    suspensiones: [],
    casos: [],
    instituciones: [
      { ruc: "1760004560001", nombre: "Ministerio de Educación", estado: "Activa", proyectos: 3, solicitudes: 5, fuentes: [], consumidoras: 0 },
      { ruc: "1768153530001", nombre: "Dirección General de Registro Civil", estado: "Activa", proyectos: 2, solicitudes: 4, fuentes: [fuentes[0]], consumidoras: 3 },
      { ruc: "1760013210001", nombre: "Servicio de Rentas Internas", estado: "Activa", proyectos: 1, solicitudes: 2, fuentes: [fuentes[1]], consumidoras: 2 },
      { ruc: "1760001550001", nombre: "Instituto de Fomento (fusionado)", estado: "Activa", proyectos: 1, solicitudes: 1, fuentes: [], consumidoras: 0 },
    ],
    fusiones: [],
    precarga: [{ version: 1, entorno: "Producción", servicio: "SVC-SRI-RUC", operacion: "consultarContribuyente", campoEntrada: "ruc", mapeo: [{ origen: "razonSocial", destino: "nombre_institucion", tipo: "Texto" }], estado: "Activa", prueba: "Satisfactoria" }],
    bootstrap: { habilitado: false, intentos: [] },
  };
}

const KEY = "dinarp_admin_portal_v1";
let memoria: EstadoAdmin | null = null;
const oyentes = new Set<() => void>();
function cargar(): EstadoAdmin {
  if (memoria) return memoria;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    memoria = raw ? (JSON.parse(raw) as EstadoAdmin) : semilla();
  } catch {
    memoria = semilla();
  }
  return memoria;
}
/** Valores que otras pantallas leen directamente (PAR-09 y PAR-16). */
function publicarPuentes(e: EstadoAdmin) {
  try {
    const v = [...e.vigencias].reverse().find((x) => x.estado === "Publicada");
    if (v) localStorage.setItem("dinarp_par09_v1", JSON.stringify({ horas: v.horas, intentos: v.intentos }));
    const p = [...e.vistos].reverse().find((x) => x.estado === "Publicada");
    if (p) localStorage.setItem("dinarp_par16_v1", JSON.stringify({ analista: p.analista, director: p.director }));
  } catch {
    // sin almacenamiento
  }
}
function guardar(e: EstadoAdmin) {
  memoria = e;
  try {
    localStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    // sin almacenamiento
  }
  publicarPuentes(e);
  oyentes.forEach((f) => f());
}

type Actor = { nombre: string; rol: string };
const tr = (accion: string, actor: Actor) => ({ instante: ahoraIso(), accion, actor: actor.nombre });

export function useAdminStore() {
  const [estado, setEstado] = useState<EstadoAdmin | null>(null);
  useEffect(() => {
    const sync = () => setEstado(memoria ? { ...memoria } : null);
    guardar(cargar());
    oyentes.add(sync);
    sync();
    return () => {
      oyentes.delete(sync);
    };
  }, []);
  const act = useCallback((fn: (e: EstadoAdmin) => EstadoAdmin) => guardar(fn(cargar())), []);

  // PAR-08
  const publicarMetodo = useCallback((m: Omit<MetodoRecuperacion, "estado">): { ok: boolean; mensaje: string } => {
    const e = cargar();
    if (!m.codigo.trim() || !m.descripcion.trim()) return { ok: false, mensaje: "Código y descripción son obligatorios." };
    if (m.evidencias.length === 0) return { ok: false, mensaje: "Exige al menos una evidencia tipada." };
    if (!ROLES_CATALOGO.includes(m.rol)) return { ok: false, mensaje: "El rol no está activo en el catálogo de ID-14." };
    if (!(m.diasRetencion > 0)) return { ok: false, mensaje: "La retención debe ser positiva." };
    if (e.metodos.some((x) => x.codigo === m.codigo && x.estado === "Publicado")) return { ok: false, mensaje: `Ya existe un método activo con el código ${m.codigo}.` };
    guardar({ ...e, metodos: [...e.metodos, { ...m, estado: "Publicado" }] });
    return { ok: true, mensaje: "Método publicado; ya se puede elegir en ID-08." };
  }, []);
  const retirarMetodo = useCallback((codigo: string) => act((e) => ({ ...e, metodos: e.metodos.map((m) => (m.codigo === codigo ? { ...m, estado: "Retirado" } : m)) })), [act]);

  // PAR-09, PAR-16
  const publicarVigencia = useCallback((horas: number, intentos: number, actor: Actor) => act((e) => ({ ...e, vigencias: [...e.vigencias.map((v) => (v.estado === "Publicada" ? { ...v, estado: "Retirada" as const } : v)), { version: e.vigencias.length + 1, estado: "Publicada", horas, intentos, autor: actor.nombre, fecha: ahoraIso() }] })), [act]);
  const publicarVistos = useCallback((analista: boolean, director: boolean, motivo: string, actor: Actor) => act((e) => ({ ...e, vistos: [...e.vistos.map((v) => (v.estado === "Publicada" ? { ...v, estado: "Retirada" as const } : v)), { version: e.vistos.length + 1, estado: "Publicada", analista, director, motivo, autor: actor.nombre, fecha: ahoraIso() }] })), [act]);

  // PAR-14, PAR-15
  const publicarPlantilla = useCallback((tipo: TipoPlantilla, secciones: SeccionPlantilla[], actor: Actor): { ok: boolean; mensaje: string } => {
    if (secciones.length === 0) return { ok: false, mensaje: "La plantilla necesita al menos una sección." };
    const e = cargar();
    const version = Math.max(0, ...e.plantillas.filter((p) => p.tipo === tipo).map((p) => p.version)) + 1;
    guardar({ ...e, plantillas: [...e.plantillas.map((p) => (p.tipo === tipo && p.estado === "Publicada" ? { ...p, estado: "Retirada" as const } : p)), { id: idOperacion("PLT"), tipo, version, estado: "Publicada", secciones, autor: actor.nombre, fecha: ahoraIso() }] });
    return { ok: true, mensaje: `Plantilla publicada: ${tipo} v${version}` };
  }, []);
  const publicarTextos = useCallback((interfaz: VersionTextos["interfaz"], ayuda: VersionTextos["ayuda"], actor: Actor) => act((e) => ({ ...e, textos: [...e.textos.map((t) => (t.estado === "Publicada" ? { ...t, estado: "Retirada" as const } : t)), { version: e.textos.length + 1, estado: "Publicada", interfaz, ayuda, autor: actor.nombre, fecha: ahoraIso() }] })), [act]);

  // FUE-08 y FUE-09
  const solicitarBaja = useCallback((fuente: string, institucion: string, fechaBaja: string, actor: Actor): { ok: boolean; mensaje: string } => {
    const e = cargar();
    const dias = [30, 15, 7, 1];
    const primer = new Date(`${fechaBaja}T08:00:00-05:00`).getTime() - Math.max(...dias) * 86400000;
    if (Date.now() > primer) return { ok: false, mensaje: `El primer aviso (${formatoFecha(new Date(primer).toISOString())}) ya no se puede emitir a tiempo; elige otra fecha.` };
    const id = `BAJ-${String(e.bajas.length + 1).padStart(3, "0")}`;
    const f = new Date(`${fechaBaja}T08:00:00-05:00`).getTime();
    guardar({ ...e, bajas: [...e.bajas, { id, fuente, institucion, fechaBaja, instantePrograma: ahoraIso(), estado: "Solicitada", impacto: { consumidores: 2, solicitudes: 3, contratos: 1, credenciales: 3, lotes: 0 }, diasAnticipacion: dias, avisos: dias.map((d) => ({ diasAntes: d, programadoUtc: new Date(f - d * 86400000).toISOString(), estado: "Programado" as const, reintentos: 0 })), historial: [tr("Baja solicitada", actor)] }] });
    return { ok: true, mensaje: `${id} solicitada; espera la decisión del Director de Gestión.` };
  }, []);
  const decidirBaja = useCallback((id: string, resultado: "Aprobada" | "Devuelta", motivo: string, actor: Actor) => act((e) => ({ ...e, bajas: e.bajas.map((b) => (b.id === id ? { ...b, estado: resultado === "Aprobada" ? "Programada" : "Devuelta", decision: { resultado, motivo, actor: actor.nombre, instante: ahoraIso() }, historial: [...b.historial, tr(`Baja ${resultado.toLowerCase()}`, actor)] } : b)) })), [act]);
  const enviarAviso = useCallback((id: string, dias: number, falla: boolean, actor: Actor) => act((e) => ({ ...e, bajas: e.bajas.map((b) => (b.id === id ? { ...b, avisos: b.avisos.map((a) => (a.diasAntes === dias ? { ...a, estado: falla ? "Fallido" : "Enviado", reintentos: a.reintentos + (falla ? 1 : 0) } : a)), historial: [...b.historial, tr(`Aviso de ${dias} día(s) ${falla ? "fallido; se reintenta" : "enviado"}`, actor)] } : b)) })), [act]);
  const ejecutarBaja = useCallback((id: string, apigeeOk: boolean, actor: Actor) => act((e) => {
    const b = e.bajas.find((x) => x.id === id)!;
    const base = { ...e, bajas: e.bajas.map((x) => (x.id === id ? { ...x, estado: apigeeOk ? ("Retirada" as const) : ("Retiro técnico pendiente" as const), historial: [...x.historial, tr(apigeeOk ? "Fuente retirada; solicitudes y contratos cancelados por baja" : "Apigee no confirmó: retiro técnico pendiente, bloqueo lógico activo e incidente abierto", actor)] } : x)) };
    if (!apigeeOk) return base;
    const n = e.casos.length;
    const nuevos: CasoEconomico[] = Array.from({ length: Math.min(2, b.impacto.contratos) }, (_, i) => ({ id: `ECO-${String(n + i + 1).padStart(3, "0")}`, causa: "Baja programada", evento: b.id, fuente: b.fuente, solicitud: `SOL-2026-${100 + i}`, contrato: `CON-2026-${20 + i}`, factura: { numero: `001-001-00000${120 + i}`, estado: "Autorizada (SRI)" }, pago: { referencia: `PAG-${300 + i}`, estado: "Confirmado" }, importe: `USD ${(1850 + i * 640).toFixed(2)}`, estado: "Pendiente de regularización" }));
    return { ...base, casos: [...base.casos, ...nuevos] };
  }), [act]);

  // FUE-10 y FUE-11
  const suspenderFuente = useCallback((fuente: string, metrica: string, apigeeOk: boolean) => act((e) => ({ ...e, suspensiones: [...e.suspensiones, { id: `SUS-${String(e.suspensiones.length + 1).padStart(3, "0")}`, fuente, metrica, ventana: "Última ventana de 60 min", estado: apigeeOk ? "Suspendida" : "Suspensión técnica pendiente", incidente: `INC-2026-${String(100 + e.suspensiones.length)}`, instante: ahoraIso() }] })), [act]);
  const registrarCorreccion = useCallback((id: string, c: { causa: string; accion: string }, actor: Actor) => act((e) => ({ ...e, suspensiones: e.suspensiones.map((s) => (s.id === id ? { ...s, correccion: { ...c, responsable: actor.nombre, instante: ahoraIso() } } : s)) })), [act]);
  const probarFuente = useCallback((id: string, p: { conectividad: boolean; lectura: boolean; respuesta: boolean }) => act((e) => ({ ...e, suspensiones: e.suspensiones.map((s) => (s.id === id ? { ...s, pruebas: p } : s)) })), [act]);
  const decidirRestablecimiento = useCallback((id: string, resultado: "Aprobada" | "Devuelta", motivo: string, actor: Actor) => act((e) => ({ ...e, suspensiones: e.suspensiones.map((s) => (s.id === id ? { ...s, decision: { resultado, motivo, actor: actor.nombre, instante: ahoraIso() }, estado: resultado === "Aprobada" ? "Restablecida" : s.estado } : s)) })), [act]);

  // ECO-01
  const regularizar = useCallback((id: string, resultado: "Ajuste externo confirmado" | "Cerrar sin ajuste", motivo: string, soporte: string | undefined, actor: Actor) => act((e) => ({ ...e, casos: e.casos.map((c) => (c.id === id ? { ...c, estado: resultado === "Ajuste externo confirmado" ? "Regularizado con ajuste" : "Cerrado sin ajuste", decision: { resultado, motivo, soporte, actor: actor.nombre, instante: ahoraIso() } } : c)) })), [act]);

  // INS-08, INS-09, INS-10
  const inactivarInstitucion = useCallback((ruc: string, motivo: string, actor: Actor) => act((e) => ({ ...e, instituciones: e.instituciones.map((i) => (i.ruc === ruc ? { ...i, estado: "Inactivación técnica pendiente", motivo, fechaEfecto: ahoraIso(), efectos: { bloqueo: true, revocaciones: false, retiroFuentes: false, cancelaciones: false, eco: false } } : i)) })), [act]);
  const avanzarInactivacion = useCallback((ruc: string, falla: boolean) => act((e) => ({
    ...e,
    instituciones: e.instituciones.map((i) => {
      if (i.ruc !== ruc || !i.efectos) return i;
      const ef = { ...i.efectos };
      if (!ef.revocaciones) ef.revocaciones = !falla;
      else if (!ef.retiroFuentes) ef.retiroFuentes = true;
      else if (!ef.cancelaciones) ef.cancelaciones = true;
      else if (!ef.eco) ef.eco = true;
      const completo = ef.bloqueo && ef.revocaciones && ef.retiroFuentes && ef.cancelaciones && ef.eco;
      return { ...i, efectos: ef, estado: completo ? "Inactiva" : "Inactivación técnica pendiente" };
    }),
    casos: (() => {
      const i = e.instituciones.find((x) => x.ruc === ruc);
      if (!i?.efectos || !i.efectos.cancelaciones || i.efectos.eco || i.fuentes.length === 0) return e.casos;
      return [...e.casos, { id: `ECO-${String(e.casos.length + 1).padStart(3, "0")}`, causa: "Inactivación de proveedora" as const, evento: `INS-08 ${ruc}`, fuente: i.fuentes[0], solicitud: "SOL-2026-140", contrato: "CON-2026-31", factura: { numero: "001-001-000000201", estado: "Autorizada (SRI)" }, pago: { referencia: "PAG-410", estado: "Confirmado" }, importe: "USD 2.400,00", estado: "Pendiente de regularización" as const }];
    })(),
  })), [act]);
  const registrarFusion = useCallback((f: { rucsOrigen: string[]; acto: string; documento: string; rucNuevo: string }): { ok: boolean; mensaje: string } => {
    const e = cargar();
    if (f.rucsOrigen.length === 0 || !f.acto.trim() || !f.documento) return { ok: false, mensaje: "Indica los RUC de origen, la referencia del acto y el documento." };
    if (new Set(f.rucsOrigen).size !== f.rucsOrigen.length) return { ok: false, mensaje: "La relación de fusión no admite RUC duplicados." };
    const estadoOrigen: Fusion["estadoOrigen"] = Object.fromEntries(f.rucsOrigen.map((r) => [r, e.instituciones.find((i) => i.ruc === r)?.estado ?? "No_verificada"]));
    const sinVerificar = Object.values(estadoOrigen).includes("No_verificada");
    const pendiente = Object.values(estadoOrigen).some((s) => s === "Activa" || s === "Inactivación técnica pendiente");
    guardar({ ...e, fusiones: [...e.fusiones, { id: `FUS-${String(e.fusiones.length + 1).padStart(3, "0")}`, ...f, estadoOrigen, estado: sinVerificar ? "Pendiente de verificación" : pendiente ? "Pendiente de cierre de origen" : "Completada", fecha: ahoraIso() }] });
    return { ok: true, mensaje: sinVerificar ? "Fusión registrada; hay un RUC de origen sin verificar." : pendiente ? "Fusión registrada; cierre de orígenes pendiente." : "Fusión completada; instituciones anteriores inactivas." };
  }, []);
  const sincronizarFusiones = useCallback(() => act((e) => ({ ...e, fusiones: e.fusiones.map((f) => { const estadoOrigen = Object.fromEntries(f.rucsOrigen.map((r) => [r, e.instituciones.find((i) => i.ruc === r)?.estado ?? "No_verificada"])) as Fusion["estadoOrigen"]; const vals = Object.values(estadoOrigen); return { ...f, estadoOrigen, estado: vals.includes("No_verificada") ? "Pendiente de verificación" : vals.some((s) => s === "Activa" || s === "Inactivación técnica pendiente") ? "Pendiente de cierre de origen" : "Completada" }; }) })), [act]);
  const guardarPrecarga = useCallback((c: Omit<ConfigPrecarga, "version" | "estado" | "prueba">) => act((e) => ({ ...e, precarga: [...e.precarga, { ...c, version: e.precarga.length + 1, estado: "Borrador" }] })), [act]);
  const probarPrecarga = useCallback((version: number, etapa: "Conectividad" | "Respuesta" | "Mapeo" | "Satisfactoria") => act((e) => ({ ...e, precarga: e.precarga.map((c) => (c.version === version ? { ...c, prueba: etapa } : c)) })), [act]);
  const activarPrecarga = useCallback((version: number) => act((e) => ({ ...e, precarga: e.precarga.map((c) => (c.version === version ? { ...c, estado: "Activa" } : c.estado === "Activa" ? { ...c, estado: "Retirada" } : c)) })), [act]);

  // ID-00
  const habilitarAdministrador = useCallback((escenario: "ok" | "falla" | "denegado", detalle: string): { ok: boolean; mensaje: string } => {
    const e = cargar();
    const base = { id: idOperacion("BOOT"), instante: ahoraIso() };
    if (e.bootstrap.habilitado) return { ok: false, mensaje: "Ya existe un Administrador habilitado: no se crea un segundo." };
    if (escenario === "denegado") {
      guardar({ ...e, bootstrap: { ...e.bootstrap, intentos: [...e.bootstrap.intentos, { ...base, resultado: "Denegado", detalle }] } });
      return { ok: false, mensaje: "Designación o identidad no verificada; corrige la evidencia antes de reintentar." };
    }
    if (escenario === "falla") {
      const ref = codigoReferencia();
      guardar({ ...e, bootstrap: { ...e.bootstrap, intentos: [...e.bootstrap.intentos, { ...base, resultado: "Pendiente de recuperación", detalle: `Referencia ${ref}` }] } });
      return { ok: false, mensaje: `No se completó la habilitación; revisa la referencia del intento (${ref}).` };
    }
    guardar({ ...e, bootstrap: { habilitado: true, intentos: [...e.bootstrap.intentos, { ...base, resultado: "Habilitado", detalle }] } });
    return { ok: true, mensaje: "Administrador inicial habilitado" };
  }, []);

  const reiniciar = useCallback(() => guardar(semilla()), []);
  return { listo: estado !== null, ...(estado ?? ({} as Partial<EstadoAdmin>)), publicarMetodo, retirarMetodo, publicarVigencia, publicarVistos, publicarPlantilla, publicarTextos, solicitarBaja, decidirBaja, enviarAviso, ejecutarBaja, suspenderFuente, registrarCorreccion, probarFuente, decidirRestablecimiento, regularizar, inactivarInstitucion, avanzarInactivacion, registrarFusion, sincronizarFusiones, guardarPrecarga, probarPrecarga, activarPrecarga, habilitarAdministrador, reiniciar };
}
