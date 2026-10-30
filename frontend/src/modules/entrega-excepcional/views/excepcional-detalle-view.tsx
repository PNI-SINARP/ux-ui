"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatoFecha, numero, useExcepcionalStore, type SolicitudExcepcional } from "../data/excepcional-store";
import { Dato, EstadoBadge, ExcepcionalShell, Seccion } from "../components/excepcional-ui";
import { TramitePanel } from "../components/tramite-panel";
import { LotesPanel } from "../components/lotes-panel";
import { ControlPanel, RenovacionPanel } from "../components/renovacion-control-panel";

function Resumen({ s }: { s: SolicitudExcepcional }) {
  const { solicitudes, parametros } = useExcepcionalStore();
  const nombreSupuesto = (c: string) => parametros.at(-1)?.supuestos.find((p) => p.codigo === c)?.nombre ?? c;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Seccion titulo="Solicitud">
        <div className="grid grid-cols-2 gap-3">
          <Dato etiqueta="Institución consumidora">{s.institucion}</Dato>
          <Dato etiqueta="Coordinador">{s.coordinador}</Dato>
          <Dato etiqueta="Fuente">{s.fuente}</Dato>
          <Dato etiqueta="Versión de la solicitud">{s.version} · PAR-17 v{s.versionParametros}</Dato>
          <Dato etiqueta="Volumen solicitado">{numero(s.volumenSolicitado)} registros</Dato>
          <Dato etiqueta="Temporalidad">{s.temporalidadDias} días</Dato>
          <Dato etiqueta="Firmó" className="col-span-2">
            {s.firmante} {s.hashFirmaSolicitud && <span className="font-mono text-[10px] text-muted-foreground">· {s.hashFirmaSolicitud.slice(0, 14)}…</span>}
          </Dato>
          {s.origenId && (
            <Dato etiqueta="Renueva a">
              <Link href={`/entrega-excepcional/detalle?id=${s.origenId}`} className="text-primary hover:underline font-mono">
                {s.origenId}
              </Link>
            </Dato>
          )}
        </div>
        <Dato etiqueta="Finalidad">{s.finalidad}</Dato>
        <Dato etiqueta="Legitimación de acceso">{s.legitimacion}</Dato>
        <Dato etiqueta="Justificación técnica">{s.justificacionTecnica}</Dato>
      </Seccion>

      <div className="space-y-5">
        <Seccion titulo="Supuestos del art. 11">
          <ul className="space-y-2">
            {s.supuestos.map((x) => (
              <li key={x.codigo} className="text-xs">
                <strong className="text-foreground">{nombreSupuesto(x.codigo)}.</strong> <span className="text-muted-foreground">{x.justificacion}</span>
              </li>
            ))}
          </ul>
          {s.decreto && (
            <p className="text-[11px] text-muted-foreground">
              Decreto {s.decreto.numero} del {s.decreto.fecha}, vigente hasta {s.decreto.vigenciaHasta}.
            </p>
          )}
        </Seccion>
        <Seccion titulo="Entrega">
          <div className="grid grid-cols-2 gap-3">
            <Dato etiqueta="Formato">{s.formato} con gzip</Dato>
            <Dato etiqueta="Programación">{s.tipoProgramacion === "Única" ? "Única" : `Cada ${s.regla?.intervalo} ${s.regla?.unidad}(s) hasta ${s.fechaFinalProgramacion}`}</Dato>
            <Dato etiqueta="Primera ejecución (local)">{s.primeraEjecucionLocal.replace("T", " ")} · {s.zonaHoraria}</Dato>
            <Dato etiqueta="Primera ejecución (UTC)">
              <span className="font-mono text-[11px]">{s.primeraEjecucionUtc}</span> <span className="text-muted-foreground">({s.desplazamientoUtc})</span>
            </Dato>
          </div>
          <Dato etiqueta="Criterio de extracción">
            {s.criterio.length === 0 ? "Sin filtros" : s.criterio.map((c) => `${c.parametro} ${c.operador} ${c.valor}`).join(" · ")}
          </Dato>
          <Dato etiqueta="Datos solicitados">
            <div className="flex flex-wrap gap-1.5">
              {s.campos.map((c) => (
                <Badge key={c.campo} tone={c.categoria === "Confidencial" ? "danger" : "neutral"} appearance="soft" size="sm" className="text-[10px] font-mono">
                  {c.campo}
                </Badge>
              ))}
            </div>
          </Dato>
          <Dato etiqueta="Soportes">
            <ul className="space-y-0.5">
              {s.soportes.map((x) => (
                <li key={x.tipo} className="text-[11px]">
                  {x.tipo}: <span className="font-mono text-muted-foreground">{x.archivo}</span>
                </li>
              ))}
            </ul>
          </Dato>
        </Seccion>
        {s.autorizacion && (
          <Seccion titulo="Autorización">
            <div className="grid grid-cols-2 gap-3">
              <Dato etiqueta="Vigente desde">{formatoFecha(s.autorizacion.vigenciaDesde)}</Dato>
              <Dato etiqueta="Vigente hasta">{formatoFecha(s.autorizacion.vigenciaHasta)}</Dato>
              <Dato etiqueta="Volumen autorizado">{numero(s.autorizacion.volumenAutorizado)} registros</Dato>
              <Dato etiqueta="Renovaciones usadas">{s.autorizacion.renovacionesUsadas}</Dato>
            </div>
          </Seccion>
        )}
        {solicitudes.some((x) => x.origenId === s.id) && <p className="text-[11px] text-muted-foreground">Tiene renovaciones asociadas; ábrelas en la pestaña Renovación.</p>}
      </div>
    </div>
  );
}

