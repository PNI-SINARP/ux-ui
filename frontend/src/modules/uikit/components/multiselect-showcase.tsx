import * as React from "react"
import { Multiselect } from "@/components/ui/multiselect"

const mockOptions = [
  { value: "inundacion", label: "Inundación" },
  { value: "remocion", label: "Remoción en masa" },
  { value: "sismo", label: "Sismo" },
  { value: "volcanica", label: "Erupción volcánica" },
  { value: "tsunami", label: "Tsunami" },
  { value: "incendio", label: "Incendio forestal" },
]

export function MultiselectShowcase() {
  const [selected1, setSelected1] = React.useState<string[]>(["inundacion", "remocion"])
  const [selected2, setSelected2] = React.useState<string[]>(["inundacion", "remocion", "sismo", "volcanica"])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="max-w-sm">
          <Multiselect
            label="Amenazas (Pocas selecciones)"
            options={mockOptions}
            selected={selected1}
            onChange={setSelected1}
            helpText="Muestra chips individualmente"
          />
        </div>
        
        <div className="max-w-sm">
          <Multiselect
            label="Amenazas (Muchas selecciones)"
            options={mockOptions}
            selected={selected2}
            onChange={setSelected2}
            maxCount={2}
            helpText="Agrupa los chips excedentes"
          />
        </div>

        <div className="max-w-sm">
          <Multiselect
            label="Deshabilitado"
            options={mockOptions}
            selected={["sismo"]}
            onChange={() => {}}
            disabled
          />
        </div>

        <div className="max-w-sm">
          <Multiselect
            label="Con Error"
            options={mockOptions}
            selected={[]}
            onChange={() => {}}
            state="error"
            helpText="Debes seleccionar al menos una amenaza"
          />
        </div>
    </div>
  )
}
