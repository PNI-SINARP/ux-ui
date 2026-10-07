"use client";

import { useState } from "react";
import {
  CoordinadorInstitucional,
  CaracterCoordinador,
  InstitucionConfig
} from "../data/cambio-coordinador-store";
import { FormNuevoCoordinadorData } from "./coordinador-entrante-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import {
  FileText,
  ShieldCheck,
  Scale,
  Calendar,
  Hash,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  UserX,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatosInstrumentoAnexoC {
  tipoDocumento: string;
  numeroDocumento: string;
  fechaVigencia: string;
  motivoSustitucion: string;
  garantiaContinuidad: boolean;
  declaracionNormativa: boolean;
}

interface AnexoCFormProps {
  institucion: InstitucionConfig;
  caracter: CaracterCoordinador;
  coordinadorSaliente: CoordinadorInstitucional;
  coordinadorEntrante: FormNuevoCoordinadorData;
  initialData?: Partial<DatosInstrumentoAnexoC>;
  onContinuar: (datos: DatosInstrumentoAnexoC) => void;
  onVolver: () => void;
}

const TIPOS_DOCUMENTO = [
  { id: "Acción de Personal", label: "Acción de Personal", desc: "Movimiento de personal o nombramiento interno" },
  { id: "Resolución Administrativa", label: "Resolución Administrativa", desc: "Resolución formal emitida por la institución" },
  { id: "Acuerdo Ministerial", label: "Acuerdo Ministerial", desc: "Acuerdo suscrito por el Ministro o Viceministro" },
  { id: "Poder Especial Notariado", label: "Poder Notariado", desc: "Escritura pública o delegación legal notariada" }
];

