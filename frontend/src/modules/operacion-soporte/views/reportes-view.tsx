"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart3, Download, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExcepcionalShell, Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { useExcepcionalStore } from "@/modules/entrega-excepcional/data/excepcional-store";
import { saldoAcceso, useConsumoStore } from "@/modules/consumo-api/data/consumo-store";
import { useSolicitudesIngresoStore } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { useSolicitudesStore } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { useFuentesStore } from "@/modules/fuentes/data/fuentes-store";
import { formatoFecha, numero, useOperacionStore } from "../data/operacion-store";

// PAR-12 (simulado): límites de exportación
const MAX_FILAS_SINCRONA = 1000;
const MAX_FILAS_TOTAL = 50000;

function Vacio() {
  return <p className="text-xs text-muted-foreground">No hay resultados para este período y filtros.</p>;
}
function Tabla({ cols, filas }: { cols: string[]; filas: (string | number)[][] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-0">{cols.map((c, i) => <TableHead key={c} className={`text-xs font-bold text-white ${i === 0 ? "pl-4" : ""}`}>{c}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((f, i) => <TableRow key={i}>{f.map((v, k) => <TableCell key={k} className={`text-xs ${k === 0 ? "pl-4 font-semibold" : ""}`}>{v}</TableCell>)}</TableRow>)}
        </TableBody>
      </Table>
    </div>
  );
}
function exportarCsv(nombre: string, cols: string[], filas: (string | number)[][]) {
  const csv = [cols, ...filas].map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
const segundos = (a?: string, b?: string) => {
  if (!a || !b) return null;
  const s = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 1000);
  return Number.isFinite(s) && s >= 0 ? s : null;
};

function Gestion() {
  const co = useConsumoStore();
  const op = useOperacionStore();
  const incidentesCerrados = op.incidentes.map((i) => ({ i, t: i.estado === "Cerrado" ? segundos(i.registro, i.cierre?.instante) : null }));
  return (
    <div className="space-y-5">
      <Seccion titulo="Instituciones y consumo (REP-01)" descripcion="Credenciales por institución sin secreto, con la solicitud, el coordinador asociado y el consumo acumulado. Solo en pantalla: Gestión no exporta ni busca por cédula.">
        <Tabla cols={["Solicitud", "Institución", "Fuente", "Tipo", "Credencial", "Campos / finalidad", "Entregado", "Cupo o referencia"]} filas={co.accesos.map((a) => [a.id, a.institucion, a.fuente, a.tipo, a.credencial, `${a.camposAutorizados.length} campos`, numero(saldoAcceso(a, co.eventos).consumido), numero(a.cupoAutorizado)])} />
      </Seccion>
      <Seccion titulo="Tiempos de operación" descripcion="Las marcas ISO 8601 UTC se restan y se convierten a segundos (unidad canónica). Si falta el instante final se muestra «Pendiente/no calculable», nunca cero.">
        <Tabla cols={["Incidente", "Estado", "Registro", "Tiempo de resolución (s)", "En horas"]} filas={incidentesCerrados.map(({ i, t }) => [i.id, i.estado, formatoFecha(i.registro), t === null ? "Pendiente/no calculable" : numero(t), t === null ? "—" : (t / 3600).toFixed(2)])} />
      </Seccion>
    </div>
  );
}

