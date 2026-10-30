"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ExcepcionalShell, Seccion, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { EVIDENCIAS, PLANTILLAS_TIPOS, ROLES_CATALOGO, formatoFecha, useAdminStore, type SeccionPlantilla, type TipoPlantilla } from "../data/admin-store";

function SoloLectura({ quien }: { quien: string }) {
  return <p className="text-[11px] text-muted-foreground">Solo {quien} publica versiones.</p>;
}

function Par08() {
  const st = useAdminStore();
  const { rol } = useActor();
  const puede = rol === "ADMIN";
  const [f, setF] = useState({ codigo: "", descripcion: "", rol: ROLES_CATALOGO[1], dias: "365", evidencias: [] as string[] });
  return (
    <Seccion titulo="Métodos de recuperación asistida (PAR-08)" descripcion="ID-08 solo ofrece los métodos publicados. Un método retirado no se ofrece en casos nuevos y no altera los históricos; sin método aplicable no se autoriza ninguna recuperación.">
      {(st.metodos ?? []).length === 0 && <p className="text-xs text-danger">Sin método aplicable: ID-08 no autoriza recuperación.</p>}
      <ul className="space-y-1.5 text-xs">
        {(st.metodos ?? []).map((m) => (
          <li key={m.codigo} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <span><span className="font-mono font-semibold">{m.codigo}</span> · {m.descripcion} · rol {m.rol} · evidencias: {m.evidencias.join(", ")} · retención {m.diasRetencion} d</span>
            <span className="flex items-center gap-2">
              <Badge tone={m.estado === "Publicado" ? "success" : "neutral"} appearance="soft" size="sm">{m.estado}</Badge>
              {puede && m.estado === "Publicado" && <Button type="button" size="sm" variant="outline" className="text-[11px] h-7" onClick={() => st.retirarMetodo(m.codigo)}>Retirar</Button>}
            </span>
          </li>
        ))}
      </ul>
      {puede ? (
        <div className="space-y-3 rounded-xl border border-border p-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1"><Label htmlFor="m-cod" className="text-xs text-muted-foreground">Código</Label><Input id="m-cod" value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value.toUpperCase() })} className="text-xs font-mono" /></div>
            <div className="space-y-1 sm:col-span-2"><Label htmlFor="m-desc" className="text-xs text-muted-foreground">Descripción</Label><Input id="m-desc" value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} className="text-xs" /></div>
            <div className="space-y-1"><Label htmlFor="m-dias" className="text-xs text-muted-foreground">Retención (días)</Label><Input id="m-dias" type="number" min={1} value={f.dias} onChange={(e) => setF({ ...f, dias: e.target.value })} className="text-xs font-mono" /></div>
          </div>
          <div className="w-64">
            <Select value={f.rol} onValueChange={(v) => setF({ ...f, rol: v })}>
              <SelectTrigger aria-label="Rol habilitado" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES_CATALOGO.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            {EVIDENCIAS.map((ev) => (
              <label key={ev} className="flex items-center gap-1.5 text-xs"><Checkbox checked={f.evidencias.includes(ev)} onCheckedChange={(v) => setF({ ...f, evidencias: v === true ? [...f.evidencias, ev] : f.evidencias.filter((x) => x !== ev) })} />{ev}</label>
            ))}
          </div>
          <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { const r = st.publicarMetodo({ codigo: f.codigo.trim(), descripcion: f.descripcion.trim(), evidencias: f.evidencias, rol: f.rol, diasRetencion: parseInt(f.dias) || 0 }); (r.ok ? toast.success : toast.error)(r.mensaje); if (r.ok) setF({ ...f, codigo: "", descripcion: "", evidencias: [] }); }}>Publicar método</Button>
        </div>
      ) : <SoloLectura quien="el Administrador" />}
    </Seccion>
  );
}

function Par09() {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const v = [...(st.vigencias ?? [])].reverse().find((x) => x.estado === "Publicada");
  const [h, setH] = useState("");
  const [i, setI] = useState("");
  if (!v) return <p className="text-xs text-danger">Sin versión activa: no se inicia ningún trámite sin cuenta y se muestra indisponibilidad operativa.</p>;
  const horas = parseInt(h || String(v.horas));
  const intentos = parseInt(i || String(v.intentos));
  const puede = rol === "ADMIN";
  return (
    <Seccion titulo={`Vigencia e intentos de los trámites sin cuenta (PAR-09) · v${v.version}`} descripcion="Rige la sesión de los Anexos A, B y C desde la pantalla de ingreso. El Anexo C ya usa estos valores: un cambio no alarga ni acorta sesiones ya iniciadas.">
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="space-y-1"><Label htmlFor="p9-h" className="text-xs text-muted-foreground">Horas de vigencia</Label><Input id="p9-h" type="number" min={1} disabled={!puede} value={h || v.horas} onChange={(e) => setH(e.target.value)} className="text-xs font-mono" /></div>
        <div className="space-y-1"><Label htmlFor="p9-i" className="text-xs text-muted-foreground">Intentos máximos</Label><Input id="p9-i" type="number" min={1} disabled={!puede} value={i || v.intentos} onChange={(e) => setI(e.target.value)} className="text-xs font-mono" /></div>
      </div>
      {puede ? <Button type="button" size="sm" variant="primary" className="text-xs" disabled={!(horas > 0 && intentos > 0)} onClick={() => { st.publicarVigencia(horas, intentos, actor); setH(""); setI(""); toast.success("PAR-09: nueva versión publicada"); }}>Publicar versión</Button> : <SoloLectura quien="el Administrador" />}
    </Seccion>
  );
}

