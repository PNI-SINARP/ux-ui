import * as React from "react"
import { NumberField } from "@/components/ui/number-field"

export function NumberFieldShowcase() {
  const [val, setVal] = React.useState<number | undefined>(0)

  return (
    <section className="grid gap-8">
      <div className="space-y-2">
        <h2 className="text-h3 font-bold flex items-center gap-2">
          Number Field
        </h2>
        <p className="text-sm text-muted-foreground">
          Componente para ingreso de valores numéricos con controles incrementales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NumberField
          label="Cantidad (Default)"
          placeholder="0"
          value={val}
          onValueChange={setVal}
          helpText="Mínimo 0, Máximo 20"
          min={0}
          max={20}
        />
        <NumberField
          label="Deshabilitado"
          placeholder="0"
          disabled
          value={5}
        />
        <NumberField
          label="Con Error"
          placeholder="0"
          error="Valor fuera de rango"
          value={25}
        />
        <NumberField
          label="Tamaño Pequeño"
          size="sm"
          value={10}
        />
        <NumberField
          label="Tamaño Grande"
          size="lg"
          value={100}
        />
      </div>
    </section>
  )
}