function Normatividad() {
  const ing = useSolicitudesIngresoStore();
  const { rol, actor } = useActor();
  const op = useOperacionStore();
  const [estado, setEstado] = useState("TODOS");
  const [cedula, setCedula] = useState("");
  const [finalidad, setFinalidad] = useState("");
  const [busqueda, setBusqueda] = useState<null | { filas: string[][] }>(null);
  const co = useConsumoStore();
  const filasPersonal = useMemo(() => {
    const por: Record<string, { asig: number; tram: number; pend: number }> = {};
    ing.solicitudes.filter((s) => s.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" && s.revisorNormatividad && (estado === "TODOS" || s.estado === estado)).forEach((s) => {
      const r = (por[s.revisorNormatividad!] ??= { asig: 0, tram: 0, pend: 0 });
      r.asig += 1;
      if (["RESOLUCION_GENERADA", "PENDIENTE_DE_FIRMA", "INSTITUCION_ACTIVA", "Aprobada", "APROBADO_FINAL", "Rechazada"].includes(s.estado)) r.tram += 1;
      else r.pend += 1;
    });
    return Object.entries(por).map(([m, v]) => [m, v.asig, v.tram, v.pend]);
  }, [ing.solicitudes, estado]);
  const estados = [...new Set(ing.solicitudes.map((s) => s.estado))];
  const permitido = rol === "DIR_NORMATIVA" || rol === "EQ_NORMATIVA";
  if (!permitido) return <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 border border-border p-3">Estos reportes los consultan solo el Equipo y el Director de Normatividad.</p>;

  const buscar = () => {
    const filas = co.eventos.filter((e) => e.identificador === cedula.trim() && e.entorno === "Producción").map((e) => {
      const a = co.accesos.find((x) => x.id === e.accesoId);
      return [formatoFecha(e.instante), a?.institucion ?? "—", e.accesoId, a?.fuente ?? "—", "Andrea López (Coordinador asociado)", e.origen, numero(e.entregada)];
    });
    op.registrarAccesoReporte({ instante: new Date().toISOString(), cuenta: actor.nombre, cedulaProtegida: `••••••${cedula.slice(-4)}`, finalidad: finalidad.trim(), resultado: filas.length ? "Con resultados" : "Sin resultados" });
    setBusqueda({ filas });
  };
  const COLS_REP3 = ["Fecha", "Institución", "Solicitud", "Fuente", "Coordinador asociado", "Origen", "Registros"];
  const filasExp = busqueda?.filas ?? [];
  const exportar = (nombre: string, cols: string[], filas: (string | number)[][]) => {
    if (filas.length > MAX_FILAS_TOTAL) return toast.error("Supera el máximo total de exportación; acota los filtros.");
    if (filas.length > MAX_FILAS_SINCRONA) return toast.info("Exportación iniciada", { description: "Supera el límite síncrono: se generará de forma asincrónica con el mismo ámbito." });
    exportarCsv(nombre, cols, filas);
    toast.success("Exportación lista para descargar", { description: `${filas.length} filas · límites PAR-12: ${MAX_FILAS_SINCRONA}/${MAX_FILAS_TOTAL}` });
  };

  return (
    <div className="space-y-5">
      <Seccion titulo="Revisiones por miembro (REP-02)" descripcion="Asignadas, tramitadas y pendientes por persona de Normatividad, calculadas sobre los expedientes del Anexo A. Una reasignación cierra la anterior sin borrar su historial." acciones={<Button type="button" size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => exportar("reporte-normatividad.csv", ["Miembro", "Asignadas", "Tramitadas", "Pendientes"], filasPersonal)}><Download className="size-3.5" />Exportar CSV (REP-04)</Button>}>
        <div className="w-64">
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger aria-label="Estado" className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="TODOS">Todos los estados</SelectItem>{estados.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {filasPersonal.length === 0 ? <Vacio /> : <Tabla cols={["Miembro", "Asignadas", "Tramitadas", "Pendientes"]} filas={filasPersonal} />}
      </Seccion>

      <Seccion titulo="Trazabilidad por cédula (REP-03)" descripcion="Exige una finalidad declarada y deja un evento de acceso al reporte con la cédula protegida. Solo Normatividad accede; una llamada API solo identifica la credencial institucional, no a la persona que la ejecutó.">
        <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="rep3-cedula" className="text-xs text-muted-foreground">Cédula</Label>
            <Input id="rep3-cedula" value={cedula} onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))} maxLength={10} className="text-xs font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rep3-fin" className="text-xs text-muted-foreground">Finalidad de la consulta <span className="text-danger">*</span></Label>
            <Input id="rep3-fin" value={finalidad} onChange={(e) => setFinalidad(e.target.value)} className="text-xs" />
          </div>
          <Button type="button" size="sm" variant="primary" disabled={cedula.length !== 10 || !finalidad.trim()} className="text-xs gap-1.5" onClick={buscar}><Search className="size-3.5" />Buscar</Button>
        </div>
        {busqueda && (busqueda.filas.length === 0 ? <Alert variant="info" title="No hay usos registrados para esta búsqueda y período" className="p-3 text-xs">Los filtros se conservan para modificarlos.</Alert> : (
          <div className="space-y-2">
            <Tabla cols={COLS_REP3} filas={busqueda.filas} />
            <Button type="button" size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => exportar("trazabilidad-cedula.csv", COLS_REP3, filasExp)}><Download className="size-3.5" />Exportar CSV</Button>
          </div>
        ))}
        {op.accesosReporte.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-foreground">Accesos a este reporte (auditoría, sin filas consultadas)</p>
            <ul className="text-[11px] text-muted-foreground space-y-0.5">
              {[...op.accesosReporte].reverse().slice(0, 5).map((a, i) => <li key={i}>{formatoFecha(a.instante)} · {a.cuenta} · cédula {a.cedulaProtegida} · «{a.finalidad}» · {a.resultado}</li>)}
            </ul>
          </div>
        )}
      </Seccion>
    </div>
  );
}

