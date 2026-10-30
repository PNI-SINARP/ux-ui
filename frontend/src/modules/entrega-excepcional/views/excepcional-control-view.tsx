"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { diasParaVencer, formatoFecha, numero, saldoAutorizacion, useExcepcionalStore, type SolicitudExcepcional } from "../data/excepcional-store";
import { EstadoBadge, ExcepcionalShell, useActor } from "../components/excepcional-ui";

type Grupo = "vigentes" | "porVencer" | "vencidas" | "suspendidas";

const GRUPOS: { id: Grupo; etiqueta: string }[] = [
  { id: "vigentes", etiqueta: "Vigentes" },
  { id: "porVencer", etiqueta: "Por vencer (15 días o menos)" },
  { id: "vencidas", etiqueta: "Vencidas" },
  { id: "suspendidas", etiqueta: "Suspendidas" },
];

function pertenece(s: SolicitudExcepcional, g: Grupo): boolean {
  const dias = diasParaVencer(s);
  if (g === "vigentes") return s.estado === "Autorizada";
  if (g === "porVencer") return s.estado === "Autorizada" && dias !== null && dias <= 15;
  if (g === "vencidas") return s.estado === "Vencida";
  return s.estado === "Suspendida";
}

/** EXT-08 CA3: tablero de control con conciliación autorizado frente a ejecutado (criterio H4.9 del TDR). */
export function ExcepcionalControlView() {
  const { solicitudes, listo } = useExcepcionalStore();
  const { rol } = useActor();
  const [grupo, setGrupo] = useState<Grupo>("vigentes");
  const conAutorizacion = useMemo(() => solicitudes.filter((s) => s.autorizacion), [solicitudes]);
  const filas = conAutorizacion.filter((s) => pertenece(s, grupo));
  const permitido = rol === "CONTROL_EVALUACION" || rol === "ADMIN";

  return (
    <ExcepcionalShell
      activeMenu="control-excepcional"
      etiqueta="EXT-08 · Control y Evaluación"
      titulo="Tablero de control de autorizaciones excepcionales"
      descripcion="Autorizaciones vigentes, por vencer, vencidas y suspendidas, con la conciliación entre lo autorizado y lo ejecutado. Desde cada autorización se registran controles y se ordena, con hallazgos, la suspensión."
      icono={<ClipboardCheck className="size-32 text-primary" />}
    >
      {!listo ? (
        <p className="text-xs text-muted-foreground">Cargando…</p>
      ) : !permitido ? (
        <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 border border-border p-3">Este tablero solo lo ve un rol con la capacidad de control (Dirección de Control y Evaluación).</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {GRUPOS.map((g) => {
              const n = conAutorizacion.filter((s) => pertenece(s, g.id)).length;
              return (
                <button key={g.id} type="button" onClick={() => setGrupo(g.id)} aria-pressed={grupo === g.id} className={cn("text-left rounded-xl border p-3.5 shadow-xs transition-colors", grupo === g.id ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/40")}>
                  <span className="text-[11px] font-semibold text-muted-foreground">{g.etiqueta}</span>
                  <p className="text-2xl font-bold font-heading text-foreground mt-1">{n}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="text-xs font-bold text-white pl-6">Autorización</TableHead>
                  <TableHead className="text-xs font-bold text-white">Consumidora / Fuente</TableHead>
                  <TableHead className="text-xs font-bold text-white">Estado</TableHead>
                  <TableHead className="text-xs font-bold text-white">Vigencia</TableHead>
                  <TableHead className="text-xs font-bold text-white">Autorizado</TableHead>
                  <TableHead className="text-xs font-bold text-white">Ejecutado</TableHead>
                  <TableHead className="text-xs font-bold text-white">Controles</TableHead>
                  <TableHead className="text-xs font-bold text-white text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-xs text-muted-foreground">
                      No hay autorizaciones en este grupo.
                    </TableCell>
                  </TableRow>
                ) : (
                  filas.map((s) => {
                    const saldo = saldoAutorizacion(s);
                    const pct = saldo.autorizado ? Math.round((saldo.consumido / saldo.autorizado) * 100) : 0;
                    const dias = diasParaVencer(s);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="pl-6 font-mono text-xs font-semibold text-primary">{s.id}</TableCell>
                        <TableCell className="text-xs">
                          <div className="font-semibold text-foreground">{s.institucion}</div>
                          <div className="text-muted-foreground">{s.fuente}</div>
                        </TableCell>
                        <TableCell>
                          <EstadoBadge estado={s.estado} />
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{formatoFecha(s.autorizacion?.vigenciaHasta, false)}</div>
                          <div className="text-muted-foreground text-[11px]">{dias !== null && dias > 0 ? `${dias} días` : "Vencida"}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{numero(saldo.autorizado)}</TableCell>
                        <TableCell className="text-xs">
                          <div className="font-mono">{numero(saldo.consumido)} <span className="text-muted-foreground">({pct}%)</span></div>
                          {saldo.reservado > 0 && <div className="text-warning text-[11px]">+{numero(saldo.reservado)} reservado</div>}
                        </TableCell>
                        <TableCell className="text-xs">{s.controles.length}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Link href={`/entrega-excepcional/detalle?id=${s.id}`}>
                            <Button type="button" variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
                              <ShieldAlert className="size-3.5" />
                              Controlar
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </ExcepcionalShell>
  );
}
