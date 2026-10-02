"use client";
import { SubSection } from "./sub-section";

import React from 'react';
import Folder from '@/components/ui/folder';

import { Card } from "@/components/ui/card";
import { Folder as FolderIcon } from "lucide-react";




export function FolderShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="space-y-10 w-full">
      <SubSection icon={FolderIcon} id="folders" title="Carpetas Semánticas (Folders)" description="Muestra visual de variantes para estructurar contenidos jerárquicos." registerSection={registerSection}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/40">
              <span className="text-caption font-bold uppercase tracking-widest text-primary">Primario</span>
              <Folder
                variant="primary"
                title="Design Assets"
                subtitle="42 images"
                footerText="Updated 2h ago"
              />
            </div>

            <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/40">
              <span className="text-caption font-bold uppercase tracking-widest text-secondary">Secundario</span>
              <Folder
                variant="secondary"
                title="Project Media"
                subtitle="12 videos"
                footerText="Updated yesterday"
              />
            </div>

            <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/40">
              <span className="text-caption font-bold uppercase tracking-widest text-warning">Advertencia</span>
              <Folder
                variant="warning"
                title="Draft Documents"
                subtitle="8 files"
                footerText="Updated 3d ago"
              />
            </div>

            <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/40">
              <span className="text-caption font-bold uppercase tracking-widest text-info">Información</span>
              <Folder
                variant="info"
                title="Help Guides"
                subtitle="15 docs"
                footerText="Updated 1w ago"
              />
            </div>

            <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/40">
              <span className="text-caption font-bold uppercase tracking-widest text-danger">Peligro</span>
              <Folder
                variant="error"
                title="Critical Errors"
                subtitle="3 logs"
                footerText="Action required"
              />
            </div>

            <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/40">
              <span className="text-caption font-bold uppercase tracking-widest text-success">Éxito</span>
              <Folder
                variant="success"
                title="Completed Tasks"
                subtitle="24 results"
                footerText="All clear"
              />
            </div>

            <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/40">
              <span className="text-caption font-bold uppercase tracking-widest text-muted-foreground">Neutral</span>
              <Folder
                variant="neutral"
                title="Archived Files"
                subtitle="156 objects"
                footerText="Last modified 2024"
              />
            </div>
          </div>
        </SubSection>
    </div>
  );
}
