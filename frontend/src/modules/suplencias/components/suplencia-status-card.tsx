"use client";

import * as React from "react";
import { UserCheck, Calendar, ShieldAlert, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuplenciaStatusSummaryProps {
  activas: number;
  programadas: number;
  administrativas: number;
  sinSuplencia: number;
  filtroEstadoSeleccionado?: string;
  onSelectFiltro?: (estado: string) => void;
  className?: string;
}

export function SuplenciasStatusSummary({
  activas,
  programadas,
  administrativas,
  sinSuplencia,
  filtroEstadoSeleccionado = "TODOS",
  onSelectFiltro,
  className,
}: SuplenciaStatusSummaryProps) {
  const handleToggle = (estado: string) => {
    if (!onSelectFiltro) return;
    onSelectFiltro(filtroEstadoSeleccionado === estado ? "TODOS" : estado);
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full", className)}>
      {/* 1. Suplencias Activas */}
      <Card
        variant="featured"
        role="button"
        tabIndex={0}
        onClick={() => handleToggle("ACTIVA")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle("ACTIVA");
          }
        }}
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
          "hover:-translate-y-0.5 hover:shadow-md",
          filtroEstadoSeleccionado === "ACTIVA"
            ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
            : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
        )}
        innerClassName="p-0 h-full"
      >
        <div className="flex flex-col justify-between h-full gap-3 w-full">
          <div className="flex items-center justify-between gap-2 w-full">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                filtroEstadoSeleccionado === "ACTIVA"
                  ? "bg-success text-white shadow-xs"
                  : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
              )}
            >
              <UserCheck className="size-5" />
            </div>
            <Badge
              tone="success"
              appearance="soft"
              size="sm"
              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
            >
              Vigentes
            </Badge>
          </div>
          <div className="text-left w-full space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Suplencias activas
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
              {activas}
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Programadas */}
      <Card
        variant="featured"
        role="button"
        tabIndex={0}
        onClick={() => handleToggle("PROGRAMADA")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle("PROGRAMADA");
          }
        }}
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
          "hover:-translate-y-0.5 hover:shadow-md",
          filtroEstadoSeleccionado === "PROGRAMADA"
            ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
            : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
        )}
        innerClassName="p-0 h-full"
      >
        <div className="flex flex-col justify-between h-full gap-3 w-full">
          <div className="flex items-center justify-between gap-2 w-full">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                filtroEstadoSeleccionado === "PROGRAMADA"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
              )}
            >
              <Calendar className="size-5" />
            </div>
            <Badge
              tone="primary"
              appearance="soft"
              size="sm"
              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
            >
              Planificadas
            </Badge>
          </div>
          <div className="text-left w-full space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Programadas
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
              {programadas}
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Activaciones Administrativas */}
      <Card
        variant="featured"
        role="button"
        tabIndex={0}
        onClick={() => handleToggle("ADMINISTRATIVA")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle("ADMINISTRATIVA");
          }
        }}
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
          "hover:-translate-y-0.5 hover:shadow-md",
          filtroEstadoSeleccionado === "ADMINISTRATIVA"
            ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
            : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
        )}
        innerClassName="p-0 h-full"
      >
        <div className="flex flex-col justify-between h-full gap-3 w-full">
          <div className="flex items-center justify-between gap-2 w-full">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                filtroEstadoSeleccionado === "ADMINISTRATIVA"
                  ? "bg-warning text-white shadow-xs"
                  : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
              )}
            >
              <ShieldAlert className="size-5" />
            </div>
            <Badge
              tone="warning"
              appearance="soft"
              size="sm"
              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
            >
              Fuerza mayor
            </Badge>
          </div>
          <div className="text-left w-full space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Administrativas
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
              {administrativas}
            </p>
          </div>
        </div>
      </Card>

      {/* 4. Coordinaciones sin Suplencia */}
      <Card
        variant="featured"
        role="button"
        tabIndex={0}
        onClick={() => handleToggle("SIN_SUPLENCIA")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle("SIN_SUPLENCIA");
          }
        }}
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
          "hover:-translate-y-0.5 hover:shadow-md",
          filtroEstadoSeleccionado === "SIN_SUPLENCIA"
            ? "bg-muted border-border ring-2 ring-primary/30 shadow-xs"
            : "bg-muted/40 hover:bg-muted/60 border-border/70 shadow-2xs"
        )}
        innerClassName="p-0 h-full"
      >
        <div className="flex flex-col justify-between h-full gap-3 w-full">
          <div className="flex items-center justify-between gap-2 w-full">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                filtroEstadoSeleccionado === "SIN_SUPLENCIA"
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted text-muted-foreground group-hover:scale-105 group-hover:bg-foreground group-hover:text-background"
              )}
            >
              <Users className="size-5" />
            </div>
            <Badge
              tone="neutral"
              appearance="soft"
              size="sm"
              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
            >
              Titular operativo
            </Badge>
          </div>
          <div className="text-left w-full space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Sin suplencia
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
              {sinSuplencia}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
