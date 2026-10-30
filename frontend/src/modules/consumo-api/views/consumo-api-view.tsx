"use client";

import React, { useState } from "react";
import { Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dato, ExcepcionalShell, useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import { numero, useConsumoStore } from "../data/consumo-store";
import { ConsultaPanel, PruebasPanel, SaldoPanel } from "../components/consumo-uso";
import { ProgramacionPanel } from "../components/consumo-programacion";
import { AmpliacionesPanel } from "../components/consumo-ampliaciones";

export function ConsumoApiView() {
  const { accesos, listo } = useConsumoStore();
  const { institucion, rol } = useActor();
  const [sel, setSel] = useState<string>("");
  const propios = rol === "COORDINADOR_SINARP" ? accesos.filter((a) => a.institucion === institucion) : accesos;
  const a = propios.find((x) => x.id === sel) ?? propios[0];

  return (
    <ExcepcionalShell
      activeMenu="consumo-api"
      etiqueta="API-01 a API-06 · ADD-01 a ADD-07"
      titulo="Consumo por API"
      descripcion="Prueba tu credencial, consulta uno o varios registros, sigue el saldo y los eventos, programa un consumo masivo y amplía el alcance de una solicitud habilitada sin crear otra."
      icono={<Plug className="size-32 text-primary" />}
    >
      {!listo || !a ? (
        <p className="text-xs text-muted-foreground">{listo ? "No hay accesos habilitados para tu institución." : "Cargando…"}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4 items-start">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Solicitud habilitada</span>
              <Select value={a.id} onValueChange={setSel}>
                <SelectTrigger aria-label="Solicitud habilitada" className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propios.map((x) => (
                    <SelectItem key={x.id} value={x.id}>
                      {x.id} · {x.fuente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-border p-3">
              <Dato etiqueta="Tipo">
                <Badge tone={a.tipo === "Privada" ? "primary" : "info"} appearance="soft" size="sm">
                  {a.tipo}
                </Badge>
              </Dato>
              <Dato etiqueta="Credencial">
                <span className="font-mono">{a.credencial}</span>
              </Dato>
              <Dato etiqueta="Campos autorizados">{a.camposAutorizados.length} · alcance v{a.versionAlcance}</Dato>
              <Dato etiqueta={a.tipo === "Privada" ? "Cupo autorizado" : "Cupo de referencia"}>{numero(a.cupoAutorizado)}</Dato>
            </div>
          </div>

          <Tabs defaultValue="uso" className="gap-4">
            <TabsList className="flex-wrap h-auto justify-start">
              <TabsTrigger value="uso">Pruebas y consulta</TabsTrigger>
              <TabsTrigger value="saldo">Saldo y eventos</TabsTrigger>
              <TabsTrigger value="masivo">Programación masiva</TabsTrigger>
              <TabsTrigger value="ampliaciones">Ampliaciones</TabsTrigger>
            </TabsList>
            <TabsContent value="uso" className="space-y-5">
              <PruebasPanel key={`p-${a.id}`} a={a} />
              <ConsultaPanel key={`c-${a.id}`} a={a} />
            </TabsContent>
            <TabsContent value="saldo">
              <SaldoPanel a={a} />
            </TabsContent>
            <TabsContent value="masivo">
              <ProgramacionPanel a={a} />
            </TabsContent>
            <TabsContent value="ampliaciones">
              <AmpliacionesPanel a={a} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </ExcepcionalShell>
  );
}
