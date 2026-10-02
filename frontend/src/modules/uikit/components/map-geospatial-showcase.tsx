"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Globe, MapPin, Layers, Sliders, Info, Search, ZoomIn, ZoomOut, Compass, Map, Maximize2, PersonStanding, CloudRain, Ruler, PenTool, Trash2, LocateFixed } from "lucide-react";
import {
  MapContainer, MapControlGroup, MapControlButton, MapSearch, LayersPanel, LayerItem,
  LayerLegend, BasemapSelector, MapPopup, ScaleIndicator, CoordinatesDisplay
} from "@/components/ui/map-geospatial";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TreeView } from "@/components/ui/tree-view";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/data-display";
import { MoreVertical, Filter, ArrowUp, ArrowDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";




export function MapGeospatialShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const [activeMap, setActiveMap] = React.useState("google-calle");
  const [layer1, setLayer1] = React.useState(true);
  const [layer2, setLayer2] = React.useState(true);
  const [opacity1, setOpacity1] = React.useState(100);

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* 1. MAP CONTAINER INTERACTIVO */}
      <SubSection icon={Map} id="map-container" title="Visor de Mapa y Contenedor" description="Visor geográfico principal con controles flotantes, barra de búsqueda y regla de escala." registerSection={registerSection}>
        <MapContainer />
      </SubSection>

      {/* 2. LAYERS PANEL, BASEMAP SELECTOR & LEGEND */}
      <SubSection icon={Layers} id="layers-panel" title="Panel de Capas, Mapas Base y Leyenda" description="Gestor de capas geográficas con opacidad, mapa base y simbología." registerSection={registerSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <LayersPanel>
            <LayerItem
              id="1"
              name="Instituciones Educativas (AMIE)"
              category="Infraestructura"
              visible={layer1}
              opacity={opacity1}
              colorToken="bg-primary"
              onToggleVisibility={setLayer1}
              onOpacityChange={setOpacity1}
            />
            <LayerItem
              id="2"
              name="Áreas de Riesgo Volcánico"
              category="Gestión de Riesgos"
              visible={layer2}
              colorToken="bg-danger"
              onToggleVisibility={setLayer2}
            />
          </LayersPanel>

          <div className="space-y-4">
            <BasemapSelector activeMap={activeMap} onSelectMap={setActiveMap} />

            <p className="text-xs font-bold text-foreground pt-2">Simbología Activa</p>
            <LayerLegend
              title="Simbología Infraestructura"
              items={[
                { label: "Colegio Público", color: "bg-primary" },
                { label: "Colegio Fisco-misional", color: "bg-info" },
                { label: "Zona Inundable 2km", color: "bg-warning" },
                { label: "Riesgo Sísmico", color: "bg-danger" },
              ]}
            />
          </div>
        </div>
      </SubSection>

      {/* 3. MAP POPUP & CONTROLS */}
      <SubSection icon={MapPin} id="map-popup" title="Popup de Mapa e Indicadores" description="Popup emergente al seleccionar elementos sobre el mapa e indicadores de coordenadas." registerSection={registerSection}>
        <div className="flex flex-wrap items-center gap-6">
          <MapPopup
            title="Unidad Educativa Manuela Cañizares"
            subtitle="Quito • Código AMIE: 17H00012"
            category="Operativa"
          />

          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground">Indicadores y Coordenadas WGS84</p>
            <CoordinatesDisplay lat="-0.1807" lng="-78.4678" />
            <ScaleIndicator scale="1:25,000" distance="250 m" />
          </div>
        </div>
      </SubSection>

      {/* 5. PATRONES DE CAPAS (Layers, Order, Actions) */}
      <SubSection icon={Layers} id="layer-patterns" title="Patrones de Capas (Groups, Actions, Order)" description="Composición de componentes UI existentes (Sliders, Switches, Dropdowns, TreeView) para armar paneles de capas avanzados." registerSection={registerSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Layer Opacity & Actions */}
          <div className="p-6 border border-border rounded-xl bg-surface space-y-6">
            <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">Layer Item Avanzado</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch defaultChecked />
                  <span className="text-sm font-medium">Topografía (SRTM)</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Zoom a capa</DropdownMenuItem>
                    <DropdownMenuItem>Ver información</DropdownMenuItem>
                    <DropdownMenuItem className="text-danger">Quitar capa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="pl-12 pr-2 py-2">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Opacidad</span>
                  <span className="text-xs font-mono">75%</span>
                </div>
                <Slider defaultValue={[75]} max={100} step={1} />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-bold text-sm text-foreground mb-4">Reordenar Capas</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-2 bg-background border border-border rounded-md">
                  <span className="text-sm">Ríos y Cuerpos de Agua</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><ArrowUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><ArrowDown className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grouping & Filters */}
          <div className="p-6 border border-border rounded-xl bg-surface space-y-6">
            <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">Layer Group (TreeView)</h4>
            <TreeView
              selectable
              data={[
                {
                  id: "group-1",
                  label: "Infraestructura Crítica",
                  children: [
                    { id: "layer-1", label: "Hospitales (MSP)" },
                    { id: "layer-2", label: "Subestaciones Eléctricas" },
                  ]
                }
              ]}
              selectedIds={["layer-1"]}
            />

            <div className="pt-4 border-t border-border">
              <h4 className="font-bold text-sm text-foreground mb-4">Map Filter Panel (Sheet)</h4>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full"><Filter className="mr-2 h-4 w-4" /> Filtros del Mapa</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros de visualización</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Provincia</Label>
                      <Input placeholder="Buscar provincia..." />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-bold text-sm text-foreground mb-4">Ingreso de Coordenadas</h4>
              <div className="flex gap-2 w-full max-w-sm">
                <InputGroup className="flex-1 bg-surface/50 border-border">
                  <InputGroupAddon>Lat</InputGroupAddon>
                  <InputGroupInput placeholder="0.00000" />
                </InputGroup>
                <InputGroup className="flex-1 bg-surface/50 border-border">
                  <InputGroupAddon>Lng</InputGroupAddon>
                  <InputGroupInput placeholder="0.00000" />
                </InputGroup>
                <Button variant="primary" className="rounded-full px-6 font-bold shadow-md shadow-primary/20">Ir</Button>
              </div>
            </div>
          </div>
        </div>
      </SubSection>

      {/* 6. ESTADOS DEL MAPA */}
      <SubSection icon={Settings} id="map-states" title="Estados del Mapa (Loading, Empty, Feature Selection)" description="Visualización de estados comunes." registerSection={registerSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="p-6 border border-border rounded-xl bg-surface space-y-4">
            <h4 className="font-bold text-sm text-foreground">Map Loading State</h4>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </div>

          <div className="p-6 border border-border rounded-xl bg-surface space-y-4">
            <h4 className="font-bold text-sm text-foreground">Map Empty / No Data</h4>
            <EmptyState
              type="search"
              title="sión resultados"
              description="No se encontraron elementos para los filtros seleccionados en esta vista."
            />
          </div>
        </div>
      </SubSection>

    </div>
  );
}
