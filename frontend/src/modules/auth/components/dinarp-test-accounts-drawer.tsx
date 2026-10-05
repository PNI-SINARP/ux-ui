"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  X,
  Fingerprint,
  Search,
  KeyRound,
  ArrowRight,
  User,
  Building2,
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
  institution: string;
  cedula: string;
  password?: string;
  badge?: string;
  badgeTone?: "primary" | "secondary" | "success" | "warning" | "neutral";
  highlight?: boolean;
  category: "anexo-c" | "dinarp" | "institucion" | "otros";
  targetRoute?: string;
  description?: string;
}

export const TEST_ACCOUNTS_DATA: TestAccountItem[] = [
  // ── FLUJO CAMBIO DE COORDINADOR (ANEXO C / CAM-01) ──
  {
    roleName: "Representante Institucional",
    userName: "Carlos Andrade",
    institution: "Ministerio de Educación",
    cedula: "1716789019",
    password: "Admin2026*",
    badge: "Anexo C · Inicia Solicitud",
    badgeTone: "primary",
    highlight: true,
    category: "anexo-c",
    targetRoute: "/cambio-coordinador",
    description: "Inicia el trámite CAM-01 de sustitución de Coordinador mediante Anexo C y FirmaEC."
  },
  {
    roleName: "Director Área de Gestión",
    userName: "Director Gestión",
    institution: "DINARP",
    cedula: "1711223344",
    password: "Admin2026*",
    badge: "Anexo C · Asigna Revisor",
    badgeTone: "secondary",
    highlight: true,
    category: "anexo-c",
    targetRoute: "/asignacion-solicitudes",
    description: "Recibe el Anexo C firmado y asigna a Revisor de Gestión (Ana Torres)."
  },
  {
    roleName: "Revisor Área de Gestión",
    userName: "Ana Torres (Revisor)",
    institution: "DINARP",
    cedula: "1111111111",
    password: "Admin2026*",
    badge: "Anexo C · Revisa y Dictamina",
    badgeTone: "success",
    highlight: true,
    category: "anexo-c",
    targetRoute: "/solicitudes-pendientes",
    description: "Revisa documento Anexo C, autorizaciones y dictamina Aprobación o Rechazo."
  },

  // ── COORDINADORES INSTITUCIONALES (MINEDUC) ──
  {
    roleName: "Coordinador Titular SINARP",
    userName: "Juan Pérez",
    institution: "Ministerio de Educación",
    cedula: "1712345678",
    password: "Admin2026*",
    badge: "Saliente Titular",
    badgeTone: "neutral",
    category: "institucion",
    targetRoute: "/catalogo-interoperabilidad",
    description: "Coordinador activo titular registrado en el Ministerio de Educación."
  },
  {
    roleName: "Coordinador Suplente SINARP",
    userName: "Mariana Almeida",
    institution: "Ministerio de Educación",
    cedula: "1714443322",
    password: "Temporal2026*",
    badge: "Contraseña Temporal",
    badgeTone: "warning",
    category: "institucion",
    targetRoute: "/cambiar-contrasena-temporal?cedula=1714443322",
    description: "Coordinador suplente registrado con primer acceso obligatorio."
  },
  {
    roleName: "Aprobador Institucional",
    userName: "Aprobador MinEduc",
    institution: "Ministerio de Educación",
    cedula: "1718956234",
    password: "Admin2026*",
    badge: "Aprobador",
    badgeTone: "neutral",
    category: "institucion",
    targetRoute: "/catalogo-interoperabilidad",
    description: "Autoridad institucional para validaciones internas."
  },

  // ── ADMINISTRACIÓN Y GESTIÓN DINARP ──
  {
    roleName: "Administrador del Sistema",
    userName: "Admin Portal",
    institution: "DINARP",
    cedula: "1799999999",
    password: "Admin2026*",
    badge: "Superadmin",
    badgeTone: "neutral",
    category: "dinarp",
    targetRoute: "/cuentas-internas",
    description: "Administración integral de cuentas, roles, permisos y auditoría."
  },
  {
    roleName: "Director Área de Normativa",
    userName: "Director Normativa",
    institution: "DINARP",
    cedula: "2222222222",
    password: "Admin2026*",
    badge: "Normativa",
    badgeTone: "neutral",
    category: "dinarp",
    targetRoute: "/asignacion-solicitudes",
    description: "Supervisión y asignación de solicitudes de revisión jurídica."
  },
  {
    roleName: "Revisor Área de Normativa",
    userName: "Revisor Normativa",
    institution: "DINARP",
    cedula: "3333333333",
    password: "Admin2026*",
    badge: "Normativa",
    badgeTone: "neutral",
    category: "dinarp",
    targetRoute: "/revision-normativa",
    description: "Dictámenes jurídicos y resoluciones de acceso institucional."
  },
  {
    roleName: "Dirección de Gestión y Registro (DGR)",
    userName: "Analista DGR",
    institution: "DINARP",
    cedula: "1715489621",
    password: "Admin2026*",
    badge: "DGR",
    badgeTone: "neutral",
    category: "dinarp",
    targetRoute: "/catalogo-interoperabilidad"
  },
  {
    roleName: "Dirección de Tecnologías y Desarrollo (DTD)",
    userName: "Especialista DTD",
    institution: "DINARP",
    cedula: "1712345602",
    password: "Admin2026*",
    badge: "DTD",
    badgeTone: "neutral",
    category: "dinarp",
    targetRoute: "/catalogo-interoperabilidad"
  },
  {
    roleName: "Dirección de Protección de Datos (DPI)",
    userName: "Auditor DPI",
    institution: "DINARP",
    cedula: "1724589632",
    password: "Admin2026*",
    badge: "DPI",
    badgeTone: "neutral",
    category: "dinarp",
    targetRoute: "/catalogo-interoperabilidad"
  },
  {
    roleName: "Analista de Facturación",
    userName: "Analista Cobros",
    institution: "DINARP",
    cedula: "0999999999",
    password: "Admin2026*",
    badge: "Facturación",
    badgeTone: "neutral",
    category: "otros",
    targetRoute: "/catalogo-interoperabilidad"
  }
];

