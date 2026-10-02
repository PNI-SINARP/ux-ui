"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GeoportalHeader } from "@/components/layout/geoportal-header";

function HeaderPreviewContent() {
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant") as "full" | "navigation" | "user-actions" | null;
  const variant = variantParam || "full";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GeoportalHeader variant={variant} />
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10">
        <h2 className="text-xl font-heading font-bold text-foreground">Vista Previa de Header DINARP</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Variante: <span className="font-mono text-primary font-bold">{variant}</span>
        </p>
      </main>
    </div>
  );
}

export default function HeaderPreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando header...</div>}>
      <HeaderPreviewContent />
    </Suspense>
  );
}

