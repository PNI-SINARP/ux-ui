import React, { useState, useCallback, useRef } from "react";
import { FileUpload as BasicFileUpload, type FileUploadItem } from "@/components/ui/file-upload";
import { FileUpload as AdvancedFileUpload, type FileItemData, type FileItemStatus, type FileErrorType } from "@/components/ui/file-input";

let idCounter = 0;
function makeId() { return `file-${++idCounter}`; }

function createAdvancedItem(file: File, overrides: Partial<FileItemData> = {}): FileItemData {
  return {
    id: makeId(),
    file,
    status: "uploading",
    errorType: null,
    progress: 0,
    ...overrides,
  };
}

function createBasicItem(file: File, overrides: Partial<FileUploadItem> = {}): FileUploadItem {
  return {
    id: makeId(),
    file,
    status: "uploading",
    errorType: null,
    progress: 0,
    ...overrides,
  };
}

function makeFile(name: string, sizeMB = 2.4) {
  return new File(["x".repeat(Math.round(sizeMB * 1024 * 1024))], name);
}

// ── Basic File Upload Showcase Component ─────────────────────────────────────

function BasicDemo() {
  const [items, setItems] = useState<FileUploadItem[]>([
    createBasicItem(makeFile("reporte_mensual.pdf", 3.1), { status: "success", progress: 100 }),
    createBasicItem(makeFile("fotografía_terreno.jpg", 1.8), { status: "success", progress: 100 }),
    createBasicItem(makeFile("contrato_firmado.pdf", 2.7), { status: "uploading", progress: 42 }),
  ]);

  const handleSelect = (files: File[]) => {
    const newItems = files.map(f => createBasicItem(f, { status: "uploading", progress: 20 }));
    setItems(prev => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="space-y-6">
      <BasicFileUpload
        allowedFormats="PNG, JPG, PDF"
        maxSizeMB={10}
        maxFiles={5}
        multiple
        items={items}
        onFileSelect={handleSelect}
        onRemove={handleRemove}
      />
    </div>
  );
}

// ── Advanced File Upload Showcase Component ──────────────────────────────────

function AdvancedDemo() {
  const [items, setItems] = useState<FileItemData[]>([
    createAdvancedItem(makeFile("Propuesta_comercial.pdf", 2.4), { status: "success", progress: 100 }),
    createAdvancedItem(makeFile("Presupuesto_2024.xlsx", 1.8), { status: "success", progress: 100 }),
    createAdvancedItem(makeFile("Mockup_portada.png", 3.2), { status: "uploading", progress: 68 }),
    createAdvancedItem(makeFile("Demo_producto.mp4", 93.1), { status: "uploading", progress: 42 }),
    createAdvancedItem(makeFile("Recursos.zip", 45.0), { status: "error", errorType: "network" }),
  ]);

  const handleSelect = (files: File[]) => {
    const newItems = files.map(f => createAdvancedItem(f, { status: "uploading", progress: 15 }));
    setItems(prev => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const handleRetry = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, status: "uploading", progress: 10 } : i));
  const handleCancel = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, status: "cancelled" } : i));

  return (
    <AdvancedFileUpload
      allowedFormats="PDF, Word, Excel, CSV, PPTX, JPG, PNG, MP4, ZIP y capas geoespaciales"
      maxSizeMB={100}
      maxFiles={10}
      multiple
      items={items}
      onFileSelect={handleSelect}
      onRemove={handleRemove}
      onRetry={handleRetry}
      onCancel={handleCancel}
    />
  );
}

export function FileInputShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="space-y-12">

      {/* 1. File Upload Básico */}
      <section className="space-y-3">
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            1. File Upload — Básico
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Para cargas puntuales de uno o pocos archivos dentro de formularios sencillos.
          </p>
        </div>
        <div className="max-w-2xl">
          <BasicDemo />
        </div>
      </section>

      {/* 2. Advanced File Upload */}
      <section className="space-y-3">
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            2. Advanced File Upload — Avanzado
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Para gestionar varios archivos, consultar su progreso, tipo, tamaño, estado y acciones disponibles.
          </p>
        </div>
        <div className="max-w-3xl bg-surface/40 p-6 rounded-2xl border border-border/50">
          <AdvancedDemo />
        </div>
      </section>

    </div>
  );
}
