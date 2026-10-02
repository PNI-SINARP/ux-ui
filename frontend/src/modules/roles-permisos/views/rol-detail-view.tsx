"use client";

import React, { useState } from "react";
import {
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  Edit2,
  RotateCcw,
  UserX,
  Trash2,
  AlertTriangle,
  History,
  Users,
  Layers,
  Lock,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { Rol, useRolesStore } from "@/modules/roles-permisos/data/roles-store";
import { EditarRolModal } from "@/modules/roles-permisos/components/editar-rol-modal";
import { ImpactoRolDialog } from "@/modules/roles-permisos/components/impacto-rol-dialog";
import {
  AccionRolDialog,
  TipoAccionRol,
} from "@/modules/roles-permisos/components/accion-rol-dialog";

interface RolDetailViewProps {
  rolId: string;
  onVolver: () => void;
}

export function RolDetailView({ rolId, onVolver }: RolDetailViewProps) {
  const { roles } = useRolesStore();
  const rol = roles.find((r) => r.id === rolId);

  // Modales
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [impactoModalOpen, setImpactoModalOpen] = useState(false);
  const [accionModalOpen, setAccionModalOpen] = useState(false);
  const [accionTipo, setAccionTipo] = useState<TipoAccionRol | null>(null);

  if (!rol) {
    return (
      <Card className="bg-surface rounded-2xl border border-border p-8 text-center space-y-4">
        <AlertCircle className="size-10 text-danger mx-auto" />
        <h2 className="text-xl font-bold font-heading text-foreground">
          Rol no encontrado
        </h2>
        <p className="text-sm text-muted-foreground">
          El rol con identificador {rolId} no existe o fue eliminado.
        </p>
        <Button variant="primary" onClick={onVolver} leftIcon={<ArrowLeft className="size-4" />}>
          Volver a la lista de roles
        </Button>
      </Card>
    );
  }

  const handleOpenAccion = (tipo: TipoAccionRol) => {
    setAccionTipo(tipo);
    setAccionModalOpen(true);
  };

  const getEstadoBadge = (estado: Rol["estado"]) => {
    switch (estado) {
      case "Activo":
        return (
          <Badge tone="success" appearance="solid" size="md">
            Activo
          </Badge>
        );
      case "Borrador":
        return (
          <Badge tone="warning" appearance="solid" size="md">
            Borrador
          </Badge>
        );
      case "Inactivo":
        return (
          <Badge tone="danger" appearance="solid" size="md">
            Inactivo (Retirado)
          </Badge>
        );
    }
  };

  const totalCuentas = rol.dependencias.cuentas.length;
  const totalTareas = rol.dependencias.tareas.length;
  const tieneDependencias = totalCuentas > 0 || totalTareas > 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Barra superior de navegación y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onVolver}
          leftIcon={<ArrowLeft className="size-4" />}
          className="self-start text-xs font-semibold"
        >
          Volver a Roles y Permisos
        </Button>

        {/* Acciones contextuales del detalle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ver Impacto */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImpactoModalOpen(true)}
            leftIcon={<ShieldAlert className="size-4 text-warning" />}
            className="text-xs text-warning border-warning/40 hover:bg-warning/10 hover:text-warning"
          >
            Ver impacto
          </Button>

          {/* Editar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditarModalOpen(true)}
            leftIcon={<Edit2 className="size-4" />}
            className="text-xs"
          >
            Editar rol
          </Button>

          {/* Activar (Borrador -> Activo) */}
          {rol.estado === "Borrador" && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleOpenAccion("activar")}
              leftIcon={<UserCheck className="size-4" />}
              className="text-xs"
            >
              Activar rol
            </Button>
          )}

          {/* Reactivar (Inactivo -> Activo) */}
          {rol.estado === "Inactivo" && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleOpenAccion("reactivar")}
              leftIcon={<RotateCcw className="size-4" />}
              className="text-xs"
            >
              Reactivar rol
            </Button>
          )}

          {/* Retirar (Activo -> Inactivo) */}
          {rol.estado === "Activo" && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleOpenAccion("retirar")}
              leftIcon={<UserX className="size-4" />}
              disabled={rol.esProtegido}
              className="text-xs"
            >
              Retirar rol
            </Button>
          )}

          {/* Eliminar borrador nunca usado */}
          {rol.estado === "Borrador" && rol.nuncaUsado && rol.cuentasAsociadas === 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleOpenAccion("eliminar_borrador")}
              leftIcon={<Trash2 className="size-4" />}
              className="text-xs"
            >
              Eliminar borrador
            </Button>
          )}
        </div>
      </div>

      {/* Encabezado Principal del Rol */}
      <Card className="bg-surface rounded-2xl border border-border shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-muted-foreground uppercase bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                {rol.codigo}
              </span>
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                {rol.version}
              </span>
              {getEstadoBadge(rol.estado)}
              {rol.esProtegido && (
                <Badge tone="danger" appearance="soft" size="md" icon={<Lock className="size-3" />}>
                  Rol Protegido
                </Badge>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-foreground">
              {rol.nombre}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
              {rol.descripcion}
            </p>
          </div>

          {/* Tarjeta lateral de metadatos rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 shrink-0 lg:w-64 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border lg:pl-6">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Cuentas asociadas
              </span>
              <span className="text-lg font-bold font-heading text-foreground">
                {rol.cuentasAsociadas} usuarios
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Capacidades
              </span>
              <span className="text-lg font-bold font-heading text-primary">
                {rol.capacidades.length} autorizadas
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Última auditoría
              </span>
              <span className="text-xs font-medium text-muted-foreground block truncate">
                {rol.ultimaActualizacion}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Alerta de bloqueo por dependencias en detalle si está Activo */}
      {rol.estado === "Activo" && tieneDependencias && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-warning text-sm">
                Dependencias operativas activas
              </p>
              <p className="text-muted-foreground">
                Este rol tiene <strong>{totalCuentas} cuenta(s)</strong> y <strong>{totalTareas} tarea(s)</strong> asignadas actualmente.
                Para poder retirarlo, todas las dependencias deben ser reasignadas o concluidas.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImpactoModalOpen(true)}
            className="shrink-0 text-xs"
          >
            Ver dependencias
          </Button>
        </div>
      )}

      {/* Sección 1: Capacidades autorizadas requeridas */}
      <Card className="bg-surface rounded-2xl border border-border shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              Capacidades autorizadas ({rol.capacidades.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permisos y facultades específicas que este rol otorga en los módulos del geoportal.
            </p>
          </div>
        </div>

        <Table className="w-full" containerClassName="overflow-x-auto w-full">
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="w-[180px] min-w-[160px] whitespace-nowrap text-left pl-6 font-bold">
                CÓDIGO DE CAPACIDAD
              </TableHead>
              <TableHead className="w-[120px] min-w-[100px] whitespace-nowrap text-left font-bold">
                ACCIÓN
              </TableHead>
              <TableHead className="w-[180px] min-w-[160px] whitespace-nowrap text-left font-bold">
                ÁMBITO
              </TableHead>
              <TableHead className="min-w-[280px] text-left pr-6 font-bold">
                DESCRIPCIÓN Y ALCANCE
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rol.capacidades.map((cap) => (
              <TableRow key={cap.codigo} className="transition-colors hover:bg-muted/40">
                <TableCell className="w-[180px] min-w-[160px] font-mono pl-6 font-bold text-foreground align-middle">
                  {cap.codigo}
                </TableCell>
                <TableCell className="w-[120px] min-w-[100px] align-middle">
                  <Badge tone="info" appearance="soft" size="sm" className="font-semibold text-xs px-2.5 py-0.5">
                    {cap.accion}
                  </Badge>
                </TableCell>
                <TableCell className="w-[180px] min-w-[160px] align-middle">
                  <Badge tone="neutral" appearance="soft" size="sm" className="text-xs px-2.5 py-0.5 font-medium">
                    {cap.ambito}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[280px] text-muted-foreground pr-6 align-middle">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground text-xs">
                      {cap.nombre}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {cap.descripcion}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Sección 2: Cuentas Asociadas */}
      <Card className="bg-surface rounded-2xl border border-border shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Cuentas asociadas ({rol.dependencias.cuentas.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Funcionarios que actualmente operan bajo el perfil y facultades de este rol.
            </p>
          </div>
        </div>

        {rol.dependencias.cuentas.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl">
            <Users className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">
              No hay cuentas asignadas a este rol
            </p>
            <p className="text-[11px] text-muted-foreground">
              Las cuentas pueden asignarse desde el módulo de <strong>Cuentas internas</strong>.
            </p>
          </div>
        ) : (
          <Table className="w-full" containerClassName="overflow-x-auto w-full">
            <TableHeader>
              <TableRow className="border-0">
                <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-left pl-6 font-bold">CÉDULA / ID</TableHead>
                <TableHead className="w-[240px] min-w-[200px] whitespace-nowrap text-left font-bold">FUNCIONARIO</TableHead>
                <TableHead className="w-[260px] min-w-[220px] whitespace-nowrap text-left font-bold">CORREO INSTITUCIONAL</TableHead>
                <TableHead className="w-[180px] min-w-[160px] whitespace-nowrap text-left font-bold">ÁREA DINARP</TableHead>
                <TableHead className="w-[130px] min-w-[110px] whitespace-nowrap text-right pr-6 font-bold">ESTADO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rol.dependencias.cuentas.map((c) => (
                <TableRow key={c.id} className="transition-colors hover:bg-muted/40">
                  <TableCell className="w-[150px] min-w-[140px] font-mono pl-6 font-bold text-foreground align-middle">
                    {c.cedula}
                  </TableCell>
                  <TableCell className="w-[240px] min-w-[200px] font-semibold text-foreground text-xs align-middle">
                    {c.nombre}
                  </TableCell>
                  <TableCell className="w-[260px] min-w-[220px] font-mono text-xs text-muted-foreground align-middle">
                    {c.correo}
                  </TableCell>
                  <TableCell className="w-[180px] min-w-[160px] text-xs text-muted-foreground align-middle">
                    {c.ambito}
                  </TableCell>
                  <TableCell className="w-[130px] min-w-[110px] text-right pr-6 align-middle">
                    <div className="inline-flex justify-end w-full">
                      <Badge tone="success" appearance="soft" size="sm" className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center">
                        {c.estado}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Sección 3: Historial de Auditoría */}
      <Card className="bg-surface rounded-2xl border border-border shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <History className="size-5 text-primary" />
              Bitácora de auditoría y versionado ({rol.auditoria.length} registros)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registro inmutable de trazabilidad con autor, motivo, versión y fecha de cada cambio.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rol.auditoria.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    tone={
                      item.tipoAccion === "CREACION"
                        ? "primary"
                        : item.tipoAccion === "ACTIVACION"
                        ? "success"
                        : item.tipoAccion === "RETIRO"
                        ? "danger"
                        : item.tipoAccion === "REACTIVACION"
                        ? "warning"
                        : "neutral"
                    }
                    appearance="soft"
                    size="sm"
                    className="font-bold text-[9px]"
                  >
                    {item.tipoAccion}
                  </Badge>
                  <span className="font-mono font-bold text-primary">
                    {item.version}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    {item.fecha}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="font-semibold text-foreground">
                    Motivo: &ldquo;{item.motivo}&rdquo;
                  </p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {item.detalles}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground shrink-0 sm:self-center">
                <User className="size-3.5" />
                <span className="font-medium text-[11px]">{item.autor}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modales integrados */}
      <EditarRolModal
        open={editarModalOpen}
        onOpenChange={setEditarModalOpen}
        rol={rol}
      />
      <ImpactoRolDialog
        open={impactoModalOpen}
        onOpenChange={setImpactoModalOpen}
        rol={rol}
        onIniciarRetiro={() => {
          setAccionTipo("retirar");
          setAccionModalOpen(true);
        }}
      />
      <AccionRolDialog
        open={accionModalOpen}
        onOpenChange={setAccionModalOpen}
        rol={rol}
        tipo={accionTipo}
        onSuccess={() => {
          if (accionTipo === "eliminar_borrador") {
            onVolver();
          }
        }}
      />
    </div>
  );
}
