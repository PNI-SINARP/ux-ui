"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ShieldAlert,
  Users,
  CheckCircle2,
  FileCheck2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Rol, useRolesStore } from "@/modules/roles-permisos/data/roles-store";

interface ImpactoRolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: Rol | null;
  onIniciarRetiro?: (rol: Rol) => void;
}

export function ImpactoRolDialog({
  open,
  onOpenChange,
  rol,
  onIniciarRetiro,
}: ImpactoRolDialogProps) {
  const { simularResolverDependencias } = useRolesStore();
  const [activeTab, setActiveTab] = useState<string>("cuentas");

  if (!rol) return null;

  const totalCuentas = rol.dependencias.cuentas.length;
  const totalTareas = rol.dependencias.tareas.length;
  const tieneBloqueo = totalCuentas > 0 || totalTareas > 0 || rol.esProtegido;

  const handleSimularResolver = () => {
    simularResolverDependencias(rol.id);
    toast.success(
      "Simulación completada: se han reasignado las cuentas y tareas a roles de contingencia."
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="standard"
        size="4xl"
        className="p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden"
      >
        <DialogHeader className="shrink-0 text-left border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0",
                rol.esProtegido
                  ? "bg-danger/15 text-danger"
                  : "bg-warning/15 text-warning"
              )}
            >
              {rol.esProtegido ? (
                <Lock className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-bold font-heading text-foreground">
                  Análisis de impacto y dependencias
                </DialogTitle>
                <Badge tone="primary" appearance="soft" size="sm">
                  {rol.codigo}
                </Badge>
                <Badge
                  tone={
                    rol.estado === "Activo"
                      ? "success"
                      : rol.estado === "Borrador"
                      ? "warning"
                      : "neutral"
                  }
                  appearance="outline"
                  size="sm"
                >
                  {rol.estado}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Evaluación técnica de impacto antes de operaciones de retiro o inactivación de privilegios.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Único contenedor de scroll para toda la información */}
        <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-3 space-y-4 flex-1 min-h-0">
          {/* Mensaje de Bloqueo o Alerta */}
          {rol.esProtegido ? (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs flex items-start gap-3">
              <Lock className="size-4 text-danger shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-danger">Rol de Seguridad Protegido</p>
                <p className="text-danger/90">
                  El rol <strong>Administrador del Sistema</strong> es un componente inviolable del núcleo DINARP. No puede ser retirado, inactivado ni eliminado bajo ninguna circunstancia.
                </p>
              </div>
            </div>
          ) : tieneBloqueo ? (
            <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/30 text-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-warning">
                    Operación de retiro bloqueada por dependencias no resueltas
                  </p>
                  <p className="text-muted-foreground">
                    Existen <strong>{totalCuentas} cuenta(s) activa(s)</strong> y{" "}
                    <strong>{totalTareas} tarea(s) pendiente(s)</strong> vinculadas. Debe reasignar los usuarios o finalizar los trámites antes de proceder al retiro.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSimularResolver}
                leftIcon={<Sparkles className="size-3.5" />}
                className="shrink-0 text-xs"
              >
                Simular resolución
              </Button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-xs flex items-start gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-success">Sin dependencias bloqueantes</p>
                <p className="text-muted-foreground">
                  No existen cuentas activas ni trámites pendientes dependientes de este rol. El retiro o inactivación lógica puede ejecutarse con seguridad.
                </p>
              </div>
            </div>
          )}

          {/* Pestañas de Detalle de Impacto */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-3">
              <TabsTrigger value="cuentas" className="text-xs">
                Cuentas dependientes ({totalCuentas})
              </TabsTrigger>
              <TabsTrigger value="tareas" className="text-xs">
                Tareas dependientes ({totalTareas})
              </TabsTrigger>
              <TabsTrigger value="permisos" className="text-xs">
                Impacto de permisos ({rol.dependencias.impactoPermisos.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Cuentas dependientes */}
            <TabsContent value="cuentas" className="space-y-2 mt-0">
              {totalCuentas === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <Users className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    No hay cuentas de usuario dependientes
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ningún funcionario activo tiene asignado este rol actualmente.
                  </p>
                </div>
              ) : (
                <Table className="w-full" containerClassName="overflow-x-auto w-full">
                  <TableHeader>
                    <TableRow className="border-0">
                      <TableHead className="w-[140px] whitespace-nowrap text-left font-bold pl-6">CÉDULA / ID</TableHead>
                      <TableHead className="w-[200px] whitespace-nowrap text-left font-bold">FUNCIONARIO</TableHead>
                      <TableHead className="w-[220px] whitespace-nowrap text-left font-bold">CORREO INSTITUCIONAL</TableHead>
                      <TableHead className="w-[160px] whitespace-nowrap text-left font-bold">ÁREA DINARP</TableHead>
                      <TableHead className="w-[110px] whitespace-nowrap text-right pr-6 font-bold">ESTADO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rol.dependencias.cuentas.map((c) => (
                      <TableRow key={c.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="w-[140px] font-mono pl-6 py-2.5 font-bold text-foreground align-middle">
                          {c.cedula}
                        </TableCell>
                        <TableCell className="w-[200px] font-semibold text-foreground py-2.5 text-xs align-middle">
                          {c.nombre}
                        </TableCell>
                        <TableCell className="w-[220px] font-mono text-[11px] text-muted-foreground py-2.5 align-middle">
                          {c.correo}
                        </TableCell>
                        <TableCell className="w-[160px] text-muted-foreground py-2.5 text-xs align-middle">
                          {c.ambito}
                        </TableCell>
                        <TableCell className="w-[110px] pr-6 py-2.5 text-right align-middle">
                          <div className="inline-flex justify-end w-full">
                            <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[10px] px-2 py-0.5">
                              {c.estado}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab 2: Tareas dependientes */}
            <TabsContent value="tareas" className="space-y-2 mt-0">
              {totalTareas === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <FileCheck2 className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    No hay tareas ni trámites dependientes
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    No existen expedientes en curso que dependan de las facultades de este rol.
                  </p>
                </div>
              ) : (
                <Table className="w-full" containerClassName="overflow-x-auto w-full">
                  <TableHeader>
                    <TableRow className="border-0">
                      <TableHead className="w-[150px] whitespace-nowrap text-left font-bold pl-6">CÓDIGO TRÁMITE</TableHead>
                      <TableHead className="min-w-[200px] whitespace-nowrap text-left font-bold">TÍTULO / ASUNTO</TableHead>
                      <TableHead className="w-[140px] whitespace-nowrap text-left font-bold">TIPO</TableHead>
                      <TableHead className="w-[180px] whitespace-nowrap text-left font-bold">RESPONSABLE</TableHead>
                      <TableHead className="w-[120px] whitespace-nowrap text-right pr-6 font-bold">ESTADO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rol.dependencias.tareas.map((t) => (
                      <TableRow key={t.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="w-[150px] font-mono pl-6 py-2.5 font-bold text-foreground align-middle">
                          {t.id}
                        </TableCell>
                        <TableCell className="min-w-[200px] font-medium text-foreground py-2.5 text-xs align-middle">
                          {t.titulo}
                        </TableCell>
                        <TableCell className="w-[140px] text-muted-foreground py-2.5 text-xs align-middle">
                          {t.tipo}
                        </TableCell>
                        <TableCell className="w-[180px] text-foreground py-2.5 text-xs align-middle">
                          {t.asignadoA}
                        </TableCell>
                        <TableCell className="w-[120px] pr-6 py-2.5 text-right align-middle">
                          <div className="inline-flex justify-end w-full">
                            <Badge
                              tone={t.estado === "PENDIENTE" ? "warning" : "info"}
                              appearance="soft"
                              size="sm"
                              className="font-semibold text-[10px] px-2 py-0.5"
                            >
                              {t.estado}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab 3: Impacto de permisos */}
            <TabsContent value="permisos" className="space-y-3 mt-0">
              <div className="p-4 rounded-xl border border-border bg-surface space-y-2.5">
                <p className="text-xs font-semibold text-foreground">
                  Consecuencias directas si este rol es retirado o inactivado:
                </p>
                <ul className="space-y-2">
                  {rol.dependencias.impactoPermisos.map((impacto, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="size-1.5 rounded-full bg-danger shrink-0 mt-1.5" />
                      <span>{impacto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="shrink-0 mt-3 pt-3 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="neutral"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cerrar análisis
          </Button>

          {rol.estado === "Activo" && onIniciarRetiro && (
            <Button
              type="button"
              variant="warning"
              disabled={tieneBloqueo}
              onClick={() => {
                onOpenChange(false);
                onIniciarRetiro(rol);
              }}
              rightIcon={<ArrowRight className="size-4" />}
              className="w-full sm:w-auto"
            >
              {tieneBloqueo ? "Retiro bloqueado" : "Proceder al retiro"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
