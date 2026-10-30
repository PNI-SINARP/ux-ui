"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Play,
  Sparkles,
  Square,
  X,
  XCircle,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "@/components/ui/search";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import {
  formatoFecha,
  numero,
  parametrosVigentes,
  saldoAcceso,
  useConsumoStore,
  type AccesoApi,
  type EstadoProgramacion,
  type ProgramacionMasiva,
} from "../data/consumo-store";

const TONO: Record<
  EstadoProgramacion,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  Borrador: "neutral",
  Enviada: "info",
  Observada: "warning",
  Coordinada: "info",
  Aprobada: "success",
  Rechazada: "danger",
  "Pendiente de aplicación": "warning",
  "En ejecución": "info",
  Completada: "success",
  Cancelada: "neutral",
  Suspendida: "danger",
};

const COLOR_CARD: Record<
  EstadoProgramacion,
  "default" | "info" | "warning" | "success" | "danger" | "primary"
> = {
  Borrador: "default",
  Enviada: "info",
  Observada: "warning",
  Coordinada: "primary",
  Aprobada: "success",
  Rechazada: "danger",
  "Pendiente de aplicación": "warning",
  "En ejecución": "primary",
  Completada: "success",
  Cancelada: "default",
  Suspendida: "danger",
};

const FORMA_ENVIO_OPCIONES = [
  { value: "Por script", label: "Por script (API-02 una a una)" },
  { value: "Por petición única", label: "Por petición única (API-03)" },
] as const;

const ESTADOS_FILTRO: Array<"TODOS" | EstadoProgramacion> = [
  "TODOS",
  "Enviada",
  "Observada",
  "Coordinada",
  "Aprobada",
  "Pendiente de aplicación",
  "En ejecución",
  "Completada",
  "Suspendida",
  "Rechazada",
  "Cancelada",
];

// Hora local de Ecuador (UTC-5, sin cambio horario)
const aUtc = (local: string) => new Date(`${local}:00-05:00`);

function fueraDeFranja(
  local: string,
  inicio: string,
  fin: string,
  finesDeSemana: boolean
) {
  const d = aUtc(local);
  const hora =
    new Date(d.getTime() - 5 * 3600000).getUTCHours() * 60 +
    new Date(d.getTime() - 5 * 3600000).getUTCMinutes();
  const dow = new Date(d.getTime() - 5 * 3600000).getUTCDay();
  if (finesDeSemana && (dow === 0 || dow === 6)) return false;
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  const i = hi * 60 + mi;
  const f = hf * 60 + mf;
  return i > f ? !(hora >= i || hora < f) : !(hora >= i && hora < f);
}

