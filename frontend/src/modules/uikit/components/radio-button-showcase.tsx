import * as React from "react"
import { RadioButtonField } from "@/components/ui/radio-button"

const riskOptions = [
  { label: "Alto", value: "alto" },
  { label: "Medio", value: "medio" },
  { label: "Bajo", value: "bajo" },
]

const disabledOptions = [
  { label: "Alto (Activo)", value: "alto" },
  { label: "Medio (Deshabilitado)", value: "medio", disabled: true },
  { label: "Bajo", value: "bajo" },
]

export function RadioButtonShowcase() {
  const [val1, setVal1] = React.useState("alto")
  const [val2, setVal2] = React.useState("medio")
  
  return (
    <section className="grid gap-8">
      <div className="space-y-2">
        <h2 className="text-h3 font-bold flex items-center gap-2">
          Radio Button
        </h2>
        <p className="text-sm text-muted-foreground">
          Selección única entre opciones mutuamente excluyentes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RadioButtonField
          label="Nivel de Riesgo (Vertical)"
          options={riskOptions}
          value={val1}
          onChange={setVal1}
          helpText="Selecciona un nivel de riesgo."
        />

        <RadioButtonField
          label="Nivel de Riesgo (Horizontal)"
          orientation="horizontal"
          options={riskOptions}
          value={val2}
          onChange={setVal2}
        />

        <RadioButtonField
          label="Opciones Deshabilitadas"
          options={disabledOptions}
          value="bajo"
        />

        <RadioButtonField
          label="Grupo con Error"
          options={riskOptions}
          value=""
          error="Debes seleccionar una opción."
        />

        <RadioButtonField
          label="Todo el grupo deshabilitado"
          options={riskOptions}
          value="medio"
          disabled
        />
      </div>
    </section>
  )
}
