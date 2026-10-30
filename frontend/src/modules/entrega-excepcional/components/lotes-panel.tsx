"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Download, Play, RotateCcw, ShieldAlert, Timer, Wrench } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MAX_REINTENTOS_LOTE,
  diasParaVencer,
  estaVigente,
  formatoFecha,
  numero,
  saldoAutorizacion,
  useExcepcionalStore,
  type EscenarioLote,
  type LoteExtraccion,
  type SolicitudExcepcional,
} from "../data/excepcional-store";
import { EstadoLoteBadge, Seccion, useActor } from "./excepcional-ui";

const ESCENARIOS: { valor: EscenarioLote; etiqueta: string }[] = [
  { valor: "completado", etiqueta: "Extracción completada" },
  { valor: "sin_datos", etiqueta: "Sin datos (0 registros)" },
  { valor: "fallido", etiqueta: "Falla al generar el archivo" },
  { valor: "supera_cupo", etiqueta: "Los datos superan el saldo" },
];

function megas(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function BarraCupo({ s }: { s: SolicitudExcepcional }) {
  const { autorizado, consumido, reservado, saldo } = saldoAutorizacion(s);
  const pct = (n: number) => (autorizado ? Math.min(100, (n / autorizado) * 100) : 0);
  return (
    <div className="space-y-2">
      <div className="h-2.5 rounded-full bg-muted overflow-hidden flex" role="img" aria-label={`Consumido ${numero(consumido)}, reservado ${numero(reservado)}, saldo ${numero(saldo)}`}>
        <div className="bg-success" style={{ width: `${pct(consumido)}%` }} />
        <div className="bg-warning" style={{ width: `${pct(reservado)}%` }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <span className="text-muted-foreground">Autorizado: <strong className="text-foreground font-mono">{numero(autorizado)}</strong></span>
        <span className="text-success">Consumido: <strong className="font-mono">{numero(consumido)}</strong></span>
        <span className="text-warning">Reservado: <strong className="font-mono">{numero(reservado)}</strong></span>
        <span className="text-muted-foreground">Saldo: <strong className="text-foreground font-mono">{numero(saldo)}</strong></span>
      </div>
    </div>
  );
}

function LoteCard({ s, l }: { s: SolicitudExcepcional; l: LoteExtraccion }) {
  const st = useExcepcionalStore();
  const { rol, actor } = useActor();
  const esCoordinador = rol === "COORDINADOR_SINARP";
  const esTI = rol === "TI" || rol === "DTD";
  const automaticos = l.intentos.filter((i) => !i.manual).length;
  const expiro = l.fechaExpiracion ? new Date(l.fechaExpiracion) <= new Date() : false;
  const verificadas = l.archivo?.partes.filter((p) => p.verificada).length ?? 0;

  return (
    <div className="rounded-xl border border-border p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-primary">{l.id}</span>
          <EstadoLoteBadge estado={l.estado} />
          <span className="text-[11px] text-muted-foreground font-mono">{l.idOcurrencia} · n={l.indice}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">Programado {l.programadoLocal || formatoFecha(l.programadoUtc)}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <span className="text-muted-foreground">Previstos: <strong className="text-foreground font-mono">{numero(l.registrosPrevistos)}</strong></span>
        <span className="text-muted-foreground">Obtenidos: <strong className="text-foreground font-mono">{l.cantidadRegistros !== undefined ? numero(l.cantidadRegistros) : "—"}</strong></span>
        <span className="text-muted-foreground">Reserva: <strong className="text-foreground">{l.reservaVigente ? "Vigente" : "Liberada"}</strong></span>
        <span className="text-muted-foreground">Consumo confirmado: <strong className="text-foreground font-mono">{numero(l.consumoConfirmado)}</strong></span>
      </div>

      {l.causa && (
        <p className="text-[11px] text-muted-foreground">
          <strong className="text-foreground">Causa:</strong> {l.causa} {l.referencia && <span className="font-mono">({l.referencia})</span>}
        </p>
      )}

      {/* EXT-04 */}
      {(l.estado === "Fallido" || l.estado === "Escalado a TI") && (
        <div className="space-y-2 rounded-lg bg-danger/5 border border-danger/20 p-3">
          <p className="text-[11px] text-foreground">
            Sin URL ni consumo. Reintentos automáticos: <strong>{automaticos} de {MAX_REINTENTOS_LOTE}</strong> (PAR-13). Cada reintento usa la misma fuente, campos y criterio aprobados.
          </p>
          {l.intentos.length > 0 && (
            <ul className="text-[11px] font-mono text-muted-foreground space-y-0.5">
              {l.intentos.map((i) => (
                <li key={i.idIntento}>
                  {i.idIntento} · {formatoFecha(i.instante)} · {i.resultado}
                  {i.manual ? " · manual" : ""}
                </li>
              ))}
            </ul>
          )}
          {l.estado === "Fallido" && (esTI || esCoordinador) && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="primary" className="text-xs gap-1.5" onClick={() => toast.info(st.reintentarLote(s.id, l.id, "completado", false, actor))}>
                <RotateCcw className="size-3.5" />
                Reintentar (resulta bien)
              </Button>
              <Button type="button" size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => toast.warning(st.reintentarLote(s.id, l.id, "fallido", false, actor))}>
                Reintentar (vuelve a fallar)
              </Button>
            </div>
          )}
          {l.estado === "Escalado a TI" && (
            esTI ? (
              estaVigente(s) ? (
                <Button type="button" size="sm" variant="primary" className="text-xs gap-1.5" onClick={() => toast.success(st.reintentarLote(s.id, l.id, "completado", true, actor))}>
                  <Wrench className="size-3.5" />
                  Reintento manual documentado (causa verificada)
                </Button>
              ) : (
                <p className="text-[11px] text-danger">La autorización expiró o cambió: exige una solicitud nueva (EXT-01/EXT-02).</p>
              )
            ) : (
              <p className="text-[11px] text-muted-foreground">Escalado al Equipo de TI; no se ejecutan nuevos intentos automáticos.</p>
            )
          )}
        </div>
      )}

      {/* EXT-05 */}
      {l.estado === "Completado" && l.archivo && (
        <div className="space-y-2.5 rounded-lg bg-success/5 border border-success/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-foreground">
              Archivo {l.archivo.formato} con gzip · {megas(l.archivo.tamanoBytes)} · {l.archivo.partes.length} parte(s) · índice SHA-256 <span className="font-mono">{l.archivo.hashIndice.slice(0, 12)}…</span>
            </span>
            {l.fechaExpiracion && (
              <Badge tone={expiro ? "danger" : "warning"} appearance="outline" size="sm" className="text-[10px] gap-1">
                <Timer className="size-3" />
                {expiro ? "Plazo vencido" : `Descargar antes de ${formatoFecha(l.fechaExpiracion)}`}
              </Badge>
            )}
          </div>
          {!l.enlaceCreado && <p className="text-[11px] text-danger">Sin versión publicada de PAR-04 no se generan enlaces.</p>}
          <p className="text-[11px] text-muted-foreground">
            {l.diasVigenciaEnlace ? `Vigencia del enlace: ${l.diasVigenciaEnlace} días (PAR-04 v${l.versionPar04}). ` : ""}
            Cada parte tiene una URL firmada de corta duración, directa al almacenamiento; los datos no pasan por el Portal. {verificadas} de {l.archivo.partes.length} partes verificadas.
          </p>
          <ul className="space-y-1.5">
            {l.archivo.partes.map((p) => (
              <li key={p.numero} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface border border-border px-2.5 py-1.5 text-[11px]">
                <span className="flex items-center gap-2">
                  {p.verificada ? <CheckCircle2 className="size-3.5 text-success" /> : <Download className="size-3.5 text-muted-foreground" />}
                  <span className="font-semibold">Parte {p.numero}</span>
                  <span className="text-muted-foreground">{megas(p.tamanoBytes)}</span>
                  <span className="font-mono text-muted-foreground">{p.hashSha256.slice(0, 10)}…</span>
                </span>
                {esCoordinador && !p.verificada && l.enlaceCreado && !expiro && (
                  <span className="flex gap-1.5">
                    <Button type="button" size="sm" variant="primary" className="text-[11px] h-8 px-3" onClick={() => toast.success(st.descargarParte(s.id, l.id, p.numero, false, actor))}>
                      Descargar
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="text-[11px] h-8 px-3" onClick={() => toast.warning(st.descargarParte(s.id, l.id, p.numero, true, actor))}>
                      Simular corte
                    </Button>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            {esCoordinador && (
              <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { st.simularFalloCierre(s.id, l.id, "conciliacion", actor); toast.warning("Fallo al registrar el acuse: descarga en conciliación"); }}>
                Simular fallo al confirmar
              </Button>
            )}
            <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { st.vencerEnlace(s.id, l.id, actor); toast.info("Enlace vencido sin descarga; reserva liberada"); }}>
              Simular vencimiento del enlace
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { st.simularFalloCierre(s.id, l.id, "eliminacion", actor); toast.warning("Fallo al borrar el archivo: eliminación pendiente"); }}>
              Simular fallo de borrado
            </Button>
          </div>
        </div>
      )}

      {(l.estado === "Descarga en conciliación" || l.estado === "Eliminación pendiente") && (
        <div className="space-y-2 rounded-lg bg-warning/5 border border-warning/30 p-3">
          <p className="text-[11px] text-foreground">
            <ShieldAlert className="size-3.5 inline mr-1 text-warning" />
            Acceso bloqueado por el Portal. {l.estado === "Descarga en conciliación" ? "Se resuelve el acuse antes de liberar la reserva: el archivo pudo haberse entregado." : "TI reintenta el borrado de forma idempotente hasta confirmarlo."} Sin consumo duplicado.
          </p>
          {esTI && (
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { st.conciliarLote(s.id, l.id, actor); toast.success("Conciliación confirmada"); }}>
              Reintentar conciliación
            </Button>
          )}
        </div>
      )}

      {l.estado === "Vencido" && <p className="text-[11px] text-muted-foreground">El enlace venció sin descarga: archivo eliminado, reserva liberada y consumo cero. Una nueva entrega necesita una ejecución permitida por la autorización vigente.</p>}
      {l.estado === "Descargado" && <p className="text-[11px] text-muted-foreground">Descarga íntegra confirmada una sola vez: las partes y el índice se eliminaron; se conservan metadatos e historial.</p>}
    </div>
  );
}

export function LotesPanel({ s }: { s: SolicitudExcepcional }) {
  const st = useExcepcionalStore();
  const { rol, actor } = useActor();
  const [escenario, setEscenario] = useState<EscenarioLote>("completado");
  const vigente = estaVigente(s);
  const dias = diasParaVencer(s);

  if (!s.autorizacion) {
    return (
      <Seccion titulo="Lotes y descarga">
        <p className="text-xs text-muted-foreground">Solo una autorización <strong>Autorizada</strong> habilita la ejecución de lotes (EXT-03). Estado actual: {s.estado}.</p>
      </Seccion>
    );
  }

  const ejecutados = s.ocurrencias.filter((o) => s.lotes.some((l) => l.idOcurrencia === o.idOcurrencia));
  const puedeEjecutar = rol === "COORDINADOR_SINARP" || rol === "TI" || rol === "DTD";

  return (
    <div className="space-y-5">
      {!vigente && (
        <Alert variant="warning" icon={<AlertCircle className="size-4" />} title={`Autorización ${s.estado.toLowerCase()}`} className="p-3 text-xs">
          Se bloquean las ejecuciones nuevas y los enlaces sin descargar. Los lotes anteriores y su conciliación siguen visibles.
        </Alert>
      )}

      <Seccion titulo="Conciliación entre lo autorizado y lo ejecutado" descripcion="Visible para Gestión y Control y Evaluación. La reserva se hace antes de crear cada lote y el consumo solo se confirma al completar la descarga.">
        <BarraCupo s={s} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">Vigencia</span>
            {formatoFecha(s.autorizacion.vigenciaDesde, false)} → {formatoFecha(s.autorizacion.vigenciaHasta, false)}
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Restan</span>
            {dias !== null && dias > 0 ? `${dias} días` : "Vencida"}
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Ocurrencias ejecutadas</span>
            {ejecutados.length} de {s.ocurrencias.length}
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Lotes</span>
            {s.lotes.length}
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="Ocurrencias programadas"
        descripcion="Un solo lote por ocurrencia: si la ocurrencia ya tiene lote, una repetición devuelve el lote previo."
        acciones={
          puedeEjecutar && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-56">
                <Select value={escenario} onValueChange={(v) => setEscenario(v as EscenarioLote)}>
                  <SelectTrigger aria-label="Resultado simulado" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESCENARIOS.map((e) => (
                      <SelectItem key={e.valor} value={e.valor}>
                        {e.etiqueta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="sm" variant="primary" disabled={!vigente} className="text-xs font-semibold gap-1.5" onClick={() => { const r = st.ejecutarLote(s.id, escenario, actor); (r.ok ? toast.success : toast.error)(r.mensaje); }}>
                <Play className="size-3.5" />
                Ejecutar siguiente ocurrencia
              </Button>
            </div>
          )
        }
      >
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {s.ocurrencias.map((o) => {
            const lote = s.lotes.find((l) => l.idOcurrencia === o.idOcurrencia);
            return (
              <li key={o.idOcurrencia} className={cn("rounded-lg border px-3 py-2 text-[11px] flex items-center justify-between gap-2", lote ? "border-border bg-muted/20" : "border-dashed border-border")}>
                <span className="font-mono text-muted-foreground">
                  n={o.indice} · {o.localResuelta} (UTC{o.desplazamiento})
                </span>
                {lote ? <EstadoLoteBadge estado={lote.estado} /> : <span className="text-muted-foreground">Pendiente</span>}
              </li>
            );
          })}
        </ul>
      </Seccion>

      <Seccion titulo="Lotes" descripcion="Cada ejecución conserva su ID, ocurrencia, causa, intentos y el archivo temporal mientras exista.">
        {s.lotes.length === 0 ? <p className="text-xs text-muted-foreground">Todavía no hay lotes.</p> : <div className="space-y-3">{[...s.lotes].reverse().map((l) => <LoteCard key={l.id} s={s} l={l} />)}</div>}
      </Seccion>
    </div>
  );
}
