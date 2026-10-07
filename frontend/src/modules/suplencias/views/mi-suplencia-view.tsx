"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Building2,
  History,
  XCircle,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSuplenciasStore,
  USUARIO_COORDINADOR_TITULAR,
} from "../data/suplencias-store";
import { CoordinacionInstitucionalCard } from "../components/coordinacion-institucional-card";
import { ProgramarInactividadDialog } from "../components/programar-inactividad-dialog";
import { SuplenciaTimeline } from "../components/suplencia-timeline";

export function MiSuplenciaView() {
  const store = useSuplenciasStore();

  // Usuario titular autenticado (Juan Pérez)
  const currentUser = USUARIO_COORDINADOR_TITULAR;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("coordinacion");

  // Obtener la suplencia institucional
  const suplencia = store.getSuplenciaMineduc();
  const isTitular = currentUser.designacion === "TITULAR";

  const handleProgramarConfirm = (fechaInicial: string, fechaFinal: string) => {
    return store.programarInactividad(suplencia.idInstitucion, fechaInicial, fechaFinal);
  };

  const handleCancelarProgramacion = () => {
    store.cancelarProgramacion(suplencia.idInstitucion);
  };

  return (
    <WireframeDashboardLayout
      currentRole="COORDINADOR_SINARP"
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* ──────────────────────────────────────────────────────────── */}
        {/* CONTENEDOR PRINCIPAL UNIFICADO ESTILO DINARP (Card container) */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Card
          className="w-full bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* ──────────────────────────────────────────────────────────── */}
          {/* ENCABEZADO PRINCIPAL (Título a la izquierda, Acción a la derecha) */}
          {/* ──────────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full pb-4 border-b border-border/70">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                Mi suplencia
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Consulta el estado de tu coordinación y gestiona la suplencia temporal cuando corresponda.
              </p>
            </div>

            {/* Acción principal ubicada a la derecha con tamaño destacado */}
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              {isTitular && suplencia.estado === "SIN_SUPLENCIA" && (
                <Button
                  variant="primary"
                  size="default"
                  onClick={() => setIsDialogOpen(true)}
                  className="font-semibold gap-2 shadow-sm cursor-pointer"
                >
                  <CalendarDays className="size-5" />
                  <span>Programar inactividad</span>
                </Button>
              )}

              {/* Si ya está programada: badge con fecha inicial y final y acción de cancelación */}
              {isTitular && suplencia.estado === "PROGRAMADA" && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge tone="primary" appearance="solid" size="md" className="font-bold text-xs gap-1.5 shadow-2xs px-3 py-1.5">
                    <Calendar className="size-3.5" />
                    <span>Inactividad programada{suplencia.fechaInicial && suplencia.fechaFinal ? `: ${suplencia.fechaInicial} al ${suplencia.fechaFinal}` : ""}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelarProgramacion}
                    className="text-xs text-danger border-danger/30 hover:bg-danger/10 hover:text-danger gap-1.5 cursor-pointer"
                    title="Cancelar periodo programado"
                  >
                    <XCircle className="size-3.5" />
                    <span>Cancelar</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* BANNER EXPLICATIVO TRAS GUARDAR LA PROGRAMACIÓN               */}
          {/* ──────────────────────────────────────────────────────────── */}
          {suplencia.estado === "PROGRAMADA" && suplencia.fechaInicial && suplencia.fechaFinal && (
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                <Info className="size-5" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading font-bold text-sm text-foreground">
                    Inactividad programada: {suplencia.fechaInicial} al {suplencia.fechaFinal}
                  </h2>
                  <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-[10px]">
                    Solo registrada
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  «Al iniciar el período se verificará de nuevo si el suplente puede habilitarse», sin prometer acceso futuro ni presentar la programación como activación inmediata. El suplente será activado por el administrador.
                </p>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TABS OFICIALES DEL UI KIT                                    */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="coordinacion">
                <Building2 className="size-4" />
                <span>Coordinación institucional</span>
              </TabsTrigger>

              <TabsTrigger value="trazabilidad">
                <History className="size-4" />
                <span>Trazabilidad</span>
                {suplencia.trazabilidad.length > 0 && (
                  <Badge tone="neutral" appearance="soft" size="sm" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-semibold">
                    {suplencia.trazabilidad.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Pestaña 1: Información de Coordinación y Suplencia */}
            <TabsContent value="coordinacion" className="pt-4 focus-visible:outline-none w-full">
              <CoordinacionInstitucionalCard
                suplencia={suplencia}
                isSuplente={false}
                showBorder={true}
                showBottomProgramar={false}
                onOpenProgramar={() => setIsDialogOpen(true)}
                onCancelarProgramacion={handleCancelarProgramacion}
              />
            </TabsContent>

            {/* Pestaña 2: Trazabilidad Institucional en Contenedor */}
            <TabsContent value="trazabilidad" className="pt-4 focus-visible:outline-none w-full">
              <Card
                className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden"
                innerClassName="p-5 sm:p-7 space-y-6"
              >
                {/* Encabezado del contenedor de Trazabilidad */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <History className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                        Trazabilidad y Línea de Tiempo de Suplencias
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Historial cronológico completo de inactividades, activaciones y sustituciones en {suplencia.institucion}.
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-xs">
                    {suplencia.trazabilidad.length} {suplencia.trazabilidad.length === 1 ? "evento registrado" : "eventos registrados"}
                  </Badge>
                </div>

                {/* Timeline oficial del UI Kit */}
                <div className="pt-1 max-w-4xl">
                  <SuplenciaTimeline
                    eventos={suplencia.trazabilidad}
                    showHeader={false}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* DIÁLOGO: PROGRAMAR INACTIVIDAD                               */}
        {/* ──────────────────────────────────────────────────────────── */}
        <ProgramarInactividadDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          suplencia={suplencia}
          onConfirm={handleProgramarConfirm}
        />
      </main>
    </WireframeDashboardLayout>
  );
}
