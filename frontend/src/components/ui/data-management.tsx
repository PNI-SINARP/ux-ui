"use client"

/**
 * data-management.tsx
 * ───────────────────
 * Componentes para gestión de datos, formulación de metadatos,
 * mapeo de campos, resúmenes de validación e historial de ejecuciones.
 */

import * as React from "react"
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw, FileText,
  Table, ArrowRight, Upload, AlertCircle, ChevronDown, Check, FileCheck
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── 1. Validation Summary & Error List ──────────────────────────────────────

export interface ValidationErrorItem {
  row?: number
  field: string
  message: string
  type: "error" | "warning"
}

export function ValidationSummary({
  totalRows,
  validRows,
  errorsCount,
  warningsCount,
  errors = []
}: {
  totalRows: number
  validRows: number
  errorsCount: number
  warningsCount: number
  errors?: ValidationErrorItem[]
}) {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-5 space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h4 className="text-sm font-bold text-foreground">Resumen de Validación de Datos</h4>
          <p className="text-xs text-muted-foreground">{totalRows} registros procesados</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success" appearance="soft">{validRows} Válidos</Badge>
          {errorsCount > 0 && <Badge tone="error" appearance="soft">{errorsCount} Errores</Badge>}
          {warningsCount > 0 && <Badge tone="warning" appearance="soft">{warningsCount} Avisos</Badge>}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {errors.map((err, idx) => (
            <div
              key={idx}
              className={cn(
                "p-3 rounded-xl border text-xs flex items-start gap-2.5",
                err.type === "error"
                  ? "bg-danger/5 border-danger/20 text-danger"
                  : "bg-warning/5 border-warning/20 text-warning"
              )}
            >
              {err.type === "error" ? (
                <XCircle className="size-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {err.row && `Fila ${err.row}: `}
                  <span>{err.field}</span>
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">{err.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 2. Field Mapping Component ───────────────────────────────────────────────

export interface FieldMappingPair {
  sourceField: string
  targetField: string
  required?: boolean
  mapped: boolean
}

export function FieldMapping({
  mappings = [],
  onMapChange
}: {
  mappings: FieldMappingPair[]
  onMapChange?: (source: string, target: string) => void
}) {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-5 space-y-4 text-left">
      <div className="border-b border-border/60 pb-3">
        <h4 className="text-sm font-bold text-foreground">Mapeo de Campos de Archivo</h4>
        <p className="text-xs text-muted-foreground">Asocia las columnas de tu archivo CSV/Excel con el esquema institucional.</p>
      </div>

      <div className="space-y-3">
        {mappings.map((m) => (
          <div key={m.sourceField} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs">
            <div className="flex items-center gap-2 font-mono font-semibold text-foreground min-w-0 flex-1">
              <Table className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{m.sourceField}</span>
            </div>

            <ArrowRight className="size-4 text-muted-foreground shrink-0" />

            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <span className={cn("font-bold text-xs", m.mapped ? "text-primary" : "text-muted-foreground")}>
                {m.targetField}
              </span>
              {m.required && <Badge tone="primary" appearance="soft">Requerido</Badge>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 3. Processing Status & Execution History ──────────────────────────────────

export function ProcessingStatus({
  status = "processing",
  progress = 65,
  currentStep = "Validando registros de coordenadas...",
}: {
  status?: "idle" | "processing" | "success" | "error"
  progress?: number
  currentStep?: string
}) {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-5 space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {status === "processing" && <Clock className="size-4 text-info animate-spin" />}
          {status === "success" && <CheckCircle2 className="size-4 text-success" />}
          {status === "error" && <XCircle className="size-4 text-danger" />}
          <span className="text-xs font-bold text-foreground">
            {status === "processing" ? "Procesando Carga de Datos" : status === "success" ? "Carga Completada" : "Error en Carga"}
          </span>
        </div>
        <span className="text-xs font-bold text-primary tabular-nums">{progress}%</span>
      </div>

      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <p className="text-[11px] text-muted-foreground truncate">{currentStep}</p>
    </div>
  )
}

export function ExecutionHistory({
  history = []
}: {
  history: { id: string; filename: string; date: string; status: "success" | "error" | "processing"; records: number }[]
}) {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-5 space-y-4 text-left">
      <div className="border-b border-border/60 pb-3">
        <h4 className="text-sm font-bold text-foreground">Historial de Ejecuciones</h4>
        <p className="text-xs text-muted-foreground">Últimas cargas masivas procesadas por el sistema.</p>
      </div>

      <div className="divide-y divide-border/60">
        {history.map((item) => (
          <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <FileCheck className="size-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{item.filename}</p>
                <p className="text-[10px] text-muted-foreground">{item.date} • {item.records} registros</p>
              </div>
            </div>

            <Badge
              tone={item.status === "success" ? "success" : item.status === "error" ? "error" : "info"}
              appearance="soft"
            >
              {item.status === "success" ? "Exitoso" : item.status === "error" ? "Error" : "En Proceso"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