function Tarjeta({ p }: { p: ProgramacionMasiva }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const par = parametrosVigentes(st.parametros);
  const [obs, setObs] = useState("");
  const [alterna, setAlterna] = useState("");
  const [hilos, setHilos] = useState(String(p.hilos));
  const [motivo, setMotivo] = useState("");
  const accion = (
    estado: EstadoProgramacion,
    texto: string,
    extra: Partial<ProgramacionMasiva> = {},
    detalle?: string
  ) => st.mutarProgramacion(p.id, estado, actor, texto, extra, detalle);

  return (
    <InteractiveCard
      color={COLOR_CARD[p.estado]}
      decorativeIcon={<CalendarClock className="size-full stroke-[0.8]" />}
      className="p-4 sm:p-5 space-y-4 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-sm font-bold text-primary">
            {p.id}
          </span>
          <Badge tone={TONO[p.estado]} appearance="soft" size="sm">
            {p.estado}
          </Badge>
          <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
            PAR-18 v{p.versionPar18}
          </Badge>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {p.inicioLocal.replace("T", " ")} → {p.finLocal.replace("T", " ")} (America/Guayaquil)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface-subtle/60 border border-border/60 p-3 space-y-0.5">
          <span className="text-[11px] text-muted-foreground block">
            Volumen programado
          </span>
          <span className="text-sm font-bold text-foreground font-mono">
            {numero(p.cantidad)} registros
          </span>
        </div>
        <div className="rounded-xl bg-surface-subtle/60 border border-border/60 p-3 space-y-0.5">
          <span className="text-[11px] text-muted-foreground block">
            Concurrencia y lotes
          </span>
          <span className="text-sm font-bold text-foreground font-mono">
            {p.hilos} hilos × {numero(p.registrosPorHilo)}
          </span>
        </div>
        <div className="rounded-xl bg-surface-subtle/60 border border-border/60 p-3 space-y-0.5">
          <span className="text-[11px] text-muted-foreground block">
            Modalidad de envío
          </span>
          <span className="text-sm font-semibold text-foreground">
            {p.forma}
            {p.ajuste ? ` · Ajuste: ${p.ajuste}` : ""}
          </span>
        </div>
      </div>

      {p.justificacionHorario && (
        <div className="rounded-xl bg-info/10 border border-info/25 p-3 text-xs text-foreground">
          <strong>Justificación de horario fuera de franja:</strong> {p.justificacionHorario}
        </div>
      )}

      {p.observacion && (
        <Alert
          variant="warning"
          icon={<AlertCircle className="size-4" />}
          title="Observación de DGR"
          className="p-3.5 text-xs"
        >
          {p.observacion}
          {p.ventanaAlternativa && (
            <span className="block mt-1 font-medium">
              Ventana alternativa propuesta: {p.ventanaAlternativa}
            </span>
          )}
        </Alert>
      )}

      {p.motivoRechazo && (
        <Alert
          variant="danger"
          icon={<XCircle className="size-4" />}
          title="Programación rechazada"
          className="p-3.5 text-xs"
        >
          {p.motivoRechazo}
        </Alert>
      )}

      {p.resumen && (
        <div className="rounded-xl bg-success/10 border border-success/25 p-3.5 text-xs text-foreground">
          <strong>Resumen de ventana:</strong> {numero(p.resumen.procesados)} procesados ·{" "}
          {numero(p.resumen.conError)} con error · {numero(p.resumen.rechazados)} rechazados (429). Lo no consumido en la ventana no se consume después.
        </div>
      )}

      {/* Coordinador */}
      {rol === "COORDINADOR_SINARP" &&
        ["Enviada", "Observada", "Coordinada", "Aprobada"].includes(
          p.estado
        ) && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {p.estado === "Observada" && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() =>
                  accion("Enviada", "Programación ajustada y reenviada")
                }
              >
                Reenviar ajustada
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="neutral"
              onClick={() => {
                accion("Cancelada", "Cancelada por el Coordinador");
                toast.info("Programación cancelada");
              }}
            >
              Cancelar antes del inicio
            </Button>
          </div>
        )}

      {/* DGR */}
      {rol === "DGR" && p.estado === "Enviada" && (
        <div className="space-y-4 rounded-xl bg-surface-subtle/60 border border-border p-4">
          <p className="font-bold text-sm text-foreground">
            Coordinar fecha y hora con la consumidora
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Observación (obligatoria si observas)
              </Label>
              <Input
                aria-label="Observación"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Detalle de la observación..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Ventana alternativa
              </Label>
              <Input
                aria-label="Ventana alternativa"
                value={alterna}
                onChange={(e) => setAlterna(e.target.value)}
                placeholder="Ej. 2026-11-08 22:00 a 02:00"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                accion("Coordinada", "Coordinada con la consumidora");
                toast.success("Programación coordinada");
              }}
            >
              Marcar como Coordinada
            </Button>
            <Button
              type="button"
              size="sm"
              variant="warning"
              disabled={!obs.trim() || !alterna.trim()}
              onClick={() => {
                accion("Observada", "Observada por DGR", {
                  observacion: obs.trim(),
                  ventanaAlternativa: alterna.trim(),
                });
                toast.warning("Observada: vuelve al Coordinador");
              }}
            >
              Observar programación
            </Button>
          </div>
        </div>
      )}

      {/* DTD */}
      {rol === "DTD" && p.estado === "Coordinada" && (
        <div className="space-y-4 rounded-xl bg-surface-subtle/60 border border-border p-4">
          <p className="font-bold text-sm text-foreground">
            Analizar los parámetros (puedes reducir, nunca aumentar)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor={`h-${p.id}`}
                className="text-xs font-semibold text-foreground"
              >
                Hilos aprobados
              </Label>
              <Input
                id={`h-${p.id}`}
                type="number"
                min={1}
                max={p.hilos}
                value={hilos}
                onChange={(e) => setHilos(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="md:col-span-3">
              <Button
                type="button"
                size="sm"
                variant="primary"
                className="w-full"
                disabled={!(parseInt(hilos) >= 1 && parseInt(hilos) <= p.hilos)}
                leftIcon={<CheckCircle2 className="size-4" />}
                onClick={() => {
                  const h = parseInt(hilos);
                  accion(
                    "Aprobada",
                    "Aprobada por Tecnología",
                    h < p.hilos
                      ? { hilos: h, ajuste: `hilos de ${p.hilos} a ${h}` }
                      : {}
                  );
                  toast.success("Programación aprobada");
                }}
              >
                Aprobar
              </Button>
            </div>
            <div className="md:col-span-4 space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Motivo del rechazo
              </Label>
              <Input
                aria-label="Motivo del rechazo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Indica el motivo del rechazo..."
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="button"
                size="sm"
                variant="danger"
                className="w-full"
                disabled={!motivo.trim()}
                leftIcon={<XCircle className="size-4" />}
                onClick={() => {
                  accion("Rechazada", "Rechazada por Tecnología", {
                    motivoRechazo: motivo.trim(),
                  });
                  toast.warning("Programación rechazada");
                }}
              >
                Rechazar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ventana: aplicación en Apigee */}
      {(rol === "DTD" || rol === "TI") && p.estado === "Aprobada" && (
        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            size="sm"
            variant="primary"
            leftIcon={<Play className="size-4" />}
            onClick={() => {
              accion(
                "En ejecución",
                "Inicio de ventana",
                {},
                `Límites aprobados aplicados en Apigee (${p.hilos} hilos).`
              );
              toast.success("Ventana iniciada: límites aplicados en Apigee");
            }}
          >
            Simular inicio de ventana
          </Button>
          <Button
            type="button"
            size="sm"
            variant="neutral"
            onClick={() => {
              accion(
                "Pendiente de aplicación",
                "Apigee no confirmó la aplicación",
                {},
                `El consumo sigue con los límites estándar (${par?.hilosEstandar ?? "—"} hilos). Alerta a TI.`
              );
              toast.warning("Pendiente de aplicación: alerta a TI");
            }}
          >
            Simular fallo de Apigee
          </Button>
        </div>
      )}

      {(rol === "DTD" || rol === "TI") &&
        p.estado === "Pendiente de aplicación" && (
          <div>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                accion("En ejecución", "Límites aplicados tras reintento");
                toast.success("Límites aplicados");
              }}
            >
              Reintentar aplicación
            </Button>
          </div>
        )}

      {p.estado === "En ejecución" && (rol === "DTD" || rol === "TI") && (
        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            size="sm"
            variant="primary"
            leftIcon={<Square className="size-4" />}
            onClick={() => {
              const procesados = Math.round(p.cantidad * 0.92);
              accion(
                "Completada",
                "Ventana cerrada",
                {
                  resumen: {
                    procesados,
                    conError: Math.round(p.cantidad * 0.01),
                    rechazados: Math.round(p.cantidad * 0.02),
                  },
                },
                "Se restablecen los límites estándar de PAR-18."
              );
              toast.success("Ventana cerrada; límites estándar restablecidos");
            }}
          >
            Simular cierre de ventana
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={() => {
              accion(
                "Suspendida",
                "Suspendida por Tecnología",
                {},
                "Afecta al servicio en línea (p95 +10 %). Se restablecen los límites estándar y se avisa al Coordinador."
              );
              toast.warning("Suspendida");
            }}
          >
            Suspender por afectación al servicio
          </Button>
        </div>
      )}

      <ul className="border-t border-border/70 pt-3 space-y-1 text-xs text-muted-foreground">
        {[...p.historial].reverse().map((h, i) => (
          <li key={i}>
            <span className="font-mono">{formatoFecha(h.instante)}</span> ·{" "}
            <strong className="text-foreground font-medium">{h.accion}</strong> ·{" "}
            {h.actor}
            {h.detalle ? ` — ${h.detalle}` : ""}
          </li>
        ))}
      </ul>
    </InteractiveCard>
  );
}

