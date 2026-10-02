"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UsuariosView() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cuentas-internas");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md w-full p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
        <div className="size-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <Users className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold font-heading text-foreground">
            Redireccionando a Cuentas internas
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            La gestión de usuarios de DINARP ha sido trasladada a la sección de <strong>Cuentas internas</strong>.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/cuentas-internas">
            <Button variant="primary" size="default" className="w-full text-xs gap-2">
              <span>Ir a Cuentas internas</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
