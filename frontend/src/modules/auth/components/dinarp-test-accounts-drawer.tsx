"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  X,
  Fingerprint,
  Search,
  User,
  ChevronRight,
  ArrowLeft,
  FileText,
  FileSignature,
  ArrowLeftRight,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

export type FlowType = "anexo-a" | "anexo-b" | "anexo-c" | "todos";

export interface TestAccountItem {
  roleName: string;
  userName: string;
  cedula: string;
  flows: ("anexo-a" | "anexo-b" | "anexo-c")[];
}

export const TEST_ACCOUNTS_DATA: TestAccountItem[] = [
  // ── FLUJO ANEXO A (REGISTRO INSTITUCIÓN Y RESOLUCIÓN) ──
  {
    roleName: "Representante Legal / Solicitante",
    userName: "Marcelo Albuja",
    cedula: "1710001112",
    flows: ["anexo-a"]
  },
  {
    roleName: "Director Área de Gestión",
    userName: "Director Gestión",
    cedula: "1711223344",
    flows: ["anexo-a", "anexo-b", "anexo-c"]
  },
  {
    roleName: "Revisor Área de Gestión",
    userName: "Ana Torres (Revisor)",
    cedula: "1111111111",
    flows: ["anexo-a", "anexo-b", "anexo-c"]
  },
  {
    roleName: "Director Área de Normativa",
    userName: "Director Normativa",
    cedula: "2222222222",
    flows: ["anexo-a"]
  },
  {
    roleName: "Revisor Área de Normativa",
    userName: "Revisor Normativa",
    cedula: "3333333333",
    flows: ["anexo-a"]
  },

  // ── FLUJO ANEXO B (ENROLAMIENTO COORDINADOR / ACUERDO) ──
  {
    roleName: "Coordinador Titular (Prerregistrado)",
    userName: "Roberto Dávila",
    cedula: "1715489621",
    flows: ["anexo-b"]
  },

  // ── FLUJO ANEXO C (CAMBIO DE COORDINADOR / CAM-01) ──
  {
    roleName: "Representante Institucional",
    userName: "Carlos Andrade",
    cedula: "1716789019",
    flows: ["anexo-c"]
  },

  // ── COORDINADORES INSTITUCIONALES ──
  {
    roleName: "Coordinador Titular SINARP",
    userName: "Juan Pérez",
    cedula: "1712345678",
    flows: []
  },
  {
    roleName: "Coordinador Suplente SINARP",
    userName: "Mariana Almeida",
    cedula: "1714443322",
    flows: []
  },
  {
    roleName: "Aprobador Institucional",
    userName: "Aprobador MinEduc",
    cedula: "1718956234",
    flows: []
  },

  // ── ADMINISTRACIÓN Y OTROS ROLES DINARP ──
  {
    roleName: "Administrador del Sistema",
    userName: "Admin Portal",
    cedula: "1799999999",
    flows: []
  },
  {
    roleName: "Dirección de Gestión y Registro (DGR)",
    userName: "Analista DGR",
    cedula: "1715489621",
    flows: []
  },
  {
    roleName: "Dirección de Tecnologías y Desarrollo (DTD)",
    userName: "Especialista DTD",
    cedula: "1712345602",
    flows: []
  },
  {
    roleName: "Dirección de Protección de Datos (DPI)",
    userName: "Auditor DPI",
    cedula: "1724589632",
    flows: []
  },
  {
    roleName: "Analista de Facturación",
    userName: "Analista Cobros",
    cedula: "0999999999",
    flows: []
  }
];

const FLOW_OPTIONS = [
  {
    id: "anexo-a" as FlowType,
    title: "Flujo Anexo A",
    subtitle: "Registro de Institución y Resolución Jurídica",
    description: "Solicitante, Gestión y Normativa",
    icon: FileText,
    count: 5
  },
  {
    id: "anexo-b" as FlowType,
    title: "Flujo Anexo B",
    subtitle: "Enrolamiento de Coordinador (Acuerdo)",
    description: "Coordinador Titular Prerregistrado y Gestión",
    icon: FileSignature,
    count: 3
  },
  {
    id: "anexo-c" as FlowType,
    title: "Flujo Anexo C",
    subtitle: "Cambio de Coordinador (CAM-01)",
    description: "Representante Institucional y Gestión",
    icon: ArrowLeftRight,
    count: 3
  },
  {
    id: "todos" as FlowType,
    title: "Ver todas las cuentas",
    subtitle: "Listado completo de roles y cédulas de prueba",
    description: "DINARP, instituciones, coordinadores y administradores",
    icon: Users,
    count: TEST_ACCOUNTS_DATA.length
  }
];

