"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  X,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

export interface TestAccountItem {
  roleName: string;
  cedula: string;
}

export const TEST_ACCOUNTS_DATA: TestAccountItem[] = [
  { roleName: "Administrador del Sistema", cedula: "1799999999" },
  { roleName: "Director Área de Gestión", cedula: "1711223344" },
  { roleName: "Revisor Área de Gestión", cedula: "1111111111" },
  { roleName: "Director Área de Normativa", cedula: "2222222222" },
  { roleName: "Revisor Área de Normativa", cedula: "3333333333" },
  { roleName: "Coordinador SINARP (Activo)", cedula: "1712345678" },
  { roleName: "Coordinador SINARP (Contraseña temporal)", cedula: "1714443322" },
  { roleName: "Dirección de Gestión y Registro (DGR)", cedula: "1715489621" },
  { roleName: "Dirección de Tecnologías y Desarrollo (DTD)", cedula: "1712345602" },
  { roleName: "Dirección de Protección de Datos (DPI)", cedula: "1724589632" },
  { roleName: "Aprobador Institucional", cedula: "1718956234" },
  { roleName: "Analista de Facturación", cedula: "0999999999" },
];

interface DinarpTestAccountsDrawerProps {
  onSelectCedula?: (cedula: string) => void;
}

export function DinarpTestAccountsDrawer({ onSelectCedula }: DinarpTestAccountsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCedula, setCopiedCedula] = useState<string | null>(null);

  const handleCopy = (cedula: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(cedula);
    setCopiedCedula(cedula);
    toast.success("Cédula copiada al portapapeles", {
      description: cedula,
    });
    setTimeout(() => {
      setCopiedCedula(null);
    }, 2000);
  };

  const handleSelect = (cedula: string) => {
    handleCopy(cedula);
    if (onSelectCedula) {
      onSelectCedula(cedula);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Botón flotante para alternar apertura / cierre */}
      {!isOpen && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-3.5 py-2 h-auto flex items-center gap-2 border border-primary/20 backdrop-blur-md animate-fade-in"
              >
                <Fingerprint className="size-4 shrink-0" />
                <span className="text-xs font-semibold">Cuentas de prueba</span>
                <Badge tone="neutral" appearance="soft" size="sm" className="px-1.5 py-0.5 font-bold ml-1 text-[9px] h-4">
                  {TEST_ACCOUNTS_DATA.length}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Ver roles y cédulas de prueba disponibles
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Panel flotante desplegable */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-surface/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl p-4 flex flex-col max-h-[80vh] animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Fingerprint className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-heading text-foreground">
                  Roles y Cédulas de Prueba
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Haz clic en cualquier fila para ingresar directamente
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Listado de Cédulas y Roles */}
          <div className="overflow-y-auto py-2 divide-y divide-border/40 space-y-1 pr-1 -mr-1 [scrollbar-width:thin]">
            {TEST_ACCOUNTS_DATA.map((acc) => {
              const isCopied = copiedCedula === acc.cedula;
              return (
                <div
                  key={acc.cedula}
                  onClick={() => handleSelect(acc.cedula)}
                  className="pt-1.5 pb-1.5 px-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {acc.roleName}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                        {acc.cedula}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => handleCopy(acc.cedula, e)}
                            className="text-muted-foreground hover:text-foreground rounded-lg h-7 w-7"
                          >
                            {isCopied ? (
                              <Check className="size-3.5 text-success" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {isCopied ? "Copiado" : "Copiar cédula"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-2.5 mt-auto border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Solo cédulas oficiales activas</span>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-[11px] h-6 px-2"
            >
              Ocultar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

