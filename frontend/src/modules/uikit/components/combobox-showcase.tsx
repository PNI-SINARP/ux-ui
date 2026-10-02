"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { Sparkles, CheckCircle2, AlertCircle, Info } from "lucide-react";

const fruits = [
  { value: "apple", label: "Manzana" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Arándano" },
  { value: "grapes", label: "Uvas" },
  { value: "orange", label: "Naranja" },
  { value: "strawberry", label: "Fresa" },
];

function ComboboxExample({
  variant,
  stateId
}: {
  variant: { id: string; label: string; showClear: boolean; disabled: boolean };
  stateId: string
}) {
  const [value, setValue] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const filteredFruits = React.useMemo(() => {
    return fruits.filter((fruit) =>
      fruit.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleValueChange = (val: string | null) => {
    setValue(val);
    if (val) {
      const fruit = fruits.find(f => f.value === val);
      if (fruit) setSearch(fruit.label);
    } else {
      setSearch("");
    }
  };

  const handleInputValueChange = (newSearch: string) => {
    // Si la librería intenta poner el ID (ej: apple) en el input, 
    // lo interceptamos y ponemos el Label (ej: Manzana)
    const fruit = fruits.find(f => f.value === newSearch);
    if (fruit) {
      setSearch(fruit.label);
    } else {
      setSearch(newSearch);
    }
  };

  return (
    <Combobox
      value={variant.disabled ? null : value}
      onValueChange={handleValueChange}
      disabled={variant.disabled}
      inputValue={search}
      onInputValueChange={handleInputValueChange}
    >
      <ComboboxInput
        state={stateId as React.ComponentProps<typeof ComboboxInput>["state"]}
        placeholder="Selecciona..."
        showClear={true}
        disabled={variant.disabled}
        className="w-full"
      />
      <ComboboxContent state={stateId as React.ComponentProps<typeof ComboboxContent>["state"]}>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>Frutas</ComboboxLabel>
            {filteredFruits.map((fruit) => (
              <ComboboxItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
          {filteredFruits.length === 0 && (
            <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function ComboboxShowcase() {
  const states = [
    { id: "default", label: "Default", color: "text-primary" },
    { id: "success", label: "Success", color: "text-success" },
    { id: "error", label: "Error", color: "text-danger" },
  ] as const;

  const variants = [
    { id: "standard", label: "Estándar", showClear: true, disabled: false },
    { id: "clearable", label: "Con Limpieza", showClear: true, disabled: false },
    { id: "disabled", label: "Deshabilitado", showClear: true, disabled: true },
  ] as const;

  return (
    <div className="space-y-8">

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[1000px]">
          {/* HEADER ROW */}
          <div className="grid grid-cols-[160px_repeat(3,1fr)] gap-6 items-end mb-6 border-b border-border pb-4">
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
              Variante
            </div>
            {states.map((state) => (
              <div key={state.id} className="text-center space-y-2">
                <div className={`text-xs font-bold ${state.color}`}>{state.label}</div>
                <div className={`text-[10px] ${state.color} bg-current/5 px-2 py-0.5 rounded-full border border-current/20 inline-block font-mono uppercase`}>
                  state=&quot;{state.id}&quot;
                </div>
              </div>
            ))}
          </div>

          {/* CONTENT ROWS */}
          <div className="space-y-8">
            {variants.map((variant) => (
              <div key={variant.id} className="grid grid-cols-[160px_repeat(3,1fr)] gap-6 items-center">
                {/* VARIANT LABEL */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold capitalize text-foreground">{variant.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">type=&quot;{variant.id}&quot;</span>
                </div>

                {/* STATE CELLS */}
                {states.map((state) => (
                  <div key={`${variant.id}-${state.id}`} className="flex justify-center w-full">
                    <ComboboxExample
                      variant={variant}
                      stateId={state.id}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXTERNAL LABEL SECTION */}
      <div className="space-y-6 pt-4 border-t border-border">
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Con Label Externo
          </h3>
          <p className="text-xs text-muted-foreground">
            Uso de una etiqueta descriptiva fuera del componente para mejor accesibilidad y claridad.
          </p>
        </div>

        <div className="max-w-xs space-y-2">
          <label className="text-sm font-semibold text-foreground ml-1">
            Selecciona tu fruta favorita
          </label>
          <ComboboxExample
            variant={{ id: "standard", label: "Estándar", showClear: true, disabled: false }}
            stateId="default"
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-border pt-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Características
          </h3>
          <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
            <li>Filtrado en tiempo aareal basado en el input del usuario.</li>
            <li>Soporte nativo para navegación por teclado (flechas, enter, esc).</li>
            <li>Gestión de estados vacíos y grupos de opciones con etiquetas.</li>
            <li>Integración perfecta con el sistema de validación visual.</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Validaciones Visuales
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="size-3.5" />
              <span>Estado **Success**: Indica una selección válida o verificada.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-danger">
              <AlertCircle className="size-3.5" />
              <span>Estado **Error**: Resalta problemas de validación o campos obligatorios.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-3.5" />
              <span>Estado **Disabled**: Bloquea la interacción manteniendo la legibilidad.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
