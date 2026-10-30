"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CalendarClock, CheckCircle2, Play, Square, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { formatoFecha, numero, parametrosVigentes, saldoAcceso, useConsumoStore, type AccesoApi, type EstadoProgramacion, type ProgramacionMasiva } from "../data/consumo-store";

const TONO: Record<EstadoProgramacion, "neutral" | "info" | "warning" | "success" | "danger"> = {
  Borrador: "neutral",
  Enviada: "info",
  Observada: "warning",
  Coordinada: "info",
  Aprobada: "success",
  Rechazada: "danger",
  "Pendiente de aplicación": "warning",
  "En ejecución": "info",
  Completada: "success",
  Cancelada: "neutral",
  Suspendida: "danger",
};

// Hora local de Ecuador (UTC-5, sin cambio horario)
const aUtc = (local: string) => new Date(`${local}:00-05:00`);

function fueraDeFranja(local: string, inicio: string, fin: string, finesDeSemana: boolean) {
  const d = aUtc(local);
  const hora = new Date(d.getTime() - 5 * 3600000).getUTCHours() * 60 + new Date(d.getTime() - 5 * 3600000).getUTCMinutes();
  const dow = new Date(d.getTime() - 5 * 3600000).getUTCDay();
  if (finesDeSemana && (dow === 0 || dow === 6)) return false;
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  const i = hi * 60 + mi;
  const f = hf * 60 + mf;
  return i > f ? !(hora >= i || hora < f) : !(hora >= i && hora < f);
}