export function AnexoCForm({
  institucion,
  caracter,
  coordinadorSaliente,
  coordinadorEntrante,
  initialData,
  onContinuar,
  onVolver
}: AnexoCFormProps) {
  const [tipoDocumento, setTipoDocumento] = useState<string>(
    initialData?.tipoDocumento || "Acción de Personal"
  );
  const [numeroDocumento, setNumeroDocumento] = useState<string>(
    initialData?.numeroDocumento || "2026-DP-094"
  );
  const [fechaVigencia, setFechaVigencia] = useState<string>(
    initialData?.fechaVigencia || "A partir de la presente suscripción y confirmación DINARP"
  );
  const [motivoSustitucion, setMotivoSustitucion] = useState<string>(
    initialData?.motivoSustitucion || coordinadorEntrante.motivo || "Designación y reorganización de funciones institucionales de la entidad."
  );
  const [garantiaContinuidad, setGarantiaContinuidad] = useState<boolean>(
    initialData?.garantiaContinuidad ?? true
  );
  const [declaracionNormativa, setDeclaracionNormativa] = useState<boolean>(
    initialData?.declaracionNormativa ?? true
  );

  const [errores, setErrores] = useState<{
    numeroDocumento?: string;
    motivoSustitucion?: string;
    garantiaContinuidad?: string;
    declaracionNormativa?: string;
  }>({});

  const handleValidarYContinuar = () => {
    const nuevosErrores: typeof errores = {};

    if (!numeroDocumento.trim()) {
      nuevosErrores.numeroDocumento = "Ingresa el número o código oficial del documento de designación.";
    }

    if (!motivoSustitucion.trim() || motivoSustitucion.trim().length < 15) {
      nuevosErrores.motivoSustitucion = "Ingresa una justificación formal detallada (mínimo 15 caracteres).";
    }

    if (!garantiaContinuidad) {
      nuevosErrores.garantiaContinuidad = "Debes ratificar la continuidad operativa institucional de los servicios.";
    }

    if (!declaracionNormativa) {
      nuevosErrores.declaracionNormativa = "Debes aceptar la declaración juramentada y compromiso normativo SINARP/LOPDP.";
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    onContinuar({
      tipoDocumento,
      numeroDocumento: numeroDocumento.trim(),
      fechaVigencia: fechaVigencia.trim(),
      motivoSustitucion: motivoSustitucion.trim(),
      garantiaContinuidad,
      declaracionNormativa
    });
  };

  return (
    <div className="space-y-6">
      {/* Subcontenido 2.1: Instrumento Jurídico Anexo C */}
      <div className="bg-primary/5 dark:bg-primary-950/20 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
        <div className="flex items-start gap-2.5 min-w-0">
          <FileText className="size-4 text-primary dark:text-primary-300 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 leading-snug">
              2.1 Datos del Instrumento Anexo C
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completa el respaldo administrativo, causales de sustitución y declaraciones para generar el documento formal ARP-R03.
            </p>
          </div>
        </div>
        <Badge
          tone="primary"
          appearance="soft"
          size="sm"
          className="shrink-0 self-start sm:self-auto font-bold uppercase tracking-wider"
        >
          {caracter === "TITULAR" ? "RELEVO TITULAR" : "RELEVO SUPLENTE"}
        </Badge>
      </div>

      {/* Resumen compacto de partes comparecientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0">
              <UserX className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Funcionario Saliente</p>
              <p className="font-semibold text-foreground truncate max-w-[200px]">{coordinadorSaliente.nombreCompleto}</p>
              <p className="text-[11px] text-muted-foreground font-mono">CI: {coordinadorSaliente.cedula}</p>
            </div>
          </div>
          <Badge tone="danger" appearance="soft" size="sm" className="font-mono text-[9px]">
            CESADO
          </Badge>
        </div>

        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-primary">Funcionario Entrante</p>
              <p className="font-semibold text-foreground truncate max-w-[200px]">{coordinadorEntrante.nombreCompleto}</p>
              <p className="text-[11px] text-muted-foreground font-mono">CI: {coordinadorEntrante.cedula}</p>
            </div>
          </div>
          <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[9px]">
            DESIGNADO
          </Badge>
        </div>
      </div>

      {/* ── SECCIÓN 1: RESPALDO ADMINISTRATIVO Y DOCUMENTO HABILITANTE ── */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span>Respaldo Administrativo de la Designación (Cláusula Tercera)</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indica el acto administrativo formal que autoriza la asignación del nuevo coordinador en la institución.
          </p>
        </div>

        {/* Tipo de Documento Habilitante */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">
            Tipo de Acto Administrativo <span className="text-danger">*</span>
          </Label>
          <RadioGroup
            value={tipoDocumento}
            onValueChange={setTipoDocumento}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          >
            {TIPOS_DOCUMENTO.map((item) => {
              const isSelected = tipoDocumento === item.id;
              return (
                <label
                  key={item.id}
                  htmlFor={`tipo-${item.id}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-surface hover:bg-muted/30"
                  )}
                >
                  <RadioGroupItem
                    value={item.id}
                    id={`tipo-${item.id}`}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground leading-none">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Número de Documento y Vigencia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Número o Código Oficial del Documento"
            htmlFor="numero-documento"
            required
            error={errores.numeroDocumento}
            description="Ej: 2026-DP-094 o MINEDUC-CZ9-2026-0045-R"
          >
            <InputGroup
              state={errores.numeroDocumento ? "error" : "default"}
              leftIcon={<Hash className="size-4 text-muted-foreground" />}
            >
              <InputGroupInput
                id="numero-documento"
                type="text"
                placeholder="Ej: 2026-DP-094"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                className="text-xs font-mono"
              />
            </InputGroup>
          </FormField>

          <FormField
            label="Fecha / Condición de Vigencia"
            htmlFor="fecha-vigencia"
            required
            description="Efectividad jurídica de la nueva designación"
          >
            <InputGroup leftIcon={<Calendar className="size-4 text-muted-foreground" />}>
              <InputGroupInput
                id="fecha-vigencia"
                type="text"
                placeholder="Ej: A partir de la presente suscripción y confirmación DINARP"
                value={fechaVigencia}
                onChange={(e) => setFechaVigencia(e.target.value)}
                className="text-xs"
              />
            </InputGroup>
          </FormField>
        </div>
      </div>

      {/* ── SECCIÓN 2: JUSTIFICACIÓN INSTITUCIONAL DEL CAMBIO ── */}
      <div className="space-y-3 pt-2">
        <FormField
          label="Justificación y Causal del Cambio (Cláusula Tercera)"
          htmlFor="motivo-sustitucion"
          required
          error={errores.motivoSustitucion}
          description="Detalla la motivación institucional (reestructuración administrativa, cese de funciones, fin de período)."
        >
          <Textarea
            id="motivo-sustitucion"
            rows={3}
            placeholder="Ej: Reestructuración administrativa institucional y asignación de nuevas responsabilidades operativas en la Dirección de Tecnología."
            value={motivoSustitucion}
            onChange={(e) => setMotivoSustitucion(e.target.value)}
            className={cn("text-xs resize-none", errores.motivoSustitucion && "border-danger focus-visible:ring-danger")}
          />
        </FormField>
      </div>

      {/* ── SECCIÓN 3: GARANTÍA DE CONTINUIDAD OPERATIVA ── */}
      <div className="p-4 rounded-xl border border-success/30 bg-success/5 space-y-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground">
              Garantía Expresa de Continuidad Operativa (Cláusula Cuarta)
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Los proyectos aprobados, solicitudes de interoperabilidad en trámite, contratos de adhesión, cupos de consumo y credenciales técnicas de integración de la institución <strong>permanecen plenamente vigentes, inalterados y operativos</strong>.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-success/20">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              id="check-continuidad"
              checked={garantiaContinuidad}
              onCheckedChange={(checked) => setGarantiaContinuidad(Boolean(checked))}
              className="mt-0.5 shrink-0"
            />
            <span className="text-xs text-foreground font-medium leading-snug">
              Ratifico que el presente cambio es un relevo de nómina administrativa y no afecta la vigencia de los contratos ni las integraciones tecnológicas del SINARP. <span className="text-danger">*</span>
            </span>
          </label>
          {errores.garantiaContinuidad && (
            <p className="text-[11px] text-danger flex items-center gap-1 font-medium mt-1">
              <AlertTriangle className="size-3.5" /> {errores.garantiaContinuidad}
            </p>
          )}
        </div>
      </div>

      {/* ── SECCIÓN 4: DECLARACIÓN JURADA Y COMPROMISO NORMATIVO ── */}
      <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
        <div className="flex items-start gap-2.5">
          <Scale className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground">
              Declaración de Responsabilidad y Normativa SINARP / LOPDP (Cláusula Quinta)
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              La entidad compareciente y el nuevo funcionario designado se someten a las auditorías periódicas de accesos, lineamientos de seguridad de la información y la normativa de protección de datos personales.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              id="check-declaracion"
              checked={declaracionNormativa}
              onCheckedChange={(checked) => setDeclaracionNormativa(Boolean(checked))}
              className="mt-0.5 shrink-0"
            />
            <span className="text-xs text-foreground font-medium leading-snug">
              Declaro bajo fe de juramento la veracidad de los datos y me comprometo al estricto cumplimiento normativo institucional del SINARP. <span className="text-danger">*</span>
            </span>
          </label>
          {errores.declaracionNormativa && (
            <p className="text-[11px] text-danger flex items-center gap-1 font-medium mt-1">
              <AlertTriangle className="size-3.5" /> {errores.declaracionNormativa}
            </p>
          )}
        </div>
      </div>

      {/* Acciones de Navegación del Paso 2 */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="neutral"
          size="default"
          onClick={onVolver}
          className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
        >
          <ArrowLeft className="size-4" />
          <span>Anterior: Datos del nuevo coordinador</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={handleValidarYContinuar}
          className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
        >
          <span>Continuar: Revisar borrador</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
