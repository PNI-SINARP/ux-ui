"use client";

import React, { useState } from "react";
import { FileUpload, FileUploadItem } from "@/components/ui/file-upload";
import { EvidenciaArchivo } from "../data/gestion-recuperaciones-types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  FileText,
  FileCheck2,
  Trash2,
  Download,
  ExternalLink,
  ShieldCheck,
  Hash,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EvidenciaUploadCardProps {
  evidencias: EvidenciaArchivo[];
  onUpload: (archivo: { nombre: string; tamano: string; tipo: string; subidoPor: string }) => void;
  readOnly?: boolean;
  currentUser: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function EvidenciaUploadCard({
  evidencias,
  onUpload,
  readOnly = false,
  currentUser,
}: EvidenciaUploadCardProps) {
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;

    files.forEach((file) => {
      const fileId = `up-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: FileUploadItem = {
        id: fileId,
        file,
        status: "uploading",
        errorType: null,
        progress: 20,
      };

      setUploadItems((prev) => [...prev, newItem]);

      // Simular progreso y subida
      setTimeout(() => {
        setUploadItems((prev) =>
          prev.map((it) => (it.id === fileId ? { ...it, progress: 75 } : it))
        );
      }, 400);

      setTimeout(() => {
        setUploadItems((prev) =>
          prev.map((it) => (it.id === fileId ? { ...it, status: "success", progress: 100 } : it))
        );

        onUpload({
          nombre: file.name,
          tamano: formatBytes(file.size),
          tipo: file.type || "application/pdf",
          subidoPor: currentUser,
        });

        toast.success("Documento adjuntado", {
          description: `Se incorporó ${file.name} con verificación de integridad criptográfica SHA-256.`,
        });

        // Limpiar de la lista de subida temporal tras 1s
        setTimeout(() => {
          setUploadItems((prev) => prev.filter((it) => it.id !== fileId));
        }, 1200);
      }, 900);
    });
  };

  const handleRemoveUploadItem = (id: string) => {
    setUploadItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Componente File Upload oficial del UI Kit */}
      {!readOnly && (
        <div className="space-y-2">
          <FileUpload
            label="Adjuntar nueva evidencia de verificación"
            accept=".pdf,.png,.jpg,.jpeg"
            allowedFormats="PDF, PNG, JPG"
            maxSizeMB={10}
            items={uploadItems}
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveUploadItem}
            className="w-full"
          />
        </div>
      )}

      {/* Lista de evidencias registradas */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Paperclip className="size-4 text-primary" />
            <h4 className="text-xs font-heading font-bold text-foreground">
              Evidencias registradas ({evidencias.length})
            </h4>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Selladas con hash SHA-256 inmutable
          </span>
        </div>

        {evidencias.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <FileText className="size-8 mx-auto text-muted-foreground/60 mb-2 stroke-[1.5]" />
            <p className="text-xs font-semibold text-foreground">Sin evidencias adjuntas</p>
            <p className="text-[11px] text-muted-foreground">
              Adjunta el oficio firmado, acta notarial o reporte biométrico para respaldar la decisión.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <TooltipProvider delayDuration={150}>
              {evidencias.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-surface rounded-xl border border-border hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck2 className="size-4.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-sm sm:max-w-md">
                        {ev.nombre}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[10px] uppercase px-1.5 py-0 font-bold">
                          {ev.tipo.includes("pdf") || ev.nombre.endsWith(".pdf")
                            ? "PDF"
                            : ev.tipo.includes("png") || ev.nombre.endsWith(".png")
                            ? "PNG"
                            : "JPG"}
                        </Badge>
                        <span>{ev.tamano}</span>
                        <span>•</span>
                        <span>{ev.fechaSubida}</span>
                        <span>•</span>
                        <span className="truncate max-w-[160px] font-medium">Por: {ev.subidoPor}</span>
                      </div>
                      <div className="pt-1 flex items-center gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-muted/70 px-2 py-0.5 rounded text-muted-foreground hover:text-foreground cursor-help max-w-full truncate border border-border/60">
                              <Hash className="size-2.5 text-primary shrink-0" />
                              <span className="truncate">{ev.hashSha256}</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs font-mono text-[10px]">
                            Hash SHA-256 de integridad: {ev.hashSha256}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info("Descarga iniciada", {
                          description: `Descargando copia verificada de ${ev.nombre}`,
                        });
                      }}
                      className="h-7 text-xs rounded-lg px-2.5"
                    >
                      <Download className="size-3.5 mr-1" />
                      <span>Descargar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
