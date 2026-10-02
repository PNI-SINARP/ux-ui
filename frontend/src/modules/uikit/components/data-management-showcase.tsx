"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Upload, FileCheck, Table, CheckCircle2, History, AlertCircle, UploadCloud } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { FileUploadAdvanced } from "@/components/ui/file-input";
import {
  ValidationSummary, FieldMapping, ProcessingStatus, ExecutionHistory
} from "@/components/ui/data-management";
import { FolderShowcase } from "./folder-showcase";
import { FileInputShowcase } from "./file-input-showcase";




export function DataManagementShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const [basicFiles, setBasicFiles] = React.useState([
    {
      id: "1",
      file: new File(["demo"], "matriz_colegios_2026.xlsx", { type: "application/vnd.openxmlformats-officedocument.spaareadsheetml.sheet" }),
      status: "success" as const,
      errorType: null,
      progress: 100,
    }
  ]);

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* 1. DROPZONE & UPLOAD ITEmas */}
        <SubSection icon={Upload} id="file-upload-widgets" title="Dropzone, Upload Item & Upload List" description="Widgets integrados de carga de archivos en caja compacta o experiencia avanzada." registerSection={registerSection}>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-foreground mb-2">File Upload (Básico Integrado en Cajita)</p>
              <FileUpload label="Documentos Adjuntos" items={basicFiles} />
            </div>

            <div>
              <p className="text-xs font-bold text-foreground mb-2">Advanced File Upload (Arrastre Masivo)</p>
              <FileUploadAdvanced label="Capas Geográficas y GeoJSON" />
            </div>
          </div>
        </SubSection>
        <SubSection
          icon={UploadCloud} id="file-input"
          registerSection={registerSection}
          title="Entrada de archivo (File Input)"
          description="Permite seleccionar o arrastrar archivos para cargarlos al sistema y consultar el estado de la carga."
        >
          <FileInputShowcase />
        </SubSection>

        <FolderShowcase registerSection={registerSection} />
      </div>
  );
}
