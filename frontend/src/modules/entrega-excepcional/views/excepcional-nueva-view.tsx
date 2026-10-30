"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, FileText, FileUp, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FUENTES_PUBLICADAS,
  OPERADORES_FILTRO,
  PARAMETROS_FUENTE,
  SOPORTES_REQUERIDOS,
  ZONAS_HORARIAS,
  calcularOcurrencias,
  formatoFecha,
  resolverHoraLocal,
  ultimoParametrosPublicados,
  useExcepcionalStore,
  type CampoSolicitado,
  type FiltroExtraccion,
  type SolicitudExcepcional,
  type SupuestoDeclarado,
} from "../data/excepcional-store";
import { ExcepcionalShell, Seccion, useActor } from "../components/excepcional-ui";

const PASOS: StepperStep[] = [
  { id: "1", title: "Supuestos y requisitos", description: "Arts. 11 y 12", icon: FileText },
  { id: "2", title: "Definición de la entrega", description: "Criterio y programación", icon: CalendarClock },
  { id: "3", title: "Revisar", description: "Requisitos completos", icon: CheckCircle2 },
  { id: "4", title: "Firma y envío", description: "FirmaEC", icon: ShieldCheck },
];

function Campo({ id, etiqueta, requerido, ayuda, children, className }: { id: string; etiqueta: string; requerido?: boolean; ayuda?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {etiqueta} {requerido && <span className="text-danger">*</span>}
      </Label>
      {children}
      {ayuda && <p className="text-[11px] text-muted-foreground">{ayuda}</p>}
    </div>
  );
}

interface Formulario {
  fuenteId: string;
  supuestos: SupuestoDeclarado[];
  decreto: { numero: string; fecha: string; vigenciaHasta: string };
  finalidad: string;
  campos: CampoSolicitado[];
  legitimacion: string;
  justificacionTecnica: string;
  temporalidadDias: number;
  volumenSolicitado: number;
  conservacion: string;
  estructuraBase: string;
  soportes: Record<string, string>;
  criterio: FiltroExtraccion[];
  justificacionExtraccion: string;
  formato: "CSV" | "JSON" | "XML";
  tipoProgramacion: "Única" | "Periódica";
  zonaHoraria: string;
  fechaLocal: string;
  horaLocal: string;
  desplazamientoElegido: string;
  unidad: "dia" | "semana" | "mes";
  intervalo: number;
  fechaFinal: string;
  firmaDelegado: boolean;
  archivoDelegacion: string;
}

const FORM_VACIO: Formulario = {
  fuenteId: "",
  supuestos: [],
  decreto: { numero: "", fecha: "", vigenciaHasta: "" },
  finalidad: "",
  campos: [{ campo: "", descripcion: "", categoria: "Accesible" }],
  legitimacion: "",
  justificacionTecnica: "",
  temporalidadDias: 90,
  volumenSolicitado: 100000,
  conservacion: "",
  estructuraBase: "",
  soportes: {},
  criterio: [],
  justificacionExtraccion: "",
  formato: "CSV",
  tipoProgramacion: "Única",
  zonaHoraria: "America/Guayaquil",
  fechaLocal: "",
  horaLocal: "02:00",
  desplazamientoElegido: "",
  unidad: "semana",
  intervalo: 1,
  fechaFinal: "",
  firmaDelegado: false,
  archivoDelegacion: "",
};

