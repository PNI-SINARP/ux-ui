"use client"

/**
 * FileUpload — Basic
 * ──────────────────
 * Dropzone básica + lista de archivos.
 * Limpia, simple y funcional. Sin badges de tipo ni preview.
 */

import * as React from "react"
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type FileUploadStatus =
  | "idle"
  | "uploading"
  | "success"
  | "error"
  | "cancelled"

export type FileUploadError = "format" | "size" | "invalid" | "network" | null

export interface FileUploadItem {
  id: string
  file: File
  status: FileUploadStatus
  errorType: FileUploadError
  progress: number
}

export interface FileUploadProps {
  label?: string
  accept?: string
  maxSizeMB?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
  allowedFormats?: string
  items?: FileUploadItem[]
  onFileSelect?: (files: File[]) => void
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  onCancel?: (id: string) => void
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

function FileItem({
  item,
  disabled,
  onRemove,
  onRetry,
  onCancel,
}: {
  item: FileUploadItem
  disabled?: boolean
  onRemove: () => void
  onRetry: () => void
  onCancel: () => void
}) {
  const { file, status, errorType, progress } = item

  const isUploading = status === "uploading"
  const isSuccess = status === "success"
  const isError = status === "error"

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="listitem"
        className={cn(
          "group relative w-full bg-background p-4 sm:p-5 transition-all duration-300 border-t border-border/50",
          isError && "bg-danger/5",
          isSuccess && "bg-success/[0.02]",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-4 w-full">
          {/* Icon */}
          <div className="shrink-0">
            {isSuccess ? (
              <div className="size-9 rounded-full bg-success/15 flex items-center justify-center text-success">
                <CheckCircle2 className="size-4" strokeWidth={2.5} />
              </div>
            ) : isError ? (
              <div className="size-9 rounded-full bg-danger/15 flex items-center justify-center text-danger">
                <AlertTriangle className="size-4" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <FileIcon className={cn("size-4", isUploading && "animate-pulse text-primary")} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className={cn("text-[13px] sm:text-[14px] font-semibold truncate cursor-default leading-tight", isError ? "text-danger-700 dark:text-danger-400" : "text-foreground")}>
                    {file.name}
                  </p>
                </TooltipTrigger>
                <TooltipContent>{file.name}</TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-2 shrink-0">
                {isUploading && (
                  <span className="text-xs font-bold text-primary tabular-nums mr-2">
                    {Math.round(progress)}%
                  </span>
                )}
                {isUploading && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="neutral"
                        size="icon"
                        onClick={onCancel}
                        className="size-8 text-muted-foreground"
                      >
                        <X className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cancelar carga</TooltipContent>
                  </Tooltip>
                )}
                {!isUploading && !disabled && (
                  <div className="flex items-center gap-2">
                    {isError && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="neutral"
                            size="icon"
                            onClick={onRetry}
                            className="size-8 text-danger hover:text-danger-600 hover:bg-danger/10"
                          >
                            <RefreshCw className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reintentar</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="neutral"
                          size="icon"
                          onClick={onRemove}
                          className="size-8 text-muted-foreground"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            {/* Status messaging */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className={cn(
                "text-[12px] mt-0.5",
                isSuccess ? "text-success font-medium" :
                  isError ? "text-danger font-medium" :
                    "text-muted-foreground font-medium"
              )}>
                {(status === "idle" || isUploading) && formatBytes(file.size)}
                {isSuccess && "Archivo cargado correctamente."}
                {status === "cancelled" && "Carga cancelada."}
                {isError && (
                  errorType === "format" ? "Formato de archivo no permitido." :
                    errorType === "size" ? "El archivo supera el tamaño límite." :
                      errorType === "invalid" ? "No se pudo procesar el archivo." :
                        errorType === "network" ? "Error de red al cargar el archivo." :
                          "Error al cargar el archivo."
                )}
              </span>
            </div>

            {/* Progress bar line at bottom of item (Gradient on uploading/success) */}
            {(isUploading || isSuccess) && (
              <div
                role="progressbar"
                aria-valuenow={isSuccess ? 100 : Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-3"
              >
                <div
                  className="h-full bg-gradient-to-r from-success/90 to-primary/90 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${isSuccess ? 100 : Math.min(Math.max(progress, 0), 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function DropZoneHeader({
  disabled,
  multiple,
  isDragging,
  accept,
  maxSizeMB,
  allowedFormats,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: {
  disabled?: boolean
  multiple?: boolean
  isDragging: boolean
  accept?: string
  maxSizeMB?: number
  allowedFormats?: string
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Zona de carga."
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        "w-full p-4 sm:p-5 transition-all duration-300 cursor-pointer select-none",
        "flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 bg-muted/30 hover:bg-muted/60",
        isDragging && "bg-primary/5 border-primary/20",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={disabled}
        tabIndex={-1}
        onClick={(e) => { e.stopPropagation(); if (!disabled) onClick() }}
        className="shrink-0 w-auto font-semibold shadow-sm h-9 text-[13px] px-4 rounded-full cursor-pointer"
      >
        <UploadCloud className="size-4 mr-2" />
        {multiple ? "Seleccionar archivos..." : "Seleccionar archivo..."}
      </Button>

      <div className="flex flex-col min-w-0 justify-center">
        <span
          className={cn(
            "text-[13px] font-medium leading-snug transition-colors",
            isDragging ? "text-primary" : "text-foreground"
          )}
        >
          {isDragging ? "Suelta los archivos para cargarlos" : "Arrastra y suelta archivos aquí"}
        </span>

        {(allowedFormats || accept || maxSizeMB) && (
          <span className="text-[11px] sm:text-xs text-muted-foreground leading-normal mt-0.5 flex flex-wrap items-center gap-1.5">
            <span>
              Formatos permitidos:{" "}
              <strong className="font-semibold text-foreground/80">
                {allowedFormats || (accept ? accept.toUpperCase().replace(/\./g, "") : "PDF")}
              </strong>
            </span>
            {maxSizeMB && <span>• Máx. {maxSizeMB}MB</span>}
          </span>
        )}
      </div>
    </div>
  )
}

export function FileUpload({
  label,
  accept,
  maxSizeMB = 20,
  maxFiles = 10,
  multiple = false,
  disabled = false,
  required = false,
  allowedFormats,
  className,
  items = [],
  onFileSelect,
  onRemove,
  onRetry,
  onCancel,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files || !onFileSelect) return
    onFileSelect(Array.from(files).slice(0, maxFiles))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) handleFiles(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    if (e.target) e.target.value = ""
  }

  return (
    <div className={cn("flex flex-col gap-2 w-full text-left", className)}>
      {label && (
        <label className={cn("text-[14px] font-bold text-foreground mb-1", disabled && "opacity-50")}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
        aria-hidden="true"
      />

      <div className={cn(
        "w-full rounded-xl border overflow-hidden bg-background shadow-sm transition-all duration-300",
        isDragging ? "ring-2 ring-primary border-primary" : "border-border/80"
      )}>
        <DropZoneHeader
          disabled={disabled}
          multiple={multiple}
          isDragging={isDragging}
          accept={accept}
          maxSizeMB={maxSizeMB}
          allowedFormats={allowedFormats}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        />

        {items.length > 0 && (
          <div role="list" aria-label="Archivos" className="w-full flex flex-col">
            {items.map((item) => (
              <FileItem
                key={item.id}
                item={item}
                disabled={disabled}
                onRemove={() => onRemove?.(item.id)}
                onRetry={() => onRetry?.(item.id)}
                onCancel={() => onCancel?.(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
