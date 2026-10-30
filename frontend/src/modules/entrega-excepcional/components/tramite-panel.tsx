"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock, FileSignature, ShieldCheck, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SOPORTES_REQUERIDOS,
  formatoFecha,
  numero,
  ultimoParametrosPublicados,
  useExcepcionalStore,
  type Etapa,
  type SolicitudExcepcional,
} from "../data/excepcional-store";
import { PlazoBadge, Seccion, useActor } from "./excepcional-ui";

const NOMBRE_ETAPA: Record<Etapa["clave"], string> = {
  calificacion: "Calificación (art. 13)",
  tecnologico: "Informe tecnológico (art. 14)",
  dpi: "Informe de protección de la información (art. 15)",
  final: "Informe final (art. 16)",
  autorizacion: "Resolución de la Máxima Autoridad",
};

const REVISORES = [
  { id: "1111111111", nombre: "Ana Torres" },
  { id: "1111111112", nombre: "Luis Paz" },
];

const REQUISITOS_CALIFICACION = [
  "Supuestos del art. 11 y su justificación",
  "Finalidad y legitimación de acceso (LOPDP)",
  "Justificación técnica y tecnológica",
  "Datos solicitados, temporalidad y volumen",
  ...SOPORTES_REQUERIDOS,
];

export function LineaEtapas({ s }: { s: SolicitudExcepcional }) {
  return (
    <ol className="space-y-2.5">
      {s.etapas.map((e, i) => {
        const hecha = !!e.resultado;
        const desfavorable = e.resultado === "Desfavorable" || e.resultado === "Rechazada" || e.resultado === "Observada";
        return (
          <li key={`${e.clave}-${i}`} className="flex gap-3">
            <span className={cn("mt-0.5 size-6 rounded-full flex items-center justify-center shrink-0 border", hecha ? (desfavorable ? "bg-danger/10 border-danger/40 text-danger" : "bg-success/10 border-success/40 text-success") : "bg-warning/10 border-warning/40 text-warning")}>
              {hecha ? desfavorable ? <XCircle className="size-3.5" /> : <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
            </span>
            <div className="min-w-0 flex-1 text-xs space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">{NOMBRE_ETAPA[e.clave]}</span>
                {e.resultado && (
                  <Badge tone={desfavorable ? "danger" : "success"} appearance="soft" size="sm" className="text-[10px]">
                    {e.resultado}
                  </Badge>
                )}
                <PlazoBadge fechaLimite={e.fechaLimite} resuelta={hecha} />
              </div>
              <p className="text-muted-foreground">
                Ingresó {formatoFecha(e.ingreso)} · plazo en días hábiles según PAR-17 v{e.versionParametros}
                {e.actor && ` · ${e.actor}, ${formatoFecha(e.instante)}`}
              </p>
              {e.observacion && <p className="text-foreground/80">“{e.observacion}”</p>}
              {e.hashFirma && <p className="font-mono text-[10px] text-muted-foreground">Informe firmado con FirmaEC · {e.hashFirma.slice(0, 16)}…</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Corresponde({ a }: { a: string }) {
  return (
    <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 border border-border p-3">
      Esta etapa le corresponde a <strong className="text-foreground">{a}</strong>. Puedes consultar el expediente, pero no actuar sobre él con tu rol.
    </p>
  );
}

export function AccionTramite({ s }: { s: SolicitudExcepcional }) {
  const { rol, actor } = useActor();
  const st = useExcepcionalStore();
  const par = ultimoParametrosPublicados(st.parametros);
  const [revisor, setRevisor] = useState("");
  const [motivoReasignacion, setMotivoReasignacion] = useState("");
  const [observados, setObservados] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<"Favorable" | "Desfavorable">("Favorable");
  const [texto, setTexto] = useState("");
  const [plazo, setPlazo] = useState(String(s.plazoRecomendadoDias ?? Math.min(s.temporalidadDias, par?.vigenciaMaximaDias ?? 365)));
  const [volumen, setVolumen] = useState(String(s.volumenSolicitado));

  const [ahoraMs] = useState(() => Date.now());
  const asignacion = s.asignaciones.find((a) => a.vigente && a.version === s.version);
  const limitePlazo = useMemo(() => {
    const topes = [s.temporalidadDias, par?.vigenciaMaximaDias ?? 365];
    if (s.decreto?.vigenciaHasta) topes.push(Math.floor((new Date(s.decreto.vigenciaHasta).getTime() - ahoraMs) / 86400000));
    return Math.min(...topes);
  }, [s, par, ahoraMs]);

  if (["Rechazada", "Archivada", "Autorizada", "Suspendida", "Vencida", "Borrador", "Pendiente de firma"].includes(s.estado)) {
    return s.estado === "Rechazada" && s.motivoRechazo ? (
      <Alert variant="danger" icon={<XCircle className="size-4" />} title="Solicitud rechazada" className="p-3 text-xs">
        {s.motivoRechazo} Se notificó a la consumidora.
      </Alert>
    ) : s.estado === "Archivada" ? (
      <Alert variant="info" icon={<AlertCircle className="size-4" />} title="Archivada como no presentada" className="p-3 text-xs">
        No se completaron los requisitos a tiempo. La consumidora puede presentar una solicitud nueva.
      </Alert>
    ) : null;
  }

  const esGestion = rol === "DIR_GESTION" || rol === "EQ_GESTION";

  // CALIFICACIÓN
  if (s.estado === "En calificación") {
    if (!esGestion) return <Corresponde a="Dirección de Gestión (Director y revisor asignado)" />;
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">Asignación del revisor (EXT-02 CA9)</p>
          {asignacion && <p className="text-[11px] text-muted-foreground">Vigente: {asignacion.nombreRevisor} · {formatoFecha(asignacion.instante)} · ID {asignacion.idAsignacion}</p>}
          {rol === "DIR_GESTION" ? (
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-56">
                <Select value={revisor} onValueChange={setRevisor}>
                  <SelectTrigger aria-label="Revisor" className="h-10 text-xs">
                    <SelectValue placeholder="Elige un revisor activo" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVISORES.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {asignacion && <Input aria-label="Motivo de reasignación" value={motivoReasignacion} onChange={(e) => setMotivoReasignacion(e.target.value)} placeholder="Motivo de la reasignación" className="w-64 text-xs" />}
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs font-semibold"
                disabled={!revisor || (!!asignacion && !motivoReasignacion.trim())}
                onClick={() => {
                  const r = REVISORES.find((x) => x.id === revisor)!;
                  st.asignarRevisor(s.id, r, actor, asignacion ? motivoReasignacion.trim() : undefined);
                  toast.success(`Revisor asignado: ${r.nombre}`);
                  setRevisor("");
                  setMotivoReasignacion("");
                }}
              >
                {asignacion ? "Reasignar" : "Asignar revisor"}
              </Button>
            </div>
          ) : (
            !asignacion && <p className="text-[11px] text-warning">El Director de Gestión aún no asigna un revisor.</p>
          )}
        </div>

        {rol === "EQ_GESTION" && asignacion && (
          <div className="rounded-xl border border-border p-3 space-y-3">
            <p className="text-xs font-semibold text-foreground">Verificación de los requisitos de los arts. 11 y 12</p>
            <p className="text-[11px] text-muted-foreground">Marca lo que falta; cada requisito observado lleva su detalle. Si todo cumple, admite la solicitud.</p>
            <div className="space-y-2">
              {REQUISITOS_CALIFICACION.map((req) => (
                <div key={req} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={req in observados} onCheckedChange={(v) => setObservados((o) => { const n = { ...o }; if (v === true) n[req] = ""; else delete n[req]; return n; })} />
                    <span>{req}</span>
                  </label>
                  {req in observados && <Input aria-label={`Detalle: ${req}`} value={observados[req]} onChange={(e) => setObservados((o) => ({ ...o, [req]: e.target.value }))} placeholder="Qué falta o no es exacto" className="text-xs ml-6 w-[calc(100%-1.5rem)]" />}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5" disabled={Object.keys(observados).length > 0} onClick={() => { st.calificar(s.id, "Admitida", [], actor); toast.success("Solicitud admitida", { description: "Pasa al informe tecnológico." }); }}>
                <CheckCircle2 className="size-4" />
                Admitir
              </Button>
              <Button type="button" variant="outline" size="sm" className="text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10" disabled={Object.keys(observados).length === 0 || Object.values(observados).some((d) => !d.trim())} onClick={() => { st.calificar(s.id, "Observada", Object.entries(observados).map(([requisito, detalle]) => ({ requisito, detalle })), actor); toast.warning("Solicitud observada", { description: `La consumidora tiene ${par?.plazoCompletarDias ?? 5} días hábiles para completar.` }); setObservados({}); }}>
                <AlertCircle className="size-4" />
                Observar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // OBSERVADA
  if (s.estado === "Observada") {
    return (
      <div className="space-y-3">
        {s.observaciones && (
          <Alert variant="warning" icon={<AlertCircle className="size-4" />} title="Observaciones por requisito" className="p-3 text-xs">
            <ul className="list-disc pl-4 space-y-0.5">
              {s.observaciones.map((o) => (
                <li key={o.requisito}>
                  <strong>{o.requisito}:</strong> {o.detalle}
                </li>
              ))}
            </ul>
          </Alert>
        )}
        <div className="flex flex-wrap gap-2">
          {rol === "COORDINADOR_SINARP" && (
            <Link href={`/entrega-excepcional/nueva?corregir=${s.id}`}>
              <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5">
                <FileSignature className="size-4" />
                Completar y reenviar (versión {s.version + 1})
              </Button>
            </Link>
          )}
          {esGestion && (
            <Button type="button" variant="outline" size="sm" className="text-xs font-semibold" onClick={() => { st.archivar(s.id, actor); toast.info("Solicitud archivada como no presentada"); }}>
              Simular vencimiento del plazo y archivar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // INFORMES TECNOLÓGICO Y DPI
  if (s.estado === "En informe tecnológico" || s.estado === "En informe DPI") {
    const clave = s.estado === "En informe tecnológico" ? "tecnologico" : "dpi";
    const puede = clave === "tecnologico" ? rol === "TI" || rol === "DTD" : rol === "DIR_DPI" || rol === "EQ_DPI";
    if (!puede) return <Corresponde a={clave === "tecnologico" ? "la Coordinación de Infraestructura y Seguridad Informática" : "Protección de la Información (DPI)"} />;
    return (
      <div className="space-y-3 rounded-xl border border-border p-3">
        <p className="text-xs font-semibold text-foreground">{clave === "tecnologico" ? "Informe tecnológico vinculante (art. 14)" : "Informe de protección de la información vinculante (art. 15)"}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {clave === "tecnologico"
            ? "Verifica las razones técnicas frente a los supuestos, los protocolos de seguridad (art. 9 a y c), la frecuencia de actualización, el tiempo solicitado y de conservación, el método de consumo, el análisis de riesgo y la imposibilidad de usar la vía general."
            : "Revisa la procedencia según la LOPDP y el literal b) del art. 9. Un informe desfavorable rechaza la solicitud."}
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          {(["Favorable", "Desfavorable"] as const).map((op) => (
            <button key={op} type="button" aria-pressed={resultado === op} onClick={() => setResultado(op)} className={cn("h-9 rounded-lg border text-xs font-semibold", resultado === op ? (op === "Favorable" ? "border-success bg-success/10 text-success" : "border-danger bg-danger/10 text-danger") : "border-border text-muted-foreground hover:bg-muted")}>
              {op}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="obs-informe" className="text-xs text-muted-foreground">
            Conclusiones {resultado === "Desfavorable" && <span className="text-danger">*</span>}
          </Label>
          <Textarea id="obs-informe" value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} className="text-xs" />
        </div>
        <Button type="button" variant={resultado === "Favorable" ? "primary" : "outline"} size="sm" className={cn("text-xs font-semibold gap-1.5", resultado === "Desfavorable" && "text-danger border-danger/30 hover:bg-danger/10")} disabled={resultado === "Desfavorable" && !texto.trim()} onClick={() => { st.emitirInforme(s.id, clave, resultado, texto.trim(), actor); toast[resultado === "Favorable" ? "success" : "warning"](`Informe ${resultado.toLowerCase()} firmado con FirmaEC`); setTexto(""); setResultado("Favorable"); }}>
          <ShieldCheck className="size-4" />
          Firmar informe con FirmaEC
        </Button>
      </div>
    );
  }

  // INFORME FINAL
  if (s.estado === "En informe final") {
    if (!esGestion) return <Corresponde a="Dirección de Gestión" />;
    const n = parseInt(plazo) || 0;
    const invalido = n < 1 || n > limitePlazo;
    return (
      <div className="space-y-3 rounded-xl border border-border p-3">
        <p className="text-xs font-semibold text-foreground">Informe final (art. 16)</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">Gestión acoge las conclusiones de los dos informes vinculantes y recomienda el plazo con la plantilla de PAR-14. El plazo no supera la temporalidad solicitada ({s.temporalidadDias} días), la vigencia máxima ({par?.vigenciaMaximaDias ?? 365}) ni la vigencia del estado de excepción.</p>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="plazo-rec" className="text-xs text-muted-foreground">
            Plazo recomendado (días) <span className="text-danger">*</span>
          </Label>
          <Input id="plazo-rec" type="number" min={1} value={plazo} onChange={(e) => setPlazo(e.target.value)} className="text-xs font-mono" aria-invalid={invalido} />
          {invalido && <p className="text-[11px] text-danger">Debe estar entre 1 y {limitePlazo} días.</p>}
        </div>
        <Button type="button" variant="primary" size="sm" disabled={invalido} className="text-xs font-semibold gap-1.5" onClick={() => { st.elaborarInformeFinal(s.id, n, actor); toast.success("Informe final remitido a la Máxima Autoridad"); }}>
          <FileSignature className="size-4" />
          Remitir a la Máxima Autoridad
        </Button>
      </div>
    );
  }

  // RESOLUCIÓN
  if (s.estado === "Pendiente de autorización") {
    if (rol !== "APROBADOR") return <Corresponde a="la Máxima Autoridad de DINARP" />;
    const vol = parseInt(volumen) || 0;
    const volInvalido = vol < 1 || vol > s.volumenSolicitado;
    return (
      <div className="space-y-3 rounded-xl border border-border p-3">
        <p className="text-xs font-semibold text-foreground">Resolución de la Máxima Autoridad</p>
        <p className="text-[11px] text-muted-foreground">Informe final recomienda {s.plazoRecomendadoDias} días. El volumen autorizado será el cupo de la autorización (API-04/API-05).</p>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="vol-aut" className="text-xs text-muted-foreground">
            Volumen autorizado (registros, máx. {numero(s.volumenSolicitado)})
          </Label>
          <Input id="vol-aut" type="number" min={1} value={volumen} onChange={(e) => setVolumen(e.target.value)} className="text-xs font-mono" aria-invalid={volInvalido} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mot-res" className="text-xs text-muted-foreground">
            Motivo (obligatorio si no aprueba)
          </Label>
          <Textarea id="mot-res" value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} className="text-xs" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" size="sm" disabled={volInvalido} className="text-xs font-semibold gap-1.5" onClick={() => { st.resolver(s.id, { aprobar: true, volumenAutorizado: vol }, actor); toast.success("Autorización firmada con FirmaEC", { description: "Se notificó a la consumidora y a la entidad fuente." }); }}>
            <ShieldCheck className="size-4" />
            Aprobar y firmar
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!texto.trim()} className="text-xs font-semibold gap-1.5 text-danger border-danger/30 hover:bg-danger/10" onClick={() => { st.resolver(s.id, { aprobar: false, motivo: texto.trim() }, actor); toast.warning("Solicitud rechazada"); setTexto(""); }}>
            <XCircle className="size-4" />
            No aprobar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

export function TramitePanel({ s }: { s: SolicitudExcepcional }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Seccion titulo="Recorrido del trámite" descripcion="Cada etapa guarda su ingreso, la versión de PAR-17 aplicada y su fecha límite en días hábiles. Si vence sin decisión, se alerta y se escala; nunca se decide por silencio.">
        <LineaEtapas s={s} />
      </Seccion>
      <Seccion titulo="Acción pendiente" descripcion={`Estado actual: ${s.estado}.`}>
        <AccionTramite s={s} />
      </Seccion>
    </div>
  );
}