function Seguimiento() {
  const ing = useSolicitudesIngresoStore();
  const sol = useSolicitudesStore();
  const fu = useFuentesStore();
  const ex = useExcepcionalStore();
  const co = useConsumoStore();
  const { rol } = useActor();
  const [tipo, setTipo] = useState("TODOS");
  const [q, setQ] = useState("");
  const filas = useMemo(() => {
    const r: { tipo: string; id: string; institucion: string; estado: string; area: string; responsable: string; ingreso: string; cambio: string }[] = [];
    ing.solicitudes.forEach((s) => r.push({ tipo: s.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" ? "Anexo A" : s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" ? "Anexo B" : "Anexo C", id: s.id, institucion: s.institucion, estado: s.estado, area: s.estado.includes("NORMAT") || s.estado.includes("RESOLUCION") || s.estado.includes("FIRMA") ? "Normatividad" : "Gestión", responsable: s.revisorNormatividad || s.revisorGestion || s.revisor || "Sin asignar", ingreso: s.fechaSolicitud, cambio: s.fechaRevision ?? s.fechaSolicitud }));
    sol.solicitudes.forEach((s) => r.push({ tipo: "Solicitud de acceso", id: s.id, institucion: s.institucion, estado: s.estado, area: String(s.responsable ?? "—"), responsable: s.revisorAsignado || "Sin asignar", ingreso: s.fecha, cambio: s.ultimaActualizacion }));
    co.ampliaciones.forEach((a) => r.push({ tipo: "Ampliación", id: a.id, institucion: co.accesos.find((x) => x.id === a.accesoId)?.institucion ?? "—", estado: a.estado, area: "Gestión", responsable: "Sin asignar", ingreso: a.historial[0]?.instante ?? "", cambio: a.historial.at(-1)?.instante ?? "" }));
    ex.solicitudes.forEach((s) => r.push({ tipo: "Extracción", id: s.id, institucion: s.institucion, estado: s.estado, area: s.estado.includes("DPI") ? "DPI" : s.estado.includes("tecnol") ? "Infraestructura" : "Gestión", responsable: s.asignaciones.find((a) => a.vigente)?.nombreRevisor ?? "Sin asignar", ingreso: s.fechaCreacion, cambio: s.historial.at(-1)?.instante ?? s.fechaCreacion }));
    fu.fuentes.forEach((f) => r.push({ tipo: "Fuente", id: f.id, institucion: f.institucion_proveedora_nombre, estado: f.estado, area: "DGR / DPI", responsable: "Sin asignar", ingreso: f.fecha_creacion ?? "", cambio: f.fecha_actualizacion ?? f.fecha_creacion ?? "" }));
    return r;
  }, [ing.solicitudes, sol.solicitudes, fu.fuentes, ex.solicitudes, co.ampliaciones, co.accesos]);
  const permitido = rol === "ADMIN" || rol === "DGR" || rol === "APROBADOR";
  if (!permitido) return <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 border border-border p-3">Solo ve este seguimiento un rol con la capacidad «consultar_seguimiento_tramites» (Administrador, Dirección de Gestión y Registro o asesoría de la Máxima Autoridad).</p>;
  const tipos = [...new Set(filas.map((f) => f.tipo))];
  const vis = filas.filter((f) => (tipo === "TODOS" || f.tipo === tipo) && (!q.trim() || [f.id, f.institucion, f.estado].some((v) => v.toLowerCase().includes(q.toLowerCase()))));
  return (
    <Seccion titulo="Seguimiento de trámites (REP-05)" descripcion="Solo lectura: estado, bandeja y responsable de cada trámite. No muestra anexos, justificaciones ni credenciales y no permite asignar ni decidir.">
      <div className="flex flex-wrap gap-3">
        <div className="w-56">
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger aria-label="Tipo de trámite" className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="TODOS">Todos los tipos</SelectItem>{tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Input aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por ID, institución o estado" className="text-xs w-72" />
        <Badge tone="neutral" appearance="outline" size="sm">{vis.length} trámites</Badge>
      </div>
      {vis.length === 0 ? <p className="text-xs text-muted-foreground">No hay trámites para estos filtros.</p> : <Tabla cols={["Tipo", "ID", "Institución", "Estado", "Bandeja", "Responsable", "Ingreso", "Último cambio"]} filas={vis.slice(0, 60).map((f) => [f.tipo, f.id, f.institucion, f.estado, f.area, f.responsable, formatoFecha(f.ingreso), formatoFecha(f.cambio)])} />}
    </Seccion>
  );
}

export function ReportesView() {
  const { rol } = useActor();
  const defecto = rol === "DIR_NORMATIVA" || rol === "EQ_NORMATIVA" ? "normatividad" : rol === "ADMIN" || rol === "DGR" || rol === "APROBADOR" ? "seguimiento" : "gestion";
  return (
    <ExcepcionalShell activeMenu="reportes" etiqueta="REP-01 a REP-05" titulo="Reportes" descripcion="Cada reporte se ve solo dentro del ámbito autorizado de tu rol: Gestión supervisa operación, Normatividad audita y exporta, y el seguimiento de trámites es de solo lectura." icono={<BarChart3 className="size-32 text-primary" />}>
      <Tabs key={defecto} defaultValue={defecto} className="gap-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="gestion">Gestión</TabsTrigger>
          <TabsTrigger value="normatividad">Normatividad</TabsTrigger>
          <TabsTrigger value="seguimiento">Seguimiento de trámites</TabsTrigger>
        </TabsList>
        <TabsContent value="gestion">{rol === "DIR_GESTION" || rol === "EQ_GESTION" || rol === "ADMIN" ? <Gestion /> : <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 border border-border p-3">Estos reportes los consulta el Equipo y el Director de Gestión.</p>}</TabsContent>
        <TabsContent value="normatividad"><Normatividad /></TabsContent>
        <TabsContent value="seguimiento"><Seguimiento /></TabsContent>
      </Tabs>
    </ExcepcionalShell>
  );
}