function Par14() {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const [tipo, setTipo] = useState<TipoPlantilla>("Resolución de incorporación");
  const resp = PLANTILLAS_TIPOS.find((p) => p.tipo === tipo)!;
  const vigente = (st.plantillas ?? []).find((p) => p.tipo === tipo && p.estado === "Publicada");
  const [texto, setTexto] = useState<Record<number, string>>({});
  const puede = (tipo === "Resolución de incorporación" && rol === "DIR_NORMATIVA") || (tipo === "Informe de recomendación de acceso" && rol === "DIR_DPI") || (tipo === "Informe final de entrega excepcional" && rol === "DIR_GESTION");
  const secciones: SeccionPlantilla[] = (vigente?.secciones ?? []).map((s) => ({ ...s, texto: texto[s.orden] ?? s.texto }));
  const variablesDesconocidas = secciones.flatMap((s) => [...s.texto.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])).filter((x) => !["institucion", "ruc", "numero_resolucion", "fecha"].includes(x));
  return (
    <Seccion titulo="Plantillas de documentos generados (PAR-14)" descripcion="Las secciones Fijas no cambian al generar; las Variables se resuelven con datos; las Editables las completa quien elabora. Un documento ya generado conserva la versión con la que nació.">
      <div className="w-80">
        <Select value={tipo} onValueChange={(v) => { setTipo(v as TipoPlantilla); setTexto({}); }}>
          <SelectTrigger aria-label="Tipo de documento" className="h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{PLANTILLAS_TIPOS.map((p) => <SelectItem key={p.tipo} value={p.tipo}>{p.tipo}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <p className="text-[11px] text-muted-foreground">Responsable: {resp.responsable} · versión vigente {vigente ? `v${vigente.version}` : "—"} · {tipo === "Resolución de incorporación" ? "incluye el bloque «Elaborado, revisado y aprobado por» (INS-06 CA10)" : "firman el Revisor y el Director de DPI o la Máxima Autoridad según el documento"}.</p>
      <div className="space-y-2">
        {secciones.map((s) => (
          <div key={s.orden} className="rounded-lg border border-border p-2.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs"><span className="font-semibold">{s.orden}. {s.titulo}</span><Badge tone={s.tipo === "Fija" ? "neutral" : s.tipo === "Variable" ? "info" : "warning"} appearance="soft" size="sm">{s.tipo}</Badge></div>
            <Textarea aria-label={`Texto de ${s.titulo}`} rows={2} disabled={!puede || s.tipo === "Fija"} value={s.texto} onChange={(e) => setTexto({ ...texto, [s.orden]: e.target.value })} className="text-xs font-mono" />
          </div>
        ))}
      </div>
      {variablesDesconocidas.length > 0 && <p className="text-[11px] text-danger">La vista previa no resuelve las variables: {variablesDesconocidas.join(", ")}.</p>}
      {puede ? <Button type="button" size="sm" variant="primary" disabled={variablesDesconocidas.length > 0} className="text-xs" onClick={() => { const r = st.publicarPlantilla(tipo, secciones, actor); (r.ok ? toast.success : toast.error)(r.mensaje); setTexto({}); }}>Aprobar y publicar</Button> : <SoloLectura quien={`el ${resp.responsable}`} />}
    </Seccion>
  );
}

