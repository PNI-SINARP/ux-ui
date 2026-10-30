"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Seccion, ExcepcionalShell, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { formatoFecha, parametrosVigentes, useConsumoStore } from "../data/consumo-store";

export function ParametrosConsumoView() {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const vigente = parametrosVigentes(st.parametros);
  const puede = rol === "DTD";
  const [f, setF] = useState({ tasa: "50", hilosEst: "10", maxHilos: "150", ini: "20:00", fin: "06:00", finde: true, antic: "48", dur: "8" });

  useEffect(() => {
    if (vigente) setF({ tasa: String(vigente.tasaMaxima), hilosEst: String(vigente.hilosEstandar), maxHilos: String(vigente.maxHilosPorConsumidor), ini: vigente.franjaInicio, fin: vigente.franjaFin, finde: vigente.incluyeFinesDeSemana, antic: String(vigente.anticipacionMinimaHoras), dur: String(vigente.duracionMaximaHoras) });
  }, [vigente?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const nums = [f.tasa, f.hilosEst, f.maxHilos, f.antic, f.dur].map((v) => parseInt(v));
  const invalido = nums.some((n) => !(n >= 1)) || !f.ini || !f.fin;
  const campo = (id: keyof typeof f, etiqueta: string, tipo = "number") => (
    <div className="space-y-1.5">
      <Label htmlFor={`par18-${id}`} className="text-xs text-muted-foreground">{etiqueta}</Label>
      <Input id={`par18-${id}`} type={tipo} min={1} disabled={!puede} value={String(f[id])} onChange={(e) => setF({ ...f, [id]: e.target.value })} className="text-xs font-mono" />
    </div>
  );

  return (
    <ExcepcionalShell activeMenu="parametros-consumo" etiqueta="PAR-18" titulo="Límites del consumo masivo" descripcion="Límites estándar que rigen fuera de una programación y reglas para programar ventanas de consumo masivo (Res. 003-NG-DINARP-2025). Sin versión publicada no se aprueban programaciones." icono={<Gauge className="size-32 text-primary" />}>
      {!st.listo || !vigente ? (
        <p className="text-xs text-muted-foreground">Cargando…</p>
      ) : (
        <Seccion titulo={`PAR-18 · versión ${vigente.version} publicada`} descripcion={`${vigente.autor} · ${formatoFecha(vigente.fecha)}. ${puede ? "Publicar prueba los límites en Apigee y crea una versión nueva que rige solo las programaciones futuras." : "Solo el Director de Tecnología y Desarrollo publica versiones."}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {campo("tasa", "Tasa máxima por credencial (req/s)")}
            {campo("hilosEst", "Hilos concurrentes estándar")}
            {campo("maxHilos", "Máx. hilos por consumidor")}
            {campo("antic", "Anticipación mínima (horas)")}
            {campo("dur", "Duración máxima de la ventana (horas)")}
            {campo("ini", "Franja preferente: inicio", "time")}
            {campo("fin", "Franja preferente: fin", "time")}
            <label className="flex items-center gap-2 text-xs pt-6">
              <Checkbox disabled={!puede} checked={f.finde} onCheckedChange={(v) => setF({ ...f, finde: v === true })} />
              Incluye fines de semana
            </label>
          </div>
          {puede && (
            <Button type="button" variant="primary" size="sm" disabled={invalido} className="text-xs font-semibold" onClick={() => { st.publicarParametros({ tasaMaxima: parseInt(f.tasa), hilosEstandar: parseInt(f.hilosEst), maxHilosPorConsumidor: parseInt(f.maxHilos), franjaInicio: f.ini, franjaFin: f.fin, incluyeFinesDeSemana: f.finde, anticipacionMinimaHoras: parseInt(f.antic), duracionMaximaHoras: parseInt(f.dur) }, actor); toast.success("PAR-18: nueva versión publicada", { description: "Límites estándar probados en Apigee." }); }}>
              Probar en Apigee y publicar
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            {[...st.parametros].reverse().map((p) => (
              <Badge key={p.version} tone={p.estado === "Publicada" ? "success" : "neutral"} appearance="soft" size="sm">
                v{p.version} · {p.estado}
              </Badge>
            ))}
          </div>
        </Seccion>
      )}
    </ExcepcionalShell>
  );
}
