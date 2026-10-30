"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { CalendarX2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ExcepcionalShell, Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { FUENTES_PUBLICADAS } from "@/modules/entrega-excepcional/data/excepcional-store";
import { formatoFecha, useAdminStore, type Baja } from "../data/admin-store";

const TONO: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = { Solicitada: "warning", Devuelta: "neutral", Programada: "info", "Retiro técnico pendiente": "danger", Retirada: "success" };

function BajaCard({ b }: { b: Baja }) {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const [motivo, setMotivo] = useState("");
  const dir = rol === "DIR_GESTION";
  const op = rol === "DGR" || rol === "TI" || rol === "DTD" || rol === "ADMIN";
  return (
    <div className="rounded-xl border border-border p-3.5 space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2"><span className="font-mono font-bold text-primary">{b.id}</span><Badge tone={TONO[b.estado]} appearance="soft" size="sm">{b.estado}</Badge></span>
        <span className="text-muted-foreground">Baja el {b.fechaBaja} · {b.fuente} · {b.institucion}</span>
      </div>
      <p className="text-muted-foreground">Impacto: {b.impacto.consumidores} consumidores · {b.impacto.solicitudes} solicitudes · {b.impacto.contratos} contratos · {b.impacto.credenciales} credenciales · {b.impacto.lotes} lotes. No se despublica antes de la fecha ni se borra historia.</p>
      {b.decision && <p className="text-muted-foreground">Decisión: <strong className="text-foreground">{b.decision.resultado}</strong> por {b.decision.actor} · «{b.decision.motivo}»</p>}
      {b.estado === "Solicitada" && dir && (
        <div className="flex flex-wrap items-center gap-2">
          <Input aria-label="Motivo de la decisión" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (obligatorio)" className="text-xs w-72" />
          <Button type="button" size="sm" variant="primary" disabled={!motivo.trim()} className="text-xs" onClick={() => { st.decidirBaja(b.id, "Aprobada", motivo.trim(), actor); setMotivo(""); toast.success("Baja aprobada: se programan los avisos"); }}>Aprobar</Button>
          <Button type="button" size="sm" variant="outline" disabled={!motivo.trim()} className="text-xs" onClick={() => { st.decidirBaja(b.id, "Devuelta", motivo.trim(), actor); setMotivo(""); }}>Devolver</Button>
        </div>
      )}
      {["Programada", "Retiro técnico pendiente", "Retirada"].includes(b.estado) && (
        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">Avisos previos (FUE-09)</p>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {b.avisos.map((a) => (
              <li key={a.diasAntes} className="rounded-lg border border-border p-2 space-y-1">
                <p className="font-semibold">{a.diasAntes} día(s) antes</p>
                <p className="text-[11px] text-muted-foreground">{formatoFecha(a.programadoUtc, false)}</p>
                <Badge tone={a.estado === "Enviado" ? "success" : a.estado === "Fallido" ? "danger" : "neutral"} appearance="soft" size="sm">{a.estado}{a.reintentos ? ` · ${a.reintentos} reintento(s)` : ""}</Badge>
                {op && b.estado === "Programada" && a.estado !== "Enviado" && (
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => st.enviarAviso(b.id, a.diasAntes, false, actor)}>Enviar</Button>
                    <Button type="button" size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => st.enviarAviso(b.id, a.diasAntes, true, actor)}>Falla</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {b.estado === "Programada" && op && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-2">
          <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { st.ejecutarBaja(b.id, true, actor); toast.success("Bloqueo lógico, ACC-06 confirmado y fuente retirada; se abren los casos ECO-01"); }}>Simular fecha efectiva</Button>
          <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { st.ejecutarBaja(b.id, false, actor); toast.warning("Apigee no confirmó: retiro técnico pendiente"); }}>Simular fallo de Apigee</Button>
        </div>
      )}
      {b.estado === "Retiro técnico pendiente" && op && <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { st.ejecutarBaja(b.id, true, actor); toast.success("ACC-06 reintentado: fuente retirada"); }}>Reintentar ACC-06</Button>}
      <ul className="text-[11px] text-muted-foreground border-t border-border pt-1.5">{[...b.historial].reverse().map((h, i) => <li key={i}>{formatoFecha(h.instante)} · {h.accion} · {h.actor}</li>)}</ul>
    </div>
  );
}

function Bajas() {
  const st = useAdminStore();
  const { rol, actor, institucion } = useActor();
  const [fuente, setFuente] = useState(FUENTES_PUBLICADAS[0].nombre);
  const [fecha, setFecha] = useState("");
  return (
    <div className="space-y-5">
      {rol === "COORDINADOR_SINARP" && (
        <Seccion titulo="Solicitar la baja de una fuente (FUE-08)" descripcion="La fecha debe permitir emitir el primer aviso (30 días antes con la versión actual de PAR-10). El Director de Gestión autoriza o devuelve; sin su autorización no se programa.">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-80">
              <Select value={fuente} onValueChange={setFuente}>
                <SelectTrigger aria-label="Fuente" className="h-10 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{FUENTES_PUBLICADAS.map((f) => <SelectItem key={f.id} value={f.nombre}>{f.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input aria-label="Fecha de baja" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="text-xs w-44" />
            <Button type="button" size="sm" variant="primary" disabled={!fecha} className="text-xs" onClick={() => { const r = st.solicitarBaja(fuente, institucion, fecha, actor); (r.ok ? toast.success : toast.error)(r.mensaje); }}>Solicitar baja</Button>
          </div>
        </Seccion>
      )}
      <Seccion titulo="Bajas de fuentes (FUE-08 y FUE-09)">
        <div className="space-y-3">{[...(st.bajas ?? [])].reverse().map((b) => <BajaCard key={b.id} b={b} />)}</div>
      </Seccion>
    </div>
  );
}

