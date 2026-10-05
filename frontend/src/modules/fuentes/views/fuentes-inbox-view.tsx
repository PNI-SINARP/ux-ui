"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFuentesStore } from "../data/fuentes-store";
import { EstadoFuente, FuenteDatos } from "../data/fuentes-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PublicarFuenteDialog } from "../components/publicar-fuente-dialog";
import {
  Server,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  FileEdit,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Layers,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface FuentesInboxViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

export function FuentesInboxView({ currentUser }: FuentesInboxViewProps) {
  const router = useRouter();
  const { fuentes, isLoaded, restablecerDatosDemo } = useFuentesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [fuenteAPublicar, setFuenteAPublicar] = useState<FuenteDatos | null>(null);

  const institucionActual =
    currentUser?.institution || "Dirección General de Registro Civil";
  const coordinadorNombre = currentUser?.name || "Carlos Mendoza";

  // Filter sources for this provider institution or all if admin/demo
  const fuentesFiltradas = useMemo(() => {
    return fuentes.filter((f) => {
      // Búsqueda por texto
      const matchesSearch =
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.conexion.tipo_conector.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estado
      const matchesEstado =
        estadoFilter === "ALL" ? true : f.estado === estadoFilter;

      return matchesSearch && matchesEstado;
    });
  }, [fuentes, searchTerm, estadoFilter]);

  // Contadores para métricas
  const stats = useMemo(() => {
    return {
      total: fuentes.length,
      enRevision: fuentes.filter((f) => f.estado === "EN_REVISION").length,
      devueltas: fuentes.filter((f) => f.estado === "DEVUELTA").length,
      aprobadas: fuentes.filter((f) => f.estado === "APROBADA").length,
      publicadas: fuentes.filter((f) => f.estado === "PUBLICADA").length,
    };
  }, [fuentes]);

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "BORRADOR":
        return (
          <Badge tone="neutral" appearance="soft" size="sm">
            <FileEdit className="size-3 mr-1" />
            Borrador
          </Badge>
        );
      case "CONFIGURACION":
        return (
          <Badge tone="info" appearance="soft" size="sm">
            <Clock className="size-3 mr-1" />
            Configuración
          </Badge>
        );
      case "EN_REVISION":
        return (
          <Badge tone="warning" appearance="soft" size="sm">
            <Clock className="size-3 mr-1" />
            En revisión
          </Badge>
        );
      case "DEVUELTA":
        return (
          <Badge tone="danger" appearance="soft" size="sm">
            <AlertTriangle className="size-3 mr-1" />
            Devuelta
          </Badge>
        );
      case "APROBADA":
        return (
          <Badge tone="success" appearance="soft" size="sm">
            <CheckCircle2 className="size-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "PUBLICADA":
        return (
          <Badge tone="success" appearance="solid" size="sm">
            <Globe className="size-3 mr-1" />
            Publicada
          </Badge>
        );
      default:
        return <Badge size="sm">{estado}</Badge>;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Server className="size-5" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Fuentes de Información de la Institución
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building2 className="size-3.5 text-primary" />
                {institucionActual} · Flujo BN-06 (FUE-01 → FUE-05)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={restablecerDatosDemo}
            className="text-xs gap-1.5"
            title="Restablece las fuentes de demostración iniciales"
          >
            <RotateCcw className="size-3.5" />
            Restablecer demo
          </Button>

          <Link href="/fuentes/nueva">
            <Button variant="primary" size="sm" className="text-xs gap-2 shadow-xs">
              <Plus className="size-4" />
              Nueva fuente
            </Button>
          </Link>
        </div>
      </div>

      {/* Métricas del Ciclo de Vida */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Total Fuentes
            </span>
            <span className="font-heading font-bold text-lg text-foreground">{stats.total}</span>
          </div>
          <div className="p-2 bg-muted/30 rounded-lg text-muted-foreground">
            <Layers className="size-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-warning block">
              En Revisión
            </span>
            <span className="font-heading font-bold text-lg text-warning">{stats.enRevision}</span>
          </div>
          <div className="p-2 bg-warning/10 rounded-lg text-warning">
            <Clock className="size-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-danger block">
              Devueltas
            </span>
            <span className="font-heading font-bold text-lg text-danger">{stats.devueltas}</span>
          </div>
          <div className="p-2 bg-danger/10 rounded-lg text-danger">
            <AlertTriangle className="size-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-success block">
              Aprobadas
            </span>
            <span className="font-heading font-bold text-lg text-success">{stats.aprobadas}</span>
          </div>
          <div className="p-2 bg-success/10 rounded-lg text-success">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block">
              Publicadas
            </span>
            <span className="font-heading font-bold text-lg text-primary">{stats.publicadas}</span>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Globe className="size-4" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 bg-surface rounded-xl border border-border shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, ID o conector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground shrink-0 font-medium">Estado:</span>
          <div className="flex items-center gap-1">
            {[
              { key: "ALL", label: "Todas" },
              { key: "EN_REVISION", label: "En revisión" },
              { key: "DEVUELTA", label: "Devueltas" },
              { key: "APROBADA", label: "Aprobadas" },
              { key: "PUBLICADA", label: "Publicadas" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setEstadoFilter(opt.key)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  estadoFilter === opt.key
                    ? "bg-primary text-white shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Fuentes */}
      <div className="rounded-xl border border-border overflow-hidden bg-surface shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">Fuente / ID</TableHead>
              <TableHead className="text-xs font-semibold">Conector / Versión</TableHead>
              <TableHead className="text-xs font-semibold">Modalidad</TableHead>
              <TableHead className="text-xs font-semibold">Campos</TableHead>
              <TableHead className="text-xs font-semibold">Estado</TableHead>
              <TableHead className="text-xs font-semibold">Actualización</TableHead>
              <TableHead className="text-xs font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fuentesFiltradas.length > 0 ? (
              fuentesFiltradas.map((fuente) => (
                <TableRow key={fuente.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/fuentes/${fuente.id}`}
                        className="font-semibold text-xs text-foreground hover:text-primary transition-colors block"
                      >
                        {fuente.nombre}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {fuente.id}
                        </span>
                        {fuente.estado === "DEVUELTA" && (
                          <span className="text-[10px] text-danger font-medium flex items-center gap-1">
                            <AlertTriangle className="size-3" /> Requiere corrección
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[11px]">
                        {fuente.conexion.tipo_conector}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        {fuente.version_propuesta}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {fuente.modalidades_soportadas}
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-medium text-foreground">
                      {fuente.campos.filter((c) => c.incluido).length} expuesto(s)
                    </span>
                  </TableCell>

                  <TableCell>{getEstadoBadge(fuente.estado)}</TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(fuente.fecha_actualizacion)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {fuente.estado === "APROBADA" && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setFuenteAPublicar(fuente)}
                          className="gap-1 shadow-xs"
                        >
                          <Globe className="size-3" />
                          Publicar
                        </Button>
                      )}

                      {fuente.estado === "DEVUELTA" && (
                        <Link href={`/fuentes/${fuente.id}`}>
                          <Button
                            type="button"
                            variant="warning"
                            size="sm"
                            className="gap-1 shadow-xs"
                          >
                            <AlertTriangle className="size-3" />
                            Corregir
                          </Button>
                        </Link>
                      )}

                      <Link href={`/fuentes/${fuente.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          Ver detalle
                          <ArrowRight className="size-3" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                    <Server className="size-8 text-muted-foreground/40" />
                    <p className="text-xs">No se encontraron fuentes de información registradas.</p>
                    <Link href="/fuentes/nueva">
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <Plus className="size-3.5" />
                        Registrar nueva fuente
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Publicación */}
      {fuenteAPublicar && (
        <PublicarFuenteDialog
          fuente={fuenteAPublicar}
          coordinadorNombre={coordinadorNombre}
          open={!!fuenteAPublicar}
          onOpenChange={(open) => !open && setFuenteAPublicar(null)}
          onPublicacionExitosa={() => {
            setFuenteAPublicar(null);
          }}
        />
      )}
    </div>
  );
}