interface DinarpTestAccountsDrawerProps {
  onSelectCedula?: (cedula: string, targetRoute?: string) => void;
}

export function DinarpTestAccountsDrawer({ onSelectCedula }: DinarpTestAccountsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"todos" | "anexo-c" | "dinarp" | "institucion">("todos");
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

  const handleSelect = (cedula: string, targetRoute?: string) => {
    handleCopy(cedula);
    if (onSelectCedula) {
      onSelectCedula(cedula, targetRoute);
    }
  };

  const filteredAccounts = useMemo(() => {
    return TEST_ACCOUNTS_DATA.filter((acc) => {
      const matchesFilter =
        selectedFilter === "todos"
          ? true
          : selectedFilter === "anexo-c"
          ? acc.category === "anexo-c"
          : selectedFilter === "dinarp"
          ? acc.category === "dinarp"
          : acc.category === "institucion";

      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        acc.roleName.toLowerCase().includes(q) ||
        acc.userName.toLowerCase().includes(q) ||
        acc.institution.toLowerCase().includes(q) ||
        acc.cedula.includes(q) ||
        (acc.badge && acc.badge.toLowerCase().includes(q))
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
              Ver roles y cédulas de prueba disponibles (incluye Anexo C)
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
                <h4 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                  <span>Roles y Cédulas de Prueba</span>
                  <Badge tone="primary" appearance="soft" size="sm" className="text-[10px] px-1.5 py-0">
                    Mocks
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground">
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

          {/* Barra de Búsqueda y Filtros Rápidos */}
          <div className="pt-3 pb-2 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por cédula, rol o usuario..."
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
                onClick={() => setSelectedFilter("anexo-c")}
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all shrink-0 flex items-center gap-1",
                  selectedFilter === "anexo-c"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                )}
              >
                <Sparkles className="size-2.5" />
                <span>Flujo Anexo C (3)</span>
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
                Institución
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
                DINARP
              </button>
            </div>
          </div>

          {/* Listado de Cédulas y Roles */}
          <div className="overflow-y-auto py-1 divide-y divide-border/40 space-y-1 pr-1 -mr-1 flex-1 [scrollbar-width:thin]">
            {filteredAccounts.map((acc) => {
              const isCopied = copiedCedula === acc.cedula;
              return (
                <div
                  key={acc.cedula}
                  onClick={() => handleSelect(acc.cedula, acc.targetRoute)}
                  className={cn(
                    "p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group border border-transparent",
                    acc.highlight
                      ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40 shadow-xs"
                      : "hover:bg-muted/60"
                  )}
                >
                  <div className="space-y-1 min-w-0 pr-2 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {acc.roleName}
                      </p>
                      {acc.badge && (
                        <Badge
                          tone={acc.badgeTone || "neutral"}
                          appearance="soft"
                          size="sm"
                          className="text-[9px] px-1.5 py-0 font-semibold"
                        >
                          {acc.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 text-foreground/80 font-medium truncate">
                        <User className="size-3 text-muted-foreground shrink-0" />
                        <span>{acc.userName}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-muted-foreground truncate text-[10px]">
                        <Building2 className="size-2.5 shrink-0" />
                        <span>{acc.institution}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-0.5 text-[10px]">
                      <div className="flex items-center gap-1 font-mono text-muted-foreground group-hover:text-foreground font-semibold">
                        <span>Cédula:</span>
                        <span className="text-foreground bg-muted/60 px-1 py-0.2 rounded font-mono">
                          {acc.cedula}
                        </span>
                      </div>

                      {acc.password && (
                        <div className="flex items-center gap-1 text-muted-foreground font-mono">
                          <KeyRound className="size-2.5 text-muted-foreground" />
                          <span>{acc.password}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
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

                    <div className="p-1 rounded-full text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="size-3.5" />
                    </div>
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
              <span className="size-1.5 rounded-full bg-success inline-block"></span>
              <span>Cuentas activas con auto-ingreso</span>
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