function Suspensiones() {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const [obs, setObs] = useState("");
  const [corr, setCorr] = useState({ causa: "", accion: "" });
  const [pr, setPr] = useState({ conectividad: true, lectura: true, respuesta: true });
  const gestion = rol === "DIR_GESTION" || rol === "EQ_GESTION";
  const ti = rol === "TI" || rol === "DTD" || rol === "ADMIN";
  return (
    <div className="space-y-5">
      {ti && (
        <Seccion titulo="Suspender por fallo crítico (FUE-10)" descripcion="Un fallo crítico detectado por el monitoreo con regla publicada en PAR-06 suspende solo los accesos dependientes y aplica bloqueo lógico inmediato. Si Apigee falla queda «Suspensión técnica pendiente» hasta confirmar.">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { st.suspenderFuente(FUENTES_PUBLICADAS[1].nombre, "healthcheck fallido ×6 (umbral 5)", true); toast.warning("Fuente suspendida; se notificó a consumidores y a Gestión"); }}>Registrar fallo crítico (Apigee confirma)</Button>
            <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { st.suspenderFuente(FUENTES_PUBLICADAS[0].nombre, "tasa de error 12 % (umbral 5 %)", false); toast.warning("Suspensión técnica pendiente: bloqueo lógico activo"); }}>Registrar fallo (Apigee no confirma)</Button>
          </div>
        </Seccion>
      )}
      <Seccion titulo="Fuentes suspendidas y restablecimiento (FUE-11)" descripcion="Para restablecer: prueba de conectividad, lectura y respuesta satisfactoria, corrección registrada en INC-03 y decisión Aprobada de Gestión. No se restablece una fuente retirada definitivamente.">
        {(st.suspensiones ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No hay fuentes suspendidas.</p> : (
          <div className="space-y-3">
            {[...(st.suspensiones ?? [])].reverse().map((s) => (
              <div key={s.id} className="rounded-xl border border-border p-3.5 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><span className="font-mono font-bold text-primary">{s.id}</span><Badge tone={s.estado === "Restablecida" ? "success" : "danger"} appearance="soft" size="sm">{s.estado}</Badge></span>
                  <span className="text-muted-foreground">{s.fuente} · {s.metrica} · {s.ventana} · {s.incidente} · {formatoFecha(s.instante)}</span>
                </div>
                {s.correccion && <p className="text-muted-foreground">Corrección ({s.correccion.responsable}): {s.correccion.causa} → {s.correccion.accion}</p>}
                {s.pruebas && <p className="text-muted-foreground">Pruebas: conectividad {s.pruebas.conectividad ? "✓" : "✗"} · lectura {s.pruebas.lectura ? "✓" : "✗"} · respuesta {s.pruebas.respuesta ? "✓" : "✗"}</p>}
                {s.decision && <p className="text-muted-foreground">Decisión: <strong className="text-foreground">{s.decision.resultado}</strong> · «{s.decision.motivo}»</p>}
                {s.estado === "Suspensión técnica pendiente" && ti && <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { st.suspenderFuente(s.fuente, s.metrica, true); toast.success("ACC-06 confirmó la suspensión"); }}>Reintentar ACC-06</Button>}
                {s.estado === "Suspendida" && ti && !s.correccion && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input aria-label="Causa original" value={corr.causa} onChange={(e) => setCorr({ ...corr, causa: e.target.value })} placeholder="Causa original" className="text-xs w-56" />
                    <Input aria-label="Acción aplicada" value={corr.accion} onChange={(e) => setCorr({ ...corr, accion: e.target.value })} placeholder="Acción aplicada" className="text-xs w-56" />
                    <Button type="button" size="sm" variant="outline" disabled={!corr.causa.trim() || !corr.accion.trim()} className="text-xs" onClick={() => { st.registrarCorreccion(s.id, corr, actor); setCorr({ causa: "", accion: "" }); }}>Registrar corrección (INC-03)</Button>
                  </div>
                )}
                {s.estado === "Suspendida" && s.correccion && !s.pruebas && ti && (
                  <div className="flex flex-wrap items-center gap-3">
                    {(["conectividad", "lectura", "respuesta"] as const).map((k) => <label key={k} className="flex items-center gap-1.5"><Checkbox checked={pr[k]} onCheckedChange={(v) => setPr({ ...pr, [k]: v === true })} />{k}</label>)}
                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => st.probarFuente(s.id, pr)}>Ejecutar pruebas (FUE-02)</Button>
                  </div>
                )}
                {s.estado === "Suspendida" && s.correccion && s.pruebas && gestion && (
                  <div className="space-y-1.5">
                    <Textarea aria-label="Motivo de la decisión" value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Motivo y observaciones" className="text-xs" />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="primary" className="text-xs" disabled={!obs.trim() || !(s.pruebas.conectividad && s.pruebas.lectura && s.pruebas.respuesta)} onClick={() => { st.decidirRestablecimiento(s.id, "Aprobada", obs.trim(), actor); setObs(""); toast.success("Fuente restablecida; solo se reactivan las autorizaciones vigentes"); }}>Aprobar restablecimiento</Button>
                      <Button type="button" size="sm" variant="outline" className="text-xs" disabled={!obs.trim()} onClick={() => { st.decidirRestablecimiento(s.id, "Devuelta", obs.trim(), actor); setObs(""); }}>Devolver</Button>
                    </div>
                    {!(s.pruebas.conectividad && s.pruebas.lectura && s.pruebas.respuesta) && <p className="text-[11px] text-danger">Las pruebas no fueron satisfactorias: no se puede aprobar.</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Seccion>
    </div>
  );
}

function Economicos() {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const [motivo, setMotivo] = useState("");
  const [soporte, setSoporte] = useState("");
  const juridica = rol === "JURIDICA";
  return (
    <Seccion titulo="Efectos económicos de una fuente retirada (ECO-01)" descripcion="La factura y el pago conservan el último estado confirmado por el sistema externo. El Portal nunca los marca anulados ni reembolsados por la baja: Jurídica documenta el tratamiento y adjunta la confirmación externa.">
      {(st.casos ?? []).length === 0 ? <p className="text-xs text-muted-foreground">No hay casos. Se abren al retirar una fuente (FUE-09) o inactivar su proveedora (INS-08).</p> : (
        <div className="space-y-3">
          {[...(st.casos ?? [])].reverse().map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-3.5 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2"><span className="font-mono font-bold text-primary">{c.id}</span><Badge tone={c.estado === "Pendiente de regularización" ? "warning" : "success"} appearance="soft" size="sm">{c.estado}</Badge></span>
                <span className="text-muted-foreground">{c.causa} · {c.evento}</span>
              </div>
              <p className="text-muted-foreground">{c.fuente} · solicitud {c.solicitud} · contrato {c.contrato} (cancelado) · factura {c.factura.numero} ({c.factura.estado}) · pago {c.pago.referencia} ({c.pago.estado}) · {c.importe}</p>
              {c.decision && <p className="text-muted-foreground">Decisión: <strong className="text-foreground">{c.decision.resultado}</strong> · «{c.decision.motivo}»{c.decision.soporte ? ` · soporte ${c.decision.soporte}` : ""}</p>}
              {c.estado === "Pendiente de regularización" && juridica && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input aria-label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo de la decisión" className="text-xs w-64" />
                  <label className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 h-9 cursor-pointer"><span className="truncate max-w-[10rem]">{soporte || "Soporte de ajuste (PDF)"}</span><input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setSoporte(e.target.files?.[0]?.name ?? "")} /></label>
                  <Button type="button" size="sm" variant="primary" disabled={!motivo.trim() || !soporte} className="text-xs" onClick={() => { st.regularizar(c.id, "Ajuste externo confirmado", motivo.trim(), soporte, actor); setMotivo(""); setSoporte(""); }}>Regularizar con ajuste</Button>
                  <Button type="button" size="sm" variant="outline" disabled={!motivo.trim()} className="text-xs" onClick={() => { st.regularizar(c.id, "Cerrar sin ajuste", motivo.trim(), undefined, actor); setMotivo(""); }}>Cerrar sin ajuste</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {!juridica && <p className="text-[11px] text-muted-foreground">Solo Jurídica registra la decisión.</p>}
    </Seccion>
  );
}

export function CicloFuentesView() {
  const st = useAdminStore();
  return (
    <ExcepcionalShell activeMenu="ciclo-fuentes" etiqueta="FUE-08 a FUE-11 · ECO-01" titulo="Ciclo de vida de las fuentes" descripcion="Baja programada con avisos y retiro, suspensión por fallo crítico, restablecimiento tras una nueva prueba y regularización económica de los contratos afectados." icono={<CalendarX2 className="size-32 text-primary" />}>
      {!st.listo ? <p className="text-xs text-muted-foreground">Cargando…</p> : (
        <Tabs defaultValue="bajas" className="gap-4">
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="bajas">Bajas</TabsTrigger>
            <TabsTrigger value="susp">Suspensiones</TabsTrigger>
            <TabsTrigger value="eco">Efectos económicos</TabsTrigger>
          </TabsList>
          <TabsContent value="bajas"><Bajas /></TabsContent>
          <TabsContent value="susp"><Suspensiones /></TabsContent>
          <TabsContent value="eco"><Economicos /></TabsContent>
        </Tabs>
      )}
    </ExcepcionalShell>
  );
}
