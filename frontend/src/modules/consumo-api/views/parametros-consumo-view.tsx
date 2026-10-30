"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  History,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InteractiveCard } from "@/components/ui/data-display";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { cn } from "@/lib/utils";
import { useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import {
  formatoFecha,
  parametrosVigentes,
  useConsumoStore,
} from "../data/consumo-store";

export function ParametrosConsumoView() {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const vigente = parametrosVigentes(st.parametros);
  const puede = rol === "DTD" || rol === "ADMIN";
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [busquedaVer, setBusquedaVer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [f, setF] = useState({
    tasa: "50",
    hilosEst: "10",
    maxHilos: "150",
    ini: "20:00",
    fin: "06:00",
    finde: true,
    antic: "48",
    dur: "8",
  });

  useEffect(() => {
    if (vigente) {
      setF({
        tasa: String(vigente.tasaMaxima),
        hilosEst: String(vigente.hilosEstandar),
        maxHilos: String(vigente.maxHilosPorConsumidor),
        ini: vigente.franjaInicio,
        fin: vigente.franjaFin,
        finde: vigente.incluyeFinesDeSemana,
        antic: String(vigente.anticipacionMinimaHoras),
        dur: String(vigente.duracionMaximaHoras),
      });
    }
  }, [vigente?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const nums = [f.tasa, f.hilosEst, f.maxHilos, f.antic, f.dur].map((v) =>
    parseInt(v)
  );
  const invalido = nums.some((n) => !(n >= 1)) || !f.ini || !f.fin;

  const historialFiltrado = useMemo(() => {
    const q = busquedaVer.trim().toLowerCase();
    return [...st.parametros]
      .reverse()
      .filter((p) =>
        !q
          ? true
          : `v${p.version}`.includes(q) ||
            p.estado.toLowerCase().includes(q) ||
            p.autor.toLowerCase().includes(q)
      );
  }, [st.parametros, busquedaVer]);

  const totalPages = Math.max(1, Math.ceil(historialFiltrado.length / pageSize));
  const paginatedHistorial = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return historialFiltrado.slice(start, start + pageSize);
  }, [historialFiltrado, currentPage, pageSize]);

  const campo = (id: keyof typeof f, etiqueta: string, tipo = "number") => (
    <div className="space-y-1.5">
      <Label
        htmlFor={`par18-${id}`}
        className="text-xs font-semibold text-foreground"
      >
        {etiqueta}
      </Label>
      <Input
        id={`par18-${id}`}
        type={tipo}
        min={1}
        disabled={!puede}
        value={String(f[id])}
        onChange={(e) => setF({ ...f, [id]: e.target.value })}
        className="text-xs font-mono"
      />
    </div>
  );

  return (
    <WireframeDashboardLayout activeMenu="parametros-consumo">
      <main className="mx-auto max-w-[1600px] space-y-6 pb-16">
        <Card className="p-6 sm:p-8 rounded-2xl border-border shadow-xs space-y-6 bg-surface">
          {/* Header alineado con cuentas-internas (sin etiquetas técnicas encima del título) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border/70">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                  Parámetros de Consumo Masivo y Límites Operativos
                </h1>
                {vigente && (
                  <Badge
                    tone="success"
                    appearance="soft"
                    size="sm"
                    className="font-mono"
                  >
                    Versión vigente v{vigente.version}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Configuración de límites estándar que rigen fuera de una ventana programada y reglas operativas para autorizar programaciones de consumo masivo en Apigee (Res. 003-NG-DINARP-2025).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="size-3.5" />}
                onClick={() => {
                  st.reiniciar();
                  toast.info("Datos de demostración restaurados");
                }}
              >
                Restaurar datos demo
              </Button>
            </div>
          </div>

          {!st.listo || !vigente ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              Cargando configuración vigente…
            </p>
          ) : (
            <>
              {/* 4 KPI Summary Cards interactivas estilo cuentas-internas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card
                  variant="featured"
                  className="group p-4 rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Tasa máxima estándar
                      </span>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {vigente.tasaMaxima} req/s
                      </p>
                      <span className="text-[11px] text-muted-foreground block">
                        Por credencial fuera de ventana
                      </span>
                    </div>
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
                      <Gauge className="size-5" />
                    </div>
                  </div>
                </Card>

                <Card
                  variant="featured"
                  className="group p-4 rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Hilos estándar / máx. ventana
                      </span>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {vigente.hilosEstandar} / {vigente.maxHilosPorConsumidor}
                      </p>
                      <span className="text-[11px] text-muted-foreground block">
                        Concurrencia máxima autorizable
                      </span>
                    </div>
                    <div className="size-10 rounded-xl bg-info/10 text-info flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-info group-hover:text-white">
                      <Cpu className="size-5" />
                    </div>
                  </div>
                </Card>

                <Card
                  variant="featured"
                  className="group p-4 rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Franja horaria preferente
                      </span>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {vigente.franjaInicio} – {vigente.franjaFin}
                      </p>
                      <span className="text-[11px] text-muted-foreground block">
                        {vigente.incluyeFinesDeSemana
                          ? "Incluye sábados y domingos"
                          : "Solo días hábiles nocturnos"}
                      </span>
                    </div>
                    <div className="size-10 rounded-xl bg-success/10 text-success flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-success group-hover:text-white">
                      <Clock className="size-5" />
                    </div>
                  </div>
                </Card>

                <Card
                  variant="featured"
                  className="group p-4 rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Anticipación y duración máx.
                      </span>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {vigente.anticipacionMinimaHoras}h /{" "}
                        {vigente.duracionMaximaHoras}h
                      </p>
                      <span className="text-[11px] text-muted-foreground block">
                        Regla para programar API-06
                      </span>
                    </div>
                    <div className="size-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-warning group-hover:text-white">
                      <CalendarClock className="size-5" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Formulario de edición y publicación */}
              <section className="rounded-2xl border border-border bg-surface-subtle/40 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-foreground">
                      Configuración de versión vigente (v{vigente.version})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Publicada por {vigente.autor} el{" "}
                      {formatoFecha(vigente.fecha)}.{" "}
                      {puede
                        ? "Al publicar se prueban los límites en Apigee y se genera una nueva versión que rige únicamente para las programaciones futuras."
                        : "Solo el Director de Tecnología y Desarrollo (DTD) puede publicar nuevas versiones."}
                    </p>
                  </div>
                  {puede && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        leftIcon={<Sparkles className="size-3.5" />}
                        onClick={() =>
                          setF({
                            tasa: "60",
                            hilosEst: "12",
                            maxHilos: "180",
                            ini: "21:00",
                            fin: "06:00",
                            finde: true,
                            antic: "36",
                            dur: "10",
                          })
                        }
                      >
                        Cargar preset alta capacidad
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {campo("tasa", "Tasa máxima por credencial (req/s)")}
                  {campo("hilosEst", "Hilos concurrentes estándar")}
                  {campo("maxHilos", "Máx. hilos por consumidor")}
                  {campo("antic", "Anticipación mínima (horas)")}
                  {campo("dur", "Duración máxima de la ventana (horas)")}
                  {campo("ini", "Franja preferente: inicio", "time")}
                  {campo("fin", "Franja preferente: fin", "time")}
                  <label className="flex items-center gap-2.5 text-xs font-medium text-foreground pt-6 cursor-pointer">
                    <Checkbox
                      disabled={!puede}
                      checked={f.finde}
                      onCheckedChange={(v) => setF({ ...f, finde: v === true })}
                    />
                    Incluye fines de semana completos
                  </label>
                </div>

                {!puede ? (
                  <Alert
                    variant="info"
                    icon={<Activity className="size-4" />}
                    title="Modo de consulta"
                    className="p-3.5 text-xs"
                  >
                    Estás visualizando los parámetros vigentes con el perfil actual. Cambia al perfil de Director de Tecnología y Desarrollo (DTD) en el selector superior si deseas publicar una nueva versión.
                  </Alert>
                ) : (
                  <div className="flex justify-end pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={invalido}
                      leftIcon={<CheckCircle2 className="size-4" />}
                      onClick={() => {
                        st.publicarParametros(
                          {
                            tasaMaxima: parseInt(f.tasa),
                            hilosEstandar: parseInt(f.hilosEst),
                            maxHilosPorConsumidor: parseInt(f.maxHilos),
                            franjaInicio: f.ini,
                            franjaFin: f.fin,
                            incluyeFinesDeSemana: f.finde,
                            anticipacionMinimaHoras: parseInt(f.antic),
                            duracionMaximaHoras: parseInt(f.dur),
                          },
                          actor
                        );
                        toast.success("Nueva versión publicada", {
                          description:
                            "Límites estándar verificados y aplicados en Apigee.",
                        });
                      }}
                    >
                      Probar en Apigee y publicar versión
                    </Button>
                  </div>
                )}
              </section>

              {/* Historial de versiones con Tabla / Tarjetas estilo cuentas-internas */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-foreground">
                      Historial de versiones publicadas
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Trazabilidad de versiones de parámetros operativos y su estado de vigencia.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-64">
                      <Search
                        size="sm"
                        placeholder="Buscar versión, estado o autor..."
                        value={busquedaVer}
                        onChange={(e) => {
                          setBusquedaVer(e.target.value);
                          setCurrentPage(1);
                        }}
                        onClear={() => {
                          setBusquedaVer("");
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                  </div>
                </div>

                {/* Vista Tabla */}
                <div
                  className={cn(
                    "w-full",
                    viewMode === "table" ? "hidden md:block" : "hidden"
                  )}
                >
                  <Table
                    className="w-full min-w-[820px]"
                    containerClassName="overflow-x-auto w-full"
                  >
                    <TableHeader>
                      <TableRow className="border-0">
                        <TableHead className="whitespace-nowrap text-left pl-6">
                          VERSIÓN / FECHA
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-left">
                          TASA / HILOS ESTÁNDAR
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-left">
                          MÁX. HILOS VENTANA
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-left">
                          FRANJA PREFERENTE
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-left">
                          ANTICIPACIÓN / DURACIÓN
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-left">
                          AUTOR
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-right pr-6">
                          ESTADO
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHistorial.map((p) => (
                        <TableRow key={p.version}>
                          <TableCell className="pl-6">
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-bold text-primary block">
                                Versión v{p.version}
                              </span>
                              <span className="text-[11px] font-mono text-muted-foreground block">
                                {formatoFecha(p.fecha)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-foreground">
                            {p.tasaMaxima} req/s · {p.hilosEstandar} hilos
                          </TableCell>
                          <TableCell className="text-xs font-mono font-semibold text-foreground">
                            {p.maxHilosPorConsumidor} hilos
                          </TableCell>
                          <TableCell className="text-xs font-mono text-foreground">
                            {p.franjaInicio}–{p.franjaFin}{" "}
                            {p.incluyeFinesDeSemana ? "(+Finde)" : ""}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-foreground">
                            {p.anticipacionMinimaHoras} h mín. /{" "}
                            {p.duracionMaximaHoras} h máx.
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.autor}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Badge
                              tone={
                                p.estado === "Publicada" ? "success" : "neutral"
                              }
                              appearance="soft"
                              size="sm"
                            >
                              {p.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Vista Tarjetas */}
                <div
                  className={cn(
                    viewMode === "cards"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                      : "block md:hidden space-y-3.5"
                  )}
                >
                  {paginatedHistorial.map((p) => (
                    <InteractiveCard
                      key={p.version}
                      color={p.estado === "Publicada" ? "success" : "default"}
                      decorativeIcon={
                        <History className="size-full stroke-[0.8]" />
                      }
                      className="p-4 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-sm font-bold text-primary">
                            Versión v{p.version}
                          </span>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {formatoFecha(p.fecha)} · {p.autor}
                          </p>
                        </div>
                        <Badge
                          tone={
                            p.estado === "Publicada" ? "success" : "neutral"
                          }
                          appearance="soft"
                          size="sm"
                        >
                          {p.estado}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-surface-subtle/60 border border-border/60 p-3">
                        <div>
                          <span className="text-[11px] text-muted-foreground block">
                            Tasa / Hilos est.
                          </span>
                          <strong className="font-mono text-foreground">
                            {p.tasaMaxima} req/s · {p.hilosEstandar} hilos
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">
                            Máx. hilos ventana
                          </span>
                          <strong className="font-mono text-foreground">
                            {p.maxHilosPorConsumidor} hilos
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">
                            Franja preferente
                          </span>
                          <strong className="font-mono text-foreground">
                            {p.franjaInicio}–{p.franjaFin}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">
                            Anticipación / Duración
                          </span>
                          <strong className="font-mono text-foreground">
                            {p.anticipacionMinimaHoras}h /{" "}
                            {p.duracionMaximaHoras}h
                          </strong>
                        </div>
                      </div>
                    </InteractiveCard>
                  ))}
                </div>

                {/* Footer de paginación estilo cuentas-internas */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-border/60">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Mostrando{" "}
                      <strong className="font-semibold text-foreground">
                        {historialFiltrado.length === 0
                          ? 0
                          : (currentPage - 1) * pageSize + 1}
                      </strong>{" "}
                      a{" "}
                      <strong className="font-semibold text-foreground">
                        {Math.min(
                          currentPage * pageSize,
                          historialFiltrado.length
                        )}
                      </strong>{" "}
                      de{" "}
                      <strong className="font-semibold text-foreground">
                        {historialFiltrado.length}
                      </strong>{" "}
                      versiones
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Filas:</span>
                      <div className="inline-flex items-center rounded-lg border border-border bg-surface-subtle/60 p-0.5">
                        {[5, 10, 15].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              setPageSize(sz);
                              setCurrentPage(1);
                            }}
                            className={cn(
                              "px-2 py-0.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                              pageSize === sz
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <Pagination className="w-auto mx-0">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationFirst
                            href="#"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setCurrentPage(1);
                            }}
                            aria-disabled={currentPage === 1}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setCurrentPage((p) => Math.max(1, p - 1));
                            }}
                            aria-disabled={currentPage === 1}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: totalPages },
                          (_, idx) => idx + 1
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(ev) => {
                                ev.preventDefault();
                                setCurrentPage(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setCurrentPage((p) =>
                                Math.min(totalPages, p + 1)
                              );
                            }}
                            aria-disabled={currentPage === totalPages}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLast
                            href="#"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setCurrentPage(totalPages);
                            }}
                            aria-disabled={currentPage === totalPages}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