function desdeSolicitud(s: SolicitudExcepcional): Formulario {
  const [fechaLocal, horaLocal] = s.primeraEjecucionLocal.split("T");
  return {
    fuenteId: s.fuenteId,
    supuestos: s.supuestos,
    decreto: s.decreto ?? { numero: "", fecha: "", vigenciaHasta: "" },
    finalidad: s.finalidad,
    campos: s.campos,
    legitimacion: s.legitimacion,
    justificacionTecnica: s.justificacionTecnica,
    temporalidadDias: s.temporalidadDias,
    volumenSolicitado: s.volumenSolicitado,
    conservacion: s.conservacion,
    estructuraBase: s.estructuraBase,
    soportes: Object.fromEntries(s.soportes.map((x) => [x.tipo, x.archivo])),
    criterio: s.criterio,
    justificacionExtraccion: s.justificacionExtraccion,
    formato: s.formato,
    tipoProgramacion: s.tipoProgramacion,
    zonaHoraria: s.zonaHoraria,
    fechaLocal,
    horaLocal,
    desplazamientoElegido: s.desplazamientoUtc,
    unidad: s.regla?.unidad ?? "semana",
    intervalo: s.regla?.intervalo ?? 1,
    fechaFinal: s.fechaFinalProgramacion ?? "",
    firmaDelegado: false,
    archivoDelegacion: "",
  };
}