export function ProgramacionPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const par = parametrosVigentes(st.parametros);
  const { saldo } = saldoAcceso(a, st.eventos);
  const [ahoraMs] = useState(() => Date.now());
  const [formaSearch, setFormaSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [busquedaPrg, setBusquedaPrg] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"TODOS" | EstadoProgramacion>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [f, setF] = useState({
    inicio: "",
    fin: "",
    cantidad: "100000",
    hilos: "20",
    porHilo: "5000",
    forma: "Por script" as ProgramacionMasiva["forma"],
    justificacion: "",
  });

  const listaCompleta = useMemo(
    () => [...st.programaciones.filter((p) => p.accesoId === a.id)].reverse(),
    [st.programaciones, a.id]
  );

  const listaFiltrada = useMemo(() => {
    const q = busquedaPrg.trim().toLowerCase();
    return listaCompleta
      .filter((p) => (estadoFiltro === "TODOS" ? true : p.estado === estadoFiltro))
      .filter((p) =>
        !q
          ? true
          : p.id.toLowerCase().includes(q) ||
            p.forma.toLowerCase().includes(q) ||
            p.estado.toLowerCase().includes(q) ||
            (p.observacion ?? "").toLowerCase().includes(q)
      );
  }, [listaCompleta, busquedaPrg, estadoFiltro]);

  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / pageSize));
  const paginatedLista = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return listaFiltrada.slice(start, start + pageSize);
  }, [listaFiltrada, currentPage, pageSize]);

  const hayFiltros = busquedaPrg.trim() !== "" || estadoFiltro !== "TODOS";

  const currentFormaLabel =
    FORMA_ENVIO_OPCIONES.find((o) => o.value === f.forma)?.label ?? "";

  const errores = useMemo(() => {
    const e: string[] = [];
    if (!par)
      return ["PAR-18 no tiene versión publicada: no se aprueban programaciones."];
    if (!f.inicio || !f.fin) return ["Indica el inicio y el fin de la ventana."];
    const i = aUtc(f.inicio).getTime();
    const fin = aUtc(f.fin).getTime();
    if (fin <= i) e.push("El fin debe ser posterior al inicio.");
    if ((fin - i) / 3600000 > par.duracionMaximaHoras)
      e.push(`La ventana no puede superar ${par.duracionMaximaHoras} horas.`);
    if ((i - ahoraMs) / 3600000 < par.anticipacionMinimaHoras)
      e.push(
        `Debes programar con al menos ${par.anticipacionMinimaHoras} horas de anticipación.`
      );
    if (!(parseInt(f.hilos) >= 1) || parseInt(f.hilos) > par.maxHilosPorConsumidor)
      e.push(`Hilos entre 1 y ${par.maxHilosPorConsumidor}.`);
    if (!(parseInt(f.porHilo) >= 1) || !(parseInt(f.cantidad) >= 1))
      e.push("Cantidad y registros por hilo deben ser positivos.");
    if (a.tipo === "Privada" && parseInt(f.cantidad) > saldo)
      e.push(`La cantidad supera el saldo disponible (${numero(saldo)}).`);
    return e;
  }, [f, par, saldo, a.tipo, ahoraMs]);

  const fuera =
    par && f.inicio
      ? fueraDeFranja(
          f.inicio,
          par.franjaInicio,
          par.franjaFin,
          par.incluyeFinesDeSemana
        )
      : false;
  const faltaJustificacion = fuera && !f.justificacion.trim();

  const aplicarPresetVentana = (modo: "nocturna" | "diurna") => {
    const base = new Date(Date.now() + 72 * 3600000);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    if (modo === "nocturna") {
      setF({
        inicio: `${yyyy}-${mm}-${dd}T22:00`,
        fin: `${yyyy}-${mm}-${dd}T23:55`,
        cantidad: "80000",
        hilos: "16",
        porHilo: "5000",
        forma: "Por script",
        justificacion: "",
      });
    } else {
      setF({
        inicio: `${yyyy}-${mm}-${dd}T10:00`,
        fin: `${yyyy}-${mm}-${dd}T13:00`,
        cantidad: "60000",
        hilos: "12",
        porHilo: "5000",
        forma: "Por petición única",
        justificacion:
          "Sincronización urgente requerida antes del corte contable de mediodía.",
      });
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {rol === "COORDINADOR_SINARP" && (
          <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border/70">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">
                  Programar un consumo masivo (API-06)
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No es una solicitud de acceso nueva: usa el acceso, la credencial y los campos ya autorizados. Fuera de una programación aprobada rigen los límites estándar y Apigee rechaza el exceso con HTTP 429.
                </p>
              </div>
              {par && (
                <Badge
                  tone="info"
                  appearance="soft"
                  size="sm"
                  className="shrink-0 font-mono"
                >
                  PAR-18 v{par.version} · máx. {par.maxHilosPorConsumidor} hilos ·{" "}
                  {par.duracionMaximaHoras} h
                </Badge>
              )}
            </div>

            {/* Presets de caso de uso API-06 */}
            <div className="rounded-xl bg-surface-subtle/70 border border-border p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Casos de prueba rápidos (API-06 / PAR-18):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => aplicarPresetVentana("nocturna")}
                >
                  1. Ventana nocturna preferente (22:00–23:55)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => aplicarPresetVentana("diurna")}
                >
                  2. Fuera de franja con justificación (10:00–13:00)
                </Button>
              </div>
            </div>

            {par && (
              <div className="rounded-xl bg-surface-subtle/60 border border-border/60 px-4 py-3 text-xs text-muted-foreground">
                Anticipación mínima:{" "}
                <strong className="text-foreground">
                  {par.anticipacionMinimaHoras} h
                </strong>{" "}
                · Franja preferente:{" "}
                <strong className="text-foreground">
                  {par.franjaInicio}–{par.franjaFin}
                </strong>
                {par.incluyeFinesDeSemana ? " y fines de semana" : ""}.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="p-inicio"
                  className="text-xs font-semibold text-foreground"
                >
                  Inicio (hora de Ecuador)
                </Label>
                <Input
                  id="p-inicio"
                  type="datetime-local"
                  value={f.inicio}
                  onChange={(e) => setF({ ...f, inicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="p-fin"
                  className="text-xs font-semibold text-foreground"
                >
                  Fin (hora de Ecuador)
                </Label>
                <Input
                  id="p-fin"
                  type="datetime-local"
                  value={f.fin}
                  onChange={(e) => setF({ ...f, fin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Forma de envío
                </Label>
                <Combobox
                  value={f.forma}
                  onValueChange={(val) => {
                    if (val) {
                      setF({
                        ...f,
                        forma: val as ProgramacionMasiva["forma"],
                      });
                      const found = FORMA_ENVIO_OPCIONES.find(
                        (o) => o.value === val
                      );
                      if (found) setFormaSearch(found.label);
                    }
                  }}
                  inputValue={formaSearch || currentFormaLabel}
                  onInputValueChange={setFormaSearch}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Seleccionar forma de envío..."
                    showTrigger={true}
                    showClear={false}
                    showSearchIcon={false}
                    className="w-full"
                  />
                  <ComboboxContent className="min-w-[260px] z-[80]">
                    <ComboboxList>
                      <ComboboxGroup>
                        <ComboboxLabel>Modalidad de envío</ComboboxLabel>
                        {FORMA_ENVIO_OPCIONES.map((opt) => (
                          <ComboboxItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs py-1.5 cursor-pointer"
                          >
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="p-cant"
                  className="text-xs font-semibold text-foreground"
                >
                  Cantidad de registros
                </Label>
                <Input
                  id="p-cant"
                  type="number"
                  min={1}
                  value={f.cantidad}
                  onChange={(e) => setF({ ...f, cantidad: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="p-hilos"
                  className="text-xs font-semibold text-foreground"
                >
                  Número de hilos
                </Label>
                <Input
                  id="p-hilos"
                  type="number"
                  min={1}
                  value={f.hilos}
                  onChange={(e) => setF({ ...f, hilos: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="p-porhilo"
                  className="text-xs font-semibold text-foreground"
                >
                  Registros por hilo
                </Label>
                <Input
                  id="p-porhilo"
                  type="number"
                  min={1}
                  value={f.porHilo}
                  onChange={(e) => setF({ ...f, porHilo: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>

            {fuera && (
              <div className="space-y-3">
                <Alert
                  variant="info"
                  icon={<AlertCircle className="size-4" />}
                  title="Fuera de la franja preferente"
                  className="p-3.5 text-xs"
                >
                  Se recomienda programar de noche o en fin de semana. No se bloquea, pero necesitas justificar el horario.
                </Alert>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Justificación del horario
                  </Label>
                  <Textarea
                    aria-label="Justificación del horario"
                    value={f.justificacion}
                    onChange={(e) =>
                      setF({ ...f, justificacion: e.target.value })
                    }
                    rows={2}
                    placeholder="Describe por qué se requiere ejecutar fuera de la franja nocturna/fin de semana..."
                  />
                </div>
              </div>
            )}

            {errores.length > 0 && f.inicio && (
              <ul className="text-xs text-danger list-disc pl-5 space-y-1">
                {errores.map((er) => (
                  <li key={er}>{er}</li>
                ))}
              </ul>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={errores.length > 0 || faltaJustificacion}
                leftIcon={<CalendarClock className="size-4" />}
                onClick={() => {
                  const id = st.crearProgramacion(
                    {
                      accesoId: a.id,
                      inicioLocal: f.inicio,
                      finLocal: f.fin,
                      cantidad: parseInt(f.cantidad),
                      hilos: parseInt(f.hilos),
                      registrosPorHilo: parseInt(f.porHilo),
                      forma: f.forma,
                      justificacionHorario: fuera
                        ? f.justificacion.trim()
                        : undefined,
                    },
                    actor
                  );
                  toast.success(`${id} enviada`, {
                    description:
                      "La Dirección de Gestión y Registro la coordina con la consumidora.",
                  });
                }}
              >
                Enviar programación
              </Button>
            </div>
          </section>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-foreground">
                Programaciones de este acceso
              </h2>
              <p className="text-xs text-muted-foreground">
                DGR coordina la fecha; Tecnología y Desarrollo aprueba y aplica los límites en Apigee solo durante la ventana. Durante y después se ve el seguimiento a partir de los eventos de API-04.
              </p>
            </div>
            <Badge tone="neutral" appearance="soft" size="sm">
              {listaFiltrada.length}{" "}
              {listaFiltrada.length === 1 ? "programación" : "programaciones"}
            </Badge>
          </div>

          {/* Barra de búsqueda, filtro por estado y ViewModeToggle estilo cuentas-internas */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="flex-1 min-w-[240px]">
                <Search
                  size="sm"
                  placeholder="Buscar por código PRG, modalidad de envío u observación..."
                  value={busquedaPrg}
                  onChange={(e) => {
                    setBusquedaPrg(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setBusquedaPrg("");
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-full sm:w-[230px]">
                  <Combobox
                    value={estadoFiltro}
                    onValueChange={(val) => {
                      if (val) {
                        setEstadoFiltro(val as "TODOS" | EstadoProgramacion);
                        setEstadoSearch(val === "TODOS" ? "Todos los estados" : val);
                        setCurrentPage(1);
                      }
                    }}
                    inputValue={
                      estadoSearch ||
                      (estadoFiltro === "TODOS" ? "Todos los estados" : estadoFiltro)
                    }
                    onInputValueChange={setEstadoSearch}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Estado..."
                      showTrigger={true}
                      showClear={false}
                      showSearchIcon={false}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[230px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                          {ESTADOS_FILTRO.map((est) => (
                            <ComboboxItem
                              key={est}
                              value={est}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {est === "TODOS" ? "Todos los estados" : est}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {hayFiltros && (
              <div className="flex flex-wrap items-center gap-2 pt-1 animate-fade-in">
                <span className="text-xs font-medium text-muted-foreground mr-1">
                  Filtros activos:
                </span>
                {busquedaPrg.trim() !== "" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span>Búsqueda: &ldquo;{busquedaPrg}&rdquo;</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setBusquedaPrg("");
                            setCurrentPage(1);
                          }}
                          className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                          aria-label="Quitar filtro de búsqueda"
                        >
                          <X className="size-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Quitar filtro de búsqueda
                      </TooltipContent>
                    </Tooltip>
                  </Badge>
                )}
                {estadoFiltro !== "TODOS" && (
                  <Badge
                    tone="info"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span>Estado: {estadoFiltro}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setEstadoFiltro("TODOS");
                            setEstadoSearch("");
                            setCurrentPage(1);
                          }}
                          className="hover:bg-info/20 rounded-full p-0.5 transition-colors cursor-pointer"
                          aria-label="Quitar filtro de estado"
                        >
                          <X className="size-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Quitar filtro de estado
                      </TooltipContent>
                    </Tooltip>
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-danger gap-1"
                  onClick={() => {
                    setBusquedaPrg("");
                    setEstadoFiltro("TODOS");
                    setEstadoSearch("");
                    setCurrentPage(1);
                  }}
                >
                  <X className="size-3" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Vista Tabla (Desktop cuando viewMode === "table") */}
          <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
            <Table
              className="w-full min-w-[880px]"
              containerClassName="overflow-x-auto w-full"
            >
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="whitespace-nowrap text-left pl-6">
                    ID / VERSIÓN PAR-18
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    VENTANA (ECUADOR)
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    VOLUMEN / CONCURRENCIA
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    MODALIDAD
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    ESTADO
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-right pr-6">
                    GESTIÓN
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLista.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CalendarClock className="size-8 stroke-[1.5] text-muted-foreground/60" />
                        <p className="text-sm font-semibold text-foreground">
                          No se encontraron programaciones
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajusta los filtros o registra una nueva ventana masiva.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLista.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-6">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-primary block">
                            {p.id}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            PAR-18 v{p.versionPar18}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-foreground">
                        {p.inicioLocal.replace("T", " ")} →{" "}
                        {p.finLocal.replace("T", " ")}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-foreground">
                        <strong>{numero(p.cantidad)}</strong> reg · {p.hilos} hilos ×{" "}
                        {numero(p.registrosPorHilo)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {p.forma}
                        {p.ajuste && (
                          <span className="block text-[11px] text-muted-foreground">
                            Ajuste: {p.ajuste}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge tone={TONO[p.estado]} appearance="soft" size="sm">
                          {p.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setViewMode("cards")}
                        >
                          Gestionar en tarjeta
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista Tarjetas Interactivas */}
          <div
            className={cn(
              viewMode === "cards" ? "space-y-4" : "block md:hidden space-y-4"
            )}
          >
            {paginatedLista.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
                No se encontraron programaciones para los filtros seleccionados.
              </div>
            ) : (
              paginatedLista.map((p) => <Tarjeta key={p.id} p={p} />)
            )}
          </div>

          {/* Footer de Paginación idéntico a cuentas-internas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>
                Mostrando{" "}
                <strong className="font-semibold text-foreground">
                  {listaFiltrada.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </strong>{" "}
                a{" "}
                <strong className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, listaFiltrada.length)}
                </strong>{" "}
                de{" "}
                <strong className="font-semibold text-foreground">
                  {listaFiltrada.length}
                </strong>{" "}
                programaciones
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
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (page) => (
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
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
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
      </div>
    </TooltipProvider>
  );
}
