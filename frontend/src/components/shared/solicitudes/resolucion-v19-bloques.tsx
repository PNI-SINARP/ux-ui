"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, FileText, RotateCcw, Undo2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  PAR16_VISTOS_BUENOS_ACTIVOS,
  type SolicitudIngreso,
  type VistoBuenoResolucion,
  useSolicitudesIngresoStore,
} from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

/** INS-06 / INS-07 (v19): informe técnico, cadena de vistos buenos y devolución al Analista. */

interface BloqueProps {
  solicitud: SolicitudIngreso;
  actor: string;
  rol?: string;
}

export function DevolucionResolucionAviso({ solicitud }: { solicitud: SolicitudIngreso }) {
  const dev = solicitud.devolucionResolucion;
  if (!dev) return null;
  return (
    <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-xs space-y-1">
      <div className="flex items-center gap-2 font-bold text-foreground">
        <Undo2 className="size-4 shrink-0 text-warning" />
        <span>Resolución devuelta al Analista</span>
      </div>
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        {dev.rol} ({dev.por}), {dev.instante}: “{dev.observacion}”
      </p>
    </div>
  );
}

/** INS-06 CA9: el Analista carga el informe técnico firmado y registra su resultado antes de generar la resolución. */
export function InformeTecnicoCard({ solicitud, actor, rol }: BloqueProps) {
  const { registrarInformeTecnico } = useSolicitudesIngresoStore();
  const [archivo, setArchivo] = useState("");
  const [resultado, setResultado] = useState<"Favorable" | "Desfavorable">("Favorable");
  const [motivo, setMotivo] = useState("");
  const informe = solicitud.informeTecnico;
  const esAnalista = rol === "EQ_NORMATIVA";

  if (informe) {
    return (
      <div className="p-3 bg-success/10 border border-success/30 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Informe técnico {informe.resultado.toLowerCase()} registrado</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Archivo:</span>
          <span className="font-mono text-foreground font-medium truncate max-w-[180px]">{informe.archivo}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">SHA-256:</span>
          <span className="font-mono text-foreground">{informe.hash.slice(0, 16)}…</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Cargado por:</span>
          <span className="text-foreground font-medium">{informe.autor}</span>
        </div>
      </div>
    );
  }

  if (!esAnalista) {
    return (
      <div className="p-3 bg-muted/40 border border-border rounded-xl text-[11px] text-muted-foreground">
        El Analista de Normatividad asignado debe cargar el informe técnico firmado antes de generar la resolución.
      </div>
    );
  }

  const handleRegistrar = () => {
    if (!archivo) {
      toast.error("Adjunta el informe técnico firmado en PDF.");
      return;
    }
    if (resultado === "Desfavorable" && !motivo.trim()) {
      toast.error("Ingresa el motivo del informe desfavorable.");
      return;
    }
    registrarInformeTecnico(
      solicitud.id,
      { archivo, resultado, motivo: resultado === "Desfavorable" ? motivo.trim() : undefined },
      actor
    );
    if (resultado === "Desfavorable") {
      toast.warning("Expediente rechazado por Normatividad", {
        description: "No se genera resolución ni se emiten invitaciones B; se notificó a la institución.",
      });
    } else {
      toast.success("Informe técnico favorable registrado", {
        description: "Ya puedes generar la resolución institucional.",
      });
    }
  };

  return (
    <div className="p-3 bg-surface border border-border rounded-xl text-xs space-y-3">
      <div className="flex items-center gap-2 font-bold text-foreground">
        <FileText className="size-4 shrink-0 text-primary" />
        <span>Informe técnico (obligatorio)</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Carga el informe técnico firmado sobre la información de la institución, elaborado fuera de la plataforma. Sin él no se habilita la resolución.
      </p>

      <label className="flex items-center justify-between gap-2 px-3 h-9 rounded-lg border border-dashed border-border bg-muted/20 cursor-pointer hover:border-primary/40 text-[11px]">
        <span className="flex items-center gap-2 truncate">
          <Upload className="size-3.5 text-primary shrink-0" />
          <span className="truncate">{archivo || "Adjuntar informe técnico (PDF)"}</span>
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => setArchivo(e.target.files?.[0]?.name ?? "")}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        {(["Favorable", "Desfavorable"] as const).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setResultado(op)}
            aria-pressed={resultado === op}
            className={cn(
              "h-9 rounded-lg border text-[11px] font-semibold transition-colors",
              resultado === op
                ? op === "Favorable"
                  ? "border-success bg-success/10 text-success"
                  : "border-danger bg-danger/10 text-danger"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {op}
          </button>
        ))}
      </div>

      {resultado === "Desfavorable" && (
        <div className="space-y-1.5">
          <Label htmlFor="motivo-informe" className="text-[11px] font-medium text-muted-foreground">
            Motivo del rechazo <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="motivo-informe"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="text-xs"
            placeholder="Fundamento del informe desfavorable"
          />
          <p className="text-[11px] text-danger">
            El expediente pasará a Rechazado por Normatividad: no se genera resolución ni invitaciones B.
          </p>
        </div>
      )}

      <Button type="button" variant={resultado === "Favorable" ? "primary" : "outline"} size="sm" onClick={handleRegistrar} className={cn("w-full text-xs font-semibold gap-1.5", resultado === "Desfavorable" && "text-danger border-danger/30 hover:bg-danger/10")}>
        {resultado === "Favorable" ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
        <span>{resultado === "Favorable" ? "Registrar informe favorable" : "Registrar y rechazar expediente"}</span>
      </Button>
    </div>
  );
}

