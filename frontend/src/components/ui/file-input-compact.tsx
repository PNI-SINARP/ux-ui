"use client"

/**
 * FileInput — Compact
 * ───────────────────
 * El componente SIMPLE de selección de archivo.
 * No es una dropzone. Es un campo de formulario compacto,
 * misma familia visual que Text Field, Select y Combobox.
 *
 * Flujo: Seleccionar → Cargando → Éxito  |  → Error → Reintentar
 */

import * as React from "react"
import {
  Paperclip,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File as FileIcon,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  XCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

export type FileInputStatus = "idle" | "selected" | "uploading" | "success" | "error"
export type FileInputError = "format" | "size" | "invalid" | "network" | null

export interface FileInputProps {
  label?: string
  helpText?: string
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  state?: "default" | "success" | "error"
  size?: "sm" | "default" | "lg"
  className?: string

  // Controlled
  file?: File | null
  status?: FileInputStatus
  errorType?: FileInputError
  progress?: number // 0–100

  onFileSelect?: (file: File) => void
  onClear?: () => void
  onRetry?: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatFileBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

function getFileIcon(file?: File | null) {
  if (!file) return <Paperclip className="size-4 text-muted-foreground" />
  const n = file.name.toLowerCase()
  if (n.endsWith(".pdf")) return <FileText className="size-4 text-danger" />
  if (n.endsWith(".xlsx") || n.endsWith(".xls") || n.endsWith(".csv"))
    return <FileSpreadsheet className="size-4 text-success" />
  if (n.endsWith(".zip") || n.endsWith(".rar"))
    return <FileArchive className="size-4 text-warning" />
  return <FileIcon className="size-4 text-primary" />
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileInput({
  label,
  helpText,
  accept,
  maxSizeMB = 10,
  disabled = false,
  readOnly = false,
  required = false,
  state: externalState = "default",
  size = "default",
  className,
  file,
  status = "idle",
  errorType = null,
  progress = 0,
  onFileSelect,
  onClear,
  onRetry,
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isInteractive = !disabled && !readOnly && status !== "success"
  const visualState =
    status === "error" ? "error" : status === "success" ? "success" : externalState

  const handleClick = () => {
    if (!isInteractive || status === "uploading") return
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && onFileSelect) onFileSelect(f)
    if (e.target) e.target.value = ""
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear?.()
  }

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRetry?.()
  }

  return (
    <div className={cn("flex flex-col gap-1.5 text-left w-full", className)}>
      {label && (
        <label
          className={cn(
            "text-sm font-semibold",
            visualState === "error" ? "text-danger" : "text-foreground",
            disabled && "opacity-50"
          )}
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          "w-full relative group",
          isInteractive && status !== "uploading" ? "cursor-pointer" : "cursor-default",
          (disabled || readOnly) && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={!isInteractive || status === "uploading"}
          aria-hidden="true"
        />

        <InputGroup state={visualState} size={size} className="w-full overflow-hidden">
          <div className="flex-1 flex items-center min-h-10 px-3 py-2 w-full">

            {/* IDLE */}
            {status === "idle" && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground flex-1">
                  <Paperclip className="size-4 shrink-0" />
                  <span className="text-sm">Seleccionar archivo</span>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0 group-hover:text-primary/80 transition-colors">
                  Examinar
                </span>
              </>
            )}

            {/* SELECTED */}
            {status === "selected" && file && (
              <>
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                  <div className="shrink-0">{getFileIcon(file)}</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-foreground truncate leading-tight">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileBytes(file.size)}
                    </span>
                  </div>
                </div>
                {!readOnly && !disabled && (
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Eliminar archivo"
                    onClick={handleClear}
                    className="shrink-0 ml-2"
                  >
                    <X className="size-4" />
                  </InputGroupButton>
                )}
              </>
            )}

            {/* UPLOADING */}
            {status === "uploading" && file && (
              <div className="flex flex-col w-full gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="shrink-0 animate-pulse">{getFileIcon(file)}</div>
                    <span className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </span>
                  </div>
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Cancelar carga"
                    onClick={handleClear}
                    className="shrink-0 text-muted-foreground hover:text-danger"
                  >
                    <XCircle className="size-4" />
                  </InputGroupButton>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">
                    Subiendo…
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-primary/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
                      style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-primary tabular-nums shrink-0">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {status === "success" && file && (
              <>
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                  <CheckCircle2 className="size-4 text-success shrink-0 animate-in zoom-in duration-500" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-foreground truncate leading-tight">
                      {file.name}
                    </span>
                    <span className="text-xs text-success">
                      Archivo cargado correctamente
                    </span>
                  </div>
                </div>
                {!readOnly && !disabled && (
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Eliminar archivo"
                    onClick={handleClear}
                    className="shrink-0 ml-2"
                  >
                    <X className="size-4" />
                  </InputGroupButton>
                )}
              </>
            )}

            {/* ERROR */}
            {status === "error" && file && (
              <>
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                  <AlertTriangle className="size-4 text-danger shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-foreground truncate leading-tight">
                      {file.name}
                    </span>
                    <span className="text-xs text-danger">
                      {errorType === "format" && "Formato no permitido"}
                      {errorType === "size" && "Supera el tamaño máximo"}
                      {errorType === "invalid" && "Archivo no procesable"}
                      {errorType === "network" && "Error de conexión"}
                      {!errorType && "Error al cargar"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {errorType === "network" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRetry}
                      className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
                    >
                      <RefreshCw className="size-3 mr-1" />
                      Reintentar
                    </Button>
                  )}
                  {!readOnly && !disabled && (
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Eliminar archivo"
                      onClick={handleClear}
                    >
                      <X className="size-4" />
                    </InputGroupButton>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Progress bar stripe at bottom (uploading) */}
          {status === "uploading" && (
            <div className="absolute bottom-0 left-0 h-[2px] bg-primary/15 w-full">
              <div
                className="h-full bg-primary transition-all duration-200 ease-out"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          )}
        </InputGroup>
      </div>

      {/* Help text */}
      {helpText && status === "idle" && (
        <p className={cn("text-xs text-muted-foreground", disabled && "opacity-50")}>
          {helpText}
        </p>
      )}
    </div>
  )
}
