"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-4 text-xs shadow-2xs">
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
    </div>
  );
}

export function AmpliacionesPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const [campos, setCampos] = useState<string[]>([]);
  const [cupo, setCupo] = useState("");
  const disponibles = a.catalogoCampos.filter(
    (c) => !a.camposAutorizados.includes(c.campo)
  );
  const lista = st.ampliaciones.filter((x) => x.accesoId === a.id);

  const enviar = (c: string[], q: number) => {
    const r = st.crearAmpliacion(a.id, c, q, actor);
    (r.ok ? toast.success : toast.error)(r.mensaje);
    if (r.ok) {
      setCampos([]);
      setCupo("");
    }
  };

  return (
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
            {lista.length} {lista.length === 1 ? "ampliación" : "ampliaciones"}
          </Badge>
        </div>

        {lista.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
            No hay ampliaciones registradas para esta solicitud.
          </div>
        ) : (
          <div className="space-y-4">
            {[...lista].reverse().map((am) => (
              <Tarjeta key={am.id} am={am} a={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
