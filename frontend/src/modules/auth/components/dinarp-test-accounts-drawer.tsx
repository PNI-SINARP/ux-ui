"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  X,
  Fingerprint,
  Search,
  User,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TestAccountItem {
  roleName: string;
  userName: string;
  cedula: string;
  category: "enrolamiento" | "anexo-c" | "dinarp" | "institucion" | "otros";
  categories?: ("enrolamiento" | "anexo-c" | "dinarp" | "institucion" | "otros")[];
}

export const TEST_ACCOUNTS_DATA: TestAccountItem[] = [
  // ── FLUJO ENROLAMIENTO (PROCESO A & B / ANEXO A & B) ──
  {
    roleName: "Director Área de Gestión",
    userName: "Director Gestión",
    cedula: "1711223344",
    category: "enrolamiento",
    categories: ["enrolamiento", "anexo-c", "dinarp"]
  },
  {
    roleName: "Revisor Área de Gestión",
    userName: "Ana Torres (Revisor)",
    cedula: "1111111111",
    category: "enrolamiento",
    categories: ["enrolamiento", "anexo-c", "dinarp"]
  },
  {
    roleName: "Director Área de Normativa",
    userName: "Director Normativa",
    cedula: "2222222222",
    category: "enrolamiento",
    categories: ["enrolamiento", "dinarp"]
  },
  {
    roleName: "Revisor Área de Normativa",
    userName: "Revisor Normativa",
    cedula: "3333333333",
    category: "enrolamiento",
    categories: ["enrolamiento", "dinarp"]
  },
  {
    roleName: "Coordinador Titular (Prerregistrado)",
    userName: "Roberto Dávila",
    cedula: "1715489621",
    category: "enrolamiento",
    categories: ["enrolamiento", "institucion"]
  },
  {
    roleName: "Representante Legal / Solicitante",
    userName: "Marcelo Albuja",
    cedula: "1710001112",
    category: "enrolamiento",
    categories: ["enrolamiento", "institucion"]
  },

  // ── FLUJO CAMBIO DE COORDINADOR (ANEXO C / CAM-01) ──
  {
    roleName: "Representante Institucional",
    userName: "Carlos Andrade",
    cedula: "1716789019",
    category: "anexo-c",
    categories: ["anexo-c", "institucion"]
  },
  {
    roleName: "Director Área de Gestión",
    userName: "Director Gestión",
    cedula: "1711223344",
    category: "anexo-c",
    categories: ["anexo-c", "enrolamiento", "dinarp"]
  },
  {
    roleName: "Revisor Área de Gestión",
    userName: "Ana Torres (Revisor)",
    cedula: "1111111111",
    category: "anexo-c",
    categories: ["anexo-c", "enrolamiento", "dinarp"]
  },

  // ── COORDINADORES INSTITUCIONALES ──
  {
    roleName: "Coordinador Titular SINARP",
    userName: "Juan Pérez",
    cedula: "1712345678",
    category: "institucion",
    categories: ["institucion"]
  },
  {
    roleName: "Coordinador Suplente SINARP",
    userName: "Mariana Almeida",
    cedula: "1714443322",
    category: "institucion",
    categories: ["institucion"]
  },
  {
    roleName: "Aprobador Institucional",
    userName: "Aprobador MinEduc",
    cedula: "1718956234",
    category: "institucion",
    categories: ["institucion"]
  },

  // ── ADMINISTRACIÓN Y OTROS ROLES DINARP ──
  {
    roleName: "Administrador del Sistema",
    userName: "Admin Portal",
    cedula: "1799999999",
    category: "dinarp",
    categories: ["dinarp"]
  },
  {
    roleName: "Dirección de Gestión y Registro (DGR)",
    userName: "Analista DGR",
    cedula: "1715489621",
    category: "dinarp",
    categories: ["dinarp"]
  },
  {
    roleName: "Dirección de Tecnologías y Desarrollo (DTD)",
    userName: "Especialista DTD",
    cedula: "1712345602",
    category: "dinarp",
    categories: ["dinarp"]
  },
  {
    roleName: "Dirección de Protección de Datos (DPI)",
    userName: "Auditor DPI",
    cedula: "1724589632",
    category: "dinarp",
    categories: ["dinarp"]
  },
  {
    roleName: "Analista de Facturación",
    userName: "Analista Cobros",
    cedula: "0999999999",
    category: "otros",
    categories: ["otros", "dinarp"]
  }
];

interface DinarpTestAccountsDrawerProps {
  onSelectCedula?: (cedula: string) => void;
}

