"use client";

import React from "react";
import { SubSection } from "./sub-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Sliders, FileSpreadsheet, CheckCircle2, Clock, AlertCircle, Eye, Layers, Share2, ListOrdered, Loader2, RotateCcw, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ProgressBar } from "@/components/ui/data-display";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";


export function ReportsExportShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* 1. EXPORT BUTTON */}
      <SubSection icon={Download} id="export-button" title="Botón de Exportación" description="Diferentes estados del botón principal para iniciar descargas o generación de archivos." registerSection={registerSection}>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="space-y-3 text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Default</span>
            <div>
              <Button variant="primary" size="sm">
                <Download className="size-4 mr-2" /> Exportar Reporte
              </Button>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hover</span>
            <div>
              {/* Simulating hover state visually via classes */}
              <Button variant="primary" size="sm" className="bg-primary-600 border-primary-600 shadow-md">
                <Download className="size-4 mr-2" /> Exportar Reporte
              </Button>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Loading</span>
            <div>
              <Button variant="primary" size="sm" disabled>
                <Loader2 className="size-4 mr-2 animate-spin" /> Exportando...
              </Button>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Disabled</span>
            <div>
              <Button variant="primary" size="sm" disabled>
                <Download className="size-4 mr-2" /> Exportar Reporte
              </Button>
            </div>
          </div>
        </div>
      </SubSection>

      {/* 2. EXPORT MENU */}
      <SubSection icon={Share2} id="export-menu" title="Menú de Exportación" description="Selector de formato para descargar información, considerando opciones disponibles y restringidas." registerSection={registerSection}>
        <div className="p-6 rounded-3xl border border-border/60 bg-surface max-w-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="size-4 mr-2" /> Opciones de Exportación
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Seleccionar formato</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-muted/50">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileText className="size-4 text-danger" /> PDF
                </div>
                <span className="text-xs text-muted-foreground pl-6">Documento para consulta e impresión.</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-muted/50">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileSpreadsheet className="size-4 text-primary" /> XLSX
                </div>
                <span className="text-xs text-muted-foreground pl-6">Archivo editable con datos estructurados.</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 focus:bg-muted/50">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileSpreadsheet className="size-4 text-success" /> CSV
                </div>
                <span className="text-xs text-muted-foreground pl-6">Datos tabulares para procesamiento.</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Layers className="size-4" /> GeoJSON
                </div>
                <span className="text-xs text-muted-foreground pl-6">Requiere permisos de administrador.</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SubSection>

      {/* 3. REPORT PREVIEW */}
      <SubSection icon={Eye} id="report-preview" title="Vista Previa del Reporte (Report Preview)" description="Visualización de un reporte antes de generar o descargar el archivo." registerSection={registerSection}>
        <div className="p-6 rounded-3xl border border-border/60 bg-surface max-w-sm">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral"><Eye className="size-4 mr-2" /> Ver Vista Previa</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Vista Previa del Documento</DialogTitle>
              </DialogHeader>
              <div className="bg-muted/30 p-6 rounded-md border border-border flex flex-col items-center my-4 min-h-[300px]">
                <div className="bg-background shadow-sm border border-border p-8 w-full max-w-sm space-y-6 aspect-[1/1.4]">
                  <div className="text-center space-y-1 border-b border-border pb-4">
                    <h3 className="font-bold text-lg font-heading">Informe de Riesgos</h3>
                    <p className="text-sm font-medium">Zona 3</p>
                  </div>
                  <div className="space-y-2 text-sm text-foreground/80">
                    <p><strong className="text-foreground">Periodo:</strong> Enero – Septiembre 2026</p>
                    <p><strong className="text-foreground">Riesgos identificados:</strong> 24</p>
                    <p><strong className="text-foreground">Riesgos críticos:</strong> 4</p>
                  </div>
                  {/* Simulated content lines */}
                  <div className="space-y-2 pt-4 opacity-50">
                    <div className="h-2 bg-muted-foreground rounded w-full"></div>
                    <div className="h-2 bg-muted-foreground rounded w-full"></div>
                    <div className="h-2 bg-muted-foreground rounded w-5/6"></div>
                    <div className="h-2 bg-muted-foreground rounded w-full"></div>
                    <div className="h-2 bg-muted-foreground rounded w-4/6"></div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2 justify-end">
                <DialogClose asChild>
                  <Button variant="neutral">Cancelar</Button>
                </DialogClose>
                <Button variant="primary"><Download className="size-4 mr-2" /> Exportar PDF</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SubSection>

      {/* 4. REPORT STATUS */}
      

      {/* 5. DOWNLOAD LIST / ITEM STATES */}
      <SubSection icon={ListOrdered} id="download-list" title="Lista de Descargas y Estados" description="Fila individual enriquecida con metadatos completos y acciones, mostrando sus variantes de estado." registerSection={registerSection}>
        <div className="space-y-4 max-w-4xl">

          {/* Estado: Generando */}
          <div className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="text-left space-y-1.5 min-w-[250px]">
                <h5 className="text-sm font-bold text-foreground">Informe_Riesgos_Nacionales.pdf</h5>
                <div className="space-y-1.5 w-full pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-warning uppercase tracking-wider">
                    <span>Generando...</span>
                    <span>65%</span>
                  </div>
                  <ProgressBar value={65} showValue={false} className="[&>div>div]:bg-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Estado: Disponible */}
          <div className="p-4 rounded-xl border border-success/30 bg-success/5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-success/20 text-success flex items-center justify-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-foreground">Informe_Riesgo_Zona3_2026.pdf</h5>
                  <Badge tone="success" appearance="soft" size="sm" className="uppercase tracking-wider text-[10px]">Disponible</Badge>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-1">
                  <span className="font-bold text-foreground">PDF</span>
                  <span>•</span>
                  <span>4.2 MB</span>
                  <span>•</span>
                  <span>Generado hoy, 14:30</span>
                  <span>•</span>
                  <span>Por: Ana López</span>
                  <span>•</span>
                  <span>Periodo: Ene-Sep 2026</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-foreground/70 hover:text-foreground">
                      <Eye className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver Documento</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="primary" size="sm" className="ml-1 shadow-sm">
                <Download className="size-3.5 mr-1.5" /> Descargar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full ml-1 text-foreground/70 hover:text-foreground">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><RotateCcw className="size-4 mr-2" /> Regenerar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger/10">
                    <AlertCircle className="size-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Estado: Error */}
          <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-danger/20 text-danger flex items-center justify-center shrink-0">
                <FileSpreadsheet className="size-5" />
              </div>
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-foreground">Matriz_Predios_Escolares.xlsx</h5>
                  <Badge tone="error" appearance="soft" size="sm" className="uppercase tracking-wider text-[10px]">Error al generar</Badge>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-1">
                  <span className="font-bold text-foreground">XLSX</span>
                  <span>•</span>
                  <span>Ayer, 09:15</span>
                  <span>•</span>
                  <span>Error de conexión de base de datos</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" className="shadow-sm">
                <RotateCcw className="size-3.5 mr-1.5" /> Reintentar
              </Button>
            </div>
          </div>

        </div>
      </SubSection>
    </div>
  );
}
