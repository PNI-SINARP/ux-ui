"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Play,
  Square,
  XCircle,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const FORMA_ENVIO_OPCIONES = [
  { value: "Por script", label: "Por script (API-02 una a una)" },
  { value: "Por petición única", label: "Por petición única (API-03)" },
] as const;

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
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-4 text-xs shadow-2xs">
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
    </div>
  );
}

export function ProgramacionPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const par = parametrosVigentes(st.parametros);
  const { saldo } = saldoAcceso(a, st.eventos);
  const [ahoraMs] = useState(() => Date.now());
  const [formaSearch, setFormaSearch] = useState("");
  const [f, setF] = useState({
    inicio: "",
    fin: "",
    cantidad: "100000",
    hilos: "20",
    porHilo: "5000",
    forma: "Por script" as ProgramacionMasiva["forma"],
    justificacion: "",
  });
  const lista = st.programaciones.filter((p) => p.accesoId === a.id);

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

  return (
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
            {lista.length} {lista.length === 1 ? "programación" : "programaciones"}
          </Badge>
        </div>

        {lista.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
            Todavía no hay programaciones registradas para este acceso.
          </div>
        ) : (
          <div className="space-y-4">
            {[...lista].reverse().map((p) => (
              <Tarjeta key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
