"use client";

import React from "react";
import { SubSection } from "./sub-section";
import { Card } from "@/components/ui/card";
import { TextCursorInput, AlignLeft, CalendarRange, ListFilter, X, CircleDot, FormInput, Hash, CheckSquare, ToggleLeft, Calendar, Search as SearchIcon } from "lucide-react";

import { InputGroupShowcase } from "./input-group-showcase";
import { TextareaShowcase } from "./textarea-showcase";
import { SearchShowcase } from "./search-showcase";
import { ComboboxShowcase } from "./combobox-showcase";
import { CheckboxShowcase } from "./checkbox-showcase";
import { SwitchShowcase } from "./switch-showcase";
import { CalendarShowcase } from "./calendar-showcase";
import { DateRangeShowcase } from "./date-range-showcase";
import { NumberFieldShowcase } from "./number-field-showcase";
import { MultiselectShowcase } from "./multiselect-showcase";
import { RadioButtonShowcase } from "./radio-button-showcase";
import { Slider } from "@/components/ui/slider";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Search } from "@/components/ui/search";
import { DataChip } from "@/components/ui/data-display";

export function FormsFiltersShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const [sliderVal, setSliderVal] = React.useState([50]);
  const [rangeVal, setRangeVal] = React.useState([20, 80]);
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      <SubSection
        icon={TextCursorInput} id="text-field"
        registerSection={registerSection}
        title="Campo de texto (Text Field)"
        description="Permite ingresar información de texto en formularios y mostrar estados de validación, ayudas o acciones complementarias."
      >
        <InputGroupShowcase />
      </SubSection>

      <SubSection
        icon={Hash} id="number-field"
        registerSection={registerSection}
        title="Campo numérico (Number Field)"
        description="Permite ingresar valores numéricos y ajustarlos fácilmente mediante controles de incremento o disminución."
      >
        <NumberFieldShowcase />
      </SubSection>

      <SubSection
        icon={AlignLeft} id="textarea"
        registerSection={registerSection}
        title="Área de texto (textarea)"
        description="Permite ingresar textos más extensos, como observaciones, comentarios o descripciones."
      >
        <TextareaShowcase />
      </SubSection>

      <SubSection
        icon={SearchIcon} id="search-field"
        registerSection={registerSection}
        title="Campo de búsqueda (Search Field)"
        description="Permite buscar información dentro del sistema y limpiar rápidamente el término ingresado."
      >
        <SearchShowcase />
      </SubSection>

      <SubSection
        icon={FormInput} id="combobox"
        registerSection={registerSection}
        title="Cuadro combinado (Combobox)"
        description="Permite buscar y seleccionar una opción dentro de una lista, especialmente cuando existen muchas alternativas."
      >
        <ComboboxShowcase />
      </SubSection>

      <SubSection
        icon={ListFilter} id="multiselect"
        registerSection={registerSection}
        title="Selección múltiple (Multiselect)"
        description="Permite seleccionar varias opciones dentro de una misma lista y visualizar las selecciones aarealizadas."
      >
        <MultiselectShowcase />
      </SubSection>

      <SubSection
        icon={CheckSquare} id="checkbox"
        registerSection={registerSection}
        title="Casilla de verificación (Checkbox)"
        description="Permite seleccionar una o varias opciones independientes dentro de un formulario o configuración."
      >
        <CheckboxShowcase />
      </SubSection>

      <SubSection
        icon={CircleDot} id="radio-button"
        registerSection={registerSection}
        title="Botón de radio (Radio Button)"
        description="Permite seleccionar una única opción entre varias alternativas disponibles."
      >
        <RadioButtonShowcase />
      </SubSection>

      <SubSection
        icon={ToggleLeft} id="switch"
        registerSection={registerSection}
        title="Interruptor (Switch)"
        description="Permite activar o desactivar rápidamente una configuración o funcionalidad."
      >
        <SwitchShowcase />
      </SubSection>

      <SubSection
        icon={Calendar} id="date-picker"
        registerSection={registerSection}
        title="Selector de fecha (Date Picker)"
        description="Permite seleccionar una fecha específica mediante un calendario."
      >
        <CalendarShowcase />
      </SubSection>

      <SubSection
        icon={CalendarRange} id="date-range"
        registerSection={registerSection}
        title="Rango de fechas (Date Range)"
        description="Permite seleccionar un período definido por una fecha de inicio y una fecha de finalización."
      >
        <DateRangeShowcase />
      </SubSection>

      {/* SLIDER */}
      <SubSection
        icon={SlidersHorizontal} id="slider"
        registerSection={registerSection}
        title="Slider"
        description="Componente base reútilizable para selección de un valor dentro de un rango."
      >
        <div className="flex flex-col gap-6 max-w-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Opacidad de capa</span>
              <span className="text-sm text-muted-foreground">{sliderVal[0]}%</span>
            </div>
            <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium opacity-50">Deshabilitado</span>
            </div>
            <Slider disabled value={[30]} max={100} step={1} />
          </div>
        </div>
      </SubSection>





      {/* FILTER BAR Y APPLIED FILTERS */}
      <SubSection
        icon={Filter} id="filter-bar"
        registerSection={registerSection}
        title="Barra de Filtros y Filtros Aplicados"
        description="Patrón reútilizable para listados, que combina búsquedas, selectores y muestra los filtros activos."
      >
        <div className="flex flex-col gap-4 border border-border/40 p-4 sm:p-5 rounded-2xl bg-surface shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-full sm:w-72">
              <Search placeholder="Buscar incidentes, folios o usuarios..." className="h-10 bg-background" />
            </div>
            <Button variant="secondary" className="h-10 px-4 gap-2 border-border font-medium">
              <Filter className="h-4 w-4" />
              Filtros
              <Badge tone="primary" appearance="soft" className="ml-1 rounded-full px-1.5 py-0 min-w-5 h-5 justify-center text-[10px] font-bold">3</Badge>
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" className="h-10 text-muted-foreground hover:text-foreground">
              Limpiar filtros
            </Button>
          </div>

          {/* Applied Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <span className="text-[13px] font-semibold text-muted-foreground mr-1">Filtros activos:</span>
            <Badge tone="primary" appearance="soft" className="pl-3 pr-1 py-1 rounded-full text-[11px] h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25">
              Estado: Activo
              <button type="button" className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"><X className="size-3" /></button>
            </Badge>
            <Badge tone="primary" appearance="soft" className="pl-3 pr-1 py-1 rounded-full text-[11px] h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25">
              Zona: Norte
              <button type="button" className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"><X className="size-3" /></button>
            </Badge>
            <Badge tone="neutral" appearance="soft" className="pl-3 pr-1 py-1 rounded-full text-[11px] h-7 gap-1 font-semibold bg-muted text-foreground border border-border">
              Úúúltimos 30 días
              <button type="button" className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer"><X className="size-3" /></button>
            </Badge>
          </div>
        </div>
      </SubSection>

    </div>
  );
}

