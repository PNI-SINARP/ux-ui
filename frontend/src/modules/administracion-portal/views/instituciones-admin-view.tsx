"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cedulaValida, correoValido, rucValido } from "@/lib/tec00";
import { ExcepcionalShell, Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { formatoFecha, useAdminStore, type Institucion } from "../data/admin-store";

const TONO: Record<Institucion["estado"], "success" | "warning" | "neutral" | "danger"> = { Activa: "success", "Inactivación técnica pendiente": "warning", Inactiva: "neutral", Sin_registro_activo: "neutral" };

function Inactivar() {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const [sel, setSel] = useState("");
  const [motivo, setMotivo] = useState("");
  const admin = rol === "ADMIN";
  const lista = st.instituciones ?? [];
  const i = lista.find((x) => x.ruc === sel);
  const EFECTOS: [keyof NonNullable<Institucion["efectos"]>, string][] = [["bloqueo", "Bloqueo lógico del ingreso, proyectos, solicitudes y fuentes (incluye consumidoras de sus fuentes)"], ["revocaciones", "Revocación técnica en Apigee de accesos propios y dependientes (ACC-06)"], ["retiroFuentes", "Retiro de las fuentes afectadas"], ["cancelaciones", "Solicitudes y contratos Cancelados por inactivación de proveedora"], ["eco", "Casos ECO-01 abiertos para las relaciones económicas"]];
  return (
    <div className="space-y-5">
      <Seccion titulo="Inactivar una institución (INS-08)" descripcion="Solo el Administrador. Antes de confirmar se muestra el impacto; el bloqueo es inmediato y la institución pasa a Inactiva solo cuando todos los efectos están confirmados. Los anexos, resoluciones y eventos siguen consultables.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-80">
            <Select value={sel} onValueChange={setSel}>
              <SelectTrigger aria-label="Institución" className="h-10 text-xs"><SelectValue placeholder="Elige una institución" /></SelectTrigger>
              <SelectContent>{lista.map((x) => <SelectItem key={x.ruc} value={x.ruc}>{x.nombre} · {x.estado}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {i && (
          <div className="rounded-xl border border-border p-3.5 space-y-3 text-xs">
            <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-foreground">{i.nombre}</span><span className="font-mono text-muted-foreground">RUC {i.ruc}</span><Badge tone={TONO[i.estado]} appearance="soft" size="sm">{i.estado}</Badge></div>
            <p className="text-muted-foreground">Impacto: {i.proyectos} proyectos · {i.solicitudes} solicitudes · {i.fuentes.length} fuente(s) propia(s) · {i.consumidoras} solicitud(es) de otras instituciones que las consumen.</p>
            {i.estado === "Activa" && admin && (
              <div className="flex flex-wrap items-end gap-2">
                <Input aria-label="Motivo de la inactivación" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (obligatorio)" className="text-xs w-80" />
                <Button type="button" size="sm" variant="primary" disabled={!motivo.trim()} className="text-xs" onClick={() => { st.inactivarInstitucion(i.ruc, motivo.trim(), actor); setMotivo(""); toast.warning("Accesos bloqueados; cierre de inactivación pendiente"); }}>Inactivar</Button>
              </div>
            )}
            {i.efectos && (
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">Efectos de la inactivación · efecto {formatoFecha(i.fechaEfecto)} · «{i.motivo}»</p>
                <ul className="space-y-1">{EFECTOS.map(([k, t]) => <li key={k} className="flex items-center gap-2"><Badge tone={i.efectos![k] ? "success" : "warning"} appearance="soft" size="sm">{i.efectos![k] ? "Confirmado" : "Pendiente"}</Badge>{t}</li>)}</ul>
                {i.estado === "Inactivación técnica pendiente" && admin && (
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { st.avanzarInactivacion(i.ruc, false); st.sincronizarFusiones(); }}>Confirmar siguiente efecto</Button>
                    {!i.efectos.revocaciones && <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { st.avanzarInactivacion(i.ruc, true); toast.error("Apigee no confirmó la revocación; se reintenta sin repetir efectos ya confirmados"); }}>Simular fallo de Apigee</Button>}
                  </div>
                )}
                {i.estado === "Inactivación técnica pendiente" ? <p className="text-warning">Accesos bloqueados; cierre de inactivación pendiente.</p> : i.estado === "Inactiva" ? <Alert variant="success" title="Institución inactivada; accesos afectados revocados" className="p-3 text-xs">RUC {i.ruc} · efecto {formatoFecha(i.fechaEfecto)}.</Alert> : null}
              </div>
            )}
          </div>
        )}
        {!admin && <p className="text-[11px] text-muted-foreground">Solo el Administrador ejecuta el cambio.</p>}
      </Seccion>
    </div>
  );
}

function Fusion() {
  const st = useAdminStore();
  const { rol } = useActor();
  const [f, setF] = useState({ origen: "", acto: "", nuevo: "", doc: "" });
  useEffect(() => { st.sincronizarFusiones?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const rucs = f.origen.split(/[\s,]+/).filter(Boolean);
  const invalidos = rucs.filter((r) => !rucValido(r));
  return (
    <Seccion titulo="Registrar una institución nueva tras una fusión (INS-09)" descripcion="La entidad resultante recibe RUC y expediente propios y no hereda proyectos, cupos, contratos ni credenciales. El Administrador inactiva cada origen por INS-08; el estado de origen se consulta, no se supone.">
      {rol === "COORDINADOR_SINARP" || rol === "ADMIN" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="fu-org" className="text-xs text-muted-foreground">RUC de origen (separados por coma)</Label><Input id="fu-org" value={f.origen} onChange={(e) => setF({ ...f, origen: e.target.value })} placeholder="1760001550001, 1760001560001" className="text-xs font-mono" /></div>
          <div className="space-y-1"><Label htmlFor="fu-new" className="text-xs text-muted-foreground">RUC de la entidad resultante</Label><Input id="fu-new" value={f.nuevo} onChange={(e) => setF({ ...f, nuevo: e.target.value })} className="text-xs font-mono" /></div>
          <div className="space-y-1"><Label htmlFor="fu-acto" className="text-xs text-muted-foreground">Referencia del acto de fusión</Label><Input id="fu-acto" value={f.acto} onChange={(e) => setF({ ...f, acto: e.target.value })} className="text-xs" /></div>
          <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 h-10 text-xs cursor-pointer self-end"><span>Documento del acto (PDF)</span><span className="font-mono text-muted-foreground truncate max-w-[10rem]">{f.doc || "Adjuntar"}</span><input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setF({ ...f, doc: e.target.files?.[0]?.name ?? "" })} /></label>
          {invalidos.length > 0 && <p className="text-[11px] text-danger sm:col-span-2">RUC inválido(s): {invalidos.join(", ")} (13 dígitos).</p>}
          <div className="sm:col-span-2"><Button type="button" size="sm" variant="primary" disabled={rucs.length === 0 || invalidos.length > 0 || !rucValido(f.nuevo)} className="text-xs" onClick={() => { const r = st.registrarFusion({ rucsOrigen: rucs, acto: f.acto.trim(), documento: f.doc, rucNuevo: f.nuevo }); (r.ok ? toast.success : toast.error)(r.mensaje); if (r.ok) setF({ origen: "", acto: "", nuevo: "", doc: "" }); }}>Registrar fusión</Button></div>
        </div>
      ) : <p className="text-[11px] text-muted-foreground">La inicia el representante de la institución resultante; el cierre de los orígenes lo hace el Administrador.</p>}
      <div className="space-y-2">
        {[...(st.fusiones ?? [])].reverse().map((x) => (
          <div key={x.id} className="rounded-xl border border-border p-3 text-xs space-y-1">
            <div className="flex items-center gap-2"><span className="font-mono font-bold text-primary">{x.id}</span><Badge tone={x.estado === "Completada" ? "success" : "warning"} appearance="soft" size="sm">{x.estado}</Badge><span className="text-muted-foreground">nuevo RUC {x.rucNuevo} · {x.acto}</span></div>
            <ul className="text-muted-foreground">{Object.entries(x.estadoOrigen).map(([r, e]) => <li key={r}><span className="font-mono">{r}</span> → {e}</li>)}</ul>
            <p className="text-foreground">{x.estado === "Completada" ? "Fusión completada; instituciones anteriores inactivas." : "Fusión registrada; cierre de orígenes pendiente."}</p>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

function Precarga() {
  const st = useAdminStore();
  const { rol } = useActor();
  const [f, setF] = useState({ entorno: "Pruebas" as "Pruebas" | "Producción", servicio: "", operacion: "", campo: "ruc", origen: "razonSocial", destino: "nombre_institucion" });
  const puede = rol === "ADMIN";
  const ETAPAS: ("Conectividad" | "Respuesta" | "Mapeo" | "Satisfactoria")[] = ["Conectividad", "Respuesta", "Mapeo", "Satisfactoria"];
  return (
    <Seccion titulo="Precarga institucional por interoperabilidad con el SRI (INS-10)" descripcion="Se prueba conectividad, respuesta y mapeo antes de activar. Una configuración fallida deja INS-01 en captura manual con una alerta técnica; no inventa datos.">
      <ul className="space-y-1.5 text-xs">
        {[...(st.precarga ?? [])].reverse().map((c) => (
          <li key={c.version} className="rounded-lg border border-border px-3 py-2 flex flex-wrap items-center justify-between gap-2">
            <span>v{c.version} · {c.entorno} · {c.servicio}/{c.operacion} · entrada «{c.campoEntrada}» · {c.mapeo.map((m) => `${m.origen}→${m.destino}`).join(", ")}</span>
            <span className="flex items-center gap-1.5">
              <Badge tone={c.estado === "Activa" ? "success" : c.estado === "Retirada" ? "neutral" : "warning"} appearance="soft" size="sm">{c.estado}</Badge>
              {c.estado === "Borrador" && puede && (
                <>
                  {ETAPAS.slice(0, 3).map((e) => <Button key={e} type="button" size="sm" variant="outline" className="text-[11px] h-7 px-2" onClick={() => { st.probarPrecarga(c.version, e); toast.error(`Precarga no disponible; revisa la configuración del SRI (falla en ${e.toLowerCase()})`); }}>Falla: {e}</Button>)}
                  <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 px-2" onClick={() => { st.probarPrecarga(c.version, "Satisfactoria"); toast.success("Prueba satisfactoria"); }}>Probar</Button>
                  <Button type="button" size="sm" variant="primary" disabled={c.prueba !== "Satisfactoria"} className="text-[11px] h-7 px-2" onClick={() => { st.activarPrecarga(c.version); toast.success(`Precarga institucional activa (${c.servicio}, ${c.entorno}, mapeo v${c.version})`); }}>Activar</Button>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
      {puede ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 items-end">
          <Select value={f.entorno} onValueChange={(v) => setF({ ...f, entorno: v as typeof f.entorno })}><SelectTrigger aria-label="Entorno" className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pruebas">Pruebas</SelectItem><SelectItem value="Producción">Producción</SelectItem></SelectContent></Select>
          <Input aria-label="id_servicio" value={f.servicio} onChange={(e) => setF({ ...f, servicio: e.target.value })} placeholder="id_servicio" className="text-xs font-mono" />
          <Input aria-label="id_operacion_externa" value={f.operacion} onChange={(e) => setF({ ...f, operacion: e.target.value })} placeholder="operación" className="text-xs font-mono" />
          <Input aria-label="campo_entrada_ruc" value={f.campo} onChange={(e) => setF({ ...f, campo: e.target.value })} className="text-xs font-mono" />
          <Input aria-label="campo_origen" value={f.origen} onChange={(e) => setF({ ...f, origen: e.target.value })} className="text-xs font-mono" />
          <Button type="button" size="sm" variant="outline" disabled={!f.servicio.trim() || !f.operacion.trim()} className="text-xs" onClick={() => { st.guardarPrecarga({ entorno: f.entorno, servicio: f.servicio.trim(), operacion: f.operacion.trim(), campoEntrada: f.campo.trim(), mapeo: [{ origen: f.origen.trim(), destino: f.destino, tipo: "Texto" }] }); toast.info("Borrador guardado (aún no está activo)"); }}>Guardar borrador</Button>
        </div>
      ) : <p className="text-[11px] text-muted-foreground">Solo el Administrador técnico configura la precarga.</p>}
    </Seccion>
  );
}

function Bootstrap() {
  const st = useAdminStore();
  const [f, setF] = useState({ autor: "", verificador: "", cedula: "", correo: "", acta: "", clave: "", totp: "", resultado: "Aprobada" as "Aprobada" | "Rechazada", motivo: "", falla: false });
  const errores: string[] = [];
  if (f.cedula && !cedulaValida(f.cedula)) errores.push("La cédula no es válida (10 dígitos con dígito verificador).");
  if (f.correo && !correoValido(f.correo)) errores.push("El correo no tiene un formato válido.");
  if (f.autor && f.autor === f.verificador) errores.push("El verificador debe ser distinto del ejecutor técnico.");
  if (f.clave && f.clave.length < 12) errores.push("La contraseña debe tener al menos 12 caracteres.");
  const completo = f.acta && f.autor.trim() && f.verificador.trim() && cedulaValida(f.cedula) && correoValido(f.correo) && errores.length === 0 && (f.resultado === "Rechazada" ? f.motivo.trim() : f.clave.length >= 12 && /^\d{6}$/.test(f.totp));
  return (
    <Seccion titulo="Habilitar el primer Administrador (ID-00)" descripcion="Procedimiento restringido de bootstrap con acta formal, verificador distinto y segundo factor. Nadie puede crear un Administrador por registro público ni por Anexo B; la contraseña y el código TOTP se transmiten al proveedor sin guardarse.">
      {st.bootstrap?.habilitado ? <Alert variant="success" title="Administrador inicial habilitado" className="p-3 text-xs">Desde ahora ID-01 gestiona las cuentas internas con control de permisos.</Alert> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="b-autor" className="text-xs text-muted-foreground">autor_bootstrap (ejecutor técnico)</Label><Input id="b-autor" value={f.autor} onChange={(e) => setF({ ...f, autor: e.target.value })} className="text-xs" /></div>
          <div className="space-y-1"><Label htmlFor="b-ver" className="text-xs text-muted-foreground">id_verificador (funcionario distinto)</Label><Input id="b-ver" value={f.verificador} onChange={(e) => setF({ ...f, verificador: e.target.value })} className="text-xs" /></div>
          <div className="space-y-1"><Label htmlFor="b-ced" className="text-xs text-muted-foreground">Cédula del Administrador</Label><Input id="b-ced" value={f.cedula} maxLength={10} onChange={(e) => setF({ ...f, cedula: e.target.value.replace(/\D/g, "") })} className="text-xs font-mono" /></div>
          <div className="space-y-1"><Label htmlFor="b-mail" className="text-xs text-muted-foreground">Correo del Administrador</Label><Input id="b-mail" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} className="text-xs" /></div>
          <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 h-10 text-xs cursor-pointer sm:col-span-2"><span>Acta formal de designación (PDF protegido)</span><span className="font-mono text-muted-foreground truncate max-w-[14rem]">{f.acta || "Adjuntar"}</span><input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setF({ ...f, acta: e.target.files?.[0]?.name ?? "" })} /></label>
          <div className="space-y-1"><Label className="text-xs text-muted-foreground">Resultado de la verificación</Label>
            <Select value={f.resultado} onValueChange={(v) => setF({ ...f, resultado: v as typeof f.resultado })}><SelectTrigger aria-label="Resultado de la verificación" className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Aprobada">Aprobada</SelectItem><SelectItem value="Rechazada">Rechazada</SelectItem></SelectContent></Select>
          </div>
          {f.resultado === "Rechazada" ? (
            <div className="space-y-1"><Label htmlFor="b-mot" className="text-xs text-muted-foreground">Motivo (obligatorio, máx. 2.000 caracteres)</Label><Textarea id="b-mot" value={f.motivo} maxLength={2000} onChange={(e) => setF({ ...f, motivo: e.target.value })} rows={2} className="text-xs" /></div>
          ) : (
            <>
              <div className="space-y-1"><Label htmlFor="b-clave" className="text-xs text-muted-foreground">Contraseña inicial (transitoria)</Label><Input id="b-clave" type="password" autoComplete="new-password" value={f.clave} onChange={(e) => setF({ ...f, clave: e.target.value })} className="text-xs" /></div>
              <div className="space-y-1"><Label htmlFor="b-totp" className="text-xs text-muted-foreground">Código TOTP de confirmación (6 dígitos)</Label><Input id="b-totp" value={f.totp} maxLength={6} onChange={(e) => setF({ ...f, totp: e.target.value.replace(/\D/g, "") })} className="text-xs font-mono" /></div>
              <label className="flex items-center gap-2 text-xs sm:col-span-2"><input type="checkbox" checked={f.falla} onChange={(e) => setF({ ...f, falla: e.target.checked })} />Simular que Identity Platform no confirma el alta</label>
            </>
          )}
          {errores.length > 0 && <ul className="text-[11px] text-danger list-disc pl-4 sm:col-span-2">{errores.map((x) => <li key={x}>{x}</li>)}</ul>}
          <div className="sm:col-span-2">
            <Button type="button" size="sm" variant="primary" disabled={!completo} className="text-xs" onClick={() => { const r = st.habilitarAdministrador(f.resultado === "Rechazada" ? "denegado" : f.falla ? "falla" : "ok", f.resultado === "Rechazada" ? f.motivo : `Cuenta de ${f.correo}`); (r.ok ? toast.success : toast.error)(r.mensaje); setF({ ...f, clave: "", totp: "" }); }}>Ejecutar procedimiento</Button>
          </div>
        </div>
      )}
      {(st.bootstrap?.intentos ?? []).length > 0 && <ul className="text-[11px] text-muted-foreground space-y-0.5">{[...(st.bootstrap?.intentos ?? [])].reverse().map((i) => <li key={i.id}>{formatoFecha(i.instante)} · <span className="font-mono">{i.id}</span> · {i.resultado} · {i.detalle}</li>)}</ul>}
      <p className="text-[11px] text-muted-foreground">El reemplazo de un único Administrador se documenta operativamente, sin puerta trasera ni contraseña compartida. Los identificadores y validaciones siguen TEC-00 (cédula, correo, referencias de operación).</p>
    </Seccion>
  );
}

export function InstitucionesAdminView() {
  const st = useAdminStore();
  const { rol } = useActor();
  const esAdmin = rol === "ADMIN";
  const defaultTab = esAdmin ? "inactivar" : "fusion";

  return (
    <ExcepcionalShell activeMenu="instituciones-admin" etiqueta="INS-08 a INS-10 · ID-00" titulo="Instituciones y arranque del Portal" descripcion="Inactivación con análisis de impacto, registro tras una fusión, precarga del SRI y habilitación del primer Administrador." icono={<Building2 className="size-32 text-primary" />}>
      {!st.listo ? <p className="text-xs text-muted-foreground">Cargando…</p> : (
        <Tabs key={rol} defaultValue={defaultTab} className="gap-4">
          <TabsList className="h-auto flex-wrap justify-start">
            {esAdmin && <TabsTrigger value="inactivar">Inactivar</TabsTrigger>}
            <TabsTrigger value="fusion">Fusión</TabsTrigger>
            {esAdmin && <TabsTrigger value="precarga">Precarga SRI</TabsTrigger>}
            {esAdmin && <TabsTrigger value="bootstrap">Primer Administrador</TabsTrigger>}
          </TabsList>
          {esAdmin && <TabsContent value="inactivar"><Inactivar /></TabsContent>}
          <TabsContent value="fusion"><Fusion /></TabsContent>
          {esAdmin && <TabsContent value="precarga"><Precarga /></TabsContent>}
          {esAdmin && <TabsContent value="bootstrap"><Bootstrap /></TabsContent>}
        </Tabs>
      )}
    </ExcepcionalShell>
  );
}
