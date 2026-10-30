"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatoFecha, ultimoParametrosPublicados, useExcepcionalStore, vigenciaEnlaceActiva, type ParametrosExcepcional } from "../data/excepcional-store";
import { ExcepcionalShell, Seccion, useActor } from "../components/excepcional-ui";

type Numericos = Pick<ParametrosExcepcional, "minSupuestos" | "plazoCalificacionDias" | "plazoCompletarDias" | "plazoInformeTecnologicoDias" | "plazoInformeDpiDias" | "plazoInformeFinalDias" | "vigenciaMaximaDias" | "maxRenovaciones">;

const CAMPOS: { clave: keyof Numericos; etiqueta: string; ayuda: string }[] = [
  { clave: "minSupuestos", etiqueta: "Supuestos mínimos", ayuda: "Del art. 11, salvo el estado de excepción." },
  { clave: "plazoCalificacionDias", etiqueta: "Calificación (días hábiles)", ayuda: "Art. 13." },
  { clave: "plazoCompletarDias", etiqueta: "Completar requisitos (días hábiles)", ayuda: "Si no completa, se archiva." },
  { clave: "plazoInformeTecnologicoDias", etiqueta: "Informe tecnológico (días hábiles)", ayuda: "Art. 14." },
  { clave: "plazoInformeDpiDias", etiqueta: "Informe de DPI (días hábiles)", ayuda: "Art. 15." },
  { clave: "plazoInformeFinalDias", etiqueta: "Informe final (días hábiles)", ayuda: "Art. 16." },
  { clave: "vigenciaMaximaDias", etiqueta: "Vigencia máxima (días)", ayuda: "Tope de la temporalidad." },
  { clave: "maxRenovaciones", etiqueta: "Renovaciones máximas", ayuda: "Por autorización." },
];

