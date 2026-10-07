"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";

export default function SuplenciasRedirectPage() {
  const router = useRouter();
  const { activeUser } = useAuthStore();

  useEffect(() => {
    if (activeUser?.role === "ADMIN") {
      router.replace("/gestion-suplencias");
    } else {
      router.replace("/mi-suplencia");
    }
  }, [activeUser, router]);

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium">
          Redirigiendo a la vista de suplencias correspondiente...
        </p>
      </div>
    </div>
  );
}
