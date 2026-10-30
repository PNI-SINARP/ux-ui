"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Play, ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { MAX_REGISTROS_POR_SEGMENTO, formatoFecha, numero, saldoAcceso, useConsumoStore, type AccesoApi, type ResultadoConsulta } from "../data/consumo-store";

function Resultado({ r }: { r: ResultadoConsulta | null }) {
  if (!r) return null;
  return (
    <Alert variant={r.ok ? (r.parcial ? "warning" : "success") : "danger"} icon={r.ok ? <CheckCircle2 className="size-4" /> : <ShieldAlert className="size-4" />} title={r.parcial ?? (r.ok ? "Respuesta correcta" : r.codigo ?? "Sin entrega")} className="p-3 text-xs">
      <p>{r.mensaje}</p>
      {!r.ok && r.codigo && <pre className="mt-1.5 rounded bg-background/60 p-2 font-mono text-[11px] overflow-x-auto">{JSON.stringify({ codigo: r.codigo, mensaje: r.mensaje }, null, 2)}</pre>}
      {r.cursor && <p className="font-mono text-[11px] mt-1">cursor: {r.cursor}</p>}
    </Alert>
  );
}

export function PruebasPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const [token, setToken] = useState(a.token);
  const [campo, setCampo] = useState(a.camposAutorizados[0] ?? "");
  const [res, setRes] = useState<ResultadoConsulta | null>(null);
  return (
    <Seccion titulo="Probar la credencial en Pruebas (API-01)" descripcion="Las pruebas no descuentan cupo. Si el tipo de dato de pruebas es Real o Indeterminado, el ambiente responde 403 aunque la credencial sea válida.">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Tipo de datos de pruebas (FUE-04):</span>
        <Badge tone={a.tipoDatoPruebas === "Sintético" || a.tipoDatoPruebas === "Anonimizado" ? "success" : "danger"} appearance="soft" size="sm">
          {a.tipoDatoPruebas}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="token-prueba" className="text-xs text-muted-foreground">
            Token
          </Label>
          <Input id="token-prueba" value={token} onChange={(e) => setToken(e.target.value)} className="text-xs font-mono" />
          <p className="text-[11px] text-muted-foreground">Prueba también «tok-vencido» o uno inválido.</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Campo / parámetro</Label>
          <Select value={campo} onValueChange={setCampo}>
            <SelectTrigger aria-label="Campo" className="h-10 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {a.catalogoCampos.map((c) => (
                <SelectItem key={c.campo} value={c.campo}>
                  {c.campo}
                  {a.camposAutorizados.includes(c.campo) ? "" : " (no autorizado)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5" onClick={() => setRes(st.probar(a.id, token, campo))}>
          <Play className="size-3.5" />
          Probar
        </Button>
      </div>
      <Resultado r={res} />
      {res && !res.ok && res.codigo?.startsWith("REF-") && <p className="text-[11px] text-muted-foreground">Si persiste, crea un ticket (INC-01) con el código de referencia; no se copian secretos.</p>}
    </Seccion>
  );
}