function Par15() {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const v = [...(st.textos ?? [])].reverse().find((x) => x.estado === "Publicada");
  const [titulo, setTitulo] = useState("");
  const [ayuda, setAyuda] = useState<Record<number, string>>({});
  if (!v) return null;
  const puedeInterfaz = rol === "ADMIN";
  const puedeAyuda = rol === "DIR_GESTION";
  return (
    <Seccion titulo={`Textos de la interfaz y de ayuda (PAR-15) · v${v.version}`} descripcion="Solo cambia texto visible: no crea pantallas, campos, funciones ni pasos, y no altera los mensajes de error y de estado que fijan las HU. Una clave sin texto publicado usa el texto por defecto del Portal.">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">Textos de interfaz</p>
        {v.interfaz.map((t, k) => (<p key={k} className="text-xs text-muted-foreground"><span className="font-mono">{t.clave}</span> ({t.pantalla}) → «{t.texto}»</p>))}
        {puedeInterfaz && <div className="flex gap-2"><Input aria-label="Nuevo título del paso 1" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nuevo texto para sol.paso1.titulo" className="text-xs w-72" /></div>}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">Textos de ayuda (SOL-02, ADD-01, ADD-05)</p>
        {v.ayuda.map((a, k) => (
          <div key={k} className="rounded-lg border border-border p-2.5 space-y-1.5">
            <p className="text-xs"><span className="font-semibold">{a.campo}</span> · aplica a {a.aplica}</p>
            <Textarea aria-label={`Ayuda de ${a.campo}`} rows={2} disabled={!puedeAyuda} value={ayuda[k] ?? a.texto} onChange={(e) => setAyuda({ ...ayuda, [k]: e.target.value })} className="text-xs" />
            <p className="text-[11px] text-muted-foreground">Ejemplo: {a.ejemplo}</p>
          </div>
        ))}
      </div>
      {puedeInterfaz || puedeAyuda ? (
        <Button type="button" size="sm" variant="primary" className="text-xs" onClick={() => { st.publicarTextos(titulo.trim() ? v.interfaz.map((t) => (t.clave === "sol.paso1.titulo" ? { ...t, texto: titulo.trim() } : t)) : v.interfaz, v.ayuda.map((a, k) => ({ ...a, texto: ayuda[k] ?? a.texto })), actor); setTitulo(""); setAyuda({}); toast.success("PAR-15: versión publicada"); }}>Previsualizar y publicar</Button>
      ) : <SoloLectura quien="el Administrador (interfaz) o el Director de Gestión (ayuda)" />}
    </Seccion>
  );
}

function Par16() {
  const st = useAdminStore();
  const { rol, actor } = useActor();
  const v = [...(st.vistos ?? [])].reverse().find((x) => x.estado === "Publicada");
  const [a, setA] = useState<boolean | null>(null);
  const [d, setD] = useState<boolean | null>(null);
  const [motivo, setMotivo] = useState("");
  if (!v) return null;
  const analista = a ?? v.analista;
  const director = d ?? v.director;
  const puede = rol === "ADMIN";
  return (
    <Seccion titulo={`Vistos buenos de la resolución (PAR-16) · v${v.version}`} descripcion="El orden es fijo: primero el Analista y luego el Director de Normatividad. La firma de la Máxima Autoridad nunca se desactiva. Una versión nueva rige solo las cadenas nuevas; ya está conectada con INS-06.">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs"><Checkbox disabled={!puede} checked={analista} onCheckedChange={(x) => setA(x === true)} />1. Visto bueno del Analista de Normatividad</label>
        <label className="flex items-center gap-2 text-xs"><Checkbox disabled={!puede} checked={director} onCheckedChange={(x) => setD(x === true)} />2. Visto bueno del Director de Normatividad</label>
        <label className="flex items-center gap-2 text-xs opacity-60"><Checkbox checked disabled />3. Firma de la Máxima Autoridad (no desactivable)</label>
      </div>
      <p className="text-[11px] text-muted-foreground">Un paso desactivado se omite y queda registrado como «No aplica» con la versión usada.</p>
      {puede ? (
        <div className="flex flex-wrap items-end gap-2">
          <Input aria-label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo del cambio" className="text-xs w-72" />
          <Button type="button" size="sm" variant="primary" disabled={!motivo.trim()} className="text-xs" onClick={() => { st.publicarVistos(analista, director, motivo.trim(), actor); setA(null); setD(null); setMotivo(""); toast.success("PAR-16: versión publicada"); }}>Publicar versión</Button>
        </div>
      ) : <SoloLectura quien="el Administrador" />}
      <p className="text-[11px] text-muted-foreground">Vigente desde {formatoFecha(v.fecha)} · {v.autor} · «{v.motivo}».</p>
    </Seccion>
  );
}

export function ParametrosPortalView() {
  const st = useAdminStore();
  return (
    <ExcepcionalShell activeMenu="parametros-portal" etiqueta="PAR-08 · 09 · 14 · 15 · 16" titulo="Parámetros del Portal" descripcion="Métodos de recuperación asistida, vigencia de los trámites sin cuenta, plantillas de documentos, textos de interfaz y ayuda, y vistos buenos de la resolución." icono={<Settings2 className="size-32 text-primary" />}>
      {!st.listo ? <p className="text-xs text-muted-foreground">Cargando…</p> : (
        <Tabs defaultValue="par16" className="gap-4">
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="par16">Vistos buenos</TabsTrigger>
            <TabsTrigger value="par09">Sin cuenta</TabsTrigger>
            <TabsTrigger value="par08">Recuperación</TabsTrigger>
            <TabsTrigger value="par14">Plantillas</TabsTrigger>
            <TabsTrigger value="par15">Textos</TabsTrigger>
          </TabsList>
          <TabsContent value="par16"><Par16 /></TabsContent>
          <TabsContent value="par09"><Par09 /></TabsContent>
          <TabsContent value="par08"><Par08 /></TabsContent>
          <TabsContent value="par14"><Par14 /></TabsContent>
          <TabsContent value="par15"><Par15 /></TabsContent>
        </Tabs>
      )}
    </ExcepcionalShell>
  );
}
