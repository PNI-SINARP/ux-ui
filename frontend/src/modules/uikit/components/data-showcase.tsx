"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Layers, BarChart3,
  MapPin, Shield, Bell, Globe,
  Hash, Clock, Navigation, GraduationCap, AlertTriangle, Map, CheckCircle2, Info, XCircle, Zap, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CapacityCard } from "@/components/ui/capacity-card";
import { AppCard } from "@/components/ui/app-card";
import { GlowCard } from "@/components/ui/glow-card";

import {
  BaseCard,
  InteractiveCard,
  KpiCard,
  InstitutionCard,
  LayerCard,
  DocumentCard,
  ReportCard,
  DataChip,
  AddChip,
  MetadataList,
  StatusIndicator,
} from "@/components/ui/data-display";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { TreeView } from "@/components/ui/tree-view";
import { Timeline } from "@/components/ui/timeline";
import { DetailList } from "@/components/ui/detail-list";
import { RecordHeader } from "@/components/ui/record-header";

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({ id, registerSection, number, title, description, children }: {
  id: string;
  registerSection?: (id: string, el: HTMLElement | null) => void;
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      ref={(el) => {
        if (id) registerSection?.(id, el);
      }}
      className="w-full bg-surface border border-border/50 rounded-[2rem] p-8 md:p-10 flex flex-col shadow-sm scroll-mt-24"
    >
      <div className="flex flex-col gap-2 mb-8">
        <h3 className="text-h3 font-heading font-bold text-foreground flex items-center gap-3">{title}</h3>
        {description && <div className="text-sm text-muted-foreground leading-relaxed">{description}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}

// ─── Showcase ────────────────────────────────────────────────────────────────

export function DataShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">


      {/* ── 2. Interactive Card ── */}
      <Section id="interactive-card" registerSection={registerSection} number={2} title="Tarjeta Interactiva" description="Tarjeta completamente clicable con efecto hover y navegación.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InteractiveCard
            title="Institución Educativa San José"
            subtitle="Quito, Pichincha"
            description="12 bloques · 1.250 estudiantes"
            icon={<GraduationCap className="size-5" />}
            decorativeIcon={<Building2 className="size-full" />}
            color="primary"
          />
          <InteractiveCard
            title="Capa: Uso de Suelo"
            subtitle="Pichincha"
            description="Vectorial · Escala 1:25.000"
            icon={<Map className="size-5" />}
            decorativeIcon={<Globe className="size-full" />}
            color="success"
          />
          <InteractiveCard
            title="Alerta: Crecida de río"
            subtitle="Esmeraldas"
            description="Nivel crítico superado. Monitoreo activo."
            icon={<Bell className="size-5" />}
            decorativeIcon={<AlertTriangle className="size-full" />}
            color="warning"
          />
          <InteractiveCard
            title="Reporte Amenazas Julio 2026"
            subtitle="Nacional"
            description="PDF · Generado 31/07/2026"
            icon={<BarChart3 className="size-5" />}
            decorativeIcon={<BarChart3 className="size-full" />}
            disabled
          />
        </div>
      </Section>

      {/* ── 2.5. Capacity Card ── */}
      <Section id="capacity-card" registerSection={registerSection} number={12} title="Tarjeta de Capacidad" description="Tarjetas con borde animado y glow integrado.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CapacityCard
            title="Visor territorial"
            description="Explora instituciones educativas, capas geográficas y áaaaareas de influencia."
            icon={MapPin}
            color="primary"
          />
          <CapacityCard
            title="Riesgos e indicadores"
            description="Consulta niveles de riesgo, alertas e indicadores del entorno educativo."
            icon={BarChart3}
            color="success"
          />
          <CapacityCard
            title="Reportes y fichas"
            description="Analiza información territorial y genera fichas y reportes institucionales."
            icon={Globe}
            color="info"
          />
          <CapacityCard
            title="Asistente IA"
            description="Consulta información del Geoportal útilizando lenguaje natural."
            icon={Zap}
            color="warning"
          />
        </div>
      </Section>

      {/* ── 2.6. App Card ── */}
      <Section id="app-card" registerSection={registerSection} number={2} title="Tarjeta de Aplicación (App Card)" description="Tarjetas de acceso rápido a módulos con diseño colorido.">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AppCard
            title="Assistant"
            description="Your personal AI assistant"
            icon={<Zap />}
            color="primary"
          />
          <AppCard
            title="Explore"
            description="Search the intranet"
            icon={<MapPin />}
            color="info"
          />
          <AppCard
            title="Docs"
            description="Manage and chat with files"
            icon={<Globe />}
            color="danger"
          />
          <AppCard
            title="Recap"
            description="Smart meeting notes"
            icon={<Clock />}
            color="success"
            badge={5}
          />
          <AppCard
            title="Calendar"
            description="Automated calendar"
            icon={<Bell />}
            color="warning"
          />
        </div>


      </Section>

      {/* ── 8. Badge ── */}
      <Section id="badge" registerSection={registerSection} number={8} title="Etiqueta (Badge)" description="Indicadores visuales compactos para estados, categorías y etiquetas con soporte para variantes semánticas y esúútilos de contorno.">
        <div className="space-y-12 w-full">
          {/* Filled */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Relleno</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <Badge tone="primary" appearance="solid">Primary</Badge>
              <Badge tone="secondary" appearance="solid">Secondary</Badge>
              <Badge tone="success" appearance="solid">Success</Badge>
              <Badge tone="warning" appearance="solid">Warning</Badge>
              <Badge tone="danger" appearance="solid">Error / Danger</Badge>
              <Badge tone="info" appearance="solid">Info</Badge>
              <Badge tone="neutral" appearance="solid">Neutral</Badge>
            </div>
          </div>

          {/* Outline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Contorno</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <Badge tone="primary" appearance="outline">Primary</Badge>
              <Badge tone="secondary" appearance="outline">Secondary</Badge>
              <Badge tone="success" appearance="outline">Success</Badge>
              <Badge tone="warning" appearance="outline">Warning</Badge>
              <Badge tone="danger" appearance="outline">Error / Danger</Badge>
              <Badge tone="info" appearance="outline">Info</Badge>
              <Badge tone="neutral" appearance="outline">Neutral</Badge>
            </div>
          </div>

          {/* With icon */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Con icono</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <Badge tone="success" icon={<CheckCircle2 className="size-3.5" />}>Activo</Badge>
              <Badge tone="info" icon={<Info className="size-3.5" />}>Información</Badge>
              <Badge tone="warning" icon={<AlertTriangle className="size-3.5" />}>Advertencia</Badge>
              <Badge tone="danger" icon={<XCircle className="size-3.5" />}>Error</Badge>
              <Badge tone="primary" icon={<CheckCircle2 className="size-3.5" />}>Completado</Badge>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tamaños</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <Badge tone="primary" size="sm">Pequeño</Badge>
              <Badge tone="primary" size="md">Mediano</Badge>
              <Badge tone="primary" size="lg">Grande</Badge>
            </div>
          </div>

          {/* Scale */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Escala (50 a 900)</h3>
            <div className="flex flex-col gap-4">
              {["primary", "secondary", "success", "warning", "danger", "info", "neutral"].map((tone) => (
                <div key={tone} className="flex flex-wrap gap-2 items-end">
                  <span className="w-24 text-xs font-mono uppercase text-muted-foreground">{tone}</span>
                  <Badge tone={tone as any} scale="50">50</Badge>
                  <Badge tone={tone as any} scale="100">100</Badge>
                  <Badge tone={tone as any} scale="200">200</Badge>
                  <Badge tone={tone as any} scale="300">300</Badge>
                  <Badge tone={tone as any} scale="400">400</Badge>
                  <Badge tone={tone as any} scale="500">500</Badge>
                  <Badge tone={tone as any} scale="600">600</Badge>
                  <Badge tone={tone as any} scale="700">700</Badge>
                  <Badge tone={tone as any} scale="800">800</Badge>
                  <Badge tone={tone as any} scale="900">900</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/60 pt-8" />

          {/* Status examples */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status examples</h3>
              <p className="text-xs text-muted-foreground italic mt-1">Casos aareales de aplicación en el Geoportal DINARP.</p>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <Badge tone="success" appearance="soft" icon={<CheckCircle2 className="size-3.5" />}>Activo</Badge>
              <Badge tone="neutral" appearance="soft" icon={<XCircle className="size-3.5" />}>Inactivo</Badge>

              <Badge tone="danger" appearance="solid" icon={<AlertTriangle className="size-3.5" />}>Riesgo alto</Badge>
              <Badge tone="warning" appearance="solid" icon={<AlertTriangle className="size-3.5" />}>Riesgo medio</Badge>
              <Badge tone="info" appearance="solid" icon={<Info className="size-3.5" />}>Riesgo bajo</Badge>

              <Badge tone="warning" appearance="soft" icon={<Clock className="size-3.5" />}>Pendiente</Badge>
              <Badge tone="primary" appearance="outline" icon={<Clock className="size-3.5" />}>Procesando</Badge>
              <Badge tone="success" appearance="outline" icon={<CheckCircle2 className="size-3.5" />}>Completado</Badge>

              <Badge tone="secondary" appearance="soft" icon={<Globe className="size-3.5" />}>Público</Badge>
              <Badge tone="primary" appearance="solid" icon={<Building2 className="size-3.5" />}>Institucional</Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 9. Chip ── */}
      <Section id="chip" registerSection={registerSection} number={9} title="Filtro (Chip)" description="Elemento interactivo para filtros, selección y etiquetas removibles.">
        <div className="p-6 border border-border rounded-xl bg-surface space-y-4">
          <div className="flex flex-wrap gap-2">
            <DataChip label="Pichincha" removable onRemove={() => { }} />
            <DataChip label="Azuay" removable onRemove={() => { }} />
            <DataChip label="Riesgo alto" removable selected icon={<Shield className="size-3" />} onRemove={() => { }} />
            <DataChip label="Inundación" removable onRemove={() => { }} />
            <DataChip label="Estado: Activa" removable onRemove={() => { }} />
            <AddChip />
          </div>
          <div className="flex flex-wrap gap-2">
            <DataChip label="Seleccionado" selected />
            <DataChip label="Default" />
            <DataChip label="Con icono" icon={<MapPin className="size-3" />} />
            <DataChip label="Deshabilitado" disabled />
          </div>
        </div>
      </Section>



      {/* ── 11. Status Indicator ── */}
      <Section id="status-indicator" registerSection={registerSection} number={11} title="Indicador de Estado" description="Señal visual que comunica un estado actual mediante dot + texto.">
        <div className="p-6 border border-border rounded-xl bg-surface">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-5">
            <StatusIndicator status="online" description="Sistema operativo" />
            <StatusIndicator status="processing" description="Taaarea en ejecución" />
            <StatusIndicator status="warning" description="Requiere atención" />
            <StatusIndicator status="critical" description="Intervención urgente" />
            <StatusIndicator status="offline" description="Servicio no disponible" />
            <StatusIndicator status="inactive" description="sión actividad reciente" />
            <StatusIndicator status="completed" description="Proceso finalizado" />
          </div>
        </div>
      </Section>

      {/* 12. Accordion */}
      <Section id="accordion" registerSection={registerSection} number={12} title="Accordion" description="Paneles colapsables para organizar contenido vertical.">
        <div className="p-6 border border-border rounded-xl bg-surface max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Qué es el visor geográfico?</AccordionTrigger>
              <AccordionContent>
                Es una herramienta interactiva que permite visualizar, consultar y analizar la información geográfica y estadística del proyecto de gestión de riesgos, mostrando capas de infraestructura, topografía y amenazas naturales.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>¿Cómo puedo descargar reportes?</AccordionTrigger>
              <AccordionContent>
                Los reportes pueden descargarse desde el panel lateral de "Analítica". Solo necesitas aplicar los filtros deseados y presionar el botón "Exportar" situado en la parte superior derecha de la pantalla.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>¿Están disponibles los datos en tiempo aareal?</AccordionTrigger>
              <AccordionContent>
                Sí, algunas capas como la meteorológica y las alertas de sismos están conectadas a fuentes externas y se actualizan en tiempo aareal. Otras capas base tienen ciclos de actualización trimestral o semestral.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      {/* 13. Divider */}
      <Section id="divider" registerSection={registerSection} number={13} title="Divider / Separator" description="Separadores visuales horizontales y verticales.">
        <div className="p-6 border border-border rounded-xl bg-surface space-y-8">
          <div>
            <p className="text-sm font-medium mb-4 text-foreground">Separador Horizontal Básico</p>
            <Separator />
          </div>

          <div className="flex h-12 items-center space-x-4 text-sm text-foreground">
            <div>Capa Base</div>
            <Separator orientation="vertical" />
            <div>Capa Operativa</div>
            <Separator orientation="vertical" />
            <div>Riesgos</div>
          </div>
        </div>
      </Section>

      {/* 14. Tree View */}
      <Section id="tree-view" registerSection={registerSection} number={14} title="Tree View" description="Vista jerárquica para estructuras de carpetas o capas.">
        <div className="p-6 border border-border rounded-xl bg-surface max-w-sm">
          <TreeView
            selectable
            data={[
              {
                id: "1",
                label: "Capas Base",
                children: [
                  { id: "1-1", label: "Imágenes Satelitales" },
                  { id: "1-2", label: "Topografía (SRTM)" },
                  { id: "1-3", label: "Red Vial" }
                ]
              },
              {
                id: "2",
                label: "Gestión de Riesgos",
                children: [
                  { id: "2-1", label: "Amenaza Volcánica" },
                  { id: "2-2", label: "Zonas Inundables" }
                ]
              }
            ]}
            selectedIds={["2-1", "1-2"]}
          />
        </div>
      </Section>

      {/* 15. Timeline */}
      <Section id="timeline" registerSection={registerSection} number={15} title="Timeline" description="Línea de tiempo para auditorías, incidentes o trazabilidad.">
        <div className="p-6 border border-border rounded-xl bg-surface max-w-xl">
          <Timeline
            items={[
              {
                id: "1",
                title: "Registro creado",
                date: "12 Oct 2026, 09:41 AM",
                description: "Reporte de posible deslizamiento ingresado al sistema.",
                status: "success",
                icon: <CheckCircle2 />,
                user: "Juan Pérez"
              },
              {
                id: "2",
                title: "Asignado a cuadrilla",
                date: "12 Oct 2026, 11:20 AM",
                status: "primary",
                icon: <Info />,
                user: "Marta Gómez"
              },
              {
                id: "3",
                title: "Inspección en sitio",
                date: "13 Oct 2026, 08:00 AM",
                description: "Se verifica movimiento de tierra menor, se recomienda monitoreo.",
                status: "warning",
                icon: <AlertTriangle />,
                user: "Pedro Santos"
              },
              {
                id: "4",
                title: "Caso cerrado",
                date: "14 Oct 2026, 10:15 AM",
                status: "neutral",
                user: "Ana López"
              }
            ]}
          />
        </div>
      </Section>

      {/* 16. Detail List */}
      <Section id="detail-list" registerSection={registerSection} number={16} title="Detail List / Key Value" description="Componente para visualizar información estructurada de un registro con soporte para layouts vertical, horizontal y grid.">
        <div className="flex flex-col gap-8 max-w-4xl">
          <div className="p-6 border border-border rounded-xl bg-surface">
            <h4 className="font-bold text-sm mb-4 text-foreground">Layout 2 Columnas</h4>
            <DetailList
              columns={2}
              items={[
                { label: "Nombre", value: "Unidad Educativa Manuela Cañizares" },
                { label: "Zona", value: "Norte" },
                { label: "Estado", value: <Badge tone="success" size="sm" appearance="soft">Activo</Badge> },
                { label: "Responsable", value: "Juan Pérez" },
                { label: "Úúúltima actualización", value: "09 sep 2026" },
                { label: "Descripción", value: "Institución principal del distrito con capacidad de 1500 estudiantes.", colSpan: 2 },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* 17. Record Header */}
      <Section id="record-header" registerSection={registerSection} number={17} title="Record Header" description="Componente de cabecera para páginas de detalle, componiendo Badge y botones.">
        <div className="flex flex-col gap-8">
          <div className="p-6 border border-border rounded-xl bg-surface">
            <RecordHeader
              title="Zona Norte"
              status={<Badge tone="success" appearance="soft" size="sm">Activo</Badge>}
              subtitle="Entidad responsable: Distrito aametropolitano"
              metadata={
                <>
                  <span>Úúúltima actualización: 09 sep 2026</span>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span>ID: ZN-001</span>
                </>
              }
              actions={
                <>
                  <Button variant="outline" size="sm">Desactivar</Button>
                  <Button variant="primary" size="sm">Editar</Button>
                </>
              }
            />
          </div>
        </div>
      </Section>

    </div>
  );
}
