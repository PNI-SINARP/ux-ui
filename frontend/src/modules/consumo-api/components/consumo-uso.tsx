"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Play,
  ShieldAlert,
  Activity,
  Loader2,
  RotateCcw,
  LifeBuoy,
  Terminal,
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
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import {
  MAX_REGISTROS_POR_SEGMENTO,
  formatoFecha,
  numero,
  saldoAcceso,
  useConsumoStore,
  type AccesoApi,
  type EscenarioConsultaApi02,
  type EscenarioPruebaApi01,
  type ResultadoConsulta,
  type TipoDatoPruebas,
} from "../data/consumo-store";

const ESCENARIO_PRUEBA_OPCIONES: { value: EscenarioPruebaApi01; label: string }[] = [
  { value: "ok", label: "Respuesta normal de la fuente" },
  { value: "sin_datos", label: "Sin datos (0 coincidencias)" },
  { value: "red_vpn", label: "Red o VPN inaccesible (502)" },
  { value: "timeout", label: "Tiempo de espera agotado (504)" },
];

const TIPO_DATO_PRUEBAS_OPCIONES: TipoDatoPruebas[] = [
  "Sintético",
  "Anonimizado",
  "Real",
  "Indeterminado",
];

const ESCENARIO_OPCIONES: { value: EscenarioConsultaApi02; label: string }[] = [
  { value: "ok", label: "Entrega correcta" },
  { value: "sin_datos", label: "Sin datos (0 coincidencias)" },
  { value: "fallo", label: "Falla antes de entregar" },
  { value: "incierto", label: "Entrega incierta (conciliación)" },
];

const FALLA_SEGMENTO_OPCIONES = [
  { value: "ninguna", label: "Ninguna (completar todos)" },
  { value: "1", label: "Falla en Segmento 1" },
  { value: "2", label: "Falla en Segmento 2" },
  { value: "3", label: "Falla en Segmento 3" },
] as const;

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ProgresoSimulacion({
  activo,
  etapa,
  detalle,
}: {
  activo: boolean;
  etapa: string;
  detalle?: string;
}) {
  if (!activo) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs animate-fade-in"
    >
      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
      <div className="space-y-0.5">
        <p className="font-semibold text-foreground">{etapa}</p>
        {detalle && <p className="text-muted-foreground font-mono text-[11px]">{detalle}</p>}
      </div>
    </div>
  );
}

function Resultado({
  r,
  accionesExtra,
}: {
  r: ResultadoConsulta | null;
  accionesExtra?: React.ReactNode;
}) {
  if (!r) return null;
  const httpTone =
    !r.httpStatus
      ? "neutral"
      : r.httpStatus >= 200 && r.httpStatus < 300
        ? r.parcial
          ? "warning"
          : "success"
        : "danger";

  return (
    <div className="space-y-3 animate-fade-in">
      <Alert
        variant={r.ok ? (r.parcial ? "warning" : "success") : "danger"}
        icon={
          r.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <ShieldAlert className="size-4" />
          )
        }
        title={
          r.parcial ??
          (r.resultadoPrueba
            ? `Resultado de prueba: ${r.resultadoPrueba}`
            : r.ok
              ? "Respuesta recibida correctamente"
              : r.codigo ?? "Operación rechazada o fallida")
        }
        className="p-4 text-xs"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {r.httpStatus && (
              <Badge tone={httpTone} appearance="solid" size="sm" className="font-mono">
                HTTP {r.httpStatus}
              </Badge>
            )}
            {r.idOperacion && (
              <Badge tone="neutral" appearance="soft" size="sm" className="font-mono">
                op: {r.idOperacion}
              </Badge>
            )}
            {r.idSegmento && r.idSegmento !== "—" && (
              <Badge tone="neutral" appearance="soft" size="sm" className="font-mono">
                seg: {r.idSegmento}
              </Badge>
            )}
            {r.idEvento && (
              <Badge tone="info" appearance="soft" size="sm" className="font-mono">
                evento: {r.idEvento}
              </Badge>
            )}
            {r.codigoReferencia && (
              <Badge tone="warning" appearance="soft" size="sm" className="font-mono">
                ref: {r.codigoReferencia}
              </Badge>
            )}
          </div>

          <p className="text-xs leading-relaxed">{r.mensaje}</p>

          {r.accionSugerida && (
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Acción sugerida:</strong> {r.accionSugerida}
            </p>
          )}

          {r.cursor && (
            <div className="rounded-lg bg-background/70 border border-border px-3 py-2 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong className="text-foreground">cursor de reanudación:</strong> {r.cursor}
              </span>
              {typeof r.pendientes === "number" && r.pendientes > 0 && (
                <Badge tone="warning" appearance="soft" size="sm">
                  {numero(r.pendientes)} pendientes
                </Badge>
              )}
            </div>
          )}

          {r.payload && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <Terminal className="size-3.5" />
                <span>Cuerpo de respuesta simulado (Apigee / SINARP)</span>
              </div>
              <pre className="rounded-xl bg-background/90 p-3.5 font-mono text-[11px] leading-relaxed overflow-x-auto border border-border/70 max-h-64">
                {JSON.stringify(r.payload, null, 2)}
              </pre>
            </div>
          )}

          {accionesExtra && <div className="pt-1">{accionesExtra}</div>}
        </div>
      </Alert>
    </div>
  );
}

