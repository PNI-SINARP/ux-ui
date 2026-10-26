"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileSignature,
  FileText,
  Search as SearchIcon,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase,
  Database,
  Lock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  History,
  Send,
  UserCheck,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Check,
  ShieldCheck,
  Plus,
  Edit,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FormalizacionContratosView() {
  const {
    solicitudes,
    generarContrato,
    editarBorradorContrato,
    enviarContratoAFirmas,
    firmarContrato
  } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("ALL");

  // Modales
  const [modalGenerar, setModalGenerar] = useState<SolicitudAcceso | null>(null);
  const [modalEditar, setModalEditar] = useState<SolicitudAcceso | null>(null);
  const [modalEnviarFirmas, setModalEnviarFirmas] = useState<SolicitudAcceso | null>(null);
  const [modalFirmar, setModalFirmar] = useState<{ solicitud: SolicitudAcceso; rol: "COORDINADOR_SINARP" | "MAXIMA_AUTORIDAD" } | null>(null);

  // Form states
  const [cantidadContratada, setCantidadContratada] = useState<number>(50000);
  const [clausulas, setClausulas] = useState<string>(
    "Cláusula Primera: Objeto del Intercambio de Información. Cláusula Segunda: Tarifas y Recaudación según ordenanza institucional vigente. Cláusula Tercera: Confidencialidad y Seguridad de la Información conforme LOPDP."
  );
  const [cambiosEdicion, setCambiosEdicion] = useState<string>("Ajuste de cláusula de vigencia y cupo transaccional.");

  // Filtrar exclusivamente solicitudes privadas en formalización contractual
  const privadasEnContratacion = useMemo(() => {
    return solicitudes.filter((s) => s.tipoInstitucion === "Privada");
  }, [solicitudes]);

  const filtered = useMemo(() => {
    return privadasEnContratacion.filter((s) => {
      const contrato = s.contratoDetalle;
      const estadoContrato = contrato?.estado || (s.contrato ? "Firmado" : "Sin contrato");

      if (estadoFilter !== "ALL" && estadoContrato !== estadoFilter) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.institucion.toLowerCase().includes(term) ||
        (s.proyectoNombre && s.proyectoNombre.toLowerCase().includes(term)) ||
        (s.contrato && s.contrato.toLowerCase().includes(term)) ||
        (contrato?.numero && contrato.numero.toLowerCase().includes(term))
      );
    });
  }, [privadasEnContratacion, estadoFilter, searchTerm]);

  const handleGenerarSubmit = () => {
    if (!modalGenerar) return;
    generarContrato(modalGenerar.id, {
      cantidadContratada,
      clausulas,
      autor: "Abg. Santiago Valdivieso (Especialista Jurídico DINARP)"
    });
    toast.success("Contrato generado en estado Borrador", {
      description: "El borrador contractual puede ser revisado y editado antes del envío a firmas."
    });
    setModalGenerar(null);
  };

  const handleEditarSubmit = () => {
    if (!modalEditar) return;
    editarBorradorContrato(modalEditar.id, {
      cantidadContratada,
      clausulas,
      autor: "Abg. Santiago Valdivieso (Jurídica)",
      cambios: cambiosEdicion
    });
    toast.success("Borrador de contrato actualizado", {
      description: "Se incrementó la versión del documento. Si ya estaba en firmas, se requiere nueva suscripción."
    });
    setModalEditar(null);
  };

  const handleEnviarFirmasSubmit = () => {
    if (!modalEnviarFirmas) return;
    enviarContratoAFirmas(modalEnviarFirmas.id, "Abg. Santiago Valdivieso (Jurídica)");
    toast.success("Contrato remitido al circuito de firmas", {
      description: "Notificado al Coordinador SINARP de la entidad y a la Máxima Autoridad de DINARP."
    });
    setModalEnviarFirmas(null);
  };

  const handleFirmarSubmit = () => {
    if (!modalFirmar) return;
    const { solicitud, rol } = modalFirmar;
    firmarContrato(
      solicitud.id,
      rol,
      rol === "COORDINADOR_SINARP"
        ? `${solicitud.coordinador} (Coordinador SINARP)`
        : "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)"
    );
    toast.success("Firma electrónica registrada exitosamente", {
      description: rol === "COORDINADOR_SINARP"
        ? "Firma del Coordinador asentada."
        : "Firma de la Máxima Autoridad DINARP asentada."
    });
    setModalFirmar(null);
  };

  return (
    <WireframeDashboardLayout
      activeMenu="formalizacion-contratos"
      currentRole="JURIDICA"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="primary" appearance="soft" className="font-semibold text-xs">
                Asesoría Jurídica
              </Badge>
              <span className="text-xs text-muted-foreground">DOC-01 + DOC-02 + DOC-03</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Contratos de Interoperabilidad para Entidades Privadas
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Generación de instrumentos contractuales bilaterales, control de versiones pre-firma y seguimiento de suscripción electrónica por las partes legalmente acreditadas.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/formalizacion">
              <FileText className="size-4 text-primary" />
              Bandeja General de Formalización
            </Link>
          </Button>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 border border-border bg-surface shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Borradores en elaboración</span>
            <p className="text-2xl font-bold text-foreground mt-2">
              {privadasEnContratacion.filter((s) => s.contratoDetalle?.estado === "Borrador").length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Edición técnica de cláusulas</p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Pendientes de firmas</span>
            <p className="text-2xl font-bold text-foreground mt-2">
              {privadasEnContratacion.filter((s) => s.contratoDetalle?.estado === "Pendiente de firmas").length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Circuito bilateral activo</p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Contratos firmados</span>
            <p className="text-2xl font-bold text-foreground mt-2">
              {privadasEnContratacion.filter((s) => s.contratoDetalle?.estado === "Firmado" || s.contrato).length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Listos para pago o aprobados</p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Sin contrato generado</span>
            <p className="text-2xl font-bold text-foreground mt-2">
              {privadasEnContratacion.filter((s) => !s.contratoDetalle && !s.contrato).length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Peticiones aprobadas por Gestión</p>
          </Card>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-muted/60 rounded-xl border border-border">
              {["ALL", "Borrador", "Pendiente de firmas", "Firmado"].map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setEstadoFilter(est)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                    estadoFilter === est ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {est === "ALL" ? "Todos los contratos" : est}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-72">
            <Search
              placeholder="Buscar por institución, código o contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              className="w-full bg-background"
            />
          </div>
        </div>

        {/* Tabla de Contratos */}
        <Card className="border border-border bg-surface overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N.º Contrato</TableHead>
                <TableHead>Institución Privada</TableHead>
                <TableHead>Solicitud base</TableHead>
                <TableHead>Fuente autorizada</TableHead>
                <TableHead className="text-center">Versión</TableHead>
                <TableHead>Estado firmas</TableHead>
                <TableHead className="text-right">Acciones contractuales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <FileSignature className="size-8 stroke-1 text-muted-foreground/60" />
                      <p className="text-sm font-medium">No se encontraron contratos privados bajo este criterio.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => {
                  const contrato = s.contratoDetalle;
                  const numeroContrato = contrato?.numero || s.contrato || "Pendiente generar";
                  const estado = contrato?.estado || (s.contrato ? "Firmado" : "Sin instrumento");
                  const version = contrato?.version || (s.contrato ? 1 : 0);

                  return (
                    <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-foreground font-mono">
                        {numeroContrato}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate" title={s.institucion}>
                        {s.institucion}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`} className="hover:underline text-primary">
                          {s.id}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-muted-foreground">
                        {s.fuentePrincipal || s.fuentes?.[0]?.nombre}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge tone="neutral" appearance="soft" className="font-mono text-xs">
                          v{version}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            estado === "Firmado"
                              ? "success"
                              : estado === "Pendiente de firmas"
                              ? "warning"
                              : "primary"
                          }
                          appearance="soft"
                          className="text-xs"
                        >
                          {estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Si no existe contrato */}
                          {!contrato && !s.contrato && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setModalGenerar(s);
                                setCantidadContratada(s.cupo || 50000);
                              }}
                              className="gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
                            >
                              <Plus className="size-3.5" />
                              Generar contrato
                            </Button>
                          )}

                          {/* Si está en Borrador */}
                          {contrato?.estado === "Borrador" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setModalEditar(s);
                                  setCantidadContratada(contrato.cantidadContratada || 100000);
                                  setClausulas(contrato.clausulas || "");
                                }}
                                className="gap-1.5 text-xs"
                              >
                                <Edit className="size-3.5" />
                                Editar borrador
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setModalEnviarFirmas(s)}
                                className="gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
                              >
                                <Send className="size-3.5" />
                                Enviar a firmas
                              </Button>
                            </>
                          )}

                          {/* Si está Pendiente de firmas */}
                          {contrato?.estado === "Pendiente de firmas" && (
                            <div className="flex items-center gap-1.5">
                              {!contrato.firmadoCoordinador && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setModalFirmar({ solicitud: s, rol: "COORDINADOR_SINARP" })}
                                  className="text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5"
                                >
                                  <FileSignature className="size-3.5" />
                                  Firma Coordinador
                                </Button>
                              )}
                              {!contrato.firmadoMaximaAutoridad && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setModalFirmar({ solicitud: s, rol: "MAXIMA_AUTORIDAD" })}
                                  className="text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5"
                                >
                                  <FileSignature className="size-3.5" />
                                  Firma Máxima Autoridad
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setModalEditar(s);
                                  setCantidadContratada(contrato.cantidadContratada || 100000);
                                  setClausulas(contrato.clausulas || "");
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                                title="Editar requerirá re-firmar el contrato"
                              >
                                <Edit className="size-3.5" />
                              </Button>
                            </div>
                          )}

                          {/* Si está Firmado */}
                          {(estado === "Firmado" || contrato?.estado === "Firmado") && (
                            <Badge tone="success" appearance="soft" className="gap-1 text-xs">
                              <CheckCircle2 className="size-3" />
                              Suscrito bilateralmente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal Generar Contrato (DOC-01) */}
      <Dialog open={!!modalGenerar} onOpenChange={(open) => !open && setModalGenerar(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              Generar Contrato de Interoperabilidad Privado
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Se creará la versión preliminar <strong className="text-foreground">v1 (Borrador)</strong> del contrato bilateral conforme al marco legal de la DINARP.
            </DialogDescription>
          </DialogHeader>

          {modalGenerar && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-1">
                <p><span className="text-muted-foreground">Institución privada:</span> <strong className="text-foreground">{modalGenerar.institucion}</strong></p>
                <p><span className="text-muted-foreground">Proyecto:</span> <strong className="text-foreground">{modalGenerar.proyectoNombre}</strong></p>
                <p><span className="text-muted-foreground">Fuente:</span> <strong className="text-foreground">{modalGenerar.fuentePrincipal || modalGenerar.fuentes?.[0]?.nombre}</strong></p>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">Cantidad de consultas transaccionales contratadas:</label>
                <input
                  type="number"
                  value={cantidadContratada}
                  onChange={(e) => setCantidadContratada(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">Cláusulas contractuales y acuerdos de nivel de servicio:</label>
                <textarea
                  rows={4}
                  value={clausulas}
                  onChange={(e) => setClausulas(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setModalGenerar(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleGenerarSubmit} className="gap-1.5 bg-primary text-primary-foreground font-semibold">
              <Check className="size-4" />
              Generar borrador de contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Borrador (DOC-03) */}
      <Dialog open={!!modalEditar} onOpenChange={(open) => !open && setModalEditar(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Edit className="size-5 text-primary" />
              Editar Borrador de Contrato
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Modificación técnica de cláusulas. <span className="text-destructive font-medium">Nota: Si el contrato ya estaba en firmas, se invalidarán las firmas anteriores y se requerirá nueva suscripción de la nueva versión.</span>
            </DialogDescription>
          </DialogHeader>

          {modalEditar && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">Cantidad contratada:</label>
                <input
                  type="number"
                  value={cantidadContratada}
                  onChange={(e) => setCantidadContratada(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background font-mono"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">Cláusulas del contrato:</label>
                <textarea
                  rows={4}
                  value={clausulas}
                  onChange={(e) => setClausulas(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">Motivo del cambio de versión:</label>
                <input
                  type="text"
                  value={cambiosEdicion}
                  onChange={(e) => setCambiosEdicion(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
                  placeholder="Ej: Corrección de tarifas acordadas"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setModalEditar(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleEditarSubmit} className="gap-1.5 bg-primary text-primary-foreground font-semibold">
              <Check className="size-4" />
              Guardar nueva versión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Enviar a Firmas (DOC-02) */}
      <Dialog open={!!modalEnviarFirmas} onOpenChange={(open) => !open && setModalEnviarFirmas(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Send className="size-5 text-primary" />
              Enviar Contrato a Firmas Bilaterales
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              El instrumento quedará en estado <strong className="text-foreground">"Pendiente de firmas"</strong>. El Coordinador SINARP y la Máxima Autoridad DINARP deberán suscribir electrónicamente antes de pasar a la etapa de facturación y pago.
            </DialogDescription>
          </DialogHeader>

          {modalEnviarFirmas && (
            <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-1.5 my-2">
              <p><span className="text-muted-foreground">Contrato:</span> <strong className="text-foreground">{modalEnviarFirmas.contratoDetalle?.numero}</strong> (v{modalEnviarFirmas.contratoDetalle?.version})</p>
              <p><span className="text-muted-foreground">Firmante 1:</span> {modalEnviarFirmas.coordinador} (Coordinador SINARP)</p>
              <p><span className="text-muted-foreground">Firmante 2:</span> Dra. Cristina Álvarez (Directora Ejecutiva DINARP)</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setModalEnviarFirmas(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleEnviarFirmasSubmit} className="gap-1.5 bg-primary text-primary-foreground font-semibold">
              <Send className="size-4" />
              Confirmar y notificar para firmas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Simular Firma (Para Demo DOC-02) */}
      <Dialog open={!!modalFirmar} onOpenChange={(open) => !open && setModalFirmar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <FileSignature className="size-5 text-primary" />
              Suscripción Electrónica de Contrato
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Registro formal de la firma electrónica calificada en el expediente contractual.
            </DialogDescription>
          </DialogHeader>

          {modalFirmar && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1">
                <p><span className="text-muted-foreground">Contrato:</span> <strong className="text-foreground">{modalFirmar.solicitud.contratoDetalle?.numero}</strong></p>
                <p>
                  <span className="text-muted-foreground">Actor que suscribe:</span>{" "}
                  <strong className="text-foreground">
                    {modalFirmar.rol === "COORDINADOR_SINARP" ? "Coordinador SINARP de la Entidad" : "Máxima Autoridad DINARP"}
                  </strong>
                </p>
              </div>
              <p className="text-muted-foreground">
                Se estampará sello de tiempo y constancia digital de suscripción en el repositorio documental oficial.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setModalFirmar(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleFirmarSubmit} className="gap-1.5 bg-primary text-primary-foreground font-semibold">
              <Check className="size-4" />
              Registrar firma electrónica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
