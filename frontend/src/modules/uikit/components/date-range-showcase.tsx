"use client";

import React, { useState } from "react";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { DateRangeField } from "@/components/ui/date-range-field";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const DEFAULT_RANGE: DateRange = {
  from: new Date(2026, 7, 10),
  to: new Date(2026, 7, 16),
};

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function DateRangeShowcase() {
  const [range1, setRange1] = useState<DateRange | undefined>();
  const [range2, setRange2] = useState<DateRange | undefined>(DEFAULT_RANGE);
  const [range3, setRange3] = useState<DateRange | undefined>(DEFAULT_RANGE);
  const [pickerValue, setPickerValue] = useState<DateRange | undefined>(DEFAULT_RANGE);

  return (
    <div className="space-y-14">

        {/* ─── Date Range Field ──────────────────────────────────────────── */}
        <div className="space-y-8">
          <div>
            <h2 className="text-h3 font-heading font-semibold text-foreground mb-1">Date Range Field</h2>
            <p className="text-sm text-muted-foreground">Campo útilizado para mostrar y seleccionar un período dentro de formularios o filtros.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Section title="Default (vacío)">
              <DateRangeField
                label="Período"
                value={range1}
                onChange={setRange1}
                helpText="Selecciona la fecha de inicio y fin"
              />
            </Section>

            <Section title="Con rango seleccionado">
              <DateRangeField
                label="Fechas de evento"
                value={range2}
                onChange={setRange2}
              />
            </Section>

            <Section title="Dos meses">
              <DateRangeField
                label="Rango amplio"
                value={range3}
                onChange={setRange3}
                numberOfMonths={2}
                helpText="Abre con dos meses lado a lado"
              />
            </Section>

            <Section title="Estado Error">
              <DateRangeField
                label="Período de revisión"
                state="error"
                helpText="Las fechas seleccionadas no son válidas."
                value={undefined}
              />
            </Section>

            <Section title="Deshabilitado">
              <DateRangeField
                label="Período bloqueado"
                value={DEFAULT_RANGE}
                disabled
              />
            </Section>

            <Section title="Solo lectura">
              <DateRangeField
                label="Fecha de aprobación"
                value={DEFAULT_RANGE}
                readOnly
              />
            </Section>
          </div>
        </div>

        {/* ─── Date Range Picker standalone ─────────────────────────────── */}
        <div className="space-y-8">
          <div>
            <h2 className="text-h3 font-heading font-semibold text-foreground mb-1">Date Range Picker</h2>
            <p className="text-sm text-muted-foreground">Calendario útilizado para definir visualmente la fecha de inicio y la fecha de finalización del período.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <Section title="Picker embebido (un mes)">
              <div className="overflow-hidden rounded-2xl w-fit shadow-lg">
                <DateRangePicker
                  value={pickerValue}
                  onApply={(r) => setPickerValue(r)}
                  onClear={() => setPickerValue(undefined)}
                  onCancel={() => {}}
                  numberOfMonths={1}
                />
              </div>
            </Section>

            <Section title="Picker embebido (dos meses)">
              <div className="overflow-hidden rounded-2xl w-fit shadow-lg">
                <DateRangePicker
                  value={pickerValue}
                  onApply={(r) => setPickerValue(r)}
                  onClear={() => setPickerValue(undefined)}
                  onCancel={() => {}}
                  numberOfMonths={2}
                />
              </div>
            </Section>
          </div>
        </div>

    </div>
  );
}
