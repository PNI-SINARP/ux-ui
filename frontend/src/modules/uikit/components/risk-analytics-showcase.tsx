"use client";

import React from "react";
import { SubSection } from "./sub-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, StatusIndicator } from "@/components/ui/data-display";
import { RiskMatrix } from "@/components/ui/risk-matrix";
import { DetailList } from "@/components/ui/detail-list";
import { ShieldAlert, AlertTriangle, TrendingUp, TrendingDown, Minus, Sparkles, Lightbulb, CheckCircle2, BarChart3, PieChart, LineChart as LineChartIcon, HelpCircle, Clock, Building2, FileText, AlertOctagon, BarChart2, Info, ArrowUpRight } from "lucide-react";




export function RiskAnalyticsShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* 1. RISK BADGE */}
      <SubSection icon={ShieldAlert} id="risk-badge" title="Risk Badge" description="Badge compacto para representar el nivel de riesgo con los tokens semánticos globales." registerSection={registerSection}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold block">Alto</span>
            <Badge tone="error" appearance="filled" className="gap-1.5 px-3 py-1">
              <ShieldAlert className="size-3.5" /> Riesgo Alto
            </Badge>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold block">Medio</span>
            <Badge tone="warning" appearance="filled" className="gap-1.5 px-3 py-1">
              <AlertTriangle className="size-3.5" /> Riesgo Medio
            </Badge>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold block">Bajo</span>
            <Badge tone="success" appearance="filled" className="gap-1.5 px-3 py-1">
              <CheckCircle2 className="size-3.5" /> Riesgo Bajo
            </Badge>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold block">sión Información</span>
            <Badge tone="neutral" appearance="soft" className="gap-1.5 px-3 py-1">
              <HelpCircle className="size-3.5" /> sión Datos
            </Badge>
          </div>
        </div>
      </SubSection>

      {/* 2. RISK SCALE */}
      <SubSection icon={BarChart2} id="risk-scale" title="Risk Scale" description="Escala visual completa para representar distribuciones y gradientes de niveles de riesgo." registerSection={registerSection}>
        <div className="space-y-6">
          {/* Bar Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-foreground">
              <span>Distribución de Vulnerabilidad Escolar</span>
              <span>100% Cobertura</span>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted p-0.5">
              <div className="h-full bg-danger w-[15%] rounded-l-full" title="Riesgo Alto: 15%" />
              <div className="h-full bg-warning w-[35%]" title="Riesgo Medio: 35%" />
              <div className="h-full bg-success w-[40%]" title="Riesgo Bajo: 40%" />
              <div className="h-full bg-muted-foreground w-[10%] rounded-r-full" title="sión Datos: 10%" />
            </div>
          </div>

          {/* Leyenda Horizontal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-surface/60">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-danger shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Alto (15%)</p>
                <p className="text-[10px] text-muted-foreground">Atención Inmediata</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-warning shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Medio (35%)</p>
                <p className="text-[10px] text-muted-foreground">Monitoreo Periódico</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-success shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Bajo (40%)</p>
                <p className="text-[10px] text-muted-foreground">Estado Estabilizado</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-muted-foreground shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-foreground">sión Datos (10%)</p>
                <p className="text-[10px] text-muted-foreground">Pendiente Levantamiento</p>
              </div>
            </div>
          </div>
        </div>
      </SubSection>

      {/* 3. CRITICALITY BADGE */}
      <SubSection icon={AlertOctagon} id="criticality-badge" title="Criticality Badge" description="Insignia para categorizaciónón de prioridad y atención institucional urgente." registerSection={registerSection}>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge tone="error" appearance="filled" className="px-3 py-1 font-bold">Urgente</Badge>
          <Badge tone="error" appearance="soft" className="px-3 py-1 font-bold">Alta</Badge>
          <Badge tone="warning" appearance="soft" className="px-3 py-1 font-bold">Media</Badge>
          <Badge tone="info" appearance="soft" className="px-3 py-1 font-bold">Baja</Badge>
        </div>
      </SubSection>

      {/* 4. KPI CARD */}
      <SubSection icon={TrendingUp} id="kpi-card" title="KPI Card" description="Reútilización del componente de indicadores principales con variación y tendencias." registerSection={registerSection}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            label="Escuelas en Zona de Riesgo"
            value="1,240"
            trend="up"
            change="+12%"
            comparison="vs año anterior"
            updatedAt="Actualizado hoy"
            icon={<Building2 className="size-5 text-primary" />}
          />
          <KpiCard
            label="Infraestructura Evaluada"
            value="94.2%"
            trend="neutral"
            change="0%"
            comparison="meta cumplida"
            updatedAt="Corte Marzo 2026"
            icon={<CheckCircle2 className="size-5 text-success" />}
          />
          <KpiCard
            label="Intervenciones Pendientes"
            value="86"
            trend="down"
            change="-8%"
            comparison="reducción mensual"
            updatedAt="Hace 2 horas"
            icon={<Clock className="size-5 text-warning" />}
          />
        </div>
      </SubSection>

      {/* 5. CHARTS (BAR, DONUT, LINE, LEGEND, TOOLTIP) */}
      <SubSection icon={PieChart} id="charts-group" title="Bar, Donut, Line Chart & Chart Tooltip" description="Representación visual de gráficos analíticos con leyendas e interacción." registerSection={registerSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bar Chart Mock */}
          <div className="p-5 rounded-2xl border border-border bg-surface/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" /> Bar Chart (Por Zona)
              </span>
              <Badge tone="neutral" appearance="soft">2026</Badge>
            </div>
            <div className="h-40 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-border/60">
              <div className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-lg transition-all h-[40%] relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">40%</span>
              </div>
              <div className="flex-1 bg-primary/40 hover:bg-primary/60 rounded-t-lg transition-all h-[75%] relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">75%</span>
              </div>
              <div className="flex-1 bg-primary hover:bg-primary-600 rounded-t-lg transition-all h-[90%] relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">90%</span>
              </div>
              <div className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-lg transition-all h-[55%] relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">55%</span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
              <span>Zona 1</span><span>Zona 2</span><span>Zona 3</span><span>Zona 4</span>
            </div>
          </div>

          {/* Donut Chart Mock */}
          <div className="p-5 rounded-2xl border border-border bg-surface/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <PieChart className="size-4 text-secondary" /> Donut Chart
              </span>
              <Badge tone="neutral" appearance="soft">Porcentaje</Badge>
            </div>
            <div className="h-40 flex items-center justify-center relative">
              <div className="size-28 rounded-full border-[12px] border-primary border-t-warning border-r-danger flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">100%</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" /> Bajo (50%)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-warning" /> Medio (30%)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-danger" /> Alto (20%)</span>
            </div>
          </div>

          {/* Line Chart Mock */}
          <div className="p-5 rounded-2xl border border-border bg-surface/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <LineChartIcon className="size-4 text-info" /> Line Chart (Evolución)
              </span>
              <Badge tone="neutral" appearance="soft">Trimestral</Badge>
            </div>
            <div className="h-40 flex items-end justify-between relative border-b border-l border-border/80 p-2">
              <div className="absolute inset-x-2 bottom-6 top-6 flex items-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-info/30 via-info to-primary rounded-full relative">
                  <span className="size-3 rounded-full bg-info absolute left-1/4 -top-1 border-2 border-background" />
                  <span className="size-3 rounded-full bg-info absolute left-2/4 -top-3 border-2 border-background" />
                  <span className="size-3 rounded-full bg-primary absolute left-3/4 top-1 border-2 border-background" />
                </div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
              <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span>
            </div>
          </div>
        </div>
      </SubSection>

      {/* 6. TREND INDICATOR */}
      <SubSection icon={ArrowUpRight} id="trend-indicator" title="Trend Indicator" description="Indicador compacto para incrementos, disminuciones o estabilidad de métricas." registerSection={registerSection}>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-xl border border-success/20">
            <TrendingUp className="size-4" /> Incremento (+14%)
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-danger bg-danger/10 px-3 py-1.5 rounded-xl border border-danger/20">
            <TrendingDown className="size-4" /> Disminución (-8%)
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
            <Minus className="size-4" /> sión Variación (0%)
          </div>
        </div>
      </SubSection>

      {/* 7. INTERPRETATION CARD */}
      <SubSection icon={Info} id="interpretation-card" title="Interpretation Card" description="Tarjeta analítica para resumir hallazgos clave en lenguaje natural." registerSection={registerSection}>
        <div className="group p-6 rounded-2xl border-l-4 border-l-info border-y border-r border-border/50 bg-gradient-to-br from-info/10 via-info/5 to-surface shadow-sm hover:shadow-md transition-all duration-300 space-y-4 text-left relative overflow-hidden">

          {/* Decorative background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-info/10 rounded-full blur-3xl group-hover:bg-info/20 transition-colors duration-500 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-info flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-info/20 text-info">
                <Sparkles className="size-4 animate-pulse" />
              </div>
              Diagnóstico Territorial IA
            </span>
            <span className="text-[10px] text-muted-foreground font-medium bg-surface/80 px-2 py-1 rounded-md border border-border/50 backdrop-blur-sm w-fit">
              Fuente: DINARP GeoAnalytics • 10 Mar 2026
            </span>
          </div>

          <div className="space-y-1.5 relative z-10">
            <h4 className="text-base font-bold text-foreground leading-tight">Incremento de vulnerabilidad por lluvias en Zona 3</h4>
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
              El análisis cruzado entre precipitaciones intensas y pendientes del terreno identifica 24 instituciones educativas con riesgo moderado de escorrentía superficial. Se sugiere revisión técnica preventiva.
            </p>
          </div>
        </div>
      </SubSection>

      {/* 6. MATRIX DE RIESGO */}
      <SubSection icon={BarChart2} id="risk-matrix" title="Risk Matrix" description="Matriz de calor interactiva para evaluar el cruce entre Probabilidad e Impacto de un evento o infraestructura." registerSection={registerSection}>
        <div className="flex gap-10 flex-col md:flex-row max-w-4xl">
          {/* Solo Lectura */}
          <div className="flex-1 p-6 border border-border rounded-xl bg-surface">
            <h4 className="font-bold text-sm mb-6 text-foreground">Vista de Resultados</h4>
            <RiskMatrix selectedProbability={4} selectedImpact={3} />
          </div>

          {/* Interactivo */}
          <div className="flex-1 p-6 border border-border rounded-xl bg-surface">
            <h4 className="font-bold text-sm mb-6 text-foreground">Modo Interactivo</h4>
            <RiskMatrix interactive />
          </div>
        </div>
      </SubSection>

      {/* 9. SELECTOR DE PROBABILIDAD E IMPACTO */}
      <SubSection icon={BarChart2} id="probability-impact-selector" title="Selector de Probabilidad / Impacto" description="Componentes base para selección manual conectables a la matriz de riesgos." registerSection={registerSection}>
        <div className="p-6 border border-border rounded-xl bg-surface max-w-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold text-foreground">Probabilidad</div>
            <div className="flex justify-between gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <Button
                  key={val}
                  variant={val === 3 ? "primary" : "outline"}
                  size="icon-sm"
                  className="font-semibold shadow-none rounded-full flex-shrink-0"
                >
                  {val}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Muy baja (1)</span>
              <span>Muy alta (5)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold text-foreground">Impacto</div>
            <div className="flex justify-between gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <Button
                  key={val}
                  variant={val === 4 ? "primary" : "outline"}
                  size="icon-sm"
                  className="font-semibold shadow-none rounded-full flex-shrink-0"
                >
                  {val}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Menor (1)</span>
              <span>Crítico (5)</span>
            </div>
          </div>
        </div>
      </SubSection>

      {/* 10. RISK SUMMARY */}
      <SubSection icon={FileText} id="risk-summary" title="Risk Summary" description="Resumen compacto del riesgo seleccionado útilizando Listas de Detalles." registerSection={registerSection}>
        <div className="p-6 border border-border rounded-xl bg-surface max-w-2xl">
          <DetailList
            layout="grid"
            columns={2}
            items={[
              { label: "Riesgo", value: "Desbordamiento del río" },
              { label: "Nivel", value: <Badge tone="danger" appearance="soft" size="sm">Alto</Badge> },
              { label: "Probabilidad", value: "Frecuente (4)" },
              { label: "Impacto", value: "Severo (4)" },
              { label: "Estado", value: <StatusIndicator status="online" /> },
              { label: "Responsable", value: "Dirección de Obras Públicas" },
            ]}
          />
        </div>
      </SubSection>

      {/* 11. RISK LEGEND */}
      <SubSection icon={Info} id="risk-legend" title="Risk Legend" description="Leyenda de interpretación de niveles de riesgo útilizando elementos visuales estándar." registerSection={registerSection}>
        <div className="p-6 border border-border rounded-xl bg-surface max-w-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-success/20 border border-success/50" />
            <span className="text-sm font-medium">Riesgo Bajo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-warning/20 border border-warning/50" />
            <span className="text-sm font-medium">Riesgo Medio</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-danger/20 border border-danger/50" />
            <span className="text-sm font-medium">Riesgo Alto</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-risk-critical/20 border border-risk-critical/50" />
            <span className="text-sm font-medium text-risk-critical font-bold">Riesgo Crítico</span>
          </div>
        </div>
      </SubSection>

    </div>
  );
}