function Historial({ s }: { s: SolicitudExcepcional }) {
  return (
    <Seccion titulo="Trazabilidad" descripcion="Cada transición conserva actor, instante y versión de la solicitud.">
      <ol className="space-y-2.5">
        {[...s.historial].reverse().map((h, i) => (
          <li key={i} className="rounded-lg border border-border px-3 py-2 text-xs space-y-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-foreground">{h.accion}</span>
              <span className="text-[11px] text-muted-foreground">{formatoFecha(h.instante)} · v{h.version}</span>
            </div>
            <p className="text-muted-foreground">
              {h.actor} · {h.rol}
            </p>
            {h.detalle && <p className="text-foreground/80">{h.detalle}</p>}
          </li>
        ))}
      </ol>
    </Seccion>
  );
}

export function ExcepcionalDetalleView() {
  const id = useSearchParams().get("id");
  const { solicitudes, listo } = useExcepcionalStore();
  const s = solicitudes.find((x) => x.id === id);

  return (
    <ExcepcionalShell
      activeMenu="entrega-excepcional"
      etiqueta={s ? `${s.tipo === "Renovación" ? "EXT-07 · Renovación" : "EXT-02"} · ${s.id}` : "Entrega excepcional"}
      titulo={s ? `${s.institucion} · ${s.fuente}` : "Solicitud de entrega excepcional"}
      descripcion={s ? `Versión ${s.version} · creada el ${formatoFecha(s.fechaCreacion, false)}. ${s.tipoProgramacion === "Periódica" ? "Programación periódica." : "Entrega única."}` : "Consulta el trámite, los lotes y los controles de una solicitud."}
      icono={<FileText className="size-32 text-primary" />}
      volver={{ href: "/entrega-excepcional", texto: "Volver a la bandeja" }}
      acciones={s && <EstadoBadge estado={s.estado} />}
    >
      {!listo ? (
        <p className="text-xs text-muted-foreground">Cargando…</p>
      ) : !s ? (
        <p className="text-xs text-muted-foreground">No se encontró la solicitud {id ?? ""}. Vuelve a la bandeja y elige una.</p>
      ) : (
        <Tabs defaultValue="tramite" className="gap-4">
          <TabsList className="flex-wrap h-auto justify-start">
            <TabsTrigger value="tramite">Trámite</TabsTrigger>
            <TabsTrigger value="resumen">Solicitud</TabsTrigger>
            <TabsTrigger value="lotes">Lotes y descarga</TabsTrigger>
            {s.tipo === "Solicitud" && <TabsTrigger value="renovacion">Renovación</TabsTrigger>}
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="tramite">
            <TramitePanel s={s} />
          </TabsContent>
          <TabsContent value="resumen">
            <Resumen s={s} />
          </TabsContent>
          <TabsContent value="lotes">
            <LotesPanel s={s} />
          </TabsContent>
          {s.tipo === "Solicitud" && (
            <TabsContent value="renovacion">
              {s.autorizacion ? <RenovacionPanel s={s} /> : <Seccion titulo="Renovación"><p className="text-xs text-muted-foreground">Solo una autorización vigente puede renovarse.</p></Seccion>}
            </TabsContent>
          )}
          <TabsContent value="control">
            <ControlPanel s={s} />
          </TabsContent>
          <TabsContent value="historial">
            <Historial s={s} />
          </TabsContent>
        </Tabs>
      )}
    </ExcepcionalShell>
  );
}
