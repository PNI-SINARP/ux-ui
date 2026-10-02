"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, FileText, Activity, Server, History, Play } from "lucide-react";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

const estadoPaqueteOptions = [
  { value: "Disponible para consumo", label: "Estado: Disponible para consumo" },
];

const roleOptions = [
  { value: "COORDINADOR_SINARP", label: "Coordinador SINARP" },
  { value: "APROBADOR", label: "Aprobador" },
];

export function AccesoPaqueteDetailView({ id }: { id: string }) {
  const [role, setRole] = useSimulatedRole("COORDINADOR_SINARP");
  const [estadoPaquete, setEstadoPaquete] = useState("Disponible para consumo");
  const [activeTab, setActiveTab] = useState("resumen");

  // Mock data
  const paquete = {
    id: id,
    solicitud: "SOL-2026-005",
    institucion: "Banco Pichincha",
    fuente: "SRI",
    fechaCreacion: "2026-09-22",
    responsableActual: "Coordinador SINARP",
    campos: [
      { campo: "estadoContribuyente", fuente: "Registro Único de Contribuyentes (RUC)", clasificacion: "Accesible", estado: "Aprobado" },
      { campo: "actividadEconomica", fuente: "Registro Único de Contribuyentes (RUC)", clasificacion: "Accesible", estado: "Aprobado" }
    ],
    seguimiento: [
      { fecha: "2026-09-22 09:00", evento: "Paquete creado", actor: "Sistema", observacion: "Generación de paquete inicial basada en campos aprobados." },
      { fecha: "2026-09-22 09:15", evento: "Disponible para consumo", actor: "Sistema" }
    ]
  };

  return (
    <WireframeDashboardLayout
      activeMenu="paquetes-consumo"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad" },
        { label: "Paquetes de consumo", href: "/acceso-interoperabilidad/paquetes" },
        { label: paquete.id }
      ]}
      headerSlot={
        <div className="flex gap-2">
          <Combobox
            items={estadoPaqueteOptions}
            value={estadoPaqueteOptions.find(opt => opt.value === estadoPaquete) || estadoPaqueteOptions[0]}
            onValueChange={(val) => {
              if (val) setEstadoPaquete(val.value);
            }}
          >
            <ComboboxSelectTrigger className="h-8 text-xs min-w-[210px]" />
            <ComboboxContent align="start" className="min-w-[220px]">
              <ComboboxList>
                {estadoPaqueteOptions.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Combobox
            items={roleOptions}
            value={roleOptions.find(opt => opt.value === role) || roleOptions[0]}
            onValueChange={(val) => {
              if (val) setRole(val.value as any);
            }}
          >
            <ComboboxSelectTrigger className="h-8 text-xs min-w-[170px]" />
            <ComboboxContent align="start" className="min-w-[190px]">
              <ComboboxList>
                {roleOptions.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      }
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Header Superior */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {paquete.id}
            </h1>
            <div className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
              Solicitud asociada: <strong className="text-foreground">{paquete.solicitud}</strong>
              <Link href={`/acceso-interoperabilidad/solicitudes/${paquete.solicitud}`} className="text-primary hover:underline font-medium">
                [Ver solicitud]
              </Link>
            </div>
            <div className="text-sm text-muted-foreground mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
              <p>Institución consumidora: <strong className="text-foreground block">{paquete.institucion}</strong></p>
              <p>Fuente: <strong className="text-foreground block">{paquete.fuente}</strong></p>
              <p>Fecha de creación: <strong className="text-foreground block">{paquete.fechaCreacion}</strong></p>
              <p>Responsable actual: <strong className="text-foreground block">{paquete.responsableActual}</strong></p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone="neutral" appearance="soft" size="lg">{estadoPaquete}</Badge>
          </div>
        </div>

        {/* Acciones principales por Rol / Estado */}

        {role === "COORDINADOR_SINARP" && estadoPaquete === "Disponible para consumo" && (
          <Card className="p-5 border-l-4 border-l-primary bg-primary/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-3">
                <Activity className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Tu paquete está disponible para consumo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    El paquete ha sido configurado y validado. Puedes realizar la prueba de consumo y reportar si existe algún error.
                  </p>
                </div>
              </div>
              <Button className="gap-2 shrink-0">
                <Play className="size-4" />
                Realizar prueba de consumo
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs de Detalle */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto border-b border-border h-auto p-0 bg-transparent rounded-none">
            <TabsTrigger value="resumen" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="campos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5">
              Campos autorizados
            </TabsTrigger>
            <TabsTrigger value="validacion" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5">
              Validación técnica
            </TabsTrigger>
            <TabsTrigger value="documentos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="pruebas" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5">
              Pruebas de consumo
            </TabsTrigger>
            <TabsTrigger value="seguimiento" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5">
              Seguimiento
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="resumen" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5">
                  <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                    <Server className="size-4 text-muted-foreground" />
                    Información de Acceso
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <span className="font-medium text-foreground">https://api.dinarp.gob.ec/v2/sri/consulta</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Método:</span>
                      <span className="font-medium text-foreground">POST</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-muted-foreground">Formato de respuesta:</span>
                      <span className="font-medium text-foreground">JSON / XML</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="campos" className="mt-0 outline-none">
              <Card className="overflow-hidden">
                <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                  <div>
                    <h3 className="font-semibold text-foreground">Campos autorizados</h3>
                    <p className="text-xs text-muted-foreground mt-1">El paquete contiene únicamente los campos aprobados en la solicitud asociada.</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campo</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Clasificación</TableHead>
                      <TableHead>Estado de autorización</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paquete.campos.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-foreground">{c.campo}</TableCell>
                        <TableCell>{c.fuente}</TableCell>
                        <TableCell>{c.clasificacion}</TableCell>
                        <TableCell>
                          <Badge tone="success" appearance="soft">{c.estado}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="validacion" className="mt-0 outline-none">
              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Registro de Validación Técnica (DSI)</h3>
                {estadoPaquete === "Validación técnica requerida" ? (
                  <p className="text-sm text-muted-foreground">Aún no se ha completado la validación técnica.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/20 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="size-4 text-green-500" />
                        <span className="font-medium text-foreground">Validación exitosa</span>
                        <span className="text-xs text-muted-foreground ml-auto">2026-09-22 10:30</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Paquete configurado en ambiente de producción sin novedades.</p>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="documentos" className="mt-0 outline-none">
              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Documentos relacionados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Manual de acceso.pdf", "Respuesta_formal_oficio.pdf"].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface">
                      <div className="flex items-center gap-3">
                        <FileText className="size-8 text-red-400" />
                        <span className="text-sm font-medium text-foreground truncate">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm">Descargar</Button>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="pruebas" className="mt-0 outline-none">
              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Pruebas de consumo</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Registre los resultados de sus pruebas de integración con la fuente expuesta.
                </p>
                
                {estadoPaquete === "Disponible para consumo" && (
                  <div className="space-y-4 border border-border rounded-lg p-5 bg-surface">
                    <h4 className="text-sm font-semibold">Registrar resultado de prueba</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 justify-start">
                        <CheckCircle2 className="size-4 mr-2" /> Favorable
                      </Button>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 justify-start">
                        <AlertTriangle className="size-4 mr-2" /> Con error (Reportar)
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-3">Historial de pruebas</h4>
                  <div className="p-4 bg-muted/20 border border-border rounded-lg text-sm text-muted-foreground text-center">
                    No hay pruebas registradas aún.
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="seguimiento" className="mt-0 outline-none">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                  <History className="size-4 text-muted-foreground" />
                  Línea de tiempo del paquete
                </h3>
                <div className="relative pl-6 border-l border-border/80 ml-2 space-y-8">
                  {paquete.seguimiento.map((s, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[30px] top-1 rounded-full bg-surface border-2 border-primary w-4 h-4" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">{s.evento}</span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-md">{s.actor}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{s.fecha}</span>
                        {s.observacion && (
                          <p className="text-sm text-foreground mt-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                            {s.observacion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </WireframeDashboardLayout>
  );
}
