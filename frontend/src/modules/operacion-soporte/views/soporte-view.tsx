"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { FileUp, LifeBuoy, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ExcepcionalShell, Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { calcularLimite, formatoFecha, idOpaco, politicaActiva, useOperacionStore, type EstadoIncidente, type Incidente, type Prioridad } from "../data/operacion-store";

const RESPONSABLES = ["Ing. Carlos Mena (TI)", "María Torres (DGR)", "Luis Paz (Seguridad Informática)"];
const TONO: Record<EstadoIncidente, "neutral" | "info" | "warning" | "success" | "danger"> = {
  Registrado: "neutral",
  Clasificado: "info",
  Asignado: "info",
  "En atención": "info",
  "En espera de información": "warning",
  Escalado: "danger",
  Resuelto: "success",
  Reabierto: "warning",
  Cerrado: "neutral",
};

function Detalle({ i }: { i: Incidente }) {
  const op = useOperacionStore();
  const { rol, actor } = useActor();
  const pol = politicaActiva(op.politicas);
  const mesa = rol === "ADMIN";
  const especialista = rol === "TI" || rol === "DTD" || rol === "DGR";
  const solicitante = rol === "COORDINADOR_SINARP";
  const [prio, setPrio] = useState<Prioridad>("P2");
  const [nivel, setNivel] = useState<"Crítico" | "Alto" | "Medio" | "Bajo">("Alto");
  const [tipo, setTipo] = useState<"Operativo" | "Seguridad">("Operativo");
  const [resp, setResp] = useState(RESPONSABLES[0]);
  const [texto, setTexto] = useState("");
  const [destino, setDestino] = useState("");
  const mut = (fn: (x: Incidente) => Incidente, accion: string, detalle?: string) => op.mutarIncidente(i.id, fn, actor, accion, detalle);

  const clasificar = () => {
    if (!pol) {
      toast.error("No hay política de soporte publicada (PAR-03); no se asigna un vencimiento ficticio.");
      return;
    }
    const regla = pol.p[prio];
    const ahora = new Date().toISOString();
    const limite = calcularLimite(ahora, regla.minutos, regla.reloj);
    mut((x) => ({ ...x, estado: "Asignado", prioridad: prio, impacto: { nivel, descripcion: x.sintoma.slice(0, 80) }, tipo, responsable: resp, fechaLimiteAtencion: limite, asignaciones: [...x.asignaciones.map((a) => ({ ...a, vigente: false })), { id: idOpaco("ASG"), responsable: resp, asignador: actor.nombre, instante: ahora, vigente: true }] }), "Incidente clasificado y asignado", `${prio} · ${resp} · límite ${formatoFecha(limite)} (reloj ${regla.reloj.toLowerCase()}, PAR-03 v${pol.version})`);
    toast.success("Incidente clasificado y asignado");
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono font-bold text-primary text-sm">{i.id}</span>
        <Badge tone={TONO[i.estado]} appearance="soft" size="sm">{i.estado}</Badge>
        {i.prioridad && <Badge tone={i.prioridad === "P1" ? "danger" : "warning"} appearance="soft" size="sm">{i.prioridad}</Badge>}
        {i.tipo && <Badge tone={i.tipo === "Seguridad" ? "danger" : "neutral"} appearance="outline" size="sm">{i.tipo}</Badge>}
      </div>
      <p className="text-muted-foreground">
        {i.objetoTipo} <span className="font-mono">{i.objetoId}</span> · {i.institucion} · registrado {formatoFecha(i.registro)} por {i.solicitante} ({i.origen === "Sistema" ? "creación automática" : "usuario"})
      </p>
      <p className="text-foreground">{i.sintoma}</p>
      {i.evidencia.length > 0 && <p className="text-muted-foreground">Evidencia: <span className="font-mono">{i.evidencia.join(", ")}</span> (sin secretos ni datos personales)</p>}
      {i.responsable && (
        <p className="text-muted-foreground">
          Responsable: <strong className="text-foreground">{i.responsable}</strong>
          {i.fechaLimiteAtencion && <> · Límite de atención: <strong className={cn(new Date(i.fechaLimiteAtencion) < new Date() ? "text-danger" : "text-foreground")}>{formatoFecha(i.fechaLimiteAtencion)}</strong></>}
        </p>
      )}

      {/* INC-02 */}
      {(i.estado === "Registrado" || i.estado === "Asignado" || i.estado === "Clasificado") && mesa && (
        <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-2">
          <p className="font-semibold text-foreground">{i.estado === "Registrado" ? "Clasificar y asignar (INC-02)" : "Reasignar"}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { l: "Prioridad", v: prio, set: (v: string) => setPrio(v as Prioridad), o: ["P1", "P2", "P3", "P4"] },
              { l: "Impacto", v: nivel, set: (v: string) => setNivel(v as typeof nivel), o: ["Crítico", "Alto", "Medio", "Bajo"] },
              { l: "Tipo", v: tipo, set: (v: string) => setTipo(v as typeof tipo), o: ["Operativo", "Seguridad"] },
              { l: "Responsable", v: resp, set: setResp, o: RESPONSABLES },
            ].map((c) => (
              <div key={c.l} className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">{c.l}</Label>
                <Select value={c.v} onValueChange={c.set}>
                  <SelectTrigger aria-label={c.l} className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{c.o.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button type="button" size="sm" variant="primary" className="text-xs" onClick={clasificar}>Clasificar y asignar</Button>
        </div>
      )}

      {/* INC-03 */}
      {["Asignado", "En atención", "En espera de información", "Escalado", "Reabierto"].includes(i.estado) && especialista && (
        <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-2">
          <p className="font-semibold text-foreground">Atención (INC-03)</p>
          <Textarea aria-label="Diagnóstico o acción" value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} placeholder="Diagnóstico o acción realizada" className="text-xs" />
          <div className="flex flex-wrap gap-2">
            {i.estado !== "En atención" && <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => mut((x) => ({ ...x, estado: "En atención" }), "Pasa a En atención")}>En atención</Button>}
            <Button type="button" size="sm" variant="primary" disabled={!texto.trim()} className="text-xs" onClick={() => { mut((x) => ({ ...x, estado: x.estado === "Asignado" || x.estado === "Reabierto" ? "En atención" : x.estado, diagnostico: x.diagnostico ?? texto.trim(), acciones: [...x.acciones, { id: idOpaco("ACC"), descripcion: texto.trim(), actor: actor.nombre, instante: new Date().toISOString(), resultado: "Exitoso" }] }), "Atención registrada"); setTexto(""); toast.success("Atención registrada"); }}>Registrar atención</Button>
            <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => mut((x) => ({ ...x, estado: "En espera de información" }), "En espera de información")}>Esperar información</Button>
          </div>
          <div className="flex flex-wrap items-end gap-2 pt-1 border-t border-border">
            <div className="w-72 space-y-1">
              <Label className="text-[11px] text-muted-foreground">Escalar a (rol, área o proveedor activos)</Label>
              <Select value={destino} onValueChange={setDestino}>
                <SelectTrigger aria-label="Destino del escalamiento" className="h-9 text-xs"><SelectValue placeholder="Elige un destino" /></SelectTrigger>
                <SelectContent>
                  {pol?.escalamiento.map((e) => e.destino).filter((v, k, a) => a.indexOf(v) === k).map((d) => {
                    const prov = op.proveedores.find((p) => p.id === d);
                    return <SelectItem key={d} value={d}>{prov ? `Proveedor: ${prov.nombre}${prov.correoVerificado && prov.activo ? "" : " (no disponible)"}` : `Área: ${d}`}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" size="sm" variant="outline" disabled={!destino} className="text-xs" onClick={() => {
              const prov = op.proveedores.find((p) => p.id === destino);
              if (prov && (!prov.activo || !prov.correoVerificado)) { toast.error("Sin destinatario activo; actualiza rol, área o proveedor."); return; }
              mut((x) => ({ ...x, estado: "Escalado", escalamientos: [...x.escalamientos, { destino, tipoDestino: prov ? "Proveedor" : "Área", motivo: texto.trim() || "Escalamiento de nivel superior", instante: new Date().toISOString(), acuse: "Confirmado" }] }), "Incidente escalado", `Destino ${prov?.nombre ?? destino}; acuse confirmado.`);
              toast.success("Incidente escalado");
            }}>Escalar</Button>
          </div>
          {i.escalamientos.length > 0 && <ul className="text-[11px] text-muted-foreground space-y-0.5">{i.escalamientos.map((e, k) => <li key={k}>Escalado a {e.tipoDestino} {e.destino} · acuse {e.acuse} · {formatoFecha(e.instante)}</li>)}</ul>}
          {i.acciones.length > 0 && <ul className="text-[11px] text-muted-foreground space-y-0.5">{i.acciones.map((a) => <li key={a.id}><span className="font-mono">{a.id}</span> · {a.descripcion} · {a.resultado}</li>)}</ul>}
        </div>
      )}

      {/* INC-04 */}
      {["En atención", "Escalado", "En espera de información"].includes(i.estado) && mesa && (
        <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-2">
          <p className="font-semibold text-foreground">Resolver (INC-04)</p>
          <Input aria-label="Causa" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Causa y solución aplicada" className="text-xs" />
          <Button type="button" size="sm" variant="primary" disabled={!texto.trim()} className="text-xs" onClick={() => {
            const ahora = new Date().toISOString();
            mut((x) => ({ ...x, estado: "Resuelto", resolucion: { causa: texto.trim(), resultado: texto.trim(), instante: ahora, instanteEntrega: ahora, fechaLimiteRevision: new Date(Date.now() + (pol?.diasRevisionSolucion ?? 3) * 86400000).toISOString() } }), "Incidente resuelto", `El solicitante tiene ${pol?.diasRevisionSolucion ?? 3} días para confirmar o rechazar.`);
            setTexto("");
            toast.success("Incidente resuelto");
          }}>Marcar como resuelto</Button>
        </div>
      )}
      {i.estado === "Resuelto" && i.resolucion && (
        <div className="rounded-lg bg-success/5 border border-success/30 p-3 space-y-2">
          <p className="text-foreground"><strong>Solución:</strong> {i.resolucion.resultado}</p>
          <p className="text-muted-foreground">Revisión del solicitante hasta {formatoFecha(i.resolucion.fechaLimiteRevision)}. Sin respuesta tras ese plazo se cierra automáticamente.</p>
          <div className="flex flex-wrap gap-2">
            {solicitante && (
              <>
                <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { mut((x) => ({ ...x, estado: "Cerrado", cierre: { tipo: "Solución confirmada", instante: new Date().toISOString() } }), "Incidente cerrado", "Solución confirmada por el solicitante"); toast.success("Incidente cerrado"); }}>Confirmar cierre</Button>
                <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { mut((x) => ({ ...x, estado: "Reabierto", resolucion: undefined }), "Incidente reabierto", "El solicitante rechazó la solución"); toast.warning("Incidente reabierto"); }}>Rechazar solución</Button>
              </>
            )}
            {mesa && <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { mut((x) => ({ ...x, estado: "Cerrado", cierre: { tipo: "Cierre por silencio tras plazo", instante: new Date().toISOString() } }), "Incidente cerrado", "Cierre automático tras vencer el plazo de revisión"); toast.info("Cerrado por silencio tras el plazo"); }}>Simular vencimiento del plazo</Button>}
          </div>
        </div>
      )}
      {i.estado === "Cerrado" && i.cierre && <p className="text-muted-foreground">Cerrado ({i.cierre.tipo}) el {formatoFecha(i.cierre.instante)}. No se borra ni se altera.</p>}

      <ul className="border-t border-border pt-2 space-y-0.5 text-[11px] text-muted-foreground">
        {[...i.historial].reverse().map((h, k) => <li key={k}>{formatoFecha(h.instante)} · {h.accion} · {h.actor}{h.detalle ? ` — ${h.detalle}` : ""}</li>)}
      </ul>
    </div>
  );
}

