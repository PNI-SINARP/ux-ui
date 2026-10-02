"use client";

import * as React from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Sparkles, Calculator, Calendar, Smile, Settings, User, CreditCard } from "lucide-react";

export function CommandShowcase() {
  const states = [
    { id: "default", label: "Vista Previa", color: "text-primary" },
  ] as const;

  const compositions = [
    { id: "basic", label: "Básico" },
    { id: "grouped", label: "Agrupado" },
    { id: "shortcuts", label: "Con Atajos" },
  ] as const;

  return (
    <section className="grid gap-8 p-8 rounded-xl border border-border bg-background shadow-xs overflow-hidden">
      <div className="space-y-2">
        <h2 className="text-h3 font-bold flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Matriz de Componentes: Command
        </h2>
        <p className="text-sm text-muted-foreground">
          Menús de comandos rápidos y paletas de búsqueda optimizadas para navegación.
        </p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* HEADER ROW */}
          <div className="grid grid-cols-[160px_1fr] gap-6 items-end mb-6 border-b border-border pb-4">
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
              Composición
            </div>
            {states.map((state) => (
              <div key={state.id} className="text-center space-y-2">
                <div className={`text-xs font-bold ${state.color}`}>{state.label}</div>
                <div className={`text-[10px] ${state.color} bg-current/5 px-2 py-0.5 rounded-full border border-current/20 inline-block font-mono uppercase`}>
                  state=&quot;default&quot;
                </div>
              </div>
            ))}
          </div>

          {/* CONTENT ROWS */}
          <div className="space-y-8">
            {compositions.map((comp) => (
              <div key={comp.id} className="grid grid-cols-[160px_1fr] gap-6 items-start">
                {/* COMP LABEL */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold capitalize text-foreground">{comp.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">type=&quot;{comp.id}&quot;</span>
                </div>

                {/* STATE CELLS */}
                {states.map((state) => (
                  <div key={`${comp.id}-${state.id}`} className="flex justify-start w-full px-4">
                    <div className="w-full max-w-[400px] border border-primary/60 rounded-xl shadow-sm overflow-hidden">
                      <Command className="rounded-none border-none shadow-none">
                        <CommandInput placeholder="Busca un comando..." />
                        <CommandList className="max-h-[160px]">
                          <CommandEmpty>No se encontraron resultados.</CommandEmpty>

                          {comp.id === "basic" && (
                            <>
                              <CommandItem>
                                <Calendar />
                                <span>Calendario</span>
                              </CommandItem>
                              <CommandItem>
                                <Smile />
                                <span>Emojis</span>
                              </CommandItem>
                              <CommandItem>
                                <Calculator />
                                <span>Calculadora</span>
                              </CommandItem>
                            </>
                          )}

                          {comp.id === "grouped" && (
                            <>
                              <CommandGroup heading="Sugerencias">
                                <CommandItem>
                                  <Calendar />
                                  <span>Calendario</span>
                                </CommandItem>
                                <CommandItem>
                                  <Smile />
                                  <span>Emojis</span>
                                </CommandItem>
                              </CommandGroup>
                              <CommandSeparator />
                              <CommandGroup heading="Configuración">
                                <CommandItem>
                                  <Settings />
                                  <span>Ajustes</span>
                                </CommandItem>
                              </CommandGroup>
                            </>
                          )}

                          {comp.id === "shortcuts" && (
                            <>
                              <CommandItem>
                                <User />
                                <span>Perfil</span>
                                <CommandShortcut>⌘P</CommandShortcut>
                              </CommandItem>
                              <CommandItem>
                                <CreditCard />
                                <span>Facturación</span>
                                <CommandShortcut>⌘B</CommandShortcut>
                              </CommandItem>
                              <CommandItem>
                                <Settings />
                                <span>Ajustes</span>
                                <CommandShortcut>⌘S</CommandShortcut>
                              </CommandItem>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADDITIONAL FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-border pt-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Características Técnicas
          </h3>
          <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
            <li>Filtrado automático de items basado en el input.</li>
            <li>Navegación completa por teclado con estados <code className="text-foreground">selected</code> optimizados.</li>
            <li>Soporte para separadores y grupos con encabezados semánticos.</li>
            <li>Integración fluida con <code className="text-foreground">CommandShortcut</code> para Power Users.</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Navegación Eficiente
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            El componente <code className="text-foreground">Command</code> está diseñado para ser el centro neurálgico de la navegación rápida, permitiendo a los usuarios encontrar acciones y contenido sión despegar las manos del teclado.
          </p>
        </div>
      </div>
    </section>
  );
}
