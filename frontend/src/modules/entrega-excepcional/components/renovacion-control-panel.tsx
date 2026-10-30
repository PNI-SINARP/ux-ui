"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, FileUp, RefreshCw, ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HALLAZGOS,
  SOPORTES_RENOVACION,
  estaVigente,
  formatoFecha,
  ultimoParametrosPublicados,
  useExcepcionalStore,
  type HallazgoControl,
  type SolicitudExcepcional,
} from "../data/excepcional-store";
import { EstadoBadge, Seccion, useActor } from "./excepcional-ui";

/** EXT-07: renovación única, por igual tiempo, mientras la autorización siga vigente. */
export function RenovacionPanel({ s }: { s: SolicitudExcepcional }) {
  const st = useExcepcionalStore();
  const router = useRouter();
  const { rol, actor } = useActor();
  const par = ultimoParametrosPublicados(st.parametros);
  const [abierto, setAbierto] = useState(false);
  const [justificacion, setJustificacion] = useState("");
  const [soportes, setSoportes] = useState<Record<string, string>>({});

  const renovaciones = st.solicitudes.filter((r) => r.origenId === s.id);
  const enCurso = renovaciones.find((r) => !["Rechazada", "Archivada", "Vencida", "Autorizada"].includes(r.estado));
  const usadas = s.autorizacion?.renovacionesUsadas ?? 0;
  const maximo = par?.maxRenovaciones ?? 1;
  const admite = s.tipo === "Solicitud" && estaVigente(s) && usadas < maximo && !enCurso;
  const completo = justificacion.trim() && SOPORTES_RENOVACION.every((t) => soportes[t]);

  return (
    <div className="space-y-5">
      <Seccion titulo="Renovación de la autorización" descripcion={`Se admite hasta ${maximo} renovación(es) por autorización, por igual tiempo y solo mientras esté vigente. Sigue el mismo trámite: calificación, informe tecnológico, informe de DPI, informe final y firma.`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">Renovaciones usadas</span>
            {usadas} de {maximo}
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Vigencia actual hasta</span>
            {formatoFecha(s.autorizacion?.vigenciaHasta, false)}
          </div>
        </div>

        {rol === "COORDINADOR_SINARP" && (
          admite ? (
            <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5" onClick={() => setAbierto(true)}>
              <RefreshCw className="size-4" />
              Solicitar renovación
            </Button>
          ) : (
            <Alert variant="info" icon={<AlertCircle className="size-4" />} title="Esta autorización ya no admite renovación" className="p-3 text-xs">
              {enCurso ? `Ya hay una renovación en trámite (${enCurso.id}).` : "Solo se renueva una autorización vigente que no haya agotado sus renovaciones."}
            </Alert>
          )
        )}

        {s.autorizacion && s.autorizacion.historialVigencia.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">Historial de vigencia</p>
            <ul className="text-[11px] text-muted-foreground space-y-0.5">
              {s.autorizacion.historialVigencia.map((h) => (
                <li key={h.instante}>
                  Extendida hasta {formatoFecha(h.hasta, false)} · {h.motivo} · {formatoFecha(h.instante)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Seccion>

      {renovaciones.length > 0 && (
        <Seccion titulo="Renovaciones de esta autorización">
          <ul className="space-y-2">
            {renovaciones.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs">
                <span className="font-mono font-semibold text-primary">{r.id}</span>
                <EstadoBadge estado={r.estado} />
                <Link href={`/entrega-excepcional/detalle?id=${r.id}`} className="text-primary hover:underline">
                  Ver trámite
                </Link>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground">Renovar {s.id}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">La renovación es por igual tiempo y la firma la máxima autoridad de tu institución.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="just-ren" className="text-xs text-muted-foreground">
                Justificación técnica de por qué todavía no es posible interoperar o se requiere más tiempo <span className="text-danger">*</span>
              </Label>
              <Textarea id="just-ren" value={justificacion} onChange={(e) => setJustificacion(e.target.value)} rows={3} className="text-xs" />
            </div>
            {SOPORTES_RENOVACION.map((t) => (
              <label key={t} className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 h-10 text-xs cursor-pointer hover:border-primary/40">
                <span className="flex items-center gap-2 min-w-0">
                  {soportes[t] ? <CheckCircle2 className="size-4 text-success shrink-0" /> : <FileUp className="size-4 text-primary shrink-0" />}
                  <span className="truncate">{t}</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[35%]">{soportes[t] ?? "Adjuntar PDF"}</span>
                <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => { const n = e.target.files?.[0]?.name; if (n) setSoportes((x) => ({ ...x, [t]: n })); }} />
              </label>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!completo}
              className="text-xs font-semibold gap-1.5"
              onClick={() => {
                const id = st.crearRenovacion(s.id, { justificacionTecnica: justificacion.trim(), soportes: SOPORTES_RENOVACION.map((tipo) => ({ tipo, archivo: soportes[tipo] })), firmante: "Máxima autoridad de la consumidora" }, actor);
                if (!id) {
                  toast.error("Esta autorización ya no admite renovación");
                  return;
                }
                setAbierto(false);
                toast.success("Renovación firmada y enviada", { description: `${id} pasa a calificación.` });
                router.push(`/entrega-excepcional/detalle?id=${id}`);
              }}
            >
              Firmar y enviar con FirmaEC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** EXT-08: controles con hallazgos del art. 18 y suspensión motivada. */
export function ControlPanel({ s }: { s: SolicitudExcepcional }) {
  const st = useExcepcionalStore();
  const { rol, actor } = useActor();
  const puede = rol === "CONTROL_EVALUACION";
  const [abierto, setAbierto] = useState(false);
  const [alcance, setAlcance] = useState("");
  const [hallazgos, setHallazgos] = useState<Record<string, string>>({});
  const [suspender, setSuspender] = useState(false);
  const [motivo, setMotivo] = useState("");

  const nHallazgos = Object.keys(hallazgos).length;
  const valido = alcance.trim() && Object.values(hallazgos).every((e) => e) && (!suspender || (nHallazgos > 0 && motivo.trim()));

  return (
    <div className="space-y-5">
      <Seccion
        titulo="Controles registrados"
        descripcion="Cada control guarda alcance, responsable y hallazgos con evidencia. Con al menos un hallazgo se puede ordenar, de forma motivada, la suspensión."
        acciones={
          puede && (
            <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5" onClick={() => setAbierto(true)}>
              <ShieldAlert className="size-4" />
              Registrar control
            </Button>
          )
        }
      >
        {s.estado === "Suspendida" && (
          <Alert variant="danger" icon={<ShieldAlert className="size-4" />} title="Autorización suspendida" className="p-3 text-xs">
            Se bloquean ejecuciones y enlaces sin descargar. La entidad fuente debe suspender la entrega desde la recepción.
          </Alert>
        )}
        {s.controles.length === 0 ? (
          <p className="text-xs text-muted-foreground">No hay controles registrados para esta autorización.</p>
        ) : (
          <div className="space-y-3">
            {[...s.controles].reverse().map((c) => (
              <div key={c.idControl} className="rounded-xl border border-border p-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-primary">{c.idControl}</span>
                  <span className="text-muted-foreground">{formatoFecha(c.fecha)} · {c.responsable}</span>
                </div>
                <p className="text-foreground">{c.alcance}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.hallazgos.map((h) => (
                    <Badge key={h.tipo} tone="danger" appearance="soft" size="sm" className="text-[10px]">
                      {h.tipo} · {h.evidencia}
                    </Badge>
                  ))}
                  {c.hallazgos.length === 0 && <Badge tone="success" appearance="soft" size="sm" className="text-[10px]">Sin hallazgos</Badge>}
                </div>
                {c.suspension && <p className="text-danger">Suspensión: {c.suspension}</p>}
              </div>
            ))}
          </div>
        )}
        {!puede && <p className="text-[11px] text-muted-foreground">Solo la Dirección de Control y Evaluación registra controles y suspende.</p>}
      </Seccion>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground">Registrar control · {s.id}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Hallazgos del art. 18 de la Resolución 003-NG-DINARP-2023; cada uno lleva evidencia.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="alcance-ctl" className="text-xs text-muted-foreground">
                Alcance <span className="text-danger">*</span>
              </Label>
              <Textarea id="alcance-ctl" value={alcance} onChange={(e) => setAlcance(e.target.value)} rows={2} className="text-xs" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Hallazgos</p>
              {HALLAZGOS.map((h) => (
                <div key={h} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={h in hallazgos} onCheckedChange={(v) => setHallazgos((o) => { const n = { ...o }; if (v === true) n[h] = ""; else delete n[h]; return n; })} />
                    <span>{h}</span>
                  </label>
                  {h in hallazgos && (
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 h-9 text-[11px] cursor-pointer ml-6">
                      <span className="flex items-center gap-2">
                        <FileUp className="size-3.5 text-primary" />
                        Evidencia (PDF)
                      </span>
                      <span className="font-mono text-muted-foreground truncate">{hallazgos[h as HallazgoControl] || "Adjuntar"}</span>
                      <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => { const n = e.target.files?.[0]?.name; if (n) setHallazgos((o) => ({ ...o, [h]: n })); }} />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <label className={`flex items-center gap-2 text-xs ${nHallazgos === 0 || s.estado !== "Autorizada" ? "opacity-50" : "cursor-pointer"}`}>
              <Checkbox checked={suspender} disabled={nHallazgos === 0 || s.estado !== "Autorizada"} onCheckedChange={(v) => setSuspender(v === true)} />
              <span className="font-semibold">Ordenar la suspensión de la autorización</span>
            </label>
            {suspender && (
              <div className="space-y-1.5">
                <Label htmlFor="mot-susp" className="text-xs text-muted-foreground">
                  Motivo de la suspensión <span className="text-danger">*</span>
                </Label>
                <Input id="mot-susp" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="text-xs" />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!valido}
              className="text-xs font-semibold"
              onClick={() => {
                st.registrarControl(s.id, { alcance: alcance.trim(), responsable: actor.nombre, hallazgos: Object.entries(hallazgos).map(([tipo, evidencia]) => ({ tipo: tipo as HallazgoControl, evidencia })), suspension: suspender ? motivo.trim() : undefined }, actor);
                toast[suspender ? "warning" : "success"](suspender ? "Autorización suspendida y notificada" : "Control registrado");
                setAbierto(false);
                setAlcance("");
                setHallazgos({});
                setSuspender(false);
                setMotivo("");
              }}
            >
              {suspender ? "Registrar y suspender" : "Registrar control"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
