"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Building2,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";
import { INITIAL_INSTITUCIONES, type CampoClasificacion } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function CatalogoConsultaView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitucion, setSelectedInstitucion] = useState<string>("ALL");
  const [selectedClasificacion, setSelectedClasificacion] = useState<string>("ALL");

  const institucionOptions = useMemo(() => [
    { value: "ALL", label: "Todas las Instituciones" },
    ...INITIAL_INSTITUCIONES.map(inst => ({
      value: inst.id,
      label: `${inst.sigla} — ${inst.nombre}`
    }))
  ], []);

  const clasificacionOptions = useMemo(() => [
    { value: "ALL", label: "Todas las clasificaciones" },
    { value: "Accesible", label: "Solo Accesibles" },
    { value: "Confidencial", label: "Solo Confidenciales" },
  ], []);
  const [expandedInstituciones, setExpandedInstituciones] = useState<Record<string, boolean>>({
    "INST-001": true,
    "INST-002": true,
    "INST-003": true
  });
  const [expandedFuentes, setExpandedFuentes] = useState<Record<string, boolean>>({
    "FNT-001": true
  });

  const toggleInstitucion = (id: string) => {
    setExpandedInstituciones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFuente = (id: string) => {
    setExpandedFuentes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrar estrictamente solo fuentes en estado PUBLICADO (excluye OCULTO y DESACTIVADO)
  const institucionesFiltradas = useMemo(() => {
    return INITIAL_INSTITUCIONES.map(inst => {
      const fuentesPublicadas = inst.fuentes.filter(f => f.estado === "PUBLICADO");

      const fuentesFiltradas = fuentesPublicadas.filter(f => {
        const matchSearch =
          searchTerm === "" ||
          f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inst.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.campos.some(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchClasificacion =
          selectedClasificacion === "ALL" ||
          f.campos.some(c => c.clasificacion === selectedClasificacion);

        return matchSearch && matchClasificacion;
      });

      return {
        ...inst,
        fuentes: fuentesFiltradas
      };
    }).filter(inst => {
      const matchInst = selectedInstitucion === "ALL" || inst.id === selectedInstitucion;
      return matchInst && inst.fuentes.length > 0;
    });
  }, [searchTerm, selectedInstitucion, selectedClasificacion]);

  const totalFuentesPublicadas = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap(i => i.fuentes).filter(f => f.estado === "PUBLICADO").length;
  }, []);

  const totalCampos = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap(i => i.fuentes)
      .filter(f => f.estado === "PUBLICADO")
      .reduce((acc, f) => acc + f.campos.length, 0);
  }, []);

  return (
    <WireframeDashboardLayout activeMenu="catalogo-interoperabilidad">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* Migas de Pan */}
        <WireframeBreadcrumbs
          segments={[
            { label: "Catálogo de Interoperabilidad", href: "/catalogo-interoperabilidad" },
            { label: "Consulta" }
          ]}
        />

        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Consulta de Servicios Digitales
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Exploración estructurada de servicios digitales y fuentes de datos autorizadas para interoperabilidad en el Sistema Nacional de Registro de Datos Públicos.
            </p>
          </div>

          {/* Estadísticas de Consulta */}
          <div className="flex items-center gap-4 bg-muted/30 p-2.5 rounded-lg border border-border shrink-0">
            <div className="text-right">
              <div className="text-lg font-bold text-foreground leading-none">{totalFuentesPublicadas}</div>
              <div className="text-[11px] text-muted-foreground">Fuentes Publicadas</div>
            </div>
            <div className="h-7 w-px bg-border" />
            <div className="text-right">
              <div className="text-lg font-bold text-foreground leading-none">{totalCampos}</div>
              <div className="text-[11px] text-muted-foreground">Campos Disponibles</div>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <Card size="sm" className="bg-card border-border">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por institución, fuente o nombre de campo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
              <Combobox
                items={institucionOptions}
                value={institucionOptions.find(o => o.value === selectedInstitucion) || institucionOptions[0]}
                onValueChange={(val) => {
                  if (val) setSelectedInstitucion(val.value);
                }}
              >
                <ComboboxSelectTrigger className="h-9 text-xs min-w-[200px] bg-background border-border" />
                <ComboboxContent align="start" className="w-64 max-h-72 overflow-y-auto">
                  <ComboboxList>
                    {institucionOptions.map((opt) => (
                      <ComboboxItem key={opt.value} value={opt} className="text-xs">
                        {opt.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <Combobox
                items={clasificacionOptions}
                value={clasificacionOptions.find(o => o.value === selectedClasificacion) || clasificacionOptions[0]}
                onValueChange={(val) => {
                  if (val) setSelectedClasificacion(val.value);
                }}
              >
                <ComboboxSelectTrigger className="h-9 text-xs min-w-[180px] bg-background border-border" />
                <ComboboxContent align="start" className="w-56">
                  <ComboboxList>
                    {clasificacionOptions.map((opt) => (
                      <ComboboxItem key={opt.value} value={opt} className="text-xs">
                        {opt.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {(searchTerm || selectedInstitucion !== "ALL" || selectedClasificacion !== "ALL") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedInstitucion("ALL");
                    setSelectedClasificacion("ALL");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jerarquía: INSTITUCIÓN â†’ FUENTE / SERVICIO â†’ CAMPOS */}
        <div className="flex flex-col gap-6">
          {institucionesFiltradas.length === 0 ? (
            <Card className="border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Search className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No se encontraron fuentes publicadas</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No existen fuentes publicadas que coincidan con el término de búsqueda o filtros seleccionados.
              </p>
            </Card>
          ) : (
            institucionesFiltradas.map(institucion => {
              const isInstExpanded = expandedInstituciones[institucion.id] ?? true;

              return (
                <div key={institucion.id} className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
                  {/* Nivel 1: INSTITUCIÓN */}
                  <div
                    onClick={() => toggleInstitucion(institucion.id)}
                    className="p-4 sm:p-5 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer flex items-center justify-between border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs">
                        {institucion.sigla.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-heading text-base font-bold text-foreground">
                            {institucion.nombre}
                          </h2>
                          <Badge tone="neutral" appearance="soft" size="sm">
                            {institucion.sigla}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {institucion.sector} â€¢ RUC: {institucion.codigoInstitucion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge tone="neutral" appearance="outline" size="sm">
                        {institucion.fuentes.length} {institucion.fuentes.length === 1 ? "fuente publicada" : "fuentes publicadas"}
                      </Badge>
                      <button type="button" className="text-muted-foreground">
                        {isInstExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Nivel 2: FUENTE / SERVICIO */}
                  {isInstExpanded && (
                    <div className="p-4 sm:p-6 flex flex-col gap-6 bg-card">
                      {institucion.fuentes.map(fuente => {
                        const isFuenteExpanded = expandedFuentes[fuente.id] ?? false;
                        const camposAccesibles = fuente.campos.filter(c => c.clasificacion === "Accesible").length;
                        const camposConfidenciales = fuente.campos.filter(c => c.clasificacion === "Confidencial").length;

                        return (
                          <div
                            key={fuente.id}
                            className="border border-border rounded-lg bg-surface overflow-hidden"
                          >
                            {/* Encabezado Fuente */}
                            <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border bg-muted/15">
                              <div className="flex flex-col gap-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-heading text-base font-bold text-foreground">
                                    {fuente.nombre}
                                  </h3>
                                  <Badge tone="neutral" appearance="soft" size="sm">
                                    {fuente.codigoServicio}
                                  </Badge>
                                  <Badge tone="neutral" appearance="soft" size="sm">
                                    {fuente.version}
                                  </Badge>
                                  <Badge tone="neutral" appearance="soft" size="sm">
                                    {fuente.tipoConsumo}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {fuente.descripcion}
                                </p>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-3 pt-1">
                                  <span>Base Legal: {fuente.baseLegal}</span>
                                  <span>â€¢</span>
                                  <span>Actualizado: {fuente.ultimaActualizacion}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Unlock className="size-3.5 text-muted-foreground" />
                                    {camposAccesibles} Accesibles
                                  </span>
                                  <span className="text-muted-foreground">â€¢</span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Lock className="size-3.5 text-muted-foreground" />
                                    {camposConfidenciales} Confidenciales
                                  </span>
                                </div>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => toggleFuente(fuente.id)}
                                  className="text-xs gap-1.5"
                                >
                                  {isFuenteExpanded ? "Ocultar Campos" : "Explorar Campos"}
                                  {isFuenteExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                                </Button>
                              </div>
                            </div>

                            {/* Nivel 3: CAMPOS */}
                            {isFuenteExpanded && (
                              <div className="p-4 sm:p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Estructura de Datos ({fuente.campos.length} campos)
                                  </h4>
                                  <div className="text-[11px] text-muted-foreground">
                                    Clasificación certificada por Dirección de Protección de la Información (DPI)
                                  </div>
                                </div>

                                <div className="border border-border rounded-lg overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                                      <tr>
                                        <th className="py-2.5 px-3">Nombre del Campo</th>
                                        <th className="py-2.5 px-3">Tipo de Dato</th>
                                        <th className="py-2.5 px-3">Descripción Funcional</th>
                                        <th className="py-2.5 px-3 text-center">Clasificación DPI</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                      {fuente.campos.map(campo => (
                                        <tr key={campo.id} className="hover:bg-muted/20 transition-colors">
                                          <td className="py-3 px-3 font-mono font-medium text-foreground">
                                            {campo.nombre}
                                          </td>
                                          <td className="py-3 px-3">
                                            <Badge tone="neutral" appearance="soft" size="sm">
                                              {campo.tipo}
                                            </Badge>
                                          </td>
                                          <td className="py-3 px-3 text-muted-foreground max-w-lg">
                                            {campo.descripcion}
                                          </td>
                                          <td className="py-3 px-3 text-center">
                                            {campo.clasificacion === "Accesible" ? (
                                              <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 inline-flex">
                                                <Unlock className="size-3" />
                                                Accesible
                                              </Badge>
                                            ) : (
                                              <Badge tone="neutral" appearance="outline" size="sm" className="gap-1 inline-flex font-semibold">
                                                <Lock className="size-3" />
                                                Confidencial
                                              </Badge>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </WireframeDashboardLayout>
  );
}