export function ConsultaPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const [campo, setCampo] = useState(a.camposAutorizados[0] ?? "");
  const [devuelve, setDevuelve] = useState("10");
  const [identificador, setIdentificador] = useState("1718956234");
  const [escenario, setEscenario] = useState<"ok" | "fallo" | "incierto">("ok");
  const [solicitados, setSolicitados] = useState("2500");
  const [falla, setFalla] = useState("ninguna");
  const [r1, setR1] = useState<ResultadoConsulta | null>(null);
  const [r2, setR2] = useState<ResultadoConsulta | null>(null);
  const { saldo } = saldoAcceso(a, st.eventos);
  return (
    <div className="space-y-5">
      <Seccion titulo="Consulta por API (API-02)" descripcion="Cada petición valida solicitud, campos y cupo. Puede devolver varios registros y se descuentan los efectivamente entregados.">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Campo consultado</Label>
            <Select value={campo} onValueChange={setCampo}>
              <SelectTrigger aria-label="Campo consultado" className="h-10 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {a.catalogoCampos.map((c) => (
                  <SelectItem key={c.campo} value={c.campo}>
                    {c.campo}
                    {a.camposAutorizados.includes(c.campo) ? "" : " (no autorizado)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="devuelve" className="text-xs text-muted-foreground">
              Registros que devuelve la fuente
            </Label>
            <Input id="devuelve" type="number" min={1} value={devuelve} onChange={(e) => setDevuelve(e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="identificador" className="text-xs text-muted-foreground">
              Cédula consultada (parámetro es_identificador_persona)
            </Label>
            <Input id="identificador" value={identificador} onChange={(e) => setIdentificador(e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Resultado simulado</Label>
            <Select value={escenario} onValueChange={(v) => setEscenario(v as typeof escenario)}>
              <SelectTrigger aria-label="Resultado simulado" className="h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ok">Entrega correcta</SelectItem>
                <SelectItem value="fallo">Falla antes de entregar</SelectItem>
                <SelectItem value="incierto">Entrega incierta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5" onClick={() => setR1(st.consultar(a.id, { campo, devuelve: Math.max(1, parseInt(devuelve) || 1), escenario, identificador: identificador.trim() || undefined }))}>
            <Play className="size-3.5" />
            Consultar
          </Button>
        </div>
        <Resultado r={r1} />
      </Seccion>

      <Seccion titulo="Consulta masiva por API (API-03)" descripcion={`Misma credencial y límites de PAR-13: segmentos de hasta ${numero(MAX_REGISTROS_POR_SEGMENTO)} registros, uno a la vez. No es la extracción en archivo.`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="solicitados" className="text-xs text-muted-foreground">
              Registros solicitados
            </Label>
            <Input id="solicitados" type="number" min={1} value={solicitados} onChange={(e) => setSolicitados(e.target.value)} className="text-xs font-mono" />
            {a.tipo === "Privada" && <p className="text-[11px] text-muted-foreground">Saldo disponible: {numero(saldo)}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Falla en el segmento</Label>
            <Select value={falla} onValueChange={setFalla}>
              <SelectTrigger aria-label="Falla en el segmento" className="h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguna">Ninguna</SelectItem>
                <SelectItem value="2">Segmento 2</SelectItem>
                <SelectItem value="3">Segmento 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5" onClick={() => setR2(st.consultarMasivo(a.id, Math.max(1, parseInt(solicitados) || 1), falla === "ninguna" ? null : parseInt(falla)))}>
            <Play className="size-3.5" />
            Consultar en masa
          </Button>
        </div>
        <Resultado r={r2} />
        {r2?.segmentos ? <p className="text-[11px] text-muted-foreground">{r2.segmentos} segmento(s) con reserva y confirmación atómicas por operación.</p> : null}
      </Seccion>
    </div>
  );
}

export function SaldoPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol } = useActor();
  const { consumido, reservado, saldo } = saldoAcceso(a, st.eventos);
  const pct = (n: number) => Math.min(100, Math.max(0, (n / a.cupoAutorizado) * 100));
  const mios = [...st.eventos].filter((e) => e.accesoId === a.id).reverse();
  const puedeConciliar = rol === "TI" || rol === "DTD" || rol === "DIR_GESTION" || rol === "EQ_GESTION" || rol === "ADMIN";
  const excede = a.tipo === "Pública" && consumido > a.cupoAutorizado;
  return (
    <div className="space-y-5">
      <Seccion titulo={a.tipo === "Privada" ? "Saldo del cupo autorizado (API-05)" : "Referencia de alertas (API-05)"} descripcion={a.tipo === "Privada" ? "saldo = cupo autorizado − entregado − reservas pendientes. Al agotarse se bloquea y se ofrece renovar (ADD-03)." : "En una solicitud pública el cupo solicitado es solo una referencia para alertas: no bloquea ni se factura."}>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden flex" role="img" aria-label={`Consumido ${numero(consumido)}, reservado ${numero(reservado)}, saldo ${numero(saldo)}`}>
          <div className="bg-success" style={{ width: `${pct(consumido)}%` }} />
          <div className="bg-warning" style={{ width: `${pct(reservado)}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <span className="text-muted-foreground">{a.tipo === "Privada" ? "Cupo" : "Referencia"}: <strong className="text-foreground font-mono">{numero(a.cupoAutorizado)}</strong></span>
          <span className="text-success">Entregado: <strong className="font-mono">{numero(consumido)}</strong></span>
          <span className="text-warning">Reservado: <strong className="font-mono">{numero(reservado)}</strong></span>
          <span className="text-muted-foreground">{a.tipo === "Privada" ? "Saldo" : "Diferencia"}: <strong className={cn("font-mono", saldo < 0 ? "text-danger" : "text-foreground")}>{numero(saldo)}</strong></span>
        </div>
        {excede && (
          <Alert variant="warning" icon={<AlertCircle className="size-4" />} title="Superaste la referencia" className="p-3 text-xs">
            Alerta para Gestión; el consumo continúa y no se factura por este hecho.
          </Alert>
        )}
        {a.tipo === "Privada" && saldo <= 0 && (
          <Alert variant="danger" icon={<ShieldAlert className="size-4" />} title="Cupo agotado" className="p-3 text-xs">
            Las consultas se bloquean. Genera una renovación desde la pestaña Ampliaciones (ADD-03).
          </Alert>
        )}
      </Seccion>

      <Seccion titulo="Eventos de consumo (API-04)" descripcion="Cada entrega es una reserva durable que se convierte en evento inmutable. Un reintento del mismo id_operacion/id_segmento no duplica consumo; la entrega incierta queda Pendiente de conciliación.">
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-0">
                <TableHead className="text-xs font-bold text-white pl-4">Evento</TableHead>
                <TableHead className="text-xs font-bold text-white">Origen</TableHead>
                <TableHead className="text-xs font-bold text-white">Entorno</TableHead>
                <TableHead className="text-xs font-bold text-white">Resultado</TableHead>
                <TableHead className="text-xs font-bold text-white">Reservada / entregada</TableHead>
                <TableHead className="text-xs font-bold text-white">Estado</TableHead>
                <TableHead className="text-xs font-bold text-white pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mios.slice(0, 15).map((e) => (
                <TableRow key={e.idEvento}>
                  <TableCell className="pl-4 text-[11px] font-mono">
                    <div>{e.idEvento}</div>
                    <div className="text-muted-foreground">{formatoFecha(e.instante)}</div>
                  </TableCell>
                  <TableCell className="text-xs">{e.origen}</TableCell>
                  <TableCell className="text-xs">{e.entorno}</TableCell>
                  <TableCell className="text-xs">{e.resultado}</TableCell>
                  <TableCell className="text-xs font-mono">
                    {numero(e.reservada)} / {numero(e.entregada)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={e.estado === "Confirmado" ? "success" : e.estado === "Liberado" ? "neutral" : "warning"} appearance="soft" size="sm" className="whitespace-nowrap">
                      {e.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {e.estado === "Pendiente de conciliación" && puedeConciliar && (
                      <span className="flex gap-1.5 justify-end">
                        <Button type="button" size="sm" variant="primary" className="text-[11px] h-8 px-2.5" onClick={() => { st.conciliarEvento(e.idEvento, true); toast.success("Entrega confirmada"); }}>
                          Se entregó
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="text-[11px] h-8 px-2.5" onClick={() => { st.conciliarEvento(e.idEvento, false); toast.info("Reserva liberada; reintento habilitado"); }}>
                          No se entregó
                        </Button>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Seccion>
    </div>
  );
}
