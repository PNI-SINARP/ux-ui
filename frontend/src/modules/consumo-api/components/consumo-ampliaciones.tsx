"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import { useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import {
  PLAZO_SUBSANACION_DIAS,
  formatoFecha,
  numero,
  sumarDiasHabiles,
  ahoraIso,
  useConsumoStore,
  type AccesoApi,
  type Ampliacion,
  type EstadoAmpliacion,
} from "../data/consumo-store";

const TONO: Partial<
  Record<EstadoAmpliacion, "neutral" | "info" | "warning" | "success" | "danger">
> = {
  Aplicada: "success",
  Cerrada: "neutral",
  Observada: "warning",
  "Pendiente de corrección": "danger",
};

const COLOR_CARD: Partial<
  Record<
    EstadoAmpliacion,
    "default" | "info" | "warning" | "success" | "danger" | "primary"
  >
> = {
  Aplicada: "success",
  Cerrada: "default",
  Observada: "warning",
  "Pendiente de corrección": "danger",
  "En revisión de Gestión": "info",
  "En revisión de DPI": "info",
  "Pendiente de firmas": "primary",
  "Pendiente de pago": "warning",
  "Pendiente de aprobación": "primary",
};

const ESTADOS_AMPLIACION_FILTRO: Array<"TODOS" | EstadoAmpliacion> = [
  "TODOS",
  "En revisión de Gestión",
  "En revisión de DPI",
  "Observada",
  "Pendiente de firmas",
  "Pendiente de pago",
  "Pendiente de aprobación",
  "Pendiente de corrección",
  "Aplicada",
  "Cerrada",
];

const EVENTO = {
  campos: "adenda_campos",
  cupo: "adenda_cupo",
  mixta: "adenda_mixta",
} as const;

const AREAS_CORRECCION = ["Jurídica", "Facturación", "Pagos"] as const;