export function SoporteView() {
  const op = useOperacionStore();
  const { rol, actor, institucion } = useActor();
  const [sel, setSel] = useState<string>("");
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ tipo: "API" as Incidente["objetoTipo"], objeto: "", sintoma: "", archivo: "" });
  const lista = (rol === "COORDINADOR_SINARP" ? op.incidentes.filter((i) => i.solicitante === actor.nombre || i.institucion === institucion) : op.incidentes).slice().reverse();
  const actual = lista.find((i) => i.id === sel) ?? lista[0];

  return (
    <ExcepcionalShell activeMenu="soporte" etiqueta="INC-01 a INC-04" titulo="Soporte e incidentes" descripcion="Cada ticket queda ligado a un objeto concreto (solicitud, fuente, API, lote o componente). La mesa de ayuda lo clasifica con P1 a P4 según la política vigente, el especialista lo atiende y escala, y el solicitante confirma o rechaza la solución." icono={<LifeBuoy className="size-32 text-primary" />}
      acciones={rol === "COORDINADOR_SINARP" && <Button type="button" size="sm" variant="primary" className="text-xs gap-1.5" onClick={() => setAbierto(true)}><Plus className="size-4" />Crear ticket</Button>}>
      {!op.listo ? (
        <p className="text-xs text-muted-foreground">Cargando…</p>
      ) : (
        <>
          {abierto && (
            <Seccion titulo="Nuevo ticket de soporte (INC-01)" descripcion="No incluyas secretos ni datos personales innecesarios; adjunta evidencia protegida.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tipo de objeto</Label>
                  <Select value={f.tipo} onValueChange={(v) => setF({ ...f, tipo: v as Incidente["objetoTipo"] })}>
                    <SelectTrigger aria-label="Tipo de objeto" className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Solicitud", "Fuente", "API", "Lote", "Componente"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inc-objeto" className="text-xs text-muted-foreground">ID del objeto <span className="text-danger">*</span></Label>
                  <Input id="inc-objeto" value={f.objeto} onChange={(e) => setF({ ...f, objeto: e.target.value })} placeholder="p. ej. ACC-API-001" className="text-xs font-mono" />
                </div>
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="inc-sintoma" className="text-xs text-muted-foreground">Síntoma <span className="text-danger">*</span></Label>
                  <Textarea id="inc-sintoma" value={f.sintoma} onChange={(e) => setF({ ...f, sintoma: e.target.value })} rows={3} className="text-xs" />
                </div>
                <label className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 h-10 text-xs cursor-pointer sm:col-span-3">
                  <span className="flex items-center gap-2"><FileUp className="size-4 text-primary" />Evidencia (opcional)</span>
                  <span className="font-mono text-muted-foreground truncate">{f.archivo || "Adjuntar"}</span>
                  <input type="file" className="sr-only" onChange={(e) => setF({ ...f, archivo: e.target.files?.[0]?.name ?? "" })} />
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { const r = op.crearIncidente({ objetoTipo: f.tipo, objetoId: f.objeto.trim(), sintoma: f.sintoma, evidencia: f.archivo ? [f.archivo] : [], institucion, origen: "Usuario" }, actor); (r.ok ? toast.success : toast.error)(r.mensaje); if (r.ok) { setAbierto(false); setSel(r.id!); setF({ tipo: "API", objeto: "", sintoma: "", archivo: "" }); } }}>Registrar ticket</Button>
                <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => setAbierto(false)}>Cancelar</Button>
              </div>
            </Seccion>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-5 items-start">
            <div className="space-y-2">
              {lista.length === 0 ? <p className="text-xs text-muted-foreground">No hay tickets.</p> : lista.map((i) => (
                <button key={i.id} type="button" onClick={() => setSel(i.id)} aria-pressed={actual?.id === i.id} className={cn("w-full text-left rounded-xl border p-3 text-xs space-y-1 transition-colors", actual?.id === i.id ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/40")}>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono font-bold text-primary">{i.id}</span><Badge tone={TONO[i.estado]} appearance="soft" size="sm">{i.estado}</Badge></div>
                  <p className="text-muted-foreground line-clamp-2">{i.sintoma}</p>
                </button>
              ))}
            </div>
            {actual && <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs"><Detalle key={actual.id} i={actual} /></div>}
          </div>
        </>
      )}
    </ExcepcionalShell>
  );
}