export function PruebasPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const [token, setToken] = useState(a.token);
  const [campo, setCampo] = useState(a.camposAutorizados[0] ?? "");
  const [campoSearch, setCampoSearch] = useState("");
  const [escenarioPrueba, setEscenarioPrueba] = useState<EscenarioPruebaApi01>("ok");
  const [escenarioPruebaSearch, setEscenarioPruebaSearch] = useState("");
  const [res, setRes] = useState<ResultadoConsulta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [etapa, setEtapa] = useState("");
  const [ticketCreado, setTicketCreado] = useState<string | null>(null);

  useEffect(() => {
    setToken(a.token);
    setCampo(a.camposAutorizados[0] ?? "");
    setCampoSearch("");
    setRes(null);
    setTicketCreado(null);
  }, [a.id, a.token, a.camposAutorizados]);

  const getCampoLabel = (c: string) => {
    if (!c) return "";
    return `${c}${a.camposAutorizados.includes(c) ? "" : " (no autorizado)"}`;
  };

  const filteredCampos = useMemo(() => {
    const currentLabel = getCampoLabel(campo);
    if (
      !campoSearch.trim() ||
      campoSearch.trim().toLowerCase() === currentLabel.toLowerCase()
    ) {
      return a.catalogoCampos;
    }
    const q = campoSearch.toLowerCase();
    return a.catalogoCampos.filter((c) => c.campo.toLowerCase().includes(q));
  }, [campoSearch, campo, a.catalogoCampos]);

  const currentEscenarioPruebaLabel =
    ESCENARIO_PRUEBA_OPCIONES.find((o) => o.value === escenarioPrueba)?.label ?? "";

  const ejecutarPrueba = async () => {
    if (cargando) return;
    setCargando(true);
    setRes(null);
    setTicketCreado(null);

    setEtapa("1/3 · Autenticando credencial y token OAuth en Apigee...");
    await esperar(260);
    setEtapa(
      `2/3 · Validando alcance de solicitud (${a.id}) y clasificación FUE-04 (${a.tipoDatoPruebas})...`
    );
    await esperar(280);
    setEtapa("3/3 · Invocando ambiente de Pruebas y registrando evento TEC-00...");
    await esperar(240);

    const resultado = st.probar(a.id, token.trim(), campo, escenarioPrueba);
    setRes(resultado);
    setCargando(false);
    setEtapa("");

    if (resultado.ok) {
      toast.success(`Prueba API-01: ${resultado.resultadoPrueba ?? "Exitosa"}`);
    } else {
      toast.error(`Prueba API-01 (${resultado.resultadoPrueba}): ${resultado.codigo}`);
    }
  };

  return (
    <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-border/70">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            Probar la credencial en Pruebas (API-01)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Las pruebas se ejecutan en el ambiente de Pruebas y <strong>nunca descuentan cupo</strong>. Si el tipo de dato de pruebas (FUE-04) es <span className="font-mono">Real</span> o <span className="font-mono">Indeterminado</span>, el servicio responde 403 antes de invocar la fuente.
          </p>
        </div>

        {/* Selector rápido de tipo_dato_pruebas (FUE-04) para simular los 4 casos de API-01 */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Datos FUE-04:
          </span>
          {TIPO_DATO_PRUEBAS_OPCIONES.map((t) => {
            const activo = a.tipoDatoPruebas === t;
            const permitido = t === "Sintético" || t === "Anonimizado";
            return (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={activo ? (permitido ? "primary" : "danger") : "outline"}
                onClick={() => {
                  st.cambiarTipoDatoPruebas(a.id, t);
                  toast.info(`Clasificación FUE-04 en Pruebas cambiada a: ${t}`);
                }}
              >
                {t}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
        <div className="md:col-span-4 space-y-2">
          <Label htmlFor="token-prueba" className="text-xs font-semibold text-foreground">
            Token de autenticación
          </Label>
          <Input
            id="token-prueba"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono"
            disabled={cargando}
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-muted-foreground">Simular token:</span>
            <button
              type="button"
              onClick={() => setToken(a.token)}
              className="text-[11px] font-mono text-primary hover:underline cursor-pointer"
            >
              válido ({a.token})
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => setToken("tok-vencido")}
              className="text-[11px] font-mono text-warning hover:underline cursor-pointer"
            >
              tok-vencido
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => setToken("tok-invalido-000")}
              className="text-[11px] font-mono text-danger hover:underline cursor-pointer"
            >
              inválido
            </button>
          </div>
        </div>

        <div className="md:col-span-3 space-y-2">
          <Label className="text-xs font-semibold text-foreground">
            Campo / parámetro
          </Label>
          <Combobox
            value={campo}
            onValueChange={(val) => {
              if (val) {
                setCampo(val);
                setCampoSearch(getCampoLabel(val));
              }
            }}
            inputValue={campoSearch || getCampoLabel(campo)}
            onInputValueChange={setCampoSearch}
          >
            <ComboboxInput
              size="sm"
              placeholder="Seleccionar campo..."
              showTrigger={true}
              showClear={false}
              className="w-full"
              disabled={cargando}
            />
            <ComboboxContent className="min-w-[260px] z-[80]">
              <ComboboxList>
                <ComboboxGroup>
                  <ComboboxLabel>Catálogo de campos</ComboboxLabel>
                  {filteredCampos.map((c) => {
                    const autorizado = a.camposAutorizados.includes(c.campo);
                    return (
                      <ComboboxItem
                        key={c.campo}
                        value={c.campo}
                        className="text-xs py-1.5 cursor-pointer font-mono"
                      >
                        <span>
                          {c.campo}
                          {autorizado ? "" : " (no autorizado)"}
                        </span>
                      </ComboboxItem>
                    );
                  })}
                </ComboboxGroup>
                {filteredCampos.length === 0 && (
                  <ComboboxEmpty>No se encontraron campos.</ComboboxEmpty>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="md:col-span-3 space-y-2">
          <Label className="text-xs font-semibold text-foreground">
            Respuesta de la fuente
          </Label>
          <Combobox
            value={escenarioPrueba}
            onValueChange={(val) => {
              if (val) {
                setEscenarioPrueba(val as EscenarioPruebaApi01);
                const found = ESCENARIO_PRUEBA_OPCIONES.find((o) => o.value === val);
                if (found) setEscenarioPruebaSearch(found.label);
              }
            }}
            inputValue={escenarioPruebaSearch || currentEscenarioPruebaLabel}
            onInputValueChange={setEscenarioPruebaSearch}
          >
            <ComboboxInput
              size="sm"
              placeholder="Escenario..."
              showTrigger={true}
              showClear={false}
              showSearchIcon={false}
              className="w-full"
              disabled={cargando}
            />
            <ComboboxContent className="min-w-[240px] z-[80]">
              <ComboboxList>
                <ComboboxGroup>
                  <ComboboxLabel>Simular comportamiento</ComboboxLabel>
                  {ESCENARIO_PRUEBA_OPCIONES.map((opt) => (
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

        <div className="md:col-span-2 flex md:pt-6">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full"
            disabled={cargando}
            leftIcon={
              cargando ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )
            }
            onClick={ejecutarPrueba}
          >
            {cargando ? "Probando..." : "Probar"}
          </Button>
        </div>
      </div>

      <ProgresoSimulacion
        activo={cargando}
        etapa={etapa}
        detalle={`credencial: ${a.credencial} · entorno: Pruebas · campo: ${campo}`}
      />

      <Resultado
        r={res}
        accionesExtra={
          res && !res.ok && res.codigoReferencia && res.idEvento ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground">
                API-01 CA3: Si el problema persiste, abre un ticket en INC-01 vinculado al evento y referencia (sin copiar secretos).
              </span>
              {ticketCreado ? (
                <Badge tone="success" appearance="soft" size="sm" className="font-mono">
                  Ticket creado: {ticketCreado}
                </Badge>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  leftIcon={<LifeBuoy className="size-3.5" />}
                  onClick={() => {
                    const t = st.crearTicketInc01(
                      a.id,
                      res.idEvento!,
                      res.codigoReferencia!,
                      res.mensaje
                    );
                    setTicketCreado(t.idTicket);
                    toast.success(
                      `Ticket ${t.idTicket} creado con referencia ${t.codigoReferencia} (sin secretos)`
                    );
                  }}
                >
                  Crear ticket INC-01 ({res.codigoReferencia})
                </Button>
              )}
            </div>
          ) : null
        }
      />
    </section>
  );
}

export function ConsultaPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const [campo, setCampo] = useState(a.camposAutorizados[0] ?? "");
  const [campoSearch, setCampoSearch] = useState("");
  const [devuelve, setDevuelve] = useState("10");
  const [identificador, setIdentificador] = useState("1718956234");
  const [escenario, setEscenario] = useState<EscenarioConsultaApi02>("ok");
  const [escenarioSearch, setEscenarioSearch] = useState("");
  const [solicitados, setSolicitados] = useState("2500");
  const [falla, setFalla] = useState("ninguna");
  const [fallaSearch, setFallaSearch] = useState("");
  const [r1, setR1] = useState<ResultadoConsulta | null>(null);
  const [r2, setR2] = useState<ResultadoConsulta | null>(null);
  const [cargandoApi02, setCargandoApi02] = useState(false);
  const [etapaApi02, setEtapaApi02] = useState("");
  const [cargandoApi03, setCargandoApi03] = useState(false);
  const [etapaApi03, setEtapaApi03] = useState("");

  useEffect(() => {
    setCampo(a.camposAutorizados[0] ?? "");
    setCampoSearch("");
    setR1(null);
    setR2(null);
  }, [a.id, a.camposAutorizados]);

  const { saldo } = saldoAcceso(a, st.eventos);

  const getCampoLabel = (c: string) =>
    c ? `${c}${a.camposAutorizados.includes(c) ? "" : " (no autorizado)"}` : "";

  const filteredCampos = useMemo(() => {
    const currentLabel = getCampoLabel(campo);
    if (
      !campoSearch.trim() ||
      campoSearch.trim().toLowerCase() === currentLabel.toLowerCase()
    ) {
      return a.catalogoCampos;
    }
    const q = campoSearch.toLowerCase();
    return a.catalogoCampos.filter((c) => c.campo.toLowerCase().includes(q));
  }, [campoSearch, campo, a.catalogoCampos]);

  const currentEscenarioLabel =
    ESCENARIO_OPCIONES.find((o) => o.value === escenario)?.label ?? "";

  const currentFallaLabel =
    FALLA_SEGMENTO_OPCIONES.find((o) => o.value === falla)?.label ?? "";

  const ejecutarConsultaUnitaria = async () => {
    if (cargandoApi02) return;
    setCargandoApi02(true);
    setR1(null);

    setEtapaApi02(
      "1/3 · Verificando institución, solicitud activa, campos autorizados y saldo (API-05)..."
    );
    await esperar(260);
    setEtapaApi02(
      "2/3 · Creando reserva durable id_operacion / id_segmento en API-04..."
    );
    await esperar(280);
    setEtapaApi02(
      "3/3 · Invocando fuente en Producción y confirmando cantidad_entregada..."
    );
    await esperar(240);

    const resultado = st.consultar(a.id, {
      campo,
      devuelve: Math.max(1, parseInt(devuelve) || 1),
      escenario,
      identificador: identificador.trim() || undefined,
    });
    setR1(resultado);
    setCargandoApi02(false);
    setEtapaApi02("");

    if (resultado.ok) {
      toast.success(
        resultado.parcial
          ? `API-02: ${resultado.parcial} (${numero(resultado.registros)} entregados)`
          : `API-02: ${numero(resultado.registros)} registro(s) confirmados`
      );
    } else {
      toast.error(`API-02: ${resultado.codigo ?? "Operación no completada"}`);
    }
  };

  const ejecutarConsultaMasiva = async (reanudacion?: {
    idOperacion: string;
    cursorPrevio: string;
    pendientes: number;
    segmentoInicial: number;
  }) => {
    if (cargandoApi03) return;
    setCargandoApi03(true);
    if (!reanudacion) setR2(null);

    const totalSolicitados = reanudacion
      ? reanudacion.pendientes
      : Math.max(1, parseInt(solicitados) || 1);
    const totalSegmentosEstimados = Math.max(
      1,
      Math.ceil(totalSolicitados / MAX_REGISTROS_POR_SEGMENTO)
    );
    const fallaNum = reanudacion
      ? null
      : falla === "ninguna"
        ? null
        : parseInt(falla, 10);

    const segsSimular = Math.min(
      totalSegmentosEstimados,
      fallaNum ? fallaNum : Math.min(totalSegmentosEstimados, 4)
    );

    for (let i = 1; i <= segsSimular; i += 1) {
      const segGlobal = (reanudacion?.segmentoInicial ?? 0) + i;
      setEtapaApi03(
        reanudacion
          ? `Reanudando desde cursor ${reanudacion.cursorPrevio} · reservando y confirmando segmento S${segGlobal}...`
          : `Procesando segmento ${i} de ${totalSegmentosEstimados} (máx. ${numero(MAX_REGISTROS_POR_SEGMENTO)} registros por segmento)...`
      );
      await esperar(260);
    }

    const resultado = st.consultarMasivo(
      a.id,
      totalSolicitados,
      fallaNum,
      reanudacion
        ? {
            idOperacion: reanudacion.idOperacion,
            cursorPrevio: reanudacion.cursorPrevio,
            segmentoInicial: reanudacion.segmentoInicial,
          }
        : undefined
    );

    setR2(resultado);
    setCargandoApi03(false);
    setEtapaApi03("");

    if (resultado.parcial === "Parcial por fallo") {
      toast.warning(
        `API-03: Parcial por fallo (${numero(resultado.registros)} confirmados). Cursor listo para reanudar.`
      );
    } else if (resultado.parcial === "Parcial por cupo") {
      toast.warning(
        `API-03: Parcial por cupo (${numero(resultado.registros)} entregados).`
      );
    } else if (resultado.ok) {
      toast.success(
        `API-03: ${numero(resultado.registros)} registros entregados en ${resultado.segmentos} segmento(s).`
      );
    } else {
      toast.error(`API-03: ${resultado.codigo ?? "Error en consulta masiva"}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Consulta unitaria / múltiple API-02 */}
      <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="space-y-1 pb-4 border-b border-border/70">
          <h2 className="text-base font-bold text-foreground">
            Consulta por API (API-02)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cada petición valida solicitud activa, campos autorizados, cédula módulo 10 (TEC-00) y <span className="font-mono">saldo_cupo_disponible</span> (API-05). Crea una reserva durable antes de entregar y descuenta solo los registros confirmados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Campo consultado
            </Label>
            <Combobox
              value={campo}
              onValueChange={(val) => {
                if (val) {
                  setCampo(val);
                  setCampoSearch(getCampoLabel(val));
                }
              }}
              inputValue={campoSearch || getCampoLabel(campo)}
              onInputValueChange={setCampoSearch}
            >
              <ComboboxInput
                size="sm"
                placeholder="Seleccionar campo..."
                showTrigger={true}
                showClear={false}
                className="w-full"
                disabled={cargandoApi02}
              />
              <ComboboxContent className="min-w-[240px] z-[80]">
                <ComboboxList>
                  <ComboboxGroup>
                    <ComboboxLabel>Campos del catálogo</ComboboxLabel>
                    {filteredCampos.map((c) => (
                      <ComboboxItem
                        key={c.campo}
                        value={c.campo}
                        className="text-xs py-1.5 cursor-pointer font-mono"
                      >
                        {c.campo}
                        {a.camposAutorizados.includes(c.campo)
                          ? ""
                          : " (no autorizado)"}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                  {filteredCampos.length === 0 && (
                    <ComboboxEmpty>No se encontraron campos.</ComboboxEmpty>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="space-y-2">
            <Label htmlFor="devuelve" className="text-xs font-semibold text-foreground">
              Registros que devuelve la fuente
            </Label>
            <Input
              id="devuelve"
              type="number"
              min={1}
              value={devuelve}
              onChange={(e) => setDevuelve(e.target.value)}
              className="font-mono"
              disabled={cargandoApi02}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identificador" className="text-xs font-semibold text-foreground">
              Cédula consultada (es_identificador_persona)
            </Label>
            <Input
              id="identificador"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              className="font-mono"
              disabled={cargandoApi02}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Ejemplo:</span>
              <button
                type="button"
                onClick={() => setIdentificador("1718956234")}
                className="text-[11px] font-mono text-primary hover:underline cursor-pointer"
              >
                1718956234 (válida)
              </button>
              <span className="text-muted-foreground">·</span>
              <button
                type="button"
                onClick={() => setIdentificador("1718956239")}
                className="text-[11px] font-mono text-danger hover:underline cursor-pointer"
              >
                1718956239 (inválida mod10)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Resultado simulado
            </Label>
            <Combobox
              value={escenario}
              onValueChange={(val) => {
                if (val) {
                  setEscenario(val as EscenarioConsultaApi02);
                  const found = ESCENARIO_OPCIONES.find((o) => o.value === val);
                  if (found) setEscenarioSearch(found.label);
                }
              }}
              inputValue={escenarioSearch || currentEscenarioLabel}
              onInputValueChange={setEscenarioSearch}
            >
              <ComboboxInput
                size="sm"
                placeholder="Seleccionar resultado..."
                showTrigger={true}
                showClear={false}
                showSearchIcon={false}
                className="w-full"
                disabled={cargandoApi02}
              />
              <ComboboxContent className="min-w-[240px] z-[80]">
                <ComboboxList>
                  <ComboboxGroup>
                    <ComboboxLabel>Escenario de simulación</ComboboxLabel>
                    {ESCENARIO_OPCIONES.map((opt) => (
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
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={cargandoApi02}
            leftIcon={
              cargandoApi02 ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )
            }
            onClick={ejecutarConsultaUnitaria}
          >
            {cargandoApi02 ? "Consultando..." : "Consultar por API"}
          </Button>
        </div>

        <ProgresoSimulacion
          activo={cargandoApi02}
          etapa={etapaApi02}
          detalle={`solicitud: ${a.id} · campo: ${campo} · registros: ${devuelve}`}
        />

        <Resultado r={r1} />
      </section>

      {/* Consulta masiva API-03 */}
      <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="space-y-1 pb-4 border-b border-border/70">
          <h2 className="text-base font-bold text-foreground">
            Consulta masiva por API (API-03)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Misma credencial y límites de PAR-13: segmentos secuenciales de hasta{" "}
            <strong>{numero(MAX_REGISTROS_POR_SEGMENTO)}</strong> registros, uno a la vez, con reserva y confirmación atómicas por segmento. No es la extracción excepcional en archivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
          <div className="md:col-span-5 space-y-2">
            <Label htmlFor="solicitados" className="text-xs font-semibold text-foreground">
              Registros solicitados
            </Label>
            <Input
              id="solicitados"
              type="number"
              min={1}
              value={solicitados}
              onChange={(e) => setSolicitados(e.target.value)}
              className="font-mono"
              disabled={cargandoApi03}
            />
            {a.tipo === "Privada" && (
              <p className="text-xs text-muted-foreground">
                Saldo disponible:{" "}
                <strong className="font-mono text-foreground">
                  {numero(saldo)}
                </strong>
              </p>
            )}
          </div>

          <div className="md:col-span-4 space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Falla simulada en el segmento
            </Label>
            <Combobox
              value={falla}
              onValueChange={(val) => {
                if (val) {
                  setFalla(val);
                  const found = FALLA_SEGMENTO_OPCIONES.find(
                    (o) => o.value === val
                  );
                  if (found) setFallaSearch(found.label);
                }
              }}
              inputValue={fallaSearch || currentFallaLabel}
              onInputValueChange={setFallaSearch}
            >
              <ComboboxInput
                size="sm"
                placeholder="Seleccionar segmento..."
                showTrigger={true}
                showClear={false}
                showSearchIcon={false}
                className="w-full"
                disabled={cargandoApi03}
              />
              <ComboboxContent className="min-w-[220px] z-[80]">
                <ComboboxList>
                  <ComboboxGroup>
                    <ComboboxLabel>Simular interrupción</ComboboxLabel>
                    {FALLA_SEGMENTO_OPCIONES.map((opt) => (
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

          <div className="md:col-span-3 flex md:pt-6">
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full"
              disabled={cargandoApi03}
              leftIcon={
                cargandoApi03 ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )
              }
              onClick={() => ejecutarConsultaMasiva()}
            >
              {cargandoApi03 ? "Procesando..." : "Consultar en masa"}
            </Button>
          </div>
        </div>

        <ProgresoSimulacion
          activo={cargandoApi03}
          etapa={etapaApi03}
          detalle={`solicitud: ${a.id} · versión alcance: v${a.versionAlcance} · máx/segmento: ${numero(MAX_REGISTROS_POR_SEGMENTO)}`}
        />

        <Resultado
          r={r2}
          accionesExtra={
            r2?.parcial === "Parcial por fallo" &&
            r2.cursor &&
            r2.idOperacion &&
            typeof r2.pendientes === "number" &&
            r2.pendientes > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                <span className="text-xs text-muted-foreground">
                  API-03 CA3 / API-04 CA2: Reintenta únicamente los{" "}
                  <strong>{numero(r2.pendientes)}</strong> registros faltantes enviando el cursor opaco sin duplicar segmentos previos.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  disabled={cargandoApi03}
                  leftIcon={<RotateCcw className="size-3.5" />}
                  onClick={() =>
                    ejecutarConsultaMasiva({
                      idOperacion: r2.idOperacion!,
                      cursorPrevio: r2.cursor!,
                      pendientes: r2.pendientes!,
                      segmentoInicial: r2.segmentos ?? 1,
                    })
                  }
                >
                  Reanudar {numero(r2.pendientes)} faltantes con cursor
                </Button>
              </div>
            ) : null
          }
        />
        {r2?.segmentos ? (
          <p className="text-xs text-muted-foreground">
            {r2.segmentos} segmento(s) procesados con reserva y confirmación atómicas bajo la operación{" "}
            <span className="font-mono text-foreground">{r2.idOperacion}</span>.
          </p>
        ) : null}
      </section>
    </div>
  );
}

export function SaldoPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol } = useActor();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { consumido, reservado, saldo } = saldoAcceso(a, st.eventos);
  const pct = (n: number) =>
    Math.min(100, Math.max(0, (n / a.cupoAutorizado) * 100));

  const mios = useMemo(
    () => [...st.eventos].filter((e) => e.accesoId === a.id).reverse(),
    [st.eventos, a.id]
  );

  const totalPages = Math.max(1, Math.ceil(mios.length / pageSize));
  const paginatedEventos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mios.slice(start, start + pageSize);
  }, [mios, currentPage]);

  const puedeConciliar =
    rol === "TI" ||
    rol === "DTD" ||
    rol === "DIR_GESTION" ||
    rol === "EQ_GESTION" ||
    rol === "ADMIN";
  const excede = a.tipo === "Pública" && consumido > a.cupoAutorizado;

  return (
    <div className="space-y-6">
      {/* Barra de progreso del cupo / referencia (API-05) */}
      <div className="bg-surface-subtle/60 border border-border rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {a.tipo === "Privada"
                ? "Saldo del cupo autorizado (API-05)"
                : "Referencia de alertas (API-05)"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {a.tipo === "Privada"
                ? "saldo = cupo autorizado − entregado − reservas pendientes. Al agotarse se bloquea y se ofrece renovar (ADD-03)."
                : "En una solicitud pública el cupo solicitado es solo una referencia para alertas: no bloquea ni se factura."}
            </p>
          </div>
          <Badge
            tone={saldo <= 0 && a.tipo === "Privada" ? "danger" : "primary"}
            appearance="soft"
            size="sm"
            className="font-mono self-start sm:self-center"
          >
            {Math.round(pct(consumido))}% utilizado
          </Badge>
        </div>

        <div
          className="h-3 rounded-full bg-muted overflow-hidden flex"
          role="img"
          aria-label={`Consumido ${numero(consumido)}, reservado ${numero(reservado)}, saldo ${numero(saldo)}`}
        >
          <div
            className="bg-success transition-all duration-300"
            style={{ width: `${pct(consumido)}%` }}
          />
          <div
            className="bg-warning transition-all duration-300"
            style={{ width: `${pct(reservado)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="flex items-center justify-between rounded-xl bg-surface border border-border/60 px-3.5 py-2.5">
            <span className="text-muted-foreground font-medium">
              {a.tipo === "Privada" ? "Cupo" : "Referencia"}
            </span>
            <strong className="text-foreground font-mono">
              {numero(a.cupoAutorizado)}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface border border-border/60 px-3.5 py-2.5">
            <span className="text-success font-medium">Entregado</span>
            <strong className="text-success font-mono">
              {numero(consumido)}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface border border-border/60 px-3.5 py-2.5">
            <span className="text-warning font-medium">Reservado</span>
            <strong className="text-warning font-mono">
              {numero(reservado)}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface border border-border/60 px-3.5 py-2.5">
            <span className="text-muted-foreground font-medium">
              {a.tipo === "Privada" ? "Saldo" : "Diferencia"}
            </span>
            <strong
              className={cn(
                "font-mono",
                saldo < 0 ? "text-danger" : "text-foreground"
              )}
            >
              {numero(saldo)}
            </strong>
          </div>
        </div>

        {excede && (
          <Alert
            variant="warning"
            icon={<AlertCircle className="size-4" />}
            title="Superaste la referencia"
            className="p-3.5 text-xs"
          >
            Alerta para Gestión; el consumo continúa y no se factura por este hecho.
          </Alert>
        )}
        {a.tipo === "Privada" && saldo <= 0 && (
          <Alert
            variant="danger"
            icon={<ShieldAlert className="size-4" />}
            title="Cupo agotado"
            className="p-3.5 text-xs"
          >
            Las consultas se bloquean. Genera una renovación desde la pestaña Ampliaciones (ADD-03).
          </Alert>
        )}
      </div>

      {/* Tabla de Eventos de Consumo (API-04) — SIN contenedor envolvente */}
      <div className="space-y-3 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">
              Eventos de consumo (API-04)
            </h2>
            <p className="text-xs text-muted-foreground">
              Cada entrega es una reserva durable que se convierte en evento inmutable. Un reintento del mismo id_operacion/id_segmento no duplica consumo; la entrega incierta queda Pendiente de conciliación.
            </p>
          </div>
          <Badge tone="neutral" appearance="soft" size="sm" className="self-start sm:self-center">
            {mios.length} {mios.length === 1 ? "evento" : "eventos"}
          </Badge>
        </div>

        <Table
          className="w-full min-w-[920px]"
          containerClassName="overflow-x-auto w-full"
        >
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="whitespace-nowrap text-left pl-6">
                EVENTO / FECHA
              </TableHead>
              <TableHead className="whitespace-nowrap text-left">
                ORIGEN
              </TableHead>
              <TableHead className="whitespace-nowrap text-left">
                ENTORNO
              </TableHead>
              <TableHead className="whitespace-nowrap text-left">
                RESULTADO
              </TableHead>
              <TableHead className="whitespace-nowrap text-left">
                RESERVADA / ENTREGADA
              </TableHead>
              <TableHead className="whitespace-nowrap text-left">
                ESTADO
              </TableHead>
              <TableHead className="whitespace-nowrap text-right pr-6">
                ACCIONES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEventos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Activity className="size-8 stroke-[1.5] text-muted-foreground/60" />
                    <p className="text-sm font-semibold text-foreground">
                      No hay eventos registrados
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ejecuta una consulta o prueba en la primera pestaña para registrar eventos.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEventos.map((e) => (
                <TableRow key={e.idEvento}>
                  <TableCell className="pl-6">
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-bold text-foreground block">
                        {e.idEvento}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        {e.idOperacion} {e.idSegmento !== "—" ? `· ${e.idSegmento}` : ""} · {formatoFecha(e.instante)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {e.origen}
                  </TableCell>
                  <TableCell>
                    <Badge
                      tone={e.entorno === "Producción" ? "primary" : "info"}
                      appearance="soft"
                      size="sm"
                    >
                      {e.entorno}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    <div className="space-y-0.5">
                      <span>{e.resultado}</span>
                      {e.cursor && (
                        <span className="block font-mono text-[10px] text-muted-foreground">
                          {e.cursor}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-semibold text-foreground">
                    {numero(e.reservada)} /{" "}
                    <span className="text-primary">{numero(e.entregada)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      tone={
                        e.estado === "Confirmado"
                          ? "success"
                          : e.estado === "Liberado"
                            ? "neutral"
                            : "warning"
                      }
                      appearance="soft"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {e.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    {e.estado === "Pendiente de conciliación" &&
                    puedeConciliar ? (
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            st.conciliarEvento(e.idEvento, true);
                            toast.success("Entrega confirmada");
                          }}
                        >
                          Se entregó
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="neutral"
                          onClick={() => {
                            st.conciliarEvento(e.idEvento, false);
                            toast.info(
                              "Reserva liberada; reintento habilitado"
                            );
                          }}
                        >
                          No se entregó
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Mostrando{" "}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              a{" "}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * pageSize, mios.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-foreground">
                {mios.length}
              </span>{" "}
              eventos
            </p>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
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
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
