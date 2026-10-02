"use client";

import React, { Suspense } from "react";
import { NotificationsMenu } from "@/components/shared/notifications-menu";
import { UserMenu } from "@/components/shared/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

function UserMenuPreviewContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b border-border bg-surface px-6 py-4 flex items-center justify-end shadow-sm">
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10">
        <div className="max-w-md p-6 rounded-2xl border border-border bg-surface shadow-sm">
          <h3 className="text-base font-bold text-foreground">Previsualización de Menú de Usuario</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Haz clic en el avatar / usuario en la esquina superior derecha para desplegar las opciones.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function UserMenuPreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando menú de usuario...</div>}>
      <UserMenuPreviewContent />
    </Suspense>
  );
}

