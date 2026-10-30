"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, AlertTriangle, Plus, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ExcepcionalShell, Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { numero as nConsumo, saldoAcceso, useConsumoStore, type AccesoApi, type EventoConsumo } from "@/modules/consumo-api/data/consumo-store";
import { formatoFecha, parametrosActivos, useOperacionStore, type Componente, type ParametrosMonitoreo, type TipoComponente } from "../data/operacion-store";

/** OPS-01 CA1: proximidad al cupo y anomalía por tasa frente a la línea base (PAR-06). */
export function evaluarConsumo(a: AccesoApi, eventos: EventoConsumo[], par: ParametrosMonitoreo, ahora = Date.now()) {
  const mios = eventos.filter((e) => e.accesoId === a.id && e.entorno === "Producción" && e.estado === "Confirmado");
  const { consumido, saldo } = saldoAcceso(a, eventos);
  const proximidad = a.cupoAutorizado > 0 ? consumido / a.cupoAutorizado : null;
  const dur = par.duracionVentanaMin * 60000;
  const tasa = (i: number) => mios.filter((e) => { const t = new Date(e.instante).getTime(); return t > ahora - (i + 1) * dur && t <= ahora - i * dur; }).reduce((s, e) => s + e.entregada, 0) / par.duracionVentanaMin;
  const previas = Array.from({ length: par.ventanasLineaBase }, (_, i) => tasa(i + 1));
  const linea = previas.reduce((s, v) => s + v, 0) / par.ventanasLineaBase;
  const actual = tasa(0);
  const evaluable = previas.some((v) => v > 0);
  const umbral = Math.max(par.umbralMinimo / 1, par.factorDesviacion * linea);
  return { consumido, saldo, proximidad, cerca: proximidad !== null && proximidad >= par.umbralProximidad, agotado: a.tipo === "Privada" && saldo <= 0, actual, linea, evaluable, anomalia: evaluable && actual >= umbral };
}

