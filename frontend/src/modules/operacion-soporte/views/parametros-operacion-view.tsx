"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sliders } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExcepcionalShell, Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { AREAS_DESTINO, formatoFecha, parametrosActivos, politicaActiva, useOperacionStore, type ParametrosMonitoreo, type PoliticaSoporte, type Prioridad } from "../data/operacion-store";

const PRIORIDADES: Prioridad[] = ["P1", "P2", "P3", "P4"];

function Par03() {
  const op = useOperacionStore();
  const { rol } = useActor();
  const vigente = politicaActiva(op.politicas);
  const puede = rol === "ADMIN";
  const [p, setP] = useState<PoliticaSoporte["p"] | null>(null);
  const [dias, setDias] = useState("3");
  const [reglas, setReglas] = useState<PoliticaSoporte["escalamiento"]>([]);
  const [nueva, setNueva] = useState({ prioridad: "P2" as Prioridad, nivel: "1", minutos: "60", destino: AREAS_DESTINO[0] });
  const [prov, setProv] = useState({ nombre: "", correo: "" });
  useEffect(() => {
    if (vigente) {
      setP(vigente.p);
      setDias(String(vigente.diasRevisionSolucion));
      setReglas(vigente.escalamiento);
    }
  }, [vigente?.version]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!vigente || !p) return <p className="text-xs text-muted-foreground">Sin política publicada.</p>;
  const invalido = PRIORIDADES.some((k) => !(p[k].minutos > 0)) || !(parseInt(dias) > 0);
  const duplicada = reglas.some((r, i) => reglas.findIndex((x) => x.prioridad === r.prioridad && x.nivel === r.nivel) !== i);
  return (
    <div className="space-y-5">
      <Seccion titulo={`PAR-03 · política de soporte v${vigente.version} publicada`} descripcion={`${formatoFecha(vigente.fecha)}. Una versión nueva no recalcula los plazos de incidentes ya clasificados.`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRIORIDADES.map((k) => (
            <div key={k} className="rounded-xl border border-border p-3 space-y-2">
              <p className="text-xs font-bold text-foreground">{k}</p>
              <div className="space-y-1">
                <Label htmlFor={`min-${k}`} className="text-[11px] text-muted-foreground">Duración objetivo (min)</Label>
                <Input id={`min-${k}`} type="number" min={1} disabled={!puede} value={p[k].minutos} onChange={(e) => setP({ ...p, [k]: { ...p[k], minutos: parseInt(e.target.value) || 0 } })} className="text-xs font-mono" />
              </div>
              <Select value={p[k].reloj} onValueChange={(v) => setP({ ...p, [k]: { ...p[k], reloj: v as "Continuo" | "Hábil" } })} disabled={!puede}>
                <SelectTrigger aria-label={`Reloj ${k}`} className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Continuo">Reloj continuo</SelectItem><SelectItem value="Hábil">Reloj hábil (PAR-10)</SelectItem></SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="dias-rev" className="text-xs text-muted-foreground">Días para revisar la solución</Label>
          <Input id="dias-rev" type="number" min={1} disabled={!puede} value={dias} onChange={(e) => setDias(e.target.value)} className="text-xs font-mono" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Reglas de escalamiento</p>
          <ul className="space-y-1 text-xs">
            {reglas.map((r, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-1.5">
                <span>{r.prioridad} · nivel {r.nivel} · a los {r.minutos} min → {r.tipoDestino}: {op.proveedores.find((x) => x.id === r.destino)?.nombre ?? r.destino}</span>
                {puede && <Button type="button" size="sm" variant="ghost" className="text-[11px] h-7 text-danger" onClick={() => setReglas(reglas.filter((_, k) => k !== i))}>Quitar</Button>}
              </li>
            ))}
          </ul>
          {duplicada && <p className="text-[11px] text-danger">Hay niveles duplicados para la misma prioridad.</p>}
          {puede && (
            <div className="flex flex-wrap items-end gap-2">
              <Select value={nueva.prioridad} onValueChange={(v) => setNueva({ ...nueva, prioridad: v as Prioridad })}>
                <SelectTrigger aria-label="Prioridad de la regla" className="h-9 w-24 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORIDADES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
              <Input aria-label="Nivel" type="number" min={1} value={nueva.nivel} onChange={(e) => setNueva({ ...nueva, nivel: e.target.value })} className="text-xs w-20 font-mono" />
              <Input aria-label="Minutos" type="number" min={1} value={nueva.minutos} onChange={(e) => setNueva({ ...nueva, minutos: e.target.value })} className="text-xs w-24 font-mono" />
              <Select value={nueva.destino} onValueChange={(v) => setNueva({ ...nueva, destino: v })}>
                <SelectTrigger aria-label="Destino" className="h-9 w-72 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AREAS_DESTINO.map((a) => <SelectItem key={a} value={a}>Área: {a}</SelectItem>)}
                  {op.proveedores.filter((x) => x.activo && x.correoVerificado).map((x) => <SelectItem key={x.id} value={x.id}>Proveedor: {x.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => setReglas([...reglas, { prioridad: nueva.prioridad, nivel: parseInt(nueva.nivel) || 1, minutos: parseInt(nueva.minutos) || 1, tipoDestino: op.proveedores.some((x) => x.id === nueva.destino) ? "Proveedor" : "Área", destino: nueva.destino }])}>Agregar regla</Button>
            </div>
          )}
        </div>
        {puede && (
          <Button type="button" variant="primary" size="sm" disabled={invalido || duplicada} className="text-xs font-semibold" onClick={() => { op.publicarPolitica({ p, escalamiento: reglas, diasRevisionSolucion: parseInt(dias) }); toast.success("Política de soporte publicada"); }}>
            Publicar política
          </Button>
        )}
      </Seccion>

      <Seccion titulo="Proveedores de soporte" descripcion="El correo se marca Verificado solo al confirmar el código de un solo uso; un proveedor sin correo verificado no puede ser destino de una regla.">
        <ul className="space-y-1.5 text-xs">
          {op.proveedores.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span>{x.nombre} · <span className="font-mono">{x.correo}</span></span>
              <span className="flex items-center gap-1.5">
                <Badge tone={x.correoVerificado ? "success" : "warning"} appearance="soft" size="sm">{x.correoVerificado ? "Verificado" : "Declarado"}</Badge>
                <Badge tone={x.activo ? "success" : "neutral"} appearance="soft" size="sm">{x.activo ? "Activo" : "Inactivo"}</Badge>
                {puede && !x.correoVerificado && <Button type="button" size="sm" variant="outline" className="text-[11px] h-7" onClick={() => { op.guardarProveedor({ ...x, correoVerificado: true }); toast.success("Código confirmado: correo verificado"); }}>Confirmar código</Button>}
                {puede && <Button type="button" size="sm" variant="outline" className="text-[11px] h-7" onClick={() => { if (x.activo && reglas.some((r) => r.destino === x.id)) { toast.error("Reasigna las reglas activas antes de inactivarlo."); return; } op.guardarProveedor({ ...x, activo: !x.activo }); }}>{x.activo ? "Inactivar" : "Activar"}</Button>}
              </span>
            </li>
          ))}
        </ul>
        {puede && (
          <div className="flex flex-wrap items-end gap-2">
            <Input aria-label="Nombre del proveedor" value={prov.nombre} onChange={(e) => setProv({ ...prov, nombre: e.target.value })} placeholder="Nombre" className="text-xs w-56" />
            <Input aria-label="Correo del proveedor" value={prov.correo} onChange={(e) => setProv({ ...prov, correo: e.target.value })} placeholder="correo@proveedor" className="text-xs w-56" />
            <Button type="button" size="sm" variant="outline" disabled={!prov.nombre.trim() || !/^\S+@\S+\.\S+$/.test(prov.correo)} className="text-xs" onClick={() => { op.guardarProveedor({ id: `PROV-${String(op.proveedores.length + 1).padStart(3, "0")}`, nombre: prov.nombre.trim(), correo: prov.correo.trim(), correoVerificado: false, activo: true }); setProv({ nombre: "", correo: "" }); toast.info("Verificación del proveedor pendiente: se envió un código de un solo uso"); }}>Registrar proveedor</Button>
          </div>
        )}
      </Seccion>
    </div>
  );
}

function Par06() {
  const op = useOperacionStore();
  const { rol, actor } = useActor();
  const v = parametrosActivos(op.parametros);
  const puede = rol === "ADMIN";
  const [f, setF] = useState<Record<string, string>>({});
  useEffect(() => {
    if (v) setF({ umbralProximidad: String(v.umbralProximidad), duracionVentanaMin: String(v.duracionVentanaMin), ventanasLineaBase: String(v.ventanasLineaBase), umbralMinimo: String(v.umbralMinimo), factorDesviacion: String(v.factorDesviacion), maxHealthchecksFallidos: String(v.maxHealthchecksFallidos), latenciaMaximaMs: String(v.latenciaMaximaMs), tasaErrorMaxima: String(v.tasaErrorMaxima), colaMaxima: String(v.colaMaxima), cpuMaximo: String(v.cpuMaximo), memoriaMaxima: String(v.memoriaMaxima), disponibilidadObjetivo: String(v.disponibilidadObjetivo), severidad: v.severidad });
  }, [v?.version]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!v) return <p className="text-xs text-muted-foreground">Sin versión publicada: las alertas muestran «Sin regla».</p>;
  const n = (k: string) => parseFloat(f[k]);
  const errores: string[] = [];
  if (!(n("duracionVentanaMin") > 0)) errores.push("duracion_ventana debe ser mayor que cero.");
  if (!(n("ventanasLineaBase") >= 1)) errores.push("N de ventanas de línea base debe ser al menos 1.");
  if (!(n("umbralProximidad") > 0 && n("umbralProximidad") <= 1)) errores.push("umbral_proximidad debe estar entre 0 y 1.");
  if (!(n("umbralMinimo") >= 0)) errores.push("umbral_minimo no puede ser negativo.");
  if (!(n("factorDesviacion") > 0)) errores.push("factor_desviacion debe ser positivo.");
  if (!(n("tasaErrorMaxima") >= 0 && n("tasaErrorMaxima") <= 1)) errores.push("tasa_error_maxima debe estar entre 0 y 1.");
  if (![n("cpuMaximo"), n("memoriaMaxima")].every((x) => x >= 0 && x <= 100)) errores.push("CPU y memoria son porcentajes de 0 a 100.");
  const campos: [string, string][] = [["umbralProximidad", "Umbral de proximidad (0–1)"], ["duracionVentanaMin", "Duración de la ventana (min)"], ["ventanasLineaBase", "Ventanas de línea base (N)"], ["umbralMinimo", "Umbral mínimo (reg/min)"], ["factorDesviacion", "Factor de desviación"], ["maxHealthchecksFallidos", "Healthchecks fallidos máx."], ["latenciaMaximaMs", "Latencia máxima (ms)"], ["tasaErrorMaxima", "Tasa de error máxima (0–1)"], ["colaMaxima", "Profundidad de cola máx."], ["cpuMaximo", "CPU máx. (%)"], ["memoriaMaxima", "Memoria máx. (%)"], ["disponibilidadObjetivo", "Disponibilidad objetivo (%)"]];
  return (
    <Seccion titulo={`PAR-06 · umbrales y ventanas v${v.version} publicada`} descripcion={`${v.autor} · ${formatoFecha(v.fecha)}. Una versión nueva solo afecta evaluaciones futuras; si falta una métrica o regla se muestra «Sin datos» o «Sin regla».`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {campos.map(([k, l]) => (
          <div key={k} className="space-y-1">
            <Label htmlFor={`p6-${k}`} className="text-xs text-muted-foreground">{l}</Label>
            <Input id={`p6-${k}`} type="number" step="any" disabled={!puede} value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="text-xs font-mono" />
          </div>
        ))}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Severidad de la alerta</Label>
          <Select value={f.severidad} onValueChange={(x) => setF({ ...f, severidad: x })} disabled={!puede}>
            <SelectTrigger aria-label="Severidad" className="h-10 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{["Informativa", "Advertencia", "Crítica"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      {errores.length > 0 && <ul className="text-[11px] text-danger list-disc pl-4">{errores.map((e) => <li key={e}>{e}</li>)}</ul>}
      {puede ? (
        <Button type="button" variant="primary" size="sm" disabled={errores.length > 0} className="text-xs font-semibold" onClick={() => { op.publicarParametros({ umbralProximidad: n("umbralProximidad"), duracionVentanaMin: n("duracionVentanaMin"), ventanasLineaBase: n("ventanasLineaBase"), umbralMinimo: n("umbralMinimo"), factorDesviacion: n("factorDesviacion"), maxHealthchecksFallidos: n("maxHealthchecksFallidos"), latenciaMaximaMs: n("latenciaMaximaMs"), tasaErrorMaxima: n("tasaErrorMaxima"), colaMaxima: n("colaMaxima"), cpuMaximo: n("cpuMaximo"), memoriaMaxima: n("memoriaMaxima"), disponibilidadObjetivo: n("disponibilidadObjetivo"), severidad: f.severidad as ParametrosMonitoreo["severidad"] }, actor); toast.success("Parámetros de monitoreo publicados"); }}>
          Publicar nueva versión
        </Button>
      ) : <p className="text-[11px] text-muted-foreground">Solo un Administrador técnico autorizado publica versiones.</p>}
    </Seccion>
  );
}

export function ParametrosOperacionView() {
  const op = useOperacionStore();
  return (
    <ExcepcionalShell activeMenu="parametros-operacion" etiqueta="PAR-03 · PAR-06" titulo="Parámetros de soporte y monitoreo" descripcion="Tiempos P1 a P4 y escalamiento para los incidentes, y umbrales y ventanas que usan las alertas de consumo y de infraestructura." icono={<Sliders className="size-32 text-primary" />}>
      {!op.listo ? <p className="text-xs text-muted-foreground">Cargando…</p> : (
        <Tabs defaultValue="soporte" className="gap-4">
          <TabsList className="h-auto flex-wrap justify-start"><TabsTrigger value="soporte">Soporte (PAR-03)</TabsTrigger><TabsTrigger value="monitoreo">Monitoreo (PAR-06)</TabsTrigger></TabsList>
          <TabsContent value="soporte"><Par03 /></TabsContent>
          <TabsContent value="monitoreo"><Par06 /></TabsContent>
        </Tabs>
      )}
    </ExcepcionalShell>
  );
}