export function ExcepcionalNuevaView() {
  const router = useRouter();
  const params = useSearchParams();
  const corregirId = params.get("corregir");
  const { solicitudes, parametros, enviarSolicitud, listo } = useExcepcionalStore();
  const { actor, institucion } = useActor();
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState<Formulario>(FORM_VACIO);
  const [firmando, setFirmando] = useState(false);
  const [cargado, setCargado] = useState(false);

  const original = corregirId ? solicitudes.find((s) => s.id === corregirId) : undefined;
  useEffect(() => {
    if (original && !cargado) {
      setForm(desdeSolicitud(original));
      setCargado(true);
    }
  }, [original, cargado]);

  const par = ultimoParametrosPublicados(parametros);
  const set = <K extends keyof Formulario>(k: K, v: Formulario[K]) => setForm((f) => ({ ...f, [k]: v }));

  const fuente = FUENTES_PUBLICADAS.find((f) => f.id === form.fuenteId);
  const estadoExcepcion = form.supuestos.some((s) => s.codigo === "ESTADO_EXCEPCION");
  const ordinarios = form.supuestos.filter((s) => s.codigo !== "ESTADO_EXCEPCION");
  const hora = useMemo(() => (form.fechaLocal ? resolverHoraLocal(form.zonaHoraria, form.fechaLocal, form.horaLocal) : null), [form.fechaLocal, form.horaLocal, form.zonaHoraria]);
  const resuelta = hora?.estado === "ok" ? hora.opciones[0] : hora?.estado === "ambigua" ? hora.opciones.find((o) => o.desplazamiento === form.desplazamientoElegido) : undefined;

  const alternar = (codigo: string) =>
    set("supuestos", form.supuestos.some((s) => s.codigo === codigo) ? form.supuestos.filter((s) => s.codigo !== codigo) : [...form.supuestos, { codigo, justificacion: "" }]);

  const [ahoraMs] = useState(() => Date.now());
  const hoyIso = new Date(ahoraMs).toISOString().slice(0, 10);
  const faltantes = useMemo(() => {
    const f: string[] = [];
    if (!par) f.push("PAR-17 no tiene una versión publicada: no se pueden enviar solicitudes nuevas.");
    if (!form.fuenteId) f.push("Fuente publicada");
    if (!estadoExcepcion && ordinarios.length < (par?.minSupuestos ?? 2)) f.push(`Al menos ${par?.minSupuestos ?? 2} supuestos del art. 11`);
    form.supuestos.forEach((s) => {
      if (!s.justificacion.trim()) f.push(`Justificación del supuesto «${par?.supuestos.find((p) => p.codigo === s.codigo)?.nombre ?? s.codigo}»`);
    });
    if (estadoExcepcion) {
      if (!form.decreto.numero || !form.decreto.fecha || !form.decreto.vigenciaHasta) f.push("Número, fecha y vigencia del decreto de estado de excepción");
      else if (new Date(form.decreto.vigenciaHasta) < new Date(ahoraMs + form.temporalidadDias * 86400000)) f.push("La temporalidad no puede superar la vigencia del decreto");
    }
    if (!form.finalidad.trim()) f.push("Finalidad del tratamiento");
    if (form.campos.length === 0 || form.campos.some((c) => !c.campo.trim() || !c.descripcion.trim())) f.push("Datos solicitados con descripción y categoría");
    if (!form.legitimacion.trim()) f.push("Legitimación de acceso (LOPDP)");
    if (!form.justificacionTecnica.trim()) f.push("Justificación técnica y tecnológica");
    if (!(form.temporalidadDias > 0) || form.temporalidadDias > (par?.vigenciaMaximaDias ?? 365)) f.push(`Temporalidad entre 1 y ${par?.vigenciaMaximaDias ?? 365} días`);
    if (!(form.volumenSolicitado > 0)) f.push("Volumen solicitado");
    if (!form.conservacion.trim()) f.push("Tiempo de conservación y mecanismo de destrucción");
    if (!form.estructuraBase.trim()) f.push("Estructura de la base de consulta");
    SOPORTES_REQUERIDOS.forEach((t) => {
      if (!form.soportes[t]) f.push(`Soporte: ${t}`);
    });
    if (!form.justificacionExtraccion.trim()) f.push("Justificación de la extracción");
    if (form.criterio.some((c) => !c.parametro || !c.valor.trim())) f.push("Cada filtro del criterio necesita parámetro y valor");
    if (!ZONAS_HORARIAS.includes(form.zonaHoraria)) f.push("Zona horaria IANA válida");
    if (!form.fechaLocal) f.push("Fecha de la primera ejecución");
    else if (hora?.estado === "inexistente") f.push("La hora local no existe por cambio horario; corrígela");
    else if (hora?.estado === "ambigua" && !resuelta) f.push("Elige el desplazamiento UTC de la hora ambigua");
    else if (resuelta && new Date(resuelta.utc).getTime() <= ahoraMs) f.push("La primera ejecución debe ser futura");
    if (form.tipoProgramacion === "Periódica") {
      if (!(form.intervalo > 0)) f.push("Intervalo de la regla de frecuencia");
      if (!form.fechaFinal) f.push("Fecha final de la programación");
      else if (form.fechaLocal && form.fechaFinal < form.fechaLocal) f.push("La fecha final no puede ser anterior a la primera ejecución");
      else if (form.fechaFinal > new Date(ahoraMs + form.temporalidadDias * 86400000).toISOString().slice(0, 10)) f.push("La fecha final no puede superar el fin de la temporalidad solicitada");
    }
    if (form.firmaDelegado && !form.archivoDelegacion) f.push("Autorización de firma del delegado");
    return f;
  }, [form, par, estadoExcepcion, ordinarios.length, hora, resuelta, ahoraMs]);

  const ocurrencias = useMemo(() => {
    if (!resuelta || !form.fechaLocal) return [];
    return calcularOcurrencias({
      tipoProgramacion: form.tipoProgramacion,
      zonaHoraria: form.zonaHoraria,
      primeraEjecucionLocal: `${form.fechaLocal}T${form.horaLocal}`,
      primeraEjecucionUtc: resuelta.utc,
      desplazamientoUtc: resuelta.desplazamiento,
      regla: form.tipoProgramacion === "Periódica" ? { unidad: form.unidad, intervalo: form.intervalo } : undefined,
      fechaFinalProgramacion: form.tipoProgramacion === "Periódica" ? form.fechaFinal || undefined : undefined,
    });
  }, [form, resuelta]);

  const firmarYEnviar = () => {
    if (!resuelta || faltantes.length > 0) return;
    setFirmando(true);
    setTimeout(() => {
      const id = enviarSolicitud(
        {
          tipo: "Solicitud",
          institucion: institucion || "Dirección General de Registro Civil",
          coordinador: actor.nombre,
          fuenteId: form.fuenteId,
          fuente: fuente?.nombre ?? form.fuenteId,
          supuestos: form.supuestos,
          decreto: estadoExcepcion ? form.decreto : undefined,
          finalidad: form.finalidad,
          campos: form.campos,
          legitimacion: form.legitimacion,
          justificacionTecnica: form.justificacionTecnica,
          temporalidadDias: form.temporalidadDias,
          volumenSolicitado: form.volumenSolicitado,
          conservacion: form.conservacion,
          estructuraBase: form.estructuraBase,
          soportes: SOPORTES_REQUERIDOS.map((tipo) => ({ tipo, archivo: form.soportes[tipo] })),
          criterio: form.criterio,
          justificacionExtraccion: form.justificacionExtraccion,
          formato: form.formato,
          tipoProgramacion: form.tipoProgramacion,
          zonaHoraria: form.zonaHoraria,
          primeraEjecucionLocal: `${form.fechaLocal}T${form.horaLocal}`,
          primeraEjecucionUtc: resuelta.utc,
          desplazamientoUtc: resuelta.desplazamiento,
          regla: form.tipoProgramacion === "Periódica" ? { unidad: form.unidad, intervalo: form.intervalo } : undefined,
          fechaFinalProgramacion: form.tipoProgramacion === "Periódica" ? form.fechaFinal : undefined,
          firmante: form.firmaDelegado ? "Delegado de la máxima autoridad (autorización cargada)" : "Máxima autoridad de la consumidora",
        },
        actor,
        original?.id
      );
      setFirmando(false);
      toast.success("Solicitud firmada y enviada", { description: `${id} pasa a calificación (EXT-02).` });
      router.push(`/entrega-excepcional/detalle?id=${id}`);
    }, 900);
  };

  const subir = (clave: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.files?.[0]?.name;
    if (nombre) set("soportes", { ...form.soportes, [clave]: nombre });
  };

  return (
    <ExcepcionalShell
      activeMenu="entrega-excepcional"
      etiqueta={corregirId ? `Corrección · ${corregirId}` : "EXT-01 · Solicitud"}
      titulo={corregirId ? "Completar la solicitud observada" : "Solicitar entrega directa y excepcional"}
      descripcion="Declara los supuestos del art. 11, los requisitos del art. 12 y cómo se hará la entrega. La solicitud la firma con FirmaEC la máxima autoridad de tu institución o su delegado."
      icono={<FileText className="size-32 text-primary" />}
      volver={{ href: "/entrega-excepcional", texto: "Volver a la bandeja" }}
    >
      {!listo ? (
        <p className="text-xs text-muted-foreground">Cargando…</p>
      ) : (
        <>
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-xs overflow-x-auto">
            <Stepper steps={PASOS} activeStep={paso - 1} variant="default" stepPrefix="PASO" showBadge={true} onStepClick={(i) => i + 1 < paso && setPaso(i + 1)} />
          </div>

          {original?.observaciones && (
            <Alert variant="warning" icon={<AlertCircle className="size-4" />} title="Observaciones de la calificación" className="p-3 text-xs">
              <ul className="list-disc pl-4 space-y-0.5">
                {original.observaciones.map((o) => (
                  <li key={o.requisito}>
                    <strong>{o.requisito}:</strong> {o.detalle}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {paso === 1 && (
            <div className="space-y-5">
              <Seccion titulo="Fuente y supuestos de excepción (art. 11)" descripcion={`Exige al menos ${par?.minSupuestos ?? 2} de los cuatro primeros, cada uno con su justificación. El estado de excepción basta solo.`}>
                <Campo id="fuente" etiqueta="Fuente publicada" requerido>
                  <Select value={form.fuenteId} onValueChange={(v) => set("fuenteId", v)}>
                    <SelectTrigger id="fuente" className="h-10 text-xs">
                      <SelectValue placeholder="Selecciona la fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUENTES_PUBLICADAS.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nombre} · {f.institucion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>
                <div className="space-y-3">
                  {(par?.supuestos ?? []).map((sup) => {
                    const marcado = form.supuestos.find((s) => s.codigo === sup.codigo);
                    return (
                      <div key={sup.codigo} className={cn("rounded-xl border p-3 space-y-2", marcado ? "border-primary/40 bg-primary/5" : "border-border")}>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <Checkbox checked={!!marcado} onCheckedChange={() => alternar(sup.codigo)} />
                          <span>{sup.nombre}</span>
                          {sup.bastaSolo && (
                            <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                              Basta solo
                            </Badge>
                          )}
                        </label>
                        {marcado && (
                          <Textarea
                            aria-label={`Justificación de ${sup.nombre}`}
                            value={marcado.justificacion}
                            onChange={(e) => set("supuestos", form.supuestos.map((s) => (s.codigo === sup.codigo ? { ...s, justificacion: e.target.value } : s)))}
                            rows={2}
                            className="text-xs"
                            placeholder="Justificación del supuesto"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                {estadoExcepcion && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3">
                    <Campo id="decreto-n" etiqueta="Número del decreto" requerido>
                      <Input id="decreto-n" value={form.decreto.numero} onChange={(e) => set("decreto", { ...form.decreto, numero: e.target.value })} className="text-xs" />
                    </Campo>
                    <Campo id="decreto-f" etiqueta="Fecha del decreto" requerido>
                      <Input id="decreto-f" type="date" value={form.decreto.fecha} onChange={(e) => set("decreto", { ...form.decreto, fecha: e.target.value })} className="text-xs" />
                    </Campo>
                    <Campo id="decreto-v" etiqueta="Vigencia hasta" requerido ayuda="La temporalidad no puede superarla.">
                      <Input id="decreto-v" type="date" value={form.decreto.vigenciaHasta} onChange={(e) => set("decreto", { ...form.decreto, vigenciaHasta: e.target.value })} className="text-xs" />
                    </Campo>
                  </div>
                )}
              </Seccion>

              <Seccion titulo="Requisitos de la solicitud (art. 12)">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Campo id="finalidad" etiqueta="Finalidad del tratamiento" requerido>
                    <Textarea id="finalidad" value={form.finalidad} onChange={(e) => set("finalidad", e.target.value)} rows={3} className="text-xs" />
                  </Campo>
                  <Campo id="legitimacion" etiqueta="Legitimación de acceso (motivación jurídica LOPDP)" requerido>
                    <Textarea id="legitimacion" value={form.legitimacion} onChange={(e) => set("legitimacion", e.target.value)} rows={3} className="text-xs" />
                  </Campo>
                  <Campo id="justificacion-tec" etiqueta="Justificación técnica y tecnológica de la dificultad para consumir por la plataforma" requerido className="lg:col-span-2">
                    <Textarea id="justificacion-tec" value={form.justificacionTecnica} onChange={(e) => set("justificacionTecnica", e.target.value)} rows={3} className="text-xs" />
                  </Campo>
                  <Campo id="temporalidad" etiqueta="Temporalidad solicitada (días)" requerido ayuda={`Máximo ${par?.vigenciaMaximaDias ?? 365} días (PAR-17).`}>
                    <Input id="temporalidad" type="number" min={1} value={form.temporalidadDias} onChange={(e) => set("temporalidadDias", parseInt(e.target.value) || 0)} className="text-xs font-mono" />
                  </Campo>
                  <Campo id="volumen" etiqueta="Volumen solicitado (registros)" requerido ayuda="Será el cupo de la autorización.">
                    <Input id="volumen" type="number" min={1} value={form.volumenSolicitado} onChange={(e) => set("volumenSolicitado", parseInt(e.target.value) || 0)} className="text-xs font-mono" />
                  </Campo>
                  <Campo id="conservacion" etiqueta="Tiempo de conservación y mecanismo de destrucción o anonimización" requerido>
                    <Textarea id="conservacion" value={form.conservacion} onChange={(e) => set("conservacion", e.target.value)} rows={2} className="text-xs" />
                  </Campo>
                  <Campo id="estructura" etiqueta="Estructura de la base de consulta" requerido>
                    <Textarea id="estructura" value={form.estructuraBase} onChange={(e) => set("estructuraBase", e.target.value)} rows={2} className="text-xs" />
                  </Campo>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Datos solicitados <span className="text-danger">*</span>
                    </Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => set("campos", [...form.campos, { campo: "", descripcion: "", categoria: "Accesible" }])} className="text-xs gap-1">
                      <Plus className="size-3.5" />
                      Agregar campo
                    </Button>
                  </div>
                  {form.campos.map((c, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_9rem_auto] gap-2 items-start">
                      <Input aria-label="Campo" value={c.campo} onChange={(e) => set("campos", form.campos.map((x, j) => (j === i ? { ...x, campo: e.target.value } : x)))} placeholder="campo" className="text-xs font-mono" />
                      <Input aria-label="Descripción" value={c.descripcion} onChange={(e) => set("campos", form.campos.map((x, j) => (j === i ? { ...x, descripcion: e.target.value } : x)))} placeholder="Descripción" className="text-xs" />
                      <Select value={c.categoria} onValueChange={(v) => set("campos", form.campos.map((x, j) => (j === i ? { ...x, categoria: v as CampoSolicitado["categoria"] } : x)))}>
                        <SelectTrigger aria-label="Categoría" className="h-10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accesible">Accesible</SelectItem>
                          <SelectItem value="Confidencial">Confidencial</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon-xs" aria-label="Quitar campo" disabled={form.campos.length === 1} onClick={() => set("campos", form.campos.filter((_, j) => j !== i))}>
                        <Trash2 className="size-4 text-danger" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Soportes en PDF <span className="text-danger">*</span>
                  </Label>
                  {SOPORTES_REQUERIDOS.map((tipo) => (
                    <label key={tipo} className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 h-10 text-xs cursor-pointer hover:border-primary/40">
                      <span className="flex items-center gap-2 min-w-0">
                        {form.soportes[tipo] ? <CheckCircle2 className="size-4 text-success shrink-0" /> : <FileUp className="size-4 text-primary shrink-0" />}
                        <span className="truncate">{tipo}</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[40%]">{form.soportes[tipo] ?? "Adjuntar PDF"}</span>
                      <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={subir(tipo)} />
                    </label>
                  ))}
                </div>
              </Seccion>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-5">
              <Seccion titulo="Criterio de extracción" descripcion="Solo filtros sobre parámetros de la fuente; no se acepta cron ni filtros libres.">
                <div className="space-y-2">
                  {form.criterio.map((c, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_1fr_auto] gap-2 items-start">
                      <Select value={c.parametro} onValueChange={(v) => set("criterio", form.criterio.map((x, j) => (j === i ? { ...x, parametro: v } : x)))}>
                        <SelectTrigger aria-label="Parámetro" className="h-10 text-xs font-mono">
                          <SelectValue placeholder="Parámetro" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARAMETROS_FUENTE.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={c.operador} onValueChange={(v) => set("criterio", form.criterio.map((x, j) => (j === i ? { ...x, operador: v } : x)))}>
                        <SelectTrigger aria-label="Operador" className="h-10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERADORES_FILTRO.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input aria-label="Valor" value={c.valor} onChange={(e) => set("criterio", form.criterio.map((x, j) => (j === i ? { ...x, valor: e.target.value } : x)))} placeholder="Valor" className="text-xs" />
                      <Button type="button" variant="ghost" size="icon-xs" aria-label="Quitar filtro" onClick={() => set("criterio", form.criterio.filter((_, j) => j !== i))}>
                        <Trash2 className="size-4 text-danger" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => set("criterio", [...form.criterio, { parametro: "", operador: "=", valor: "" }])} className="text-xs gap-1">
                    <Plus className="size-3.5" />
                    Agregar filtro
                  </Button>
                </div>
                <Campo id="just-extraccion" etiqueta="Justificación de la extracción" requerido>
                  <Textarea id="just-extraccion" value={form.justificacionExtraccion} onChange={(e) => set("justificacionExtraccion", e.target.value)} rows={2} className="text-xs" />
                </Campo>
                <Campo id="formato" etiqueta="Formato del archivo" requerido className="max-w-xs">
                  <Select value={form.formato} onValueChange={(v) => set("formato", v as Formulario["formato"])}>
                    <SelectTrigger id="formato" className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["CSV", "JSON", "XML"].map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>
              </Seccion>

              <Seccion titulo="Programación" descripcion="La zona horaria y la hora local se convierten a UTC; las ocurrencias periódicas se calculan sobre el calendario local.">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Campo id="tipo-prog" etiqueta="Tipo de programación" requerido>
                    <Select value={form.tipoProgramacion} onValueChange={(v) => set("tipoProgramacion", v as Formulario["tipoProgramacion"])}>
                      <SelectTrigger id="tipo-prog" className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Única">Única</SelectItem>
                        <SelectItem value="Periódica">Periódica</SelectItem>
                      </SelectContent>
                    </Select>
                  </Campo>
                  <Campo id="zona" etiqueta="Zona horaria (IANA)" requerido>
                    <Select value={form.zonaHoraria} onValueChange={(v) => set("zonaHoraria", v)}>
                      <SelectTrigger id="zona" className="h-10 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ZONAS_HORARIAS.map((z) => (
                          <SelectItem key={z} value={z}>
                            {z}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Campo>
                  <Campo id="fecha-local" etiqueta="Fecha de la primera ejecución" requerido>
                    <Input id="fecha-local" type="date" min={hoyIso} value={form.fechaLocal} onChange={(e) => set("fechaLocal", e.target.value)} className="text-xs" />
                  </Campo>
                  <Campo id="hora-local" etiqueta="Hora local" requerido>
                    <Input id="hora-local" type="time" value={form.horaLocal} onChange={(e) => set("horaLocal", e.target.value)} className="text-xs" />
                  </Campo>
                </div>

                {hora?.estado === "inexistente" && (
                  <Alert variant="danger" icon={<AlertCircle className="size-4" />} title="La hora local no existe" className="p-3 text-xs">
                    Esa hora se salta por un cambio horario en {form.zonaHoraria}. Elige otra hora.
                  </Alert>
                )}
                {hora?.estado === "ambigua" && (
                  <Alert variant="warning" icon={<AlertCircle className="size-4" />} title="La hora local se repite por un cambio horario" className="p-3 text-xs">
                    <div className="flex flex-wrap gap-2 pt-1">
                      {hora.opciones.map((o) => (
                        <Button key={o.desplazamiento} type="button" size="sm" variant={form.desplazamientoElegido === o.desplazamiento ? "primary" : "outline"} onClick={() => set("desplazamientoElegido", o.desplazamiento)} className="text-xs font-mono">
                          UTC{o.desplazamiento} · {formatoFecha(o.utc)}
                        </Button>
                      ))}
                    </div>
                  </Alert>
                )}
                {resuelta && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Primera ejecución en UTC: {resuelta.utc} (desplazamiento {resuelta.desplazamiento})
                  </p>
                )}

                {form.tipoProgramacion === "Periódica" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border p-3">
                    <Campo id="unidad" etiqueta="Unidad" requerido>
                      <Select value={form.unidad} onValueChange={(v) => set("unidad", v as Formulario["unidad"])}>
                        <SelectTrigger id="unidad" className="h-10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dia">Día</SelectItem>
                          <SelectItem value="semana">Semana</SelectItem>
                          <SelectItem value="mes">Mes</SelectItem>
                        </SelectContent>
                      </Select>
                    </Campo>
                    <Campo id="intervalo" etiqueta="Cada (intervalo)" requerido>
                      <Input id="intervalo" type="number" min={1} value={form.intervalo} onChange={(e) => set("intervalo", parseInt(e.target.value) || 0)} className="text-xs font-mono" />
                    </Campo>
                    <Campo id="fecha-final" etiqueta="Fecha final (inclusiva)" requerido ayuda="No puede superar el fin de la temporalidad.">
                      <Input id="fecha-final" type="date" value={form.fechaFinal} onChange={(e) => set("fechaFinal", e.target.value)} className="text-xs" />
                    </Campo>
                  </div>
                )}

                {ocurrencias.length > 0 && (
                  <div className="rounded-xl bg-muted/30 border border-border p-3 space-y-1.5">
                    <p className="text-[11px] font-semibold text-foreground">Ocurrencias calculadas</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-mono text-muted-foreground">
                      {ocurrencias.map((o) => (
                        <li key={o.indice}>
                          n={o.indice} · {o.localResuelta} (UTC{o.desplazamiento})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Seccion>
            </div>
          )}

          {paso === 3 && (
            <Seccion titulo="Revisión de requisitos" descripcion="Si falta un requisito no se puede enviar; cada faltante aparece en la lista.">
              {faltantes.length === 0 ? (
                <Alert variant="success" icon={<CheckCircle2 className="size-4" />} title="Solicitud completa" className="p-3 text-xs">
                  Cumple los requisitos de los arts. 11 y 12. Revisa el resumen y pasa a la firma.
                </Alert>
              ) : (
                <Alert variant="danger" icon={<AlertCircle className="size-4" />} title={`Faltan ${faltantes.length} requisitos`} className="p-3 text-xs">
                  <ul className="list-disc pl-4 space-y-0.5">
                    {faltantes.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  ["Fuente", fuente?.nombre ?? "—"],
                  ["Supuestos", form.supuestos.map((s) => par?.supuestos.find((p) => p.codigo === s.codigo)?.nombre).join(", ") || "—"],
                  ["Volumen solicitado", `${form.volumenSolicitado.toLocaleString("es-EC")} registros`],
                  ["Temporalidad", `${form.temporalidadDias} días`],
                  ["Formato", form.formato],
                  ["Programación", form.tipoProgramacion === "Única" ? "Única" : `Cada ${form.intervalo} ${form.unidad}(s) hasta ${form.fechaFinal || "—"}`],
                  ["Primera ejecución", resuelta ? `${form.fechaLocal} ${form.horaLocal} (${form.zonaHoraria})` : "—"],
                  ["Datos", form.campos.map((c) => `${c.campo} (${c.categoria})`).join(", ")],
                ].map(([t, v]) => (
                  <div key={t} className="rounded-lg border border-border p-2.5">
                    <dt className="text-[11px] text-muted-foreground">{t}</dt>
                    <dd className="font-medium text-foreground mt-0.5 break-words">{v}</dd>
                  </div>
                ))}
              </dl>
            </Seccion>
          )}

          {paso === 4 && (
            <Seccion titulo="Firma con FirmaEC" descripcion="Firma la máxima autoridad de la consumidora o su delegado con la autorización cargada. Solo una solicitud firmada y verificada pasa a calificación.">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <Checkbox checked={form.firmaDelegado} onCheckedChange={(v) => set("firmaDelegado", v === true)} />
                <span>Firma un delegado de la máxima autoridad</span>
              </label>
              {form.firmaDelegado && (
                <label className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 h-10 text-xs cursor-pointer hover:border-primary/40 max-w-xl">
                  <span className="flex items-center gap-2">
                    <FileUp className="size-4 text-primary" />
                    Autorización de firma del delegado (PDF)
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono truncate">{form.archivoDelegacion || "Adjuntar"}</span>
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => set("archivoDelegacion", e.target.files?.[0]?.name ?? "")} />
                </label>
              )}
              {faltantes.length > 0 && (
                <Alert variant="danger" icon={<AlertCircle className="size-4" />} title="No se puede firmar todavía" className="p-3 text-xs">
                  Vuelve al paso 3: faltan {faltantes.length} requisitos.
                </Alert>
              )}
              <Button type="button" variant="primary" size="sm" disabled={faltantes.length > 0 || firmando} onClick={firmarYEnviar} className="text-xs font-semibold gap-2">
                {firmando ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                <span>{firmando ? "Verificando la firma en FirmaEC…" : "Firmar y enviar solicitud"}</span>
              </Button>
            </Seccion>
          )}

          <div className="flex justify-between gap-3 pt-2 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" disabled={paso === 1} onClick={() => setPaso(paso - 1)} className="text-xs font-semibold gap-1.5">
              <ArrowLeft className="size-4" />
              Anterior
            </Button>
            {paso < 4 && (
              <Button type="button" variant="primary" size="sm" onClick={() => setPaso(paso + 1)} className="text-xs font-semibold gap-1.5">
                Siguiente
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </ExcepcionalShell>
  );
}