function ConsumoTab() {
  const co = useConsumoStore();
  const op = useOperacionStore();
  const { rol, actor, institucion } = useActor();
  const par = parametrosActivos(op.parametros);
  const esGestion = rol === "DIR_GESTION" || rol === "EQ_GESTION";
  const accesos = rol === "COORDINADOR_SINARP" ? co.accesos.filter((a) => a.institucion === institucion) : co.accesos;
  const [motivo, setMotivo] = useState("");
  if (!par) return <p className="text-xs text-danger">PAR-06 no tiene versión publicada: las alertas muestran «Sin regla».</p>;

  return (
    <div className="space-y-5">
      <Seccion titulo="Consumo por solicitud (OPS-01)" descripcion={`Regla: proximidad ≥ ${par.umbralProximidad * 100}% del cupo; anomalía si la tasa de la última ventana de ${par.duracionVentanaMin} min ≥ máx(${par.umbralMinimo} reg/min, ${par.factorDesviacion} × línea base de ${par.ventanasLineaBase} ventana(s) previa(s)). PAR-06 v${par.version}.`}>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-0">
                <TableHead className="text-xs font-bold text-white pl-4">Solicitud</TableHead>
                <TableHead className="text-xs font-bold text-white">Entregado / cupo</TableHead>
                <TableHead className="text-xs font-bold text-white">Tasa actual / base</TableHead>
                <TableHead className="text-xs font-bold text-white">Alertas</TableHead>
                <TableHead className="text-xs font-bold text-white pr-4">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accesos.map((a) => {
                const ev = evaluarConsumo(a, co.eventos, par);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="pl-4 text-xs">
                      <div className="font-mono font-semibold text-primary">{a.id}</div>
                      <div className="text-muted-foreground">{a.institucion} · {a.fuente} · {a.tipo}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {nConsumo(ev.consumido)} / {nConsumo(a.cupoAutorizado)}
                      <div className="text-muted-foreground">{ev.proximidad !== null ? `${(ev.proximidad * 100).toFixed(1)} %` : "No calculable"}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {ev.actual.toFixed(1)} / {ev.evaluable ? ev.linea.toFixed(1) : "—"} reg/min
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-1">
                        {ev.agotado && <Badge tone="danger" appearance="soft" size="sm">Cupo agotado (bloqueo)</Badge>}
                        {!ev.agotado && ev.cerca && <Badge tone="warning" appearance="soft" size="sm">{a.tipo === "Privada" ? "Cerca del cupo" : "Cerca de la referencia (no bloquea)"}</Badge>}
                        {ev.anomalia ? <Badge tone="danger" appearance="soft" size="sm">Anomalía</Badge> : !ev.evaluable ? <Badge tone="neutral" appearance="soft" size="sm">No evaluable</Badge> : <Badge tone="success" appearance="soft" size="sm">Sin anomalía</Badge>}
                      </div>
                      {a.tipo === "Privada" && (ev.cerca || ev.agotado) && rol === "COORDINADOR_SINARP" && <p className="text-[11px] text-muted-foreground mt-1">Puedes generar una renovación (ADD-03) en Consumo por API.</p>}
                    </TableCell>
                    <TableCell className="pr-4">
                      {esGestion && ev.anomalia && (
                        <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { op.abrirRevision(a.id, `Últimas ${par.duracionVentanaMin} min`, actor); toast.success("Anomalía enviada a revisión"); }}>
                          Revisar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Seccion>

      {esGestion && (
        <Seccion titulo="Revisión de anomalías (OPS-02)" descripcion="Pendiente → En análisis → Confirmada, Descartada o Información solicitada. Si la consumidora no responde en el plazo, pasa a Sin respuesta; nunca se confirma por silencio.">
          {op.revisiones.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay anomalías en revisión.</p>
          ) : (
            <div className="space-y-3">
              {[...op.revisiones].reverse().map((r) => (
                <div key={r.id} className="rounded-xl border border-border p-3 text-xs space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-primary">{r.id}</span>
                    <Badge tone={r.estado === "Confirmada" || r.estado === "Sin respuesta" ? "danger" : r.estado === "Descartada" ? "neutral" : "warning"} appearance="soft" size="sm">{r.estado}</Badge>
                    <span className="text-muted-foreground">{r.accesoId} · {r.periodo}</span>
                  </div>
                  {r.estado === "Información solicitada" && (
                    <p className="text-muted-foreground">
                      {r.notificacionEntregada ? `Plazo de respuesta hasta ${formatoFecha(r.fechaLimiteRespuesta)} (5 días hábiles).` : "Notificación pendiente de entrega: el plazo no corre hasta confirmarla."}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {r.estado === "Pendiente" && <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => op.mutarRevision(r.id, "En análisis", actor, "Pasa a análisis")}>Iniciar análisis</Button>}
                    {r.estado === "En análisis" && (
                      <>
                        <Input aria-label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo de la decisión" className="text-xs w-64" />
                        <Button type="button" size="sm" variant="primary" disabled={!motivo.trim()} className="text-xs" onClick={() => { op.mutarRevision(r.id, "Confirmada", actor, "Anomalía confirmada", { motivo }); setMotivo(""); toast.success("Revisión de anomalía guardada"); }}>Confirmar</Button>
                        <Button type="button" size="sm" variant="outline" disabled={!motivo.trim()} className="text-xs" onClick={() => { op.mutarRevision(r.id, "Descartada", actor, "Anomalía descartada", { motivo }); setMotivo(""); toast.success("Revisión de anomalía guardada"); }}>Descartar</Button>
                        <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { op.mutarRevision(r.id, "Información solicitada", actor, "Información solicitada a la consumidora", { notificacionEntregada: false }); toast.info("Información solicitada · Notificación pendiente"); }}>Solicitar información</Button>
                      </>
                    )}
                    {r.estado === "Información solicitada" && (
                      <>
                        {!r.notificacionEntregada && <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => op.mutarRevision(r.id, "Información solicitada", actor, "Entrega del aviso confirmada (AUD-01)", { notificacionEntregada: true, fechaLimiteRespuesta: new Date(Date.now() + 7 * 86400000).toISOString() })}>Confirmar entrega del aviso</Button>}
                        <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => op.mutarRevision(r.id, "En análisis", actor, "Datos recibidos; vuelve a análisis")}>Recibí los datos</Button>
                        {r.notificacionEntregada && <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { op.mutarRevision(r.id, "Sin respuesta", actor, "Venció el plazo sin respuesta"); toast.warning("Sin respuesta: alerta al Director de Gestión; puedes abrir un incidente"); }}>Simular vencimiento del plazo</Button>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Seccion>
      )}
    </div>
  );
}

function evaluarSla(c: Componente, m: ReturnType<typeof useOperacionStore>["metricas"][number] | undefined, par: ParametrosMonitoreo | undefined) {
  if (!c.puntoSla || !par || !m) return { texto: "—", tono: "neutral" as const, disp: null as number | null };
  if (m.muestrasEsperadas === 0) return { texto: "No evaluable", tono: "neutral" as const, disp: null };
  const disp = (100 * m.muestrasExitosas) / m.muestrasEsperadas;
  const cumple = disp >= par.disponibilidadObjetivo && (m.latenciaMaxMs ?? Infinity) <= par.latenciaMaximaMs;
  return { texto: cumple ? "Cumple" : "Incumple", tono: cumple ? ("success" as const) : ("danger" as const), disp };
}

function InfraestructuraTab() {
  const op = useOperacionStore();
  const { rol, actor } = useActor();
  const par = parametrosActivos(op.parametros);
  const esTI = rol === "TI" || rol === "DTD" || rol === "ADMIN";
  const [nuevo, setNuevo] = useState(false);
  const [f, setF] = useState({ tipo: "Servicio" as TipoComponente, nombre: "", destino: "", frecuencia: "60", fuente: "" });
  const [esc, setEsc] = useState<"normal" | "degradada" | "sin_telemetria">("normal");
  const metricaDe = (id: string) => op.metricas.find((m) => m.componenteId === id);
  const alertas = useMemo(() => [...op.alertas].reverse(), [op.alertas]);

  return (
    <div className="space-y-5">
      <Seccion
        titulo="Tablero de infraestructura y fuentes (OPS-03)"
        descripcion="Healthchecks y métricas de la última ventana. El punto SLA de cada fuente se compara con disponibilidad y latencia objetivo; un dato faltante figura como «Sin telemetría» y nunca como saludable."
        acciones={
          esTI && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-48">
                <Select value={esc} onValueChange={(v) => setEsc(v as typeof esc)}>
                  <SelectTrigger aria-label="Escenario de la ventana" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Ventana normal</SelectItem>
                    <SelectItem value="degradada">Ventana degradada</SelectItem>
                    <SelectItem value="sin_telemetria">Sin telemetría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="sm" variant="primary" className="text-xs gap-1.5" onClick={() => { const n = op.recolectar(esc); toast[n ? "warning" : "success"](n ? `${n} alerta(s) generadas por PAR-06` : "Ventana recolectada sin alertas"); }}>
                <Activity className="size-3.5" />
                Recolectar ventana
              </Button>
            </div>
          )
        }
      >
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-0">
                <TableHead className="text-xs font-bold text-white pl-4">Componente</TableHead>
                <TableHead className="text-xs font-bold text-white">Healthchecks</TableHead>
                <TableHead className="text-xs font-bold text-white">Latencia máx.</TableHead>
                <TableHead className="text-xs font-bold text-white">Tasa de error</TableHead>
                <TableHead className="text-xs font-bold text-white">Cola / CPU / Mem.</TableHead>
                <TableHead className="text-xs font-bold text-white pr-4">SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {op.componentes.map((c) => {
                const m = metricaDe(c.id);
                const sla = evaluarSla(c, m, par);
                const sinT = m?.sinTelemetria;
                const tasa = m && m.peticionesTotales > 0 ? m.peticionesFallidas / m.peticionesTotales : null;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="pl-4 text-xs">
                      <div className="font-semibold text-foreground">{c.nombre}</div>
                      <div className="text-muted-foreground font-mono text-[11px]">{c.id} · {c.tipo} · {c.estado}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{sinT ? <Badge tone="warning" appearance="soft" size="sm">Sin telemetría</Badge> : m ? `${m.muestrasExitosas}/${m.muestrasEsperadas}${sla.disp !== null ? ` · ${sla.disp.toFixed(1)}%` : ""}` : "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{sinT ? "—" : m?.latenciaMaxMs !== null && m ? `${m.latenciaMaxMs} ms` : "Sin respuesta"}</TableCell>
                    <TableCell className="text-xs font-mono">{sinT ? "—" : tasa !== null ? `${(tasa * 100).toFixed(2)} %` : m?.peticionesTotales === 0 ? "Sin tráfico" : "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{sinT || !m ? "—" : `${m.profundidadCola} / ${m.cpu}% / ${m.memoria}%`}</TableCell>
                    <TableCell className="pr-4">
                      <Badge tone={sla.tono} appearance="soft" size="sm">{sla.texto}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Seccion>

      <Seccion titulo="Alertas de monitoreo (OPS-05)" descripcion="Cada alerta guarda severidad, valor medido, umbral y versión de PAR-06. Puede abrir un incidente o, si falla una fuente, disparar la suspensión (FUE-10).">
        {alertas.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin alertas. Recolecta una ventana degradada para ver el comportamiento.</p>
        ) : (
          <ul className="space-y-2">
            {alertas.slice(0, 12).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                <span className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className={cn("size-4", a.severidad === "Crítica" ? "text-danger" : "text-warning")} />
                  <span className="font-mono font-semibold">{a.componenteId}</span>
                  <span>{a.metrica}: {a.valorMedido} (umbral {a.umbral})</span>
                  <Badge tone={a.severidad === "Crítica" ? "danger" : "warning"} appearance="soft" size="sm">{a.severidad}</Badge>
                  <span className="text-muted-foreground">PAR-06 v{a.versionPar06} · {formatoFecha(a.instante)}</span>
                </span>
                {esTI && (
                  <span className="flex gap-1.5">
                    <Button type="button" size="sm" variant="outline" className="text-[11px] h-8 px-2.5 gap-1" onClick={() => { const r = op.crearIncidente({ objetoTipo: "Componente", objetoId: a.componenteId, sintoma: `Alerta ${a.metrica}: ${a.valorMedido} supera ${a.umbral}.`, evidencia: [a.id], institucion: "DINARP", origen: "Sistema" }, actor); toast.success(r.mensaje); }}>
                      <Siren className="size-3.5" />
                      Abrir incidente
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="text-[11px] h-8 px-2.5" onClick={() => toast.warning("FUE-10: suspensión de la fuente iniciada por fallo previo al retiro")}>
                      Suspender fuente
                    </Button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion titulo="Inventario de componentes (OPS-04)" descripcion="Un solo punto SLA Activo por fuente y entorno. Para ponerlo en mantenimiento o retirarlo se exige un sucesor Activo; el retiro no borra métricas ni incidentes." acciones={esTI && <Button type="button" size="sm" variant="primary" className="text-xs gap-1.5" onClick={() => setNuevo(true)}><Plus className="size-3.5" />Registrar componente</Button>}>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {op.componentes.map((c) => (
            <li key={c.id} className="rounded-lg border border-border px-3 py-2 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{c.nombre}</span>
                <span className="flex gap-1">
                  {c.puntoSla && <Badge tone="info" appearance="soft" size="sm">Punto SLA</Badge>}
                  <Badge tone={c.estado === "Activo" ? "success" : "neutral"} appearance="soft" size="sm">{c.estado}</Badge>
                </span>
              </div>
              <p className="text-muted-foreground font-mono text-[11px]">{c.id} · {c.tipo} · {c.entorno} · cada {c.frecuenciaSegundos}s · {c.destino}</p>
              {esTI && c.estado === "Activo" && (
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 px-2" onClick={() => { const r = op.cambiarEstadoComponente(c.id, "En mantenimiento"); (r.ok ? toast.success : toast.error)(r.mensaje); }}>Mantenimiento</Button>
                  <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 px-2" onClick={() => { const r = op.cambiarEstadoComponente(c.id, "Retirado"); (r.ok ? toast.success : toast.error)(r.mensaje); }}>Retirar</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Seccion>

      <Dialog open={nuevo} onOpenChange={setNuevo}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground">Registrar componente</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">El destino del healthcheck es una URI HTTPS o host:puerto.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select value={f.tipo} onValueChange={(v) => setF({ ...f, tipo: v as TipoComponente })}>
                <SelectTrigger aria-label="Tipo" className="h-10 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{(["VPN", "Conector", "Proxy", "Servicio", "Cola"] as TipoComponente[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cmp-frec" className="text-xs text-muted-foreground">Frecuencia (segundos)</Label>
              <Input id="cmp-frec" type="number" min={1} value={f.frecuencia} onChange={(e) => setF({ ...f, frecuencia: e.target.value })} className="text-xs font-mono" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="cmp-nombre" className="text-xs text-muted-foreground">Nombre</Label>
              <Input id="cmp-nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className="text-xs" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="cmp-destino" className="text-xs text-muted-foreground">Destino del healthcheck</Label>
              <Input id="cmp-destino" value={f.destino} onChange={(e) => setF({ ...f, destino: e.target.value })} placeholder="https://… o host:puerto" className="text-xs font-mono" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setNuevo(false)}>Cancelar</Button>
            <Button type="button" variant="primary" size="sm" disabled={!f.nombre.trim() || !(parseInt(f.frecuencia) > 0)} className="text-xs font-semibold" onClick={() => { const r = op.guardarComponente({ tipo: f.tipo, entorno: "Producción", nombre: f.nombre.trim(), destino: f.destino.trim(), frecuenciaSegundos: parseInt(f.frecuencia), estado: "Activo", puntoSla: false, responsable: actor.nombre, fuente: f.fuente || undefined }); (r.ok ? toast.success : toast.error)(r.mensaje); if (r.ok) { setNuevo(false); setF({ tipo: "Servicio", nombre: "", destino: "", frecuencia: "60", fuente: "" }); } }}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OperacionView() {
  const op = useOperacionStore();
  return (
    <ExcepcionalShell activeMenu="operacion" etiqueta="OPS-01 a OPS-05" titulo="Operación y monitoreo" descripcion="Alertas de consumo para el Coordinador y revisión de anomalías en Gestión; tablero de infraestructura y fuentes, inventario de componentes y recolección de métricas para Tecnología." icono={<Activity className="size-32 text-primary" />}>
      {!op.listo ? (
        <p className="text-xs text-muted-foreground">Cargando…</p>
      ) : (
        <Tabs defaultValue="consumo" className="gap-4">
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="consumo">Consumo y anomalías</TabsTrigger>
            <TabsTrigger value="infra">Infraestructura y fuentes</TabsTrigger>
          </TabsList>
          <TabsContent value="consumo"><ConsumoTab /></TabsContent>
          <TabsContent value="infra"><InfraestructuraTab /></TabsContent>
        </Tabs>
      )}
    </ExcepcionalShell>
  );
}
