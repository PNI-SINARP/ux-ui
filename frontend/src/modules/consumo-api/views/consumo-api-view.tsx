"use client";

import React, { useState, useMemo } from "react";
import {
  KeyRound,
  Layers,
  Activity,
  Wallet,
  Building2,
  Database,
  FolderKanban,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { numero, saldoAcceso, useConsumoStore } from "../data/consumo-store";
import { ConsultaPanel, PruebasPanel, SaldoPanel } from "../components/consumo-uso";
import { ProgramacionPanel } from "../components/consumo-programacion";
import { AmpliacionesPanel } from "../components/consumo-ampliaciones";
import { cn } from "@/lib/utils";

const TIPO_OPCIONES = [
  { value: "TODOS", label: "Todos los tipos" },
  { value: "Privada", label: "Entidad Privada" },
  { value: "Pública", label: "Entidad Pública" },
];

export function ConsumoApiView() {
  const { accesos, eventos, listo } = useConsumoStore();
  const { institucion, rol } = useActor();
  const [sel, setSel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("TODOS");
  const [tipoSearch, setTipoSearch] = useState<string>("");
  const [filterFuente, setFilterFuente] = useState<string>("TODOS");
  const [fuenteSearch, setFuenteSearch] = useState<string>("");
  const [accesoSearch, setAccesoSearch] = useState<string>("");

  const propios = useMemo(() => {
    if (rol === "JURIDICA" || rol === "FACTURACION") {
      return accesos.filter((x) => x.tipo === "Privada");
    }
    if (rol === "COORDINADOR_SINARP" && institucion) {
      const exactos = accesos.filter(
        (x) =>
          x.institucion.toLowerCase() === institucion.toLowerCase() ||
          institucion.toLowerCase().includes(x.institucion.toLowerCase()) ||
          x.institucion.toLowerCase().includes(institucion.toLowerCase())
      );
      if (exactos.length > 0) return exactos;
    }
    return accesos;
  }, [accesos, rol, institucion]);

  const fuentesDisponibles = useMemo(() => {
    const set = new Set<string>();
    propios.forEach((x) => set.add(x.fuente));
    return Array.from(set);
  }, [propios]);

  const accesosFiltrados = useMemo(() => {
    return propios.filter((x) => {
      if (filterTipo !== "TODOS" && x.tipo !== filterTipo) return false;
      if (filterFuente !== "TODOS" && x.fuente !== filterFuente) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          x.id.toLowerCase().includes(q) ||
          x.fuente.toLowerCase().includes(q) ||
          x.proyecto.toLowerCase().includes(q) ||
          x.institucion.toLowerCase().includes(q) ||
          x.credencial.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [propios, filterTipo, filterFuente, searchTerm]);

  const a =
    accesosFiltrados.find((x) => x.id === sel) ??
    accesosFiltrados[0] ??
    propios.find((x) => x.id === sel) ??
    propios[0];

  const currentLabel = a ? `${a.id} · ${a.fuente}` : "";

  const filteredTiposForCombo = useMemo(() => {
    if (!tipoSearch.trim()) return TIPO_OPCIONES;
    const currentTipoLabel =
      TIPO_OPCIONES.find((o) => o.value === filterTipo)?.label ?? "";
    if (currentTipoLabel.toLowerCase() === tipoSearch.trim().toLowerCase()) {
      return TIPO_OPCIONES;
    }
    const q = tipoSearch.toLowerCase();
    return TIPO_OPCIONES.filter((o) => o.label.toLowerCase().includes(q));
  }, [tipoSearch, filterTipo]);

  const filteredFuentesForCombo = useMemo(() => {
    const options = [
      { value: "TODOS", label: "Todas las fuentes" },
      ...fuentesDisponibles.map((f) => ({ value: f, label: f })),
    ];
    if (!fuenteSearch.trim()) return options;
    if (filterFuente.toLowerCase() === fuenteSearch.trim().toLowerCase()) {
      return options;
    }
    const q = fuenteSearch.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [fuenteSearch, filterFuente, fuentesDisponibles]);

  const filteredAccesosForCombo = useMemo(() => {
    const base = accesosFiltrados.length > 0 ? accesosFiltrados : propios;
    if (!accesoSearch.trim()) return base;
    if (currentLabel.toLowerCase() === accesoSearch.trim().toLowerCase()) {
      return base;
    }
    const q = accesoSearch.toLowerCase();
    return base.filter(
      (x) =>
        x.id.toLowerCase().includes(q) ||
        x.fuente.toLowerCase().includes(q) ||
        x.institucion.toLowerCase().includes(q)
    );
  }, [accesoSearch, currentLabel, accesosFiltrados, propios]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    filterTipo !== "TODOS" ||
    filterFuente !== "TODOS";

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterTipo("TODOS");
    setTipoSearch("");
    setFilterFuente("TODOS");
    setFuenteSearch("");
    setAccesoSearch("");
  };

  const { consumido, reservado, saldo } = a
    ? saldoAcceso(a, eventos)
    : { consumido: 0, reservado: 0, saldo: 0 };

  const esCoord = rol === "COORDINADOR_SINARP";
  const verMasivo = esCoord || rol === "DGR" || rol === "DTD" || rol === "TI";
  const verAmpliaciones =
    esCoord ||
    rol === "DIR_GESTION" ||
    rol === "EQ_GESTION" ||
    rol === "DIR_DPI" ||
    rol === "EQ_DPI" ||
    rol === "JURIDICA" ||
    rol === "FACTURACION";
  const defaultTab = esCoord ? "uso" : verMasivo ? "masivo" : "ampliaciones";

  const headerTitle =
    rol === "JURIDICA"
      ? "Adendas de Ampliación Contractual"
      : rol === "FACTURACION"
        ? "Facturación y Cobro de Adendas"
        : rol === "DGR" || rol === "DTD" || rol === "TI"
          ? "Programación de Consumo Masivo"
          : rol === "DIR_GESTION" || rol === "EQ_GESTION" || rol === "DIR_DPI" || rol === "EQ_DPI"
            ? "Evaluación de Ampliaciones de Acceso"
            : "Consumo por API";

  const headerSubtitle =
    rol === "JURIDICA"
      ? "Genera y gestiona las adendas contractuales para solicitudes de ampliación de alcance o cupo de entidades privadas."
      : rol === "FACTURACION"
        ? "Valida la facturación y conciliación de pagos de adendas de ampliación de entidades privadas."
        : rol === "DGR" || rol === "DTD" || rol === "TI"
          ? "Coordina y aprueba las ventanas técnicas de programación de consumo masivo."
          : rol === "DIR_GESTION" || rol === "EQ_GESTION" || rol === "DIR_DPI" || rol === "EQ_DPI"
            ? "Revisa, evalúa y aprueba solicitudes de ampliación de alcance o cupo sobre accesos habilitados."
            : "Prueba tu credencial, consulta uno o varios registros, sigue el saldo y los eventos, programa un consumo masivo y amplía el alcance de una solicitud habilitada.";

  return (
    <WireframeDashboardLayout activeMenu="consumo-api">
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-5 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Encabezado Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                {headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                {headerSubtitle}
              </p>
            </div>
          </div>

          {!listo || !a ? (
            <div className="p-8 rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
              {listo
                ? "No hay accesos habilitados disponibles."
                : "Cargando accesos habilitados…"}
            </div>
          ) : (
            <>
              {/* Tarjetas KPI Horizontales del Acceso Seleccionado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 w-full">
                {/* 1. Credencial y Tipo */}
                <Card
                  variant="featured"
                  disableHover
                  className="border border-primary/25 bg-primary/5 rounded-xl p-4 shadow-2xs my-0 w-full"
                  innerClassName="p-0 h-full"
                >
                  <div className="flex flex-col justify-between h-full gap-3 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/15 text-primary">
                        <KeyRound className="size-5" />
                      </div>
                      <Badge
                        tone={a.tipo === "Privada" ? "primary" : "info"}
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        Entidad {a.tipo}
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Credencial activa
                      </p>
                      <p className="text-lg sm:text-xl font-extrabold font-mono text-foreground leading-none tracking-tight truncate">
                        {a.credencial}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 2. Alcance Autorizado */}
                <Card
                  variant="featured"
                  disableHover
                  className="border border-info/25 bg-info/5 rounded-xl p-4 shadow-2xs my-0 w-full"
                  innerClassName="p-0 h-full"
                >
                  <div className="flex flex-col justify-between h-full gap-3 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-info/15 text-info">
                        <Layers className="size-5" />
                      </div>
                      <Badge
                        tone="info"
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        Alcance v{a.versionAlcance}
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Campos autorizados
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {a.camposAutorizados.length}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          de {a.catalogoCampos.length} campos
                        </span>
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 3. Cupo / Referencia y Entregado */}
                <Card
                  variant="featured"
                  disableHover
                  className="border border-success/25 bg-success/5 rounded-xl p-4 shadow-2xs my-0 w-full"
                  innerClassName="p-0 h-full"
                >
                  <div className="flex flex-col justify-between h-full gap-3 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-success/15 text-success">
                        <Activity className="size-5" />
                      </div>
                      <Badge
                        tone="success"
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        Entregado: {numero(consumido)}
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {a.tipo === "Privada"
                          ? "Cupo autorizado"
                          : "Cupo de referencia"}
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {numero(a.cupoAutorizado)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 4. Saldo Disponible */}
                <Card
                  variant="featured"
                  disableHover
                  className={cn(
                    "border rounded-xl p-4 shadow-2xs my-0 w-full",
                    saldo <= 0 && a.tipo === "Privada"
                      ? "border-danger/30 bg-danger/5"
                      : "border-warning/25 bg-warning/5"
                  )}
                  innerClassName="p-0 h-full"
                >
                  <div className="flex flex-col justify-between h-full gap-3 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0",
                          saldo <= 0 && a.tipo === "Privada"
                            ? "bg-danger/15 text-danger"
                            : "bg-warning/15 text-warning"
                        )}
                      >
                        <Wallet className="size-5" />
                      </div>
                      <Badge
                        tone={
                          saldo <= 0 && a.tipo === "Privada"
                            ? "danger"
                            : "warning"
                        }
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        Reservado: {numero(reservado)}
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {a.tipo === "Privada"
                          ? "Saldo disponible"
                          : "Diferencia sobre referencia"}
                      </p>
                      <p
                        className={cn(
                          "text-2xl sm:text-3xl font-extrabold font-heading leading-none tracking-tight",
                          saldo < 0 ? "text-danger" : "text-foreground"
                        )}
                      >
                        {numero(saldo)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Barra de Filtros y Contexto del Acceso Habilitado */}
              <div className="space-y-3 w-full">
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
                  {/* Buscador UI Kit */}
                  <div className="flex-1 min-w-0">
                    <Search
                      size="sm"
                      placeholder="Buscar solicitud habilitada por código, fuente, proyecto o institución..."
                      value={searchTerm}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchTerm(val);
                        if (val.trim()) {
                          const q = val.toLowerCase();
                          const match = propios.find(
                            (x) =>
                              x.id.toLowerCase().includes(q) ||
                              x.fuente.toLowerCase().includes(q) ||
                              x.proyecto.toLowerCase().includes(q) ||
                              x.institucion.toLowerCase().includes(q)
                          );
                          if (match) setSel(match.id);
                        }
                      }}
                      onClear={() => setSearchTerm("")}
                      className="w-full"
                    />
                  </div>

                  {/* Controles Combobox UI Kit */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full xl:w-auto shrink-0">
                    {/* 1. Filtro por Tipo de Entidad */}
                    <div className="w-full xl:w-[190px] min-w-0">
                      <Combobox
                        value={filterTipo === "TODOS" ? null : filterTipo}
                        onValueChange={(val) => {
                          const next = val || "TODOS";
                          setFilterTipo(next);
                          const opt = TIPO_OPCIONES.find((o) => o.value === next);
                          setTipoSearch(
                            next === "TODOS" ? "" : opt?.label ?? ""
                          );
                          const firstMatch = propios.find(
                            (x) =>
                              (next === "TODOS" || x.tipo === next) &&
                              (filterFuente === "TODOS" ||
                                x.fuente === filterFuente)
                          );
                          if (firstMatch) setSel(firstMatch.id);
                        }}
                        inputValue={tipoSearch}
                        onInputValueChange={(newSearch) => {
                          if (newSearch === "TODOS") setTipoSearch("");
                          else setTipoSearch(newSearch);
                        }}
                      >
                        <ComboboxInput
                          size="sm"
                          placeholder="Todos los tipos"
                          showClear={filterTipo !== "TODOS"}
                          showTrigger={true}
                          className="w-full"
                        />
                        <ComboboxContent className="min-w-[210px] z-[80]">
                          <ComboboxList>
                            <ComboboxGroup>
                              <ComboboxLabel>Tipo de entidad</ComboboxLabel>
                              {filteredTiposForCombo.map((opt) => (
                                <ComboboxItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-xs py-1.5 cursor-pointer"
                                >
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                            {filteredTiposForCombo.length === 0 && (
                              <ComboboxEmpty>
                                No se encontraron tipos.
                              </ComboboxEmpty>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    {/* 2. Filtro por Fuente de Datos */}
                    <div className="w-full xl:w-[230px] min-w-0">
                      <Combobox
                        value={filterFuente === "TODOS" ? null : filterFuente}
                        onValueChange={(val) => {
                          const next = val || "TODOS";
                          setFilterFuente(next);
                          setFuenteSearch(next === "TODOS" ? "" : next);
                          const firstMatch = propios.find(
                            (x) =>
                              (filterTipo === "TODOS" ||
                                x.tipo === filterTipo) &&
                              (next === "TODOS" || x.fuente === next)
                          );
                          if (firstMatch) setSel(firstMatch.id);
                        }}
                        inputValue={fuenteSearch}
                        onInputValueChange={(newSearch) => {
                          if (newSearch === "TODOS") setFuenteSearch("");
                          else setFuenteSearch(newSearch);
                        }}
                      >
                        <ComboboxInput
                          size="sm"
                          placeholder="Todas las fuentes"
                          showClear={filterFuente !== "TODOS"}
                          showTrigger={true}
                          className="w-full"
                        />
                        <ComboboxContent className="min-w-[260px] z-[80]">
                          <ComboboxList>
                            <ComboboxGroup>
                              <ComboboxLabel>Fuente de datos</ComboboxLabel>
                              {filteredFuentesForCombo.map((opt) => (
                                <ComboboxItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-xs py-1.5 cursor-pointer"
                                >
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                            {filteredFuentesForCombo.length === 0 && (
                              <ComboboxEmpty>
                                No se encontraron fuentes.
                              </ComboboxEmpty>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    {/* 3. Selector de Solicitud Habilitada Activa */}
                    <div className="w-full xl:w-[290px] min-w-0">
                      <Combobox
                        value={a.id}
                        onValueChange={(val) => {
                          if (val) {
                            setSel(val);
                            const found = propios.find((x) => x.id === val);
                            if (found)
                              setAccesoSearch(`${found.id} · ${found.fuente}`);
                          }
                        }}
                        inputValue={accesoSearch || currentLabel}
                        onInputValueChange={(newSearch) => {
                          setAccesoSearch(newSearch);
                        }}
                      >
                        <ComboboxInput
                          size="sm"
                          placeholder="Seleccionar solicitud habilitada..."
                          showTrigger={true}
                          showClear={false}
                          className="w-full"
                        />
                        <ComboboxContent className="min-w-[320px] z-[80]">
                          <ComboboxList>
                            <ComboboxGroup>
                              <ComboboxLabel>
                                Solicitudes habilitadas ({accesosFiltrados.length})
                              </ComboboxLabel>
                              {filteredAccesosForCombo.map((x) => (
                                <ComboboxItem
                                  key={x.id}
                                  value={x.id}
                                  className="text-xs py-2 cursor-pointer"
                                >
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="font-semibold text-foreground truncate">
                                      {x.id} · {x.fuente}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground truncate">
                                      {x.institucion} ({x.tipo})
                                    </span>
                                  </div>
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                            {filteredAccesosForCombo.length === 0 && (
                              <ComboboxEmpty>
                                No se encontraron solicitudes habilitadas.
                              </ComboboxEmpty>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>
                  </div>
                </div>

                {/* Ficha de Información Organizada de la Solicitud Seleccionada */}
                <div className="rounded-xl border border-border bg-surface-subtle/50 p-3.5 sm:p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-muted-foreground block">
                          Institución consumidora
                        </span>
                        <p className="font-semibold text-foreground truncate">
                          {a.institucion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0 mt-0.5">
                        <Database className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-muted-foreground block">
                          Fuente de información
                        </span>
                        <p className="font-semibold text-foreground truncate">
                          {a.fuente}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0 mt-0.5">
                        <FolderKanban className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-muted-foreground block">
                          Proyecto vinculado
                        </span>
                        <p className="font-semibold text-foreground truncate">
                          {a.proyecto}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-muted-foreground block">
                          Estado y datos de prueba
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <Badge tone="success" appearance="soft" size="sm">
                            {a.estado}
                          </Badge>
                          <Badge
                            tone={
                              a.tipoDatoPruebas === "Sintético" ||
                              a.tipoDatoPruebas === "Anonimizado"
                                ? "info"
                                : "warning"
                            }
                            appearance="soft"
                            size="sm"
                          >
                            Pruebas: {a.tipoDatoPruebas}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campos autorizados e indicadores de filtro */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border/60 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                        Solicitud <span className="font-mono text-primary">{a.id}</span> · Campos habilitados:
                      </span>
                      {a.camposAutorizados.map((campo) => (
                        <Badge
                          key={campo}
                          tone="neutral"
                          appearance="outline"
                          size="sm"
                          className="font-mono text-[11px]"
                        >
                          {campo}
                        </Badge>
                      ))}
                    </div>

                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                      >
                        <RotateCcw className="size-3.5" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Pestañas UI Kit */}
              <Tabs
                key={rol}
                defaultValue={defaultTab}
                className="w-full gap-6"
              >
                <div className="overflow-x-auto pb-1">
                  <TabsList>
                    {esCoord && (
                      <TabsTrigger value="uso">Pruebas y consulta</TabsTrigger>
                    )}
                    {esCoord && (
                      <TabsTrigger value="saldo">Saldo y eventos</TabsTrigger>
                    )}
                    {verMasivo && (
                      <TabsTrigger value="masivo">
                        Programación masiva
                      </TabsTrigger>
                    )}
                    {verAmpliaciones && (
                      <TabsTrigger value="ampliaciones">Ampliaciones</TabsTrigger>
                    )}
                  </TabsList>
                </div>

                {esCoord && (
                  <TabsContent value="uso" className="space-y-6">
                    <PruebasPanel key={`p-${a.id}`} a={a} />
                    <ConsultaPanel key={`c-${a.id}`} a={a} />
                  </TabsContent>
                )}

                {esCoord && (
                  <TabsContent value="saldo" className="space-y-6">
                    <SaldoPanel a={a} />
                  </TabsContent>
                )}

                {verMasivo && (
                  <TabsContent value="masivo" className="space-y-6">
                    <ProgramacionPanel a={a} />
                  </TabsContent>
                )}

                {verAmpliaciones && (
                  <TabsContent value="ampliaciones" className="space-y-6">
                    <AmpliacionesPanel a={a} />
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