export function DinarpTestAccountsDrawer({ onSelectCedula }: DinarpTestAccountsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "todos" | "enrolamiento" | "anexo-c" | "dinarp" | "institucion"
  >("todos");
  const [copiedCedula, setCopiedCedula] = useState<string | null>(null);

  const countEnrolamiento = useMemo(
    () =>
      TEST_ACCOUNTS_DATA.filter(
        (a) => a.category === "enrolamiento" || a.categories?.includes("enrolamiento")
      ).length,
    []
  );

  const countAnexoC = useMemo(
    () =>
      TEST_ACCOUNTS_DATA.filter(
        (a) => a.category === "anexo-c" || a.categories?.includes("anexo-c")
      ).length,
    []
  );

  const countDinarp = useMemo(
    () =>
      TEST_ACCOUNTS_DATA.filter(
        (a) => a.category === "dinarp" || a.categories?.includes("dinarp")
      ).length,
    []
  );

  const countInstitucion = useMemo(
    () =>
      TEST_ACCOUNTS_DATA.filter(
        (a) => a.category === "institucion" || a.categories?.includes("institucion")
      ).length,
    []
  );

  const handleCopy = (cedula: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(cedula);
    setCopiedCedula(cedula);
    if (onSelectCedula) {
      onSelectCedula(cedula);
    }
    toast.success("Cédula copiada al portapapeles", {
      description: cedula,
    });
    setTimeout(() => {
      setCopiedCedula(null);
    }, 2000);
  };

  const filteredAccounts = useMemo(() => {
    return TEST_ACCOUNTS_DATA.filter((acc) => {
      const matchesFilter =
        selectedFilter === "todos"
          ? true
          : acc.category === selectedFilter || acc.categories?.includes(selectedFilter);

      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        acc.roleName.toLowerCase().includes(q) ||
        acc.userName.toLowerCase().includes(q) ||
        acc.cedula.includes(q)
      );
    });
  }, [searchQuery, selectedFilter]);

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
                className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-3.5 py-2 h-auto flex items-center gap-2 border border-primary/20 backdrop-blur-md animate-fade-in group"
              >
                <Fingerprint className="size-4 shrink-0 text-white" />
                <span className="text-xs font-semibold text-white">Cuentas de prueba</span>
                <Badge
                  tone="neutral"
                  appearance="soft"
                  size="sm"
                  className="px-1.5 py-0.5 font-bold ml-1 text-[9px] h-4 bg-white/20 text-white border-0"
                >
                  {TEST_ACCOUNTS_DATA.length}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Ver roles y cédulas de prueba (Enrolamiento, Anexo C, Gestión y Normativa)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Panel flotante desplegable */}
      {isOpen && (
        <div className="w-84 sm:w-105 bg-surface/98 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl p-4 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">
                  Roles y Cédulas de Prueba
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Haz clic para copiar la cédula al portapapeles
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

          {/* Barra de Búsqueda y Filtros Rápidos */}
          <div className="pt-3 pb-2 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por rol, nombre o cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 bg-muted/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Chips de filtro */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => setSelectedFilter("todos")}
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all shrink-0",
                  selectedFilter === "todos"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground"
                )}
              >
                Todos ({TEST_ACCOUNTS_DATA.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("enrolamiento")}
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all shrink-0 flex items-center gap-1",
                  selectedFilter === "enrolamiento"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                )}
              >
                <Sparkles className="size-2.5" />
                <span>Flujo Enrolamiento ({countEnrolamiento})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("anexo-c")}
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all shrink-0 flex items-center gap-1",
                  selectedFilter === "anexo-c"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                )}
              >
                <Sparkles className="size-2.5" />
                <span>Flujo Anexo C ({countAnexoC})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("dinarp")}
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all shrink-0",
                  selectedFilter === "dinarp"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground"
                )}
              >
                DINARP ({countDinarp})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("institucion")}
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all shrink-0",
                  selectedFilter === "institucion"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground"
                )}
              >
                Institución ({countInstitucion})
              </button>
            </div>
          </div>

          {/* Listado de Cédulas y Roles (Diseño uniforme, solo Rol, Nombre y Cédula) */}
          <div className="overflow-y-auto py-1 divide-y divide-border/40 space-y-1.5 pr-1 -mr-1 flex-1 [scrollbar-width:thin]">
            {filteredAccounts.map((acc) => {
              const isCopied = copiedCedula === acc.cedula;
              return (
                <div
                  key={`${acc.category}-${acc.cedula}-${acc.roleName}`}
                  onClick={() => handleCopy(acc.cedula)}
                  className="p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between group border border-border/40 hover:border-border hover:bg-muted/40"
                >
                  <div className="space-y-1 min-w-0 pr-2 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {acc.roleName}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                      <User className="size-3 text-muted-foreground/70 shrink-0" />
                      <span className="truncate">{acc.userName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
                      <span className="text-[10px] text-muted-foreground font-medium">Cédula:</span>
                      <span className="text-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono font-medium text-[11px]">
                        {acc.cedula}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleCopy(acc.cedula, e)}
                      className="text-xs h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-3.5 text-success" />
                          <span className="text-[10px] text-success font-medium">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span className="text-[10px]">Copiar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredAccounts.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No se encontraron cuentas que coincidan con la búsqueda.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2.5 mt-auto border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary inline-block"></span>
              <span>Cédulas disponibles para pruebas</span>
            </span>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-[11px] h-6 px-2"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