function Tarjeta({ p }: { p: ProgramacionMasiva }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const par = parametrosVigentes(st.parametros);
  const [obs, setObs] = useState("");
  const [alterna, setAlterna] = useState("");
  const [hilos, setHilos] = useState(String(p.hilos));
  const [motivo, setMotivo] = useState("");
  const accion = (estado: EstadoProgramacion, texto: string, extra: Partial<ProgramacionMasiva> = {}, detalle?: string) => st.mutarProgramacion(p.id, estado, actor, texto, extra, detalle);
  return (
    <div className="rounded-xl border border-border p-3.5 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary">{p.id}</span>
          <Badge tone={TONO[p.estado]} appearance="soft" size="sm">
            {p.estado}
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">PAR-18 v{p.versionPar18}</span>
        </div>
        <span className="text-muted-foreground">
          {p.inicioLocal.replace("T", " ")} → {p.finLocal.replace("T", " ")} (America/Guayaquil)
        </span>
      </div>
      <p className="text-muted-foreground">
        {numero(p.cantidad)} registros · {p.hilos} hilos × {numero(p.registrosPorHilo)} · {p.forma}
        {p.ajuste && <span className="text-foreground"> · Ajuste de Tecnología: {p.ajuste}</span>}
      </p>
      {p.observacion && <p className="text-warning">Observación de DGR: {p.observacion} {p.ventanaAlternativa && `· Ventana alternativa: ${p.ventanaAlternativa}`}</p>}
      {p.motivoRechazo && <p className="text-danger">Rechazada: {p.motivoRechazo}</p>}
      {p.resumen && (
        <p className="text-foreground">
          Resumen: {numero(p.resumen.procesados)} procesados · {numero(p.resumen.conError)} con error · {numero(p.resumen.rechazados)} rechazados (429). Lo no consumido en la ventana no se consume después.
        </p>
      )}

      {/* Coordinador */}
      {rol === "COORDINADOR_SINARP" && ["Enviada", "Observada", "Coordinada", "Aprobada"].includes(p.estado) && (
        <div className="flex flex-wrap gap-2">
          {p.estado === "Observada" && (
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => accion("Enviada", "Programación ajustada y reenviada")}>
              Reenviar ajustada
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { accion("Cancelada", "Cancelada por el Coordinador"); toast.info("Programación cancelada"); }}>
            Cancelar antes del inicio
          </Button>
        </div>
      )}

      {/* DGR */}
      {rol === "DGR" && p.estado === "Enviada" && (
        <div className="space-y-2 rounded-lg bg-muted/30 border border-border p-3">
          <p className="font-semibold text-foreground">Coordinar fecha y hora con la consumidora</p>
          <Input aria-label="Observación" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observación (obligatoria si observas)" className="text-xs" />
          <Input aria-label="Ventana alternativa" value={alterna} onChange={(e) => setAlterna(e.target.value)} placeholder="Ventana alternativa, p. ej. 2026-11-08 22:00 a 02:00" className="text-xs" />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { accion("Coordinada", "Coordinada con la consumidora"); toast.success("Programación coordinada"); }}>
              Coordinada
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-xs text-warning border-warning/40" disabled={!obs.trim() || !alterna.trim()} onClick={() => { accion("Observada", "Observada por DGR", { observacion: obs.trim(), ventanaAlternativa: alterna.trim() }); toast.warning("Observada: vuelve al Coordinador"); }}>
              Observada
            </Button>
          </div>
        </div>
      )}

      {/* DTD */}
      {rol === "DTD" && p.estado === "Coordinada" && (
        <div className="space-y-2 rounded-lg bg-muted/30 border border-border p-3">
          <p className="font-semibold text-foreground">Analizar los parámetros (puedes reducir, nunca aumentar)</p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1 w-28">
              <Label htmlFor={`h-${p.id}`} className="text-[11px] text-muted-foreground">
                Hilos aprobados
              </Label>
              <Input id={`h-${p.id}`} type="number" min={1} max={p.hilos} value={hilos} onChange={(e) => setHilos(e.target.value)} className="text-xs font-mono" />
            </div>
            <Button type="button" size="sm" variant="primary" disabled={!(parseInt(hilos) >= 1 && parseInt(hilos) <= p.hilos)} className="text-xs gap-1" onClick={() => { const h = parseInt(hilos); accion("Aprobada", "Aprobada por Tecnología", h < p.hilos ? { hilos: h, ajuste: `hilos de ${p.hilos} a ${h}` } : {}); toast.success("Programación aprobada"); }}>
              <CheckCircle2 className="size-3.5" />
              Aprobar
            </Button>
            <Input aria-label="Motivo del rechazo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo del rechazo" className="text-xs w-64" />
            <Button type="button" size="sm" variant="outline" disabled={!motivo.trim()} className="text-xs gap-1 text-danger border-danger/30" onClick={() => { accion("Rechazada", "Rechazada por Tecnología", { motivoRechazo: motivo.trim() }); toast.warning("Programación rechazada"); }}>
              <XCircle className="size-3.5" />
              Rechazar
            </Button>
          </div>
        </div>
      )}

      {/* Ventana: aplicación en Apigee */}
      {(rol === "DTD" || rol === "TI") && p.estado === "Aprobada" && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="primary" className="text-xs gap-1" onClick={() => { accion("En ejecución", "Inicio de ventana", {}, `Límites aprobados aplicados en Apigee (${p.hilos} hilos).`); toast.success("Ventana iniciada: límites aplicados en Apigee"); }}>
            <Play className="size-3.5" />
            Simular inicio de ventana
          </Button>
          <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { accion("Pendiente de aplicación", "Apigee no confirmó la aplicación", {}, `El consumo sigue con los límites estándar (${par?.hilosEstandar ?? "—"} hilos). Alerta a TI.`); toast.warning("Pendiente de aplicación: alerta a TI"); }}>
            Simular fallo de Apigee
          </Button>
        </div>
      )}
      {(rol === "DTD" || rol === "TI") && p.estado === "Pendiente de aplicación" && (
        <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { accion("En ejecución", "Límites aplicados tras reintento"); toast.success("Límites aplicados"); }}>
          Reintentar aplicación
        </Button>
      )}
      {p.estado === "En ejecución" && (rol === "DTD" || rol === "TI") && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="primary" className="text-xs gap-1" onClick={() => { const procesados = Math.round(p.cantidad * 0.92); accion("Completada", "Ventana cerrada", { resumen: { procesados, conError: Math.round(p.cantidad * 0.01), rechazados: Math.round(p.cantidad * 0.02) } }, "Se restablecen los límites estándar de PAR-18."); toast.success("Ventana cerrada; límites estándar restablecidos"); }}>
            <Square className="size-3.5" />
            Simular cierre de ventana
          </Button>
          <Button type="button" size="sm" variant="outline" className="text-xs text-danger border-danger/30" onClick={() => { accion("Suspendida", "Suspendida por Tecnología", {}, "Afecta al servicio en línea (p95 +10 %). Se restablecen los límites estándar y se avisa al Coordinador."); toast.warning("Suspendida"); }}>
            Suspender por afectación al servicio
          </Button>
        </div>
      )}

      <ul className="border-t border-border pt-2 space-y-0.5 text-[11px] text-muted-foreground">
        {[...p.historial].reverse().map((h, i) => (
          <li key={i}>
            {formatoFecha(h.instante)} · {h.accion} · {h.actor}
            {h.detalle ? ` — ${h.detalle}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgramacionPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const par = parametrosVigentes(st.parametros);
  const { saldo } = saldoAcceso(a, st.eventos);
  const [ahoraMs] = useState(() => Date.now());
  const [f, setF] = useState({ inicio: "", fin: "", cantidad: "100000", hilos: "20", porHilo: "5000", forma: "Por script" as ProgramacionMasiva["forma"], justificacion: "" });
  const lista = st.programaciones.filter((p) => p.accesoId === a.id);

  const errores = useMemo(() => {
    const e: string[] = [];
    if (!par) return ["PAR-18 no tiene versión publicada: no se aprueban programaciones."];
    if (!f.inicio || !f.fin) return ["Indica el inicio y el fin de la ventana."];
    const i = aUtc(f.inicio).getTime();
    const fin = aUtc(f.fin).getTime();
    if (fin <= i) e.push("El fin debe ser posterior al inicio.");
    if ((fin - i) / 3600000 > par.duracionMaximaHoras) e.push(`La ventana no puede superar ${par.duracionMaximaHoras} horas.`);
    if ((i - ahoraMs) / 3600000 < par.anticipacionMinimaHoras) e.push(`Debes programar con al menos ${par.anticipacionMinimaHoras} horas de anticipación.`);
    if (!(parseInt(f.hilos) >= 1) || parseInt(f.hilos) > par.maxHilosPorConsumidor) e.push(`Hilos entre 1 y ${par.maxHilosPorConsumidor}.`);
    if (!(parseInt(f.porHilo) >= 1) || !(parseInt(f.cantidad) >= 1)) e.push("Cantidad y registros por hilo deben ser positivos.");
    if (a.tipo === "Privada" && parseInt(f.cantidad) > saldo) e.push(`La cantidad supera el saldo disponible (${numero(saldo)}).`);
    return e;
  }, [f, par, saldo, a.tipo, ahoraMs]);

  const fuera = par && f.inicio ? fueraDeFranja(f.inicio, par.franjaInicio, par.franjaFin, par.incluyeFinesDeSemana) : false;
  const faltaJustificacion = fuera && !f.justificacion.trim();

  return (
    <div className="space-y-5">
      {rol === "COORDINADOR_SINARP" && (
        <Seccion titulo="Programar un consumo masivo (API-06)" descripcion="No es una solicitud de acceso nueva: usa el acceso, la credencial y los campos ya autorizados. Fuera de una programación aprobada rigen los límites estándar y Apigee rechaza el exceso con HTTP 429.">
          {par && (
            <p className="text-[11px] text-muted-foreground">
              PAR-18 v{par.version}: hasta {par.maxHilosPorConsumidor} hilos, ventana máxima {par.duracionMaximaHoras} h, anticipación {par.anticipacionMinimaHoras} h. Franja preferente {par.franjaInicio}–{par.franjaFin}
              {par.incluyeFinesDeSemana ? " y fines de semana" : ""}.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-inicio" className="text-xs text-muted-foreground">Inicio (hora de Ecuador)</Label>
              <Input id="p-inicio" type="datetime-local" value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-fin" className="text-xs text-muted-foreground">Fin (hora de Ecuador)</Label>
              <Input id="p-fin" type="datetime-local" value={f.fin} onChange={(e) => setF({ ...f, fin: e.target.value })} className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Forma de envío</Label>
              <Select value={f.forma} onValueChange={(v) => setF({ ...f, forma: v as ProgramacionMasiva["forma"] })}>
                <SelectTrigger aria-label="Forma de envío" className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Por script">Por script (API-02 una a una)</SelectItem>
                  <SelectItem value="Por petición única">Por petición única (API-03)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-cant" className="text-xs text-muted-foreground">Cantidad de registros</Label>
              <Input id="p-cant" type="number" min={1} value={f.cantidad} onChange={(e) => setF({ ...f, cantidad: e.target.value })} className="text-xs font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-hilos" className="text-xs text-muted-foreground">Número de hilos</Label>
              <Input id="p-hilos" type="number" min={1} value={f.hilos} onChange={(e) => setF({ ...f, hilos: e.target.value })} className="text-xs font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-porhilo" className="text-xs text-muted-foreground">Registros por hilo</Label>
              <Input id="p-porhilo" type="number" min={1} value={f.porHilo} onChange={(e) => setF({ ...f, porHilo: e.target.value })} className="text-xs font-mono" />
            </div>
          </div>
          {fuera && (
            <div className="space-y-1.5">
              <Alert variant="info" icon={<AlertCircle className="size-4" />} title="Fuera de la franja preferente" className="p-3 text-xs">
                Se recomienda programar de noche o en fin de semana. No se bloquea, pero necesitas justificar el horario.
              </Alert>
              <Textarea aria-label="Justificación del horario" value={f.justificacion} onChange={(e) => setF({ ...f, justificacion: e.target.value })} rows={2} placeholder="Justificación del horario" className="text-xs" />
            </div>
          )}
          {errores.length > 0 && f.inicio && (
            <ul className="text-[11px] text-danger list-disc pl-4 space-y-0.5">
              {errores.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={errores.length > 0 || faltaJustificacion}
            className="text-xs font-semibold gap-1.5"
            onClick={() => {
              const id = st.crearProgramacion({ accesoId: a.id, inicioLocal: f.inicio, finLocal: f.fin, cantidad: parseInt(f.cantidad), hilos: parseInt(f.hilos), registrosPorHilo: parseInt(f.porHilo), forma: f.forma, justificacionHorario: fuera ? f.justificacion.trim() : undefined }, actor);
              toast.success(`${id} enviada`, { description: "La Dirección de Gestión y Registro la coordina con la consumidora." });
            }}
          >
            <CalendarClock className="size-4" />
            Enviar programación
          </Button>
        </Seccion>
      )}

      <Seccion titulo="Programaciones de este acceso" descripcion="DGR coordina la fecha; Tecnología y Desarrollo aprueba y aplica los límites en Apigee solo durante la ventana. Durante y después se ve el seguimiento a partir de los eventos de API-04.">
        {lista.length === 0 ? <p className="text-xs text-muted-foreground">Todavía no hay programaciones.</p> : <div className="space-y-3">{[...lista].reverse().map((p) => <Tarjeta key={p.id} p={p} />)}</div>}
      </Seccion>
    </div>
  );
}
