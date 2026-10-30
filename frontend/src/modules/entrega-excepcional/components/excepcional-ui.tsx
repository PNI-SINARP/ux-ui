"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBadge, CardDecorativeIcon, CardDescription, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import type { EstadoExcepcional, EstadoLote } from "../data/excepcional-store";

type Tono = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

const TONO_ESTADO: Record<EstadoExcepcional, Tono> = {
  Borrador: "neutral",
  "Pendiente de firma": "warning",
  "En calificación": "info",
  Observada: "warning",
  Archivada: "neutral",
  Admitida: "info",
  "En informe tecnológico": "info",
  "En informe DPI": "info",
  "En informe final": "info",
  "Pendiente de autorización": "warning",
  Autorizada: "success",
  Rechazada: "danger",
  Suspendida: "danger",
  Vencida: "neutral",
};

const TONO_LOTE: Record<EstadoLote, Tono> = {
  Programado: "neutral",
  "En ejecución": "info",
  Completado: "success",
  "Sin datos": "neutral",
  Fallido: "danger",
  "Escalado a TI": "danger",
  "Cancelado por cupo": "warning",
  "Cancelado por autorización": "warning",
  "Descarga en conciliación": "warning",
  "Eliminación pendiente": "warning",
  Descargado: "success",
  Vencido: "neutral",
};

export function EstadoBadge({ estado }: { estado: EstadoExcepcional }) {
  return (
    <Badge tone={TONO_ESTADO[estado]} appearance="soft" size="sm" className="whitespace-nowrap">
      {estado}
    </Badge>
  );
}

export function EstadoLoteBadge({ estado }: { estado: EstadoLote }) {
  return (
    <Badge tone={TONO_LOTE[estado]} appearance="soft" size="sm" className="whitespace-nowrap">
      {estado}
    </Badge>
  );
}

/** Actor de la sesión simulada, con el rol que se registra en el historial de cada transición. */
export function useActor() {
  const { activeUser } = useAuthStore();
  const rol = activeUser?.role ?? "";
  return {
    rol,
    actor: { nombre: activeUser?.name ?? "Usuario", rol: activeUser?.roleTitle ?? rol },
    institucion: activeUser?.institution ?? "",
  };
}

interface ShellProps {
  activeMenu: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  volver?: { href: string; texto: string };
  acciones?: React.ReactNode;
  children: React.ReactNode;
}

export function ExcepcionalShell({ activeMenu, etiqueta, titulo, descripcion, icono, volver, acciones, children }: ShellProps) {
  return (
    <WireframeDashboardLayout activeMenu={activeMenu}>
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-5 py-4 sm:py-6 space-y-5">
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-xs animate-in fade-in duration-300 w-full">
          {volver && (
            <Link href={volver.href} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-3.5" />
              <span>{volver.texto}</span>
            </Link>
          )}
          <Card variant="featured" disableHover={true} className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">{etiqueta}</CardBadge>
              {acciones}
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">{titulo}</CardTitle>
            <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium max-w-3xl">{descripcion}</CardDescription>
            <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 hidden sm:block">{icono}</CardDecorativeIcon>
          </Card>
          {children}
        </div>
      </main>
    </WireframeDashboardLayout>
  );
}

export function Dato({ etiqueta, children, className }: { etiqueta: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <span className="text-[11px] text-muted-foreground block">{etiqueta}</span>
      <div className="text-xs font-medium text-foreground mt-0.5 break-words">{children}</div>
    </div>
  );
}

export function Seccion({ titulo, descripcion, children, acciones }: { titulo: string; descripcion?: string; children: React.ReactNode; acciones?: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300">{titulo}</h2>
          {descripcion && <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl">{descripcion}</p>}
        </div>
        {acciones}
      </div>
      {children}
    </section>
  );
}

export function BotonVolver({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Button type="button" variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
        {children}
      </Button>
    </Link>
  );
}

export function PlazoBadge({ fechaLimite, resuelta }: { fechaLimite: string; resuelta?: boolean }) {
  if (resuelta) return null;
  const vencida = new Date(fechaLimite) < new Date();
  return (
    <Badge tone={vencida ? "danger" : "neutral"} appearance="outline" size="sm" className="whitespace-nowrap text-[10px]">
      {vencida ? "Plazo vencido · " : "Límite · "}
      {new Date(fechaLimite).toLocaleDateString("es-EC", { dateStyle: "medium" })}
    </Badge>
  );
}
