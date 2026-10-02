import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";

export function RadialButtonShowcase() {
  const variants = [
    {
      id: "primary",
      description: "Para la acción principal de una pantalla o flujo.",
    },
    {
      id: "secondary",
      description:
        "Para acciones importantes, pero de menor prioridad que la principal.",
    },
    {
      id: "success",
      description:
        "Para acciones asociadas a aprobación, finalización o resultado positivo.",
    },
    {
      id: "warning",
      description: "Para acciones que requieren precaución antes de continuar.",
    },
    {
      id: "danger",
      description:
        "Para acciones destructivas o de alto impacto, como eliminar o cancelar definitivamente.",
    },
    {
      id: "neutral",
      description:
        "Para acciones generales que no necesitan una prioridad visual destacada.",
    },
    {
      id: "ghost",
      description:
        "Para acciones secundarias de baja prioridad visual, sin fondo permanente.",
    },
    {
      id: "info",
      description:
        "Para acciones relacionadas con consulta, ayuda o información adicional.",
    },
  ] as const;

  const sizes = [
    { id: "lg", label: "Large", px: "56px" },
    { id: "default", label: "Default", px: "44px" },
    { id: "sm", label: "Small", px: "36px" },
    { id: "icon", label: "Icon", px: "44px" },
    { id: "icon-xs", label: "Icon XS", px: "28px" },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* HEADER ROW */}
          <div className="grid grid-cols-[240px_repeat(5,1fr)] gap-6 items-end mb-6 border-b border-border pb-4">
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
              Variante
            </div>
            {sizes.map((size) => (
              <div key={size.id} className="text-center space-y-1">
                <div className="text-xs font-bold text-foreground">
                  {size.label}
                </div>
                <div className="text-[11px] text-primary-300 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 inline-block font-mono">
                  {size.px}
                </div>
              </div>
            ))}
          </div>

          {/* CONTENT ROWS */}
          <div className="space-y-8">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="grid grid-cols-[240px_repeat(5,1fr)] gap-6 items-center border-b border-border/40 pb-6 last:border-0 last:pb-0"
              >
                {/* VARIANT LABEL */}
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-semibold capitalize text-foreground">
                    {variant.id}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    variant=&quot;{variant.id}&quot;
                  </span>
                  <span className="text-[10px] text-muted-foreground/80 leading-tight mt-1">
                    {variant.description}
                  </span>
                </div>

                {/* SIZE CELLS */}
                {sizes.map((size) => (
                  <div
                    key={`${variant.id}-${size.id}`}
                    className="flex justify-center px-1"
                  >
                    <Button
                      variant={variant.id}
                      size={
                        size.id as "default" | "sm" | "lg" | "icon" | "icon-xs"
                      }
                      className={
                        !size.id.includes("icon") ? "w-full max-w-[160px]" : ""
                      }
                      leftIcon={
                        size.id.includes("icon") ? (
                          <Plus
                            className={
                              size.id === "icon-xs" ? "size-3" : "size-5"
                            }
                          />
                        ) : undefined
                      }
                    >
                      {!size.id.includes("icon") && "Acción"}
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