interface DinarpTestAccountsDrawerProps {
  onSelectCedula?: (cedula: string) => void;
}

export function DinarpTestAccountsDrawer({ onSelectCedula }: DinarpTestAccountsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCedula, setCopiedCedula] = useState<string | null>(null);

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
    if (!selectedFlow) return [];

    return TEST_ACCOUNTS_DATA.filter((acc) => {
      const matchesFlow =
        selectedFlow === "todos" ? true : acc.flows.includes(selectedFlow);

      if (!matchesFlow) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        acc.roleName.toLowerCase().includes(q) ||
        acc.userName.toLowerCase().includes(q) ||
        acc.cedula.includes(q)
      );
    });
  }, [selectedFlow, searchQuery]);

  const currentFlowConfig = FLOW_OPTIONS.find((f) => f.id === selectedFlow);

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
                onClick={() => {
                  setSelectedFlow(null);
                  setSearchQuery("");
                  setIsOpen(true);
                }}
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
              Ver roles y cédulas de prueba por flujos (Anexo A, B, C y Todos)
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
                  {selectedFlow
                    ? "Haz clic para copiar la cédula al portapapeles"
                    : "¿Deseas ver un flujo en específico o todos?"}
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

          {/* VISTA 1: CARDS DE SELECCIÓN DE FLUJO */}
          {selectedFlow === null && (
            <div className="py-2.5 space-y-2 overflow-y-auto flex-1 pr-1 -mr-1 [scrollbar-width:thin]">
              <div className="text-[11px] font-semibold text-muted-foreground px-0.5 pt-0.5 pb-1">
                Selecciona una opción para consultar sus cuentas:
              </div>

              {FLOW_OPTIONS.map((flow) => {
                const IconComponent = flow.icon;
                return (
                  <button
                    key={flow.id}
                    type="button"
                    onClick={() => {
                      setSelectedFlow(flow.id);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-3 rounded-xl border border-border/60 hover:border-border hover:bg-muted/40 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 mt-0.5">
                        <IconComponent className="size-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                            {flow.title}
                          </span>
                          <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px] px-1.5 py-0">
                            {flow.count} {flow.count === 1 ? "rol" : "roles"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-foreground/80 truncate">
                          {flow.subtitle}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {flow.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* VISTA 2: LISTA DE CUENTAS DEL FLUJO SELECCIONADO */}
          {selectedFlow !== null && (
            <div className="flex flex-col flex-1 min-h-0 pt-2 space-y-2">
              {/* Barra superior con volver y título */}
              <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFlow(null);
                    setSearchQuery("");
                  }}
                  className="h-7 px-2 text-xs font-semibold text-primary hover:text-primary/80 gap-1 -ml-1"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Volver a flujos</span>
                </Button>
                <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                  {currentFlowConfig?.title}
                </Badge>
              </div>

              {/* Buscador */}
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

              {/* Listado de Cédulas y Roles (Diseño uniforme: solo Rol, Nombre y Cédula) */}
              <div className="overflow-y-auto py-1 divide-y divide-border/40 space-y-1.5 pr-1 -mr-1 flex-1 [scrollbar-width:thin]">
                {filteredAccounts.map((acc) => {
                  const isCopied = copiedCedula === acc.cedula;
                  return (
                    <div
                      key={`${selectedFlow}-${acc.cedula}-${acc.roleName}`}
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
            </div>
          )}

          {/* Footer */}
          <div className="pt-2.5 mt-auto border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary inline-block"></span>
              <span>
                {selectedFlow
                  ? `${filteredAccounts.length} cuentas en este flujo`
                  : "Selecciona un flujo para ver sus cuentas"}
              </span>
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