function Tarjeta({ am, a }: { am: Ampliacion; a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const [obs, setObs] = useState("");
  const [area, setArea] = useState("Facturación");
  const [areaSearch, setAreaSearch] = useState("");
  const [motivo, setMotivo] = useState("");
  const tieneConfidencial = am.campos.some(
    (c) =>
      a.catalogoCampos.find((x) => x.campo === c)?.clasificacion ===
      "Confidencial"
  );
  const esGestion = rol === "DIR_GESTION" || rol === "EQ_GESTION";
  const esDpi = rol === "DIR_DPI" || rol === "EQ_DPI";
  const mut = (
    fn: (x: Ampliacion) => Ampliacion,
    accion: string,
    detalle?: string
  ) => st.mutarAmpliacion(am.id, fn, actor, accion, detalle);

  /** Tras ADD-07 Aprobada: pública aplica en ACC-08; privada sigue a la adenda (ADD-04). */
  const aprobadaADD07 = () => {
    if (a.tipo === "Pública") {
      st.aplicarAmpliacion(am.id, actor);
      toast.success("Alcance actualizado", {
        description: "Misma solicitud, sin contrato, factura ni pago.",
      });
    } else {
      mut(
        (x) => ({ ...x, estado: "Pendiente de firmas" }),
        "ADD-07 aprobada",
        "Jurídica prepara la adenda con la plantilla contractual vigente (PAR-02)."
      );
    }
  };

  return (
    <InteractiveCard
      color={COLOR_CARD[am.estado] ?? "primary"}
      decorativeIcon={<PlusCircle className="size-full stroke-[0.8]" />}
      className="p-4 sm:p-5 space-y-4 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-sm font-bold text-primary">
            {am.id}
          </span>
          <Badge tone={TONO[am.estado] ?? "info"} appearance="soft" size="sm">
            {am.estado}
          </Badge>
          <Badge
            tone="neutral"
            appearance="outline"
            size="sm"
            className="font-mono"
          >
            {a.tipo === "Privada" ? EVENTO[am.tipo] : "ampliación pública"} · v
            {am.version}
          </Badge>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          Alcance actual v{a.versionAlcance}
        </span>
      </div>

      <div className="rounded-xl bg-surface-subtle/60 border border-border/60 p-3.5 space-y-1.5 leading-relaxed text-muted-foreground">
        {am.campos.length > 0 && (
          <p>
            Campos solicitados:{" "}
            <span className="font-mono font-semibold text-foreground">
              {am.campos.join(", ")}
            </span>
            {tieneConfidencial && (
              <span className="text-warning font-medium">
                {" "}
                (incluye confidenciales: pasa por DPI)
              </span>
            )}
          </p>
        )}
        {am.cupoAdicional > 0 && (
          <p>
            Cupo adicional:{" "}
            <span className="font-mono font-bold text-primary">
              +{numero(am.cupoAdicional)} registros
            </span>
          </p>
        )}
        <p className="text-[11px]">
          La autorización y la credencial anteriores siguen con su alcance previo hasta aplicar el cambio.
        </p>
      </div>

      {am.observaciones && (
        <Alert
          variant="warning"
          icon={<AlertCircle className="size-4" />}
          title="Observación registrada"
          className="p-3.5 text-xs"
        >
          {am.observaciones}
          {am.fechaLimiteSubsanacion && (
            <span className="block mt-1 font-medium">
              Subsanar antes de {formatoFecha(am.fechaLimiteSubsanacion)}
            </span>
          )}
        </Alert>
      )}

      {am.correccion && (
        <Alert
          variant="danger"
          icon={<AlertCircle className="size-4" />}
          title={`Pendiente de corrección (${am.correccion.area})`}
          className="p-3.5 text-xs"
        >
          {am.correccion.motivo}
        </Alert>
      )}

      {/* ADD-07: Gestión */}
      {am.estado === "En revisión de Gestión" && esGestion && (
        <div className="space-y-4 rounded-xl bg-surface-subtle/60 border border-border p-4">
          <p className="font-bold text-sm text-foreground">
            Revisión de Gestión (ADD-07)
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Observaciones (obligatorias si observas)
            </Label>
            <Input
              aria-label="Observaciones"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Indica las observaciones de revisión..."
            />
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                if (tieneConfidencial) {
                  mut(
                    (x) => ({
                      ...x,
                      decisionGestion: "Aprobada",
                      estado: "En revisión de DPI",
                    }),
                    "Aprobada por Gestión",
                    "Contiene campos confidenciales: pasa a DPI."
                  );
                } else {
                  mut(
                    (x) => ({ ...x, decisionGestion: "Aprobada" }),
                    "Aprobada por Gestión",
                    "Solo campos accesibles: la aprobación de Gestión es suficiente."
                  );
                  aprobadaADD07();
                }
              }}
            >
              Aprobar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="warning"
              disabled={!obs.trim()}
              onClick={() => {
                mut(
                  (x) => ({
                    ...x,
                    decisionGestion: "Observada",
                    estado: "Observada",
                    observaciones: obs.trim(),
                    fechaLimiteSubsanacion: sumarDiasHabiles(
                      ahoraIso(),
                      PLAZO_SUBSANACION_DIAS
                    ),
                  }),
                  "Observada por Gestión",
                  obs.trim()
                );
                setObs("");
              }}
            >
              Observar
            </Button>
          </div>
        </div>
      )}

      {/* ADD-07: DPI */}
      {am.estado === "En revisión de DPI" && esDpi && (
        <div className="space-y-4 rounded-xl bg-surface-subtle/60 border border-border p-4">
          <p className="font-bold text-sm text-foreground">
            Revisión de DPI e informe de recomendación (firmas{" "}
            {am.informeDpiFirmas} de 2)
          </p>
          {rol === "EQ_DPI" && am.informeDpiFirmas === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Observaciones por campo (obligatorias si observas)
                </Label>
                <Input
                  aria-label="Observaciones por campo"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Detalle de observación sobre campos confidenciales..."
                />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    mut(
                      (x) => ({
                        ...x,
                        decisionDpi: "Aprobada",
                        informeDpiFirmas: 1,
                      }),
                      "Revisor DPI aprobó y firmó el informe",
                      "Pasa al Director de DPI."
                    )
                  }
                >
                  Aprobar y firmar informe
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="warning"
                  disabled={!obs.trim()}
                  onClick={() => {
                    mut(
                      (x) => ({
                        ...x,
                        decisionDpi: "Observada",
                        estado: "Observada",
                        observaciones: obs.trim(),
                        fechaLimiteSubsanacion: sumarDiasHabiles(
                          ahoraIso(),
                          PLAZO_SUBSANACION_DIAS
                        ),
                      }),
                      "Observada por DPI",
                      obs.trim()
                    );
                    setObs("");
                  }}
                >
                  Observar
                </Button>
              </div>
            </div>
          )}
          {rol === "DIR_DPI" && am.informeDpiFirmas === 1 && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                mut(
                  (x) => ({ ...x, informeDpiFirmas: 2 }),
                  "Director de DPI firmó el informe",
                  "ADD-07 Aprobada: todas las decisiones y firmas constan."
                );
                aprobadaADD07();
              }}
            >
              Revisar y firmar como Director
            </Button>
          )}
          {((rol === "EQ_DPI" && am.informeDpiFirmas === 1) ||
            (rol === "DIR_DPI" && am.informeDpiFirmas === 0)) && (
            <p className="text-xs text-muted-foreground">
              Esperando la firma del{" "}
              {am.informeDpiFirmas === 0 ? "Revisor" : "Director"} de DPI.
            </p>
          )}
        </div>
      )}

      {/* Observada → subsanar o cerrar */}
      {am.estado === "Observada" && (
        <div className="flex flex-wrap gap-2.5">
          {rol === "COORDINADOR_SINARP" && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() =>
                mut(
                  (x) => ({
                    ...x,
                    estado: "En revisión de Gestión",
                    version: x.version + 1,
                    observaciones: undefined,
                    fechaLimiteSubsanacion: undefined,
                    decisionGestion: undefined,
                    decisionDpi: undefined,
                    informeDpiFirmas: 0,
                  }),
                  "Ampliación subsanada y reenviada",
                  "La versión corregida vuelve al Director de Gestión."
                )
              }
            >
              Subsanar y reenviar
            </Button>
          )}
          {esGestion && (
            <Button
              type="button"
              size="sm"
              variant="neutral"
              onClick={() =>
                mut(
                  (x) => ({ ...x, estado: "Cerrada" }),
                  "Cerrada por vencimiento",
                  "Venció el plazo de subsanación; queda inmodificable."
                )
              }
            >
              Simular vencimiento y cerrar
            </Button>
          )}
        </div>
      )}

      {/* ADD-04: Jurídica */}
      {am.estado === "Pendiente de firmas" && (
        <div className="space-y-3 rounded-xl bg-surface-subtle/60 border border-border p-4">
          <p className="font-bold text-sm text-foreground">
            Adenda privada (ADD-04): firmas {am.firmasAdenda} de 2 · tipo de evento{" "}
            <span className="font-mono text-primary">{EVENTO[am.tipo]}</span>
          </p>
          {(rol === "JURIDICA" || rol === "COORDINADOR_SINARP") && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                const f = am.firmasAdenda + 1;
                mut(
                  (x) => ({
                    ...x,
                    firmasAdenda: f,
                    estado: f >= 2 ? "Pendiente de pago" : x.estado,
                  }),
                  `Firma verificada (${rol === "JURIDICA" ? "DINARP" : "consumidora"})`,
                  f >= 2
                    ? "Firmas completas: pasa a factura y pago (FAC-01/PAG-01). La firma no aplica el alcance."
                    : undefined
                );
              }}
            >
              Firmar adenda con FirmaEC
            </Button>
          )}
        </div>
      )}

      {am.estado === "Pendiente de pago" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-subtle/60 border border-border p-4">
          <span className="text-xs font-medium text-muted-foreground">
            Factura emitida; esperando confirmación del pago (PAG-02).
          </span>
          {(rol === "FACTURACION" || rol === "ADMIN") && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() =>
                mut(
                  (x) => ({
                    ...x,
                    pagoConfirmado: true,
                    estado: "Pendiente de aprobación",
                  }),
                  "Pago confirmado (PAG-02)"
                )
              }
            >
              Confirmar pago
            </Button>
          )}
        </div>
      )}

      {/* ADD-06 */}
      {(am.estado === "Pendiente de aprobación" ||
        am.estado === "Pendiente de corrección") &&
        rol === "DIR_GESTION" && (
          <div className="space-y-4 rounded-xl bg-surface-subtle/60 border border-border p-4">
            <div className="space-y-0.5">
              <p className="font-bold text-sm text-foreground">
                Aprobar la aplicación (ADD-06)
              </p>
              <p className="text-xs text-muted-foreground">
                Adenda firmada, ADD-07 aprobada y pago{" "}
                {am.pagoConfirmado ? "confirmado" : "pendiente"}.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  className="w-full"
                  disabled={!am.pagoConfirmado}
                  leftIcon={<CheckCircle2 className="size-4" />}
                  onClick={() => {
                    st.aplicarAmpliacion(am.id, actor);
                    toast.success("Alcance actualizado en Apigee (ACC-08)");
                  }}
                >
                  Aprobar y aplicar
                </Button>
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Área responsable
                </Label>
                <Combobox
                  value={area}
                  onValueChange={(val) => {
                    if (val) {
                      setArea(val);
                      setAreaSearch(val);
                    }
                  }}
                  inputValue={areaSearch || area}
                  onInputValueChange={setAreaSearch}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Seleccionar área..."
                    showTrigger={true}
                    showClear={false}
                    showSearchIcon={false}
                    className="w-full"
                  />
                  <ComboboxContent className="min-w-[180px] z-[80]">
                    <ComboboxList>
                      <ComboboxGroup>
                        <ComboboxLabel>Área destino</ComboboxLabel>
                        {AREAS_CORRECCION.map((x) => (
                          <ComboboxItem
                            key={x}
                            value={x}
                            className="text-xs py-1.5 cursor-pointer"
                          >
                            {x}
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="md:col-span-4 space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Motivo de la corrección
                </Label>
                <Input
                  aria-label="Motivo de corrección"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Describe la corrección requerida..."
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="button"
                  size="sm"
                  variant="neutral"
                  className="w-full"
                  disabled={!motivo.trim()}
                  onClick={() => {
                    mut(
                      (x) => ({
                        ...x,
                        estado: "Pendiente de corrección",
                        correccion: { area, motivo: motivo.trim() },
                      }),
                      "Pendiente de corrección",
                      `${area}: ${motivo.trim()}`
                    );
                    setMotivo("");
                  }}
                >
                  Solicitar corrección
                </Button>
              </div>
            </div>
          </div>
        )}

      <ul className="border-t border-border/70 pt-3 space-y-1 text-xs text-muted-foreground">
        {[...am.historial].reverse().map((h, i) => (
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

export function AmpliacionesPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const [campos, setCampos] = useState<string[]>([]);
  const [cupo, setCupo] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [busquedaAmp, setBusquedaAmp] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"TODOS" | EstadoAmpliacion>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const disponibles = a.catalogoCampos.filter(
    (c) => !a.camposAutorizados.includes(c.campo)
  );

  const listaCompleta = useMemo(
    () => [...st.ampliaciones.filter((x) => x.accesoId === a.id)].reverse(),
    [st.ampliaciones, a.id]
  );

  const listaFiltrada = useMemo(() => {
    const q = busquedaAmp.trim().toLowerCase();
    return listaCompleta
      .filter((am) => (estadoFiltro === "TODOS" ? true : am.estado === estadoFiltro))
      .filter((am) =>
        !q
          ? true
          : am.id.toLowerCase().includes(q) ||
            am.tipo.toLowerCase().includes(q) ||
            am.estado.toLowerCase().includes(q) ||
            am.campos.some((c) => c.toLowerCase().includes(q))
      );
  }, [listaCompleta, busquedaAmp, estadoFiltro]);

  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / pageSize));
  const paginatedLista = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return listaFiltrada.slice(start, start + pageSize);
  }, [listaFiltrada, currentPage, pageSize]);

  const hayFiltros = busquedaAmp.trim() !== "" || estadoFiltro !== "TODOS";

  const enviar = (c: string[], q: number) => {
    const r = st.crearAmpliacion(a.id, c, q, actor);
    (r.ok ? toast.success : toast.error)(r.mensaje);
    if (r.ok) {
      setCampos([]);
      setCupo("");
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {rol === "COORDINADOR_SINARP" && (
          <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="space-y-1 pb-4 border-b border-border/70">
              <h2 className="text-base font-bold text-foreground">
                Ampliar esta solicitud (ADD-01, ADD-02, ADD-03, ADD-05)
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {a.tipo === "Privada"
                  ? "Más campos de la misma fuente, más cupo o ambos, bajo el mismo ID, credencial y contrato. Otra fuente exige una solicitud nueva."
                  : "Una solicitud pública solo amplía campos de la misma fuente: no hay contrato, factura ni pago."}
              </p>
            </div>

            {disponibles.length === 0 ? (
              <Alert
                variant="info"
                icon={<AlertCircle className="size-4" />}
                title="No hay campos adicionales disponibles"
                className="p-3.5 text-xs"
              >
                Ya tienes autorizados todos los campos publicados de esta fuente.
              </Alert>
            ) : (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-foreground">
                  Campos que aún no están autorizados
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {disponibles.map((c) => {
                    const checked = campos.includes(c.campo);
                    return (
                      <label
                        key={c.campo}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-subtle/40 hover:bg-surface-subtle px-3.5 py-2.5 text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) =>
                              setCampos(
                                v === true
                                  ? [...campos, c.campo]
                                  : campos.filter((x) => x !== c.campo)
                              )
                            }
                          />
                          <span className="font-mono font-semibold text-foreground truncate">
                            {c.campo}
                          </span>
                        </div>
                        <Badge
                          tone={
                            c.clasificacion === "Confidencial"
                              ? "danger"
                              : "neutral"
                          }
                          appearance="soft"
                          size="sm"
                          className="shrink-0"
                        >
                          {c.clasificacion}
                          {c.sensible ? " · sensible" : ""}
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {a.tipo === "Privada" && (
              <div className="space-y-2 max-w-sm">
                <Label
                  htmlFor="cupo-ad"
                  className="text-xs font-semibold text-foreground"
                >
                  Cupo adicional (registros)
                </Label>
                <Input
                  id="cupo-ad"
                  type="number"
                  min={1}
                  placeholder="Ej. 50000"
                  value={cupo}
                  onChange={(e) => setCupo(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="size-4" />}
                disabled={campos.length === 0 && !(parseInt(cupo) > 0)}
                onClick={() =>
                  enviar(campos, a.tipo === "Privada" ? parseInt(cupo) || 0 : 0)
                }
              >
                Enviar ampliación
              </Button>
              {a.tipo === "Privada" && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<RefreshCw className="size-4" />}
                  disabled={!(parseInt(cupo) > 0)}
                  onClick={() => enviar([], parseInt(cupo))}
                >
                  Generar renovación de cupo
                </Button>
              )}
            </div>
          </section>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-foreground">
                Ampliaciones de esta solicitud
              </h2>
              <p className="text-xs text-muted-foreground">
                Gestión revisa los campos (y DPI los confidenciales); en una privada sigue la adenda firmada, el pago y la aprobación; solo entonces se aplica el alcance nuevo.
              </p>
            </div>
            <Badge tone="neutral" appearance="soft" size="sm">
              {listaFiltrada.length}{" "}
              {listaFiltrada.length === 1 ? "ampliación" : "ampliaciones"}
            </Badge>
          </div>

          {/* Barra de búsqueda, filtro por estado y ViewModeToggle estilo cuentas-internas */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="flex-1 min-w-[240px]">
                <Search
                  size="sm"
                  placeholder="Buscar por código AMP, campo solicitado o tipo..."
                  value={busquedaAmp}
                  onChange={(e) => {
                    setBusquedaAmp(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setBusquedaAmp("");
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-full sm:w-[240px]">
                  <Combobox
                    value={estadoFiltro}
                    onValueChange={(val) => {
                      if (val) {
                        setEstadoFiltro(val as "TODOS" | EstadoAmpliacion);
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
                    <ComboboxContent className="min-w-[240px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                          {ESTADOS_AMPLIACION_FILTRO.map((est) => (
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
                {busquedaAmp.trim() !== "" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span>Búsqueda: &ldquo;{busquedaAmp}&rdquo;</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setBusquedaAmp("");
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
                    setBusquedaAmp("");
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
                    CÓDIGO / TIPO
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    CAMPOS SOLICITADOS
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    CUPO ADICIONAL
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    FIRMAS / PAGO
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
                        <PlusCircle className="size-8 stroke-[1.5] text-muted-foreground/60" />
                        <p className="text-sm font-semibold text-foreground">
                          No se encontraron ampliaciones
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajusta los filtros o solicita una nueva ampliación.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLista.map((am) => (
                    <TableRow key={am.id}>
                      <TableCell className="pl-6">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-primary block">
                            {am.id}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            {a.tipo === "Privada" ? EVENTO[am.tipo] : "ampliación pública"} · v
                            {am.version}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-foreground">
                        {am.campos.length > 0 ? am.campos.join(", ") : "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-primary">
                        {am.cupoAdicional > 0
                          ? `+${numero(am.cupoAdicional)} reg.`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        DPI: {am.informeDpiFirmas}/2 · Adenda: {am.firmasAdenda}/2 ·{" "}
                        {am.pagoConfirmado ? "Pagado" : "Sin pago"}
                      </TableCell>
                      <TableCell>
                        <Badge tone={TONO[am.estado] ?? "info"} appearance="soft" size="sm">
                          {am.estado}
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
                No hay ampliaciones registradas para los filtros seleccionados.
              </div>
            ) : (
              paginatedLista.map((am) => <Tarjeta key={am.id} am={am} a={a} />)
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
                ampliaciones
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
