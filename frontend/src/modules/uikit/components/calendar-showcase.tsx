"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateField } from "@/components/ui/date-field";

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

export function CalendarShowcase() {
  const [date1, setDate1] = React.useState<Date | undefined>();
  const [date2, setDate2] = React.useState<Date | undefined>(new Date(2026, 7, 14));
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 7, 14));

  return (
    <div className="space-y-14">
      
      {/* ─── Date Field ─────────────────────────────────────────────── */}
      <div className="space-y-8">
        <div>
          <h2 className="text-h3 font-heading font-semibold text-foreground mb-1">Date Field</h2>
          <p className="text-sm text-muted-foreground">Campo útilizado para mostrar y seleccionar una fecha específica dentro de formularios o filtros.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Section title="Default / vacío">
            <DateField
              label="Fecha del evento"
              value={date1}
              onChange={setDate1}
            />
          </Section>

          <Section title="Con fecha seleccionada">
            <DateField
              label="Fecha de nacimiento"
              value={date2}
              onChange={setDate2}
            />
          </Section>

          <Section title="Estado Error">
            <DateField
              label="Fecha de vencimiento"
              state="error"
              helpText="La fecha seleccionada no es válida."
              value={undefined}
            />
          </Section>

          <Section title="Deshabilitado">
            <DateField
              label="Fecha bloqueada"
              value={new Date()}
              disabled
            />
          </Section>

          <Section title="Solo lectura">
            <DateField
              label="Fecha de aprobación"
              value={new Date()}
              readOnly
            />
          </Section>
        </div>
      </div>

      {/* ─── Date Picker standalone ─────────────────────────────────── */}
      <div className="space-y-8">
        <div>
          <h2 className="text-h3 font-heading font-semibold text-foreground mb-1">Date Picker</h2>
          <p className="text-sm text-muted-foreground">Calendario independiente útilizado para seleccionar una fecha. Puede usarse embebido o como base de otros componentes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <Section title="Picker embebido">
            <div className="overflow-hidden rounded-2xl w-fit shadow-lg bg-popover text-popover-foreground border border-border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
              />
            </div>
          </Section>
        </div>
      </div>
      
    </div>
  );
}