function PasoVistoBueno({
  titulo,
  vb,
  activo,
}: {
  titulo: string;
  vb?: VistoBuenoResolucion;
  activo: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-[11px]">
      <span className="flex items-center gap-2 text-foreground font-medium">
        {vb ? <CheckCircle2 className={cn("size-4 shrink-0", vb.decision === "No aplica" ? "text-muted-foreground" : "text-success")} /> : <Clock className={cn("size-4 shrink-0", activo ? "text-warning" : "text-muted-foreground")} />}
        {titulo}
      </span>
      <span className="text-muted-foreground text-right">
        {vb ? (vb.decision === "No aplica" ? "No aplica (PAR-16)" : `${vb.actor} · ${vb.instante}`) : activo ? "Pendiente" : "En espera"}
      </span>
    </li>
  );
}

/** INS-06 CA10: cadena Analista → Director, desactivable por PAR-16. */
export function VistosBuenosBloque({ solicitud, actor, rol }: BloqueProps) {
  const { registrarVistoBueno } = useSolicitudesIngresoStore();
  const [devolverAbierto, setDevolverAbierto] = useState(false);
  const [observacion, setObservacion] = useState("");
  const vb = solicitud.vistosBuenos ?? {};
  const turno: "analista" | "director" | null = !vb.analista ? "analista" : !vb.director ? "director" : null;
  const puedeActuar =
    (turno === "analista" && rol === "EQ_NORMATIVA") || (turno === "director" && rol === "DIR_NORMATIVA");

  const otorgar = () => {
    if (!turno) return;
    registrarVistoBueno(solicitud.id, turno, "Visto bueno", actor);
    toast.success(turno === "analista" && PAR16_VISTOS_BUENOS_ACTIVOS.director ? "Visto bueno registrado; pendiente del Director de Normatividad" : "Resolución lista para firma de la Máxima Autoridad");
  };

  const devolver = () => {
    if (!turno) return;
    if (!observacion.trim()) {
      toast.error("La observación es obligatoria al devolver.");
      return;
    }
    registrarVistoBueno(solicitud.id, turno, "Devuelto", actor, observacion.trim());
    setDevolverAbierto(false);
    setObservacion("");
    toast.warning("Resolución devuelta al Analista");
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="p-3 bg-info/10 border border-info/30 rounded-xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-info">
          <Clock className="size-4 shrink-0" />
          <span>Resolución pendiente de vistos buenos</span>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          Antes de la firma, la resolución {solicitud.resolucion ? <strong>{solicitud.resolucion}</strong> : null} pasa por el visto bueno del Analista y del Director de Normatividad. Un visto bueno no es firma electrónica.
        </p>
        <ul className="space-y-1.5 pt-1 border-t border-info/20">
          <PasoVistoBueno titulo="Analista de Normatividad" vb={vb.analista} activo={turno === "analista"} />
          <PasoVistoBueno titulo="Director de Normatividad" vb={vb.director} activo={turno === "director"} />
        </ul>
      </div>

      {puedeActuar ? (
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="primary" size="sm" onClick={otorgar} className="text-xs font-semibold gap-1.5">
            <CheckCircle2 className="size-4" />
            <span>Dar visto bueno</span>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setDevolverAbierto(true)} className="text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10">
            <RotateCcw className="size-3.5" />
            <span>Devolver</span>
          </Button>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          {turno === "analista" ? "Turno del Analista de Normatividad que elaboró la resolución." : "Turno del Director de Normatividad."}
        </p>
      )}

      <Badge tone="neutral" appearance="outline" className="text-[10px] font-mono">
        PAR-16 · versión vigente
      </Badge>

      <DevolverDialog
        abierto={devolverAbierto}
        onOpenChange={setDevolverAbierto}
        titulo="Devolver la resolución al Analista"
        descripcion="La observación es obligatoria. Una versión nueva del borrador reinicia la cadena de vistos buenos."
        observacion={observacion}
        onObservacion={setObservacion}
        onConfirmar={devolver}
      />
    </div>
  );
}

export function DevolverDialog({
  abierto,
  onOpenChange,
  titulo,
  descripcion,
  observacion,
  onObservacion,
  onConfirmar,
}: {
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descripcion: string;
  observacion: string;
  onObservacion: (value: string) => void;
  onConfirmar: () => void;
}) {
  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold font-heading text-foreground">{titulo}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">{descripcion}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="observacion-devolucion" className="text-xs font-medium text-muted-foreground">
            Observación <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="observacion-devolucion"
            value={observacion}
            onChange={(e) => onObservacion(e.target.value)}
            rows={4}
            className="text-xs"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancelar
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onConfirmar} className="text-xs font-semibold">
            Devolver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