/** PAR-17 (reglas y plazos del excepcional) y PAR-04 (vigencia de los enlaces de extracción). */
export function ParametrosExcepcionalView() {
  const st = useExcepcionalStore();
  const { rol, actor } = useActor();
  const vigente = ultimoParametrosPublicados(st.parametros);
  const enlace = vigenciaEnlaceActiva(st.vigenciasEnlace);
  const puedePar17 = rol === "DIR_NORMATIVA";
  const puedePar04 = rol === "ADMIN";

  const [num, setNum] = useState<Numericos | null>(null);
  const [supuestos, setSupuestos] = useState<Record<string, boolean>>({});
  const [dias, setDias] = useState("3");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (vigente) {
      setNum({ minSupuestos: vigente.minSupuestos, plazoCalificacionDias: vigente.plazoCalificacionDias, plazoCompletarDias: vigente.plazoCompletarDias, plazoInformeTecnologicoDias: vigente.plazoInformeTecnologicoDias, plazoInformeDpiDias: vigente.plazoInformeDpiDias, plazoInformeFinalDias: vigente.plazoInformeFinalDias, vigenciaMaximaDias: vigente.vigenciaMaximaDias, maxRenovaciones: vigente.maxRenovaciones });
      setSupuestos(Object.fromEntries(vigente.supuestos.map((s) => [s.codigo, s.bastaSolo])));
    }
    if (enlace) setDias(String(enlace.dias));
  }, [vigente?.version, enlace?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalido = !num || Object.values(num).some((v) => !Number.isInteger(v) || v < 1);
  const diasN = parseInt(dias);
  const invalidoDias = !Number.isInteger(diasN) || diasN < 1;

  return (
    <ExcepcionalShell
      activeMenu="parametros-excepcional"
      etiqueta="PAR-17 · PAR-04"
      titulo="Parámetros de la entrega excepcional"
      descripcion="Reglas y plazos de la Resolución 003-NG-DINARP-2023 y vigencia de los enlaces de descarga. Cada solicitud guarda la versión vigente al enviarse; una versión nueva no cambia las solicitudes ya presentadas."
      icono={<Settings2 className="size-32 text-primary" />}
    >
      {!st.listo || !num || !vigente ? (
        <p className="text-xs text-muted-foreground">Cargando…</p>
      ) : (
        <>
          <Seccion
            titulo={`PAR-17 · versión ${vigente.version} publicada`}
            descripcion={`Autor ${vigente.autor}, aprobó ${vigente.aprobador}, efecto ${formatoFecha(vigente.fechaEfecto, false)}. ${puedePar17 ? "Publicar crea una versión nueva y retira la anterior." : "Solo el Director de Normatividad publica versiones."}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CAMPOS.map((c) => (
                <div key={c.clave} className="space-y-1.5">
                  <Label htmlFor={c.clave} className="text-xs text-muted-foreground">
                    {c.etiqueta}
                  </Label>
                  <Input id={c.clave} type="number" min={1} disabled={!puedePar17} value={num[c.clave]} onChange={(e) => setNum({ ...num, [c.clave]: parseInt(e.target.value) || 0 })} className="text-xs font-mono" />
                  <p className="text-[11px] text-muted-foreground">{c.ayuda}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Catálogo de supuestos</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vigente.supuestos.map((s) => (
                  <li key={s.codigo} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                    <span>
                      {s.nombre} <span className="font-mono text-[10px] text-muted-foreground">{s.codigo}</span>
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Checkbox disabled={!puedePar17} checked={supuestos[s.codigo] ?? false} onCheckedChange={(v) => setSupuestos({ ...supuestos, [s.codigo]: v === true })} />
                      Basta solo
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            {puedePar17 && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={invalido}
                className="text-xs font-semibold"
                onClick={() => {
                  st.publicarParametros({ ...num, supuestos: vigente.supuestos.map((s) => ({ ...s, bastaSolo: supuestos[s.codigo] ?? s.bastaSolo })) }, actor);
                  toast.success("PAR-17: nueva versión publicada", { description: "Rige solo para las solicitudes que se envíen desde ahora." });
                }}
              >
                Publicar nueva versión
              </Button>
            )}
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="text-xs font-bold text-white pl-4">Versión</TableHead>
                    <TableHead className="text-xs font-bold text-white">Estado</TableHead>
                    <TableHead className="text-xs font-bold text-white">Plazos (cal. / inf. tec. / DPI / final)</TableHead>
                    <TableHead className="text-xs font-bold text-white">Vigencia máx.</TableHead>
                    <TableHead className="text-xs font-bold text-white">Efecto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...st.parametros].reverse().map((p) => (
                    <TableRow key={p.version}>
                      <TableCell className="pl-4 font-mono text-xs">v{p.version}</TableCell>
                      <TableCell>
                        <Badge tone={p.estado === "Publicada" ? "success" : "neutral"} appearance="soft" size="sm">
                          {p.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {p.plazoCalificacionDias} / {p.plazoInformeTecnologicoDias} / {p.plazoInformeDpiDias} / {p.plazoInformeFinalDias}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{p.vigenciaMaximaDias}</TableCell>
                      <TableCell className="text-xs">{formatoFecha(p.fechaEfecto, false)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Seccion>

          <Seccion titulo={`PAR-04 · vigencia de los enlaces de extracción${enlace ? ` (versión ${enlace.version})` : ""}`} descripcion="Define cuántos días puede el Coordinador completar la descarga de un lote. Cada lote conserva el valor con el que se creó su enlace; un cambio rige solo para los enlaces futuros.">
            {enlace ? (
              <p className="text-xs text-foreground">
                Vigente: <strong>{enlace.dias} días</strong> · {enlace.motivo} · {enlace.autor}, {formatoFecha(enlace.fecha, false)}
              </p>
            ) : (
              <p className="text-xs text-danger">Sin versión publicada: no se generan enlaces nuevos.</p>
            )}
            {puedePar04 ? (
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5 w-32">
                  <Label htmlFor="dias-enlace" className="text-xs text-muted-foreground">
                    Días de vigencia
                  </Label>
                  <Input id="dias-enlace" type="number" min={1} value={dias} onChange={(e) => setDias(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="space-y-1.5 w-72">
                  <Label htmlFor="motivo-enlace" className="text-xs text-muted-foreground">
                    Motivo <span className="text-danger">*</span>
                  </Label>
                  <Input id="motivo-enlace" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="text-xs" />
                </div>
                <Button type="button" variant="primary" size="sm" disabled={invalidoDias || !motivo.trim()} className="text-xs font-semibold" onClick={() => { st.publicarVigenciaEnlace(diasN, motivo.trim(), actor); setMotivo(""); toast.success("PAR-04: nueva vigencia publicada"); }}>
                  Publicar vigencia
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">Solo un Administrador autorizado modifica este parámetro.</p>
            )}
          </Seccion>
        </>
      )}
    </ExcepcionalShell>
  );
}
