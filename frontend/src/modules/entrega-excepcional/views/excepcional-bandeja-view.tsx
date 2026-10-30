"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, FileSignature, Inbox, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  diasParaVencer,
  formatoFecha,
  numero,
  saldoAutorizacion,
  useExcepcionalStore,
  type EstadoExcepcional,
  type SolicitudExcepcional,
} from "../data/excepcional-store";
import { EstadoBadge, ExcepcionalShell, PlazoBadge, useActor } from "../components/excepcional-ui";

const ESTADOS: EstadoExcepcional[] = [
  "En calificación",
  "Observada",
  "Admitida",
  "En informe tecnológico",
  "En informe DPI",
  "En informe final",
  "Pendiente de autorización",
  "Autorizada",
  "Rechazada",
  "Archivada",
  "Suspendida",
  "Vencida",
];

/** Estados en los que cada rol tiene algo por hacer en el trámite (EXT-02). */
const POR_ATENDER: Record<string, EstadoExcepcional[]> = {
  COORDINADOR_SINARP: ["Observada"],
  DIR_GESTION: ["En calificación", "En informe final"],
  EQ_GESTION: ["En calificación", "En informe final"],
  TI: ["En informe tecnológico"],
  DTD: ["En informe tecnológico"],
  DIR_DPI: ["En informe DPI"],
  EQ_DPI: ["En informe DPI"],
  APROBADOR: ["Pendiente de autorización"],
};

export function etapaActual(s: SolicitudExcepcional) {
  return [...s.etapas].reverse().find((e) => !e.resultado);
}

export function ExcepcionalBandejaView() {
  const { solicitudes, listo } = useExcepcionalStore();
  const { rol, institucion } = useActor();
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<string>("TODOS");

  const esCoordinador = rol === "COORDINADOR_SINARP";
  const visibles = useMemo(() => {
    // EXT-01: el Coordinador solo ve las de su institución; el resto de roles ve el trámite completo
    const propias = esCoordinador ? solicitudes.filter((s) => s.institucion === institucion) : solicitudes;
    return propias.filter((s) => {
      const q = busqueda.trim().toLowerCase();
      const coincide = !q || [s.id, s.institucion, s.fuente, s.coordinador].some((t) => t.toLowerCase().includes(q));
      return coincide && (estado === "TODOS" || s.estado === estado);
    });
  }, [solicitudes, esCoordinador, institucion, busqueda, estado]);

  const porAtender = (POR_ATENDER[rol] ?? []);
  const kpis = {
    atender: visibles.filter((s) => porAtender.includes(s.estado)).length,
    tramite: visibles.filter((s) => ["En calificación", "Observada", "Admitida", "En informe tecnológico", "En informe DPI", "En informe final", "Pendiente de autorización"].includes(s.estado)).length,
    vigentes: visibles.filter((s) => s.estado === "Autorizada" && s.autorizacion).length,
    porVencer: visibles.filter((s) => s.estado === "Autorizada" && s.autorizacion && (diasParaVencer(s) ?? 99) <= 15).length,
  };

  return (
    <ExcepcionalShell
      activeMenu="entrega-excepcional"
      etiqueta="BN-11 · Res. 003-NG-DINARP-2023 · EXT-01 a EXT-08"
      titulo="Entrega directa y excepcional"
      descripcion="Solicitudes de entrega por fuera de la vía general. Cada solicitud pasa por calificación, informe tecnológico, informe de DPI, informe final y la firma de la Máxima Autoridad; solo una autorización vigente permite ejecutar lotes."
      icono={<ShieldCheck className="size-32 text-primary" />}
      acciones={
        esCoordinador ? (
          <Link href="/entrega-excepcional/nueva">
            <Button type="button" variant="primary" size="sm" className="text-xs font-semibold gap-1.5">
              <Plus className="size-4" />
              <span>Nueva solicitud</span>
            </Button>
          </Link>
        ) : undefined
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { t: "Por atender por ti", v: kpis.atender, icono: <Inbox className="size-4" />, tono: "text-warning" },
          { t: "En trámite", v: kpis.tramite, icono: <Clock className="size-4" />, tono: "text-info" },
          { t: "Autorizaciones vigentes", v: kpis.vigentes, icono: <ShieldCheck className="size-4" />, tono: "text-success" },
          { t: "Vencen en 15 días o menos", v: kpis.porVencer, icono: <AlertTriangle className="size-4" />, tono: "text-danger" },
        ].map((k) => (
          <div key={k.t} className="bg-surface border border-border rounded-xl p-3.5 shadow-xs">
            <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold", k.tono)}>
              {k.icono}
              <span>{k.t}</span>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground mt-1">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Search value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onClear={() => setBusqueda("")} placeholder="Buscar por ID, institución, fuente o coordinador" size="sm" />
        </div>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="sm:w-60 h-10 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="text-xs font-bold text-white pl-6">ID</TableHead>
              <TableHead className="text-xs font-bold text-white">Institución / Fuente</TableHead>
              <TableHead className="text-xs font-bold text-white">Estado</TableHead>
              <TableHead className="text-xs font-bold text-white">Etapa y plazo</TableHead>
              <TableHead className="text-xs font-bold text-white">Vigencia y saldo</TableHead>
              <TableHead className="text-xs font-bold text-white text-right pr-6">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!listo ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                  Cargando solicitudes…
                </TableCell>
              </TableRow>
            ) : visibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                  No hay solicitudes con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              visibles.map((s) => {
                const etapa = etapaActual(s);
                const saldo = saldoAutorizacion(s);
                const dias = diasParaVencer(s);
                const atender = porAtender.includes(s.estado);
                return (
                  <TableRow key={s.id} className={cn(atender && "bg-warning/5")}>
                    <TableCell className="pl-6 font-mono text-xs font-semibold text-primary whitespace-nowrap">
                      <div>{s.id}</div>
                      {s.tipo === "Renovación" && (
                        <Badge tone="secondary" appearance="soft" size="sm" className="text-[10px] mt-1">
                          Renueva {s.origenId}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{s.institucion}</div>
                      <div className="text-muted-foreground">{s.fuente}</div>
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={s.estado} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {etapa ? (
                        <div className="space-y-1">
                          <span className="text-muted-foreground capitalize">{etapa.clave === "dpi" ? "Informe DPI" : etapa.clave === "tecnologico" ? "Informe tecnológico" : etapa.clave === "final" ? "Informe final" : etapa.clave === "autorizacion" ? "Autorización" : "Calificación"}</span>
                          <PlazoBadge fechaLimite={etapa.fechaLimite} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {s.autorizacion ? (
                        <div className="space-y-0.5">
                          <div className="text-foreground">{dias !== null && dias > 0 ? `${dias} días restantes` : "Vencida"}</div>
                          <div className="text-muted-foreground font-mono text-[11px]">
                            {numero(saldo.saldo)} / {numero(saldo.autorizado)} reg.
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Pide {numero(s.volumenSolicitado)} reg. · {formatoFecha(s.fechaCreacion, false)}</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/entrega-excepcional/detalle?id=${s.id}`}>
                        <Button type="button" variant={atender ? "primary" : "outline"} size="sm" className="text-xs font-semibold gap-1.5">
                          {atender && <FileSignature className="size-3.5" />}
                          <span>{atender ? "Atender" : "Ver"}</span>
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
    </ExcepcionalShell>
  );
}
