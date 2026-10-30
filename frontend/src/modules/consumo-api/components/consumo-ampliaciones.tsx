"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, PlusCircle, RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { PLAZO_SUBSANACION_DIAS, formatoFecha, numero, sumarDiasHabiles, ahoraIso, useConsumoStore, type AccesoApi, type Ampliacion, type EstadoAmpliacion } from "../data/consumo-store";

const TONO: Partial<Record<EstadoAmpliacion, "neutral" | "info" | "warning" | "success" | "danger">> = {
  Aplicada: "success",
  Cerrada: "neutral",
  Observada: "warning",
  "Pendiente de corrección": "danger",
};

const EVENTO = { campos: "adenda_campos", cupo: "adenda_cupo", mixta: "adenda_mixta" } as const;

function Tarjeta({ am, a }: { am: Ampliacion; a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const [obs, setObs] = useState("");
  const [area, setArea] = useState("Facturación");
  const [motivo, setMotivo] = useState("");
  const tieneConfidencial = am.campos.some((c) => a.catalogoCampos.find((x) => x.campo === c)?.clasificacion === "Confidencial");
  const esGestion = rol === "DIR_GESTION" || rol === "EQ_GESTION";
  const esDpi = rol === "DIR_DPI" || rol === "EQ_DPI";
  const mut = (fn: (x: Ampliacion) => Ampliacion, accion: string, detalle?: string) => st.mutarAmpliacion(am.id, fn, actor, accion, detalle);

  /** Tras ADD-07 Aprobada: pública aplica en ACC-08; privada sigue a la adenda (ADD-04). */
  const aprobadaADD07 = () => {
    if (a.tipo === "Pública") {
      st.aplicarAmpliacion(am.id, actor);
      toast.success("Alcance actualizado", { description: "Misma solicitud, sin contrato, factura ni pago." });
    } else {
      mut((x) => ({ ...x, estado: "Pendiente de firmas" }), "ADD-07 aprobada", "Jurídica prepara la adenda con la plantilla contractual vigente (PAR-02).");
    }
  };

  return (
    <div className="rounded-xl border border-border p-3.5 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-primary">{am.id}</span>
          <Badge tone={TONO[am.estado] ?? "info"} appearance="soft" size="sm">
            {am.estado}
          </Badge>
          <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px] font-mono">
            {a.tipo === "Privada" ? EVENTO[am.tipo] : "ampliación pública"} · v{am.version}
          </Badge>
        </div>
        <span className="text-muted-foreground">Alcance actual v{a.versionAlcance}</span>
      </div>
      <p className="text-muted-foreground">
        {am.campos.length > 0 && <>Campos: <span className="font-mono text-foreground">{am.campos.join(", ")}</span>{tieneConfidencial && " (incluye confidenciales: pasa por DPI)"}. </>}
        {am.cupoAdicional > 0 && <>Cupo adicional: <span className="font-mono text-foreground">{numero(am.cupoAdicional)}</span>. </>}
        La autorización y la credencial anteriores siguen con su alcance previo hasta aplicar el cambio.
      </p>
      {am.observaciones && <p className="text-warning">Observación: {am.observaciones} {am.fechaLimiteSubsanacion && `· Subsanar antes de ${formatoFecha(am.fechaLimiteSubsanacion)}`}</p>}
      {am.correccion && <p className="text-danger">Pendiente de corrección ({am.correccion.area}): {am.correccion.motivo}</p>}

      {/* ADD-07: Gestión */}
      {am.estado === "En revisión de Gestión" && esGestion && (
        <div className="space-y-2 rounded-lg bg-muted/30 border border-border p-3">
          <p className="font-semibold text-foreground">Revisión de Gestión (ADD-07)</p>
          <Input aria-label="Observaciones" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observaciones (obligatorias si observas)" className="text-xs" />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => {
              if (tieneConfidencial) {
                mut((x) => ({ ...x, decisionGestion: "Aprobada", estado: "En revisión de DPI" }), "Aprobada por Gestión", "Contiene campos confidenciales: pasa a DPI.");
              } else {
                mut((x) => ({ ...x, decisionGestion: "Aprobada" }), "Aprobada por Gestión", "Solo campos accesibles: la aprobación de Gestión es suficiente.");
                aprobadaADD07();
              }
            }}>
              Aprobar
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-xs text-warning border-warning/40" disabled={!obs.trim()} onClick={() => { mut((x) => ({ ...x, decisionGestion: "Observada", estado: "Observada", observaciones: obs.trim(), fechaLimiteSubsanacion: sumarDiasHabiles(ahoraIso(), PLAZO_SUBSANACION_DIAS) }), "Observada por Gestión", obs.trim()); setObs(""); }}>
              Observar
            </Button>
          </div>
        </div>
      )}

      {/* ADD-07: DPI */}
      {am.estado === "En revisión de DPI" && esDpi && (
        <div className="space-y-2 rounded-lg bg-muted/30 border border-border p-3">
          <p className="font-semibold text-foreground">Revisión de DPI y informe de recomendación (firmas {am.informeDpiFirmas} de 2)</p>
          {rol === "EQ_DPI" && am.informeDpiFirmas === 0 && (
            <div className="space-y-2">
              <Input aria-label="Observaciones por campo" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observaciones por campo (obligatorias si observas)" className="text-xs" />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => mut((x) => ({ ...x, decisionDpi: "Aprobada", informeDpiFirmas: 1 }), "Revisor DPI aprobó y firmó el informe", "Pasa al Director de DPI.")}>
                  Aprobar y firmar informe
                </Button>
                <Button type="button" size="sm" variant="outline" className="text-xs text-warning border-warning/40" disabled={!obs.trim()} onClick={() => { mut((x) => ({ ...x, decisionDpi: "Observada", estado: "Observada", observaciones: obs.trim(), fechaLimiteSubsanacion: sumarDiasHabiles(ahoraIso(), PLAZO_SUBSANACION_DIAS) }), "Observada por DPI", obs.trim()); setObs(""); }}>
                  Observar
                </Button>
              </div>
            </div>
          )}
          {rol === "DIR_DPI" && am.informeDpiFirmas === 1 && (
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { mut((x) => ({ ...x, informeDpiFirmas: 2 }), "Director de DPI firmó el informe", "ADD-07 Aprobada: todas las decisiones y firmas constan."); aprobadaADD07(); }}>
              Revisar y firmar como Director
            </Button>
          )}
          {((rol === "EQ_DPI" && am.informeDpiFirmas === 1) || (rol === "DIR_DPI" && am.informeDpiFirmas === 0)) && <p className="text-[11px] text-muted-foreground">Esperando la firma del {am.informeDpiFirmas === 0 ? "Revisor" : "Director"} de DPI.</p>}
        </div>
      )}

      {/* Observada → subsanar o cerrar */}
      {am.estado === "Observada" && (
        <div className="flex flex-wrap gap-2">
          {rol === "COORDINADOR_SINARP" && (
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => mut((x) => ({ ...x, estado: "En revisión de Gestión", version: x.version + 1, observaciones: undefined, fechaLimiteSubsanacion: undefined, decisionGestion: undefined, decisionDpi: undefined, informeDpiFirmas: 0 }), "Ampliación subsanada y reenviada", "La versión corregida vuelve al Director de Gestión.")}>
              Subsanar y reenviar
            </Button>
          )}
          {esGestion && (
            <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => mut((x) => ({ ...x, estado: "Cerrada" }), "Cerrada por vencimiento", "Venció el plazo de subsanación; queda inmodificable.")}>
              Simular vencimiento y cerrar
            </Button>
          )}
        </div>
      )}

      {/* ADD-04: Jurídica */}
      {am.estado === "Pendiente de firmas" && (
        <div className="space-y-2 rounded-lg bg-muted/30 border border-border p-3">
          <p className="font-semibold text-foreground">Adenda privada (ADD-04): firmas {am.firmasAdenda} de 2 · tipo de evento {EVENTO[am.tipo]}</p>
          {(rol === "JURIDICA" || rol === "COORDINADOR_SINARP") && (
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => {
              const f = am.firmasAdenda + 1;
              mut((x) => ({ ...x, firmasAdenda: f, estado: f >= 2 ? "Pendiente de pago" : x.estado }), `Firma verificada (${rol === "JURIDICA" ? "DINARP" : "consumidora"})`, f >= 2 ? "Firmas completas: pasa a factura y pago (FAC-01/PAG-01). La firma no aplica el alcance." : undefined);
            }}>
              Firmar adenda con FirmaEC
            </Button>
          )}
        </div>
      )}
      {am.estado === "Pendiente de pago" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Factura emitida; esperando el pago.</span>
          {(rol === "FACTURACION" || rol === "ADMIN") && (
            <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => mut((x) => ({ ...x, pagoConfirmado: true, estado: "Pendiente de aprobación" }), "Pago confirmado (PAG-02)")}>
              Confirmar pago
            </Button>
          )}
        </div>
      )}

      {/* ADD-06 */}
      {(am.estado === "Pendiente de aprobación" || am.estado === "Pendiente de corrección") && rol === "DIR_GESTION" && (
        <div className="space-y-2 rounded-lg bg-muted/30 border border-border p-3">
          <p className="font-semibold text-foreground">Aprobar la aplicación (ADD-06)</p>
          <p className="text-[11px] text-muted-foreground">Adenda firmada, ADD-07 aprobada y pago {am.pagoConfirmado ? "confirmado" : "pendiente"}.</p>
          <div className="flex flex-wrap items-end gap-2">
            <Button type="button" size="sm" variant="primary" disabled={!am.pagoConfirmado} className="text-xs gap-1" onClick={() => { st.aplicarAmpliacion(am.id, actor); toast.success("Alcance actualizado en Apigee (ACC-08)"); }}>
              <CheckCircle2 className="size-3.5" />
              Aprobar y aplicar
            </Button>
            <div className="w-40">
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger aria-label="Área responsable" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Jurídica", "Facturación", "Pagos"].map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input aria-label="Motivo de corrección" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo de la corrección" className="text-xs w-56" />
            <Button type="button" size="sm" variant="outline" disabled={!motivo.trim()} className="text-xs" onClick={() => { mut((x) => ({ ...x, estado: "Pendiente de corrección", correccion: { area, motivo: motivo.trim() } }), "Pendiente de corrección", `${area}: ${motivo.trim()}`); setMotivo(""); }}>
              Pendiente de corrección
            </Button>
          </div>
        </div>
      )}

      <ul className="border-t border-border pt-2 space-y-0.5 text-[11px] text-muted-foreground">
        {[...am.historial].reverse().map((h, i) => (
          <li key={i}>
            {formatoFecha(h.instante)} · {h.accion} · {h.actor}
            {h.detalle ? ` — ${h.detalle}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AmpliacionesPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const [campos, setCampos] = useState<string[]>([]);
  const [cupo, setCupo] = useState("");
  const disponibles = a.catalogoCampos.filter((c) => !a.camposAutorizados.includes(c.campo));
  const lista = st.ampliaciones.filter((x) => x.accesoId === a.id);

  const enviar = (c: string[], q: number) => {
    const r = st.crearAmpliacion(a.id, c, q, actor);
    (r.ok ? toast.success : toast.error)(r.mensaje);
    if (r.ok) {
      setCampos([]);
      setCupo("");
    }
  };

  return (
    <div className="space-y-5">
      {rol === "COORDINADOR_SINARP" && (
        <Seccion titulo="Ampliar esta solicitud (ADD-01, ADD-02, ADD-03, ADD-05)" descripcion={a.tipo === "Privada" ? "Más campos de la misma fuente, más cupo o ambos, bajo el mismo ID, credencial y contrato. Otra fuente exige una solicitud nueva." : "Una solicitud pública solo amplía campos de la misma fuente: no hay contrato, factura ni pago."}>
          {disponibles.length === 0 ? (
            <Alert variant="info" icon={<AlertCircle className="size-4" />} title="No hay campos adicionales disponibles" className="p-3 text-xs">
              Ya tienes autorizados todos los campos publicados de esta fuente.
            </Alert>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Campos que aún no están autorizados</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {disponibles.map((c) => (
                  <label key={c.campo} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs cursor-pointer">
                    <Checkbox checked={campos.includes(c.campo)} onCheckedChange={(v) => setCampos(v === true ? [...campos, c.campo] : campos.filter((x) => x !== c.campo))} />
                    <span className="font-mono">{c.campo}</span>
                    <Badge tone={c.clasificacion === "Confidencial" ? "danger" : "neutral"} appearance="soft" size="sm" className="text-[10px]">
                      {c.clasificacion}
                      {c.sensible ? " · sensible" : ""}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          )}
          {a.tipo === "Privada" && (
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="cupo-ad" className="text-xs text-muted-foreground">
                Cupo adicional (registros)
              </Label>
              <Input id="cupo-ad" type="number" min={1} value={cupo} onChange={(e) => setCupo(e.target.value)} className="text-xs font-mono" />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5" disabled={campos.length === 0 && !(parseInt(cupo) > 0)} onClick={() => enviar(campos, a.tipo === "Privada" ? parseInt(cupo) || 0 : 0)}>
              <PlusCircle className="size-4" />
              Enviar ampliación
            </Button>
            {a.tipo === "Privada" && (
              <Button type="button" variant="outline" size="sm" className="text-xs font-semibold gap-1.5" disabled={!(parseInt(cupo) > 0)} onClick={() => enviar([], parseInt(cupo))}>
                <RefreshCw className="size-4" />
                Generar renovación de cupo
              </Button>
            )}
          </div>
        </Seccion>
      )}

      <Seccion titulo="Ampliaciones de esta solicitud" descripcion="Gestión revisa los campos (y DPI los confidenciales); en una privada sigue la adenda firmada, el pago y la aprobación; solo entonces se aplica el alcance nuevo.">
        {lista.length === 0 ? <p className="text-xs text-muted-foreground">No hay ampliaciones.</p> : <div className="space-y-3">{[...lista].reverse().map((am) => <Tarjeta key={am.id} am={am} a={a} />)}</div>}
      </Seccion>
    </div>
  );
}
