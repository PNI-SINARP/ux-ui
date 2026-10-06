"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RevisionNormativaView } from "@/modules/gestion-solicitudes/views/revision-normativa-view";
import { RevisionNormativaInteroperabilidadView } from "@/modules/acceso-interoperabilidad/views/revision-normativa-interoperabilidad-view";
import { Building2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function RevisionNormativaContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "interoperabilidad" ? "interoperabilidad" : "registro";
  const [tab, setTab] = useState<"registro" | "interoperabilidad">(initialTab);

  return (
    <div className="relative">
      {/* Selector de proceso en cabecera */}
      <div className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline">
            Proceso en Normatividad:
          </span>
          <div className="flex items-center rounded-xl bg-muted/40 p-1 border border-border">
            <button
              type="button"
              onClick={() => setTab("interoperabilidad")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                tab === "interoperabilidad"
                  ? "bg-background text-foreground shadow-xs border border-border text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="size-3.5 text-amber-600" />
              <span>Acceso a Fuentes Confidenciales (BN-07)</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("registro")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                tab === "registro"
                  ? "bg-background text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="size-3.5" />
              <span>Registro Institucional y Anexos A/B/C</span>
            </button>
          </div>
        </div>
      </div>

      {tab === "interoperabilidad" ? (
        <RevisionNormativaInteroperabilidadView />
      ) : (
        <RevisionNormativaView />
      )}
    </div>
  );
}

export default function RevisionNormativaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Cargando módulo de Normatividad...</div>}>
      <RevisionNormativaContent />
    </Suspense>
  );
}
