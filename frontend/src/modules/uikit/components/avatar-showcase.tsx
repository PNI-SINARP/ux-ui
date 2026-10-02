"use client";

import * as React from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  type AvatarVariant,
  type AvatarAppearance,
} from "@/components/ui/avatar";
import { User, Check, AlertCircle, ShieldCheck } from "lucide-react";

export function AvatarShowcase() {
  const VARIANTS: { id: AvatarVariant; label: string }[] = [
    { id: "00", label: "00" },
    { id: "01", label: "01" },
    { id: "02", label: "02" },
    { id: "03", label: "03" },
    { id: "04", label: "04" },
    { id: "05", label: "05" },
    { id: "06", label: "06" },
    { id: "07", label: "07" },
    { id: "08", label: "08" },
    { id: "09", label: "09" },
    { id: "10", label: "10" },
    { id: "11", label: "11" },
    { id: "12", label: "12" },
    { id: "13", label: "13" },
    { id: "14", label: "14" },
    { id: "15", label: "15" },
  ];

  return (
    <div className="grid gap-8 text-left">
        {/* Tamaños */}
        <div className="space-y-4 p-6 rounded-xl border border-border bg-surface/50 shadow-sm">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tamaños Estándar</h4>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>cn</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Small (32px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="default">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>cn</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Default (40px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>cn</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Large (56px)</span>
            </div>
          </div>
        </div>

        {/* Esúútilos Visuales: Filled, Soft, Outline */}
        <div className="space-y-6 p-6 rounded-xl border border-border bg-surface/50 shadow-sm">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Esúútilos Visuales (Tokens de Color)</h4>
          
          {/* Filled */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Filled / Solid</p>
            <div className="flex flex-wrap gap-4">
              {VARIANTS.map((v) => (
                <div key={`filled-${v.id}`} className="flex flex-col items-center gap-1.5">
                  <Avatar>
                    <AvatarFallback variant={v.id} appearance="filled">
                      {v.label.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-muted-foreground font-mono">{v.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soft */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Soft / Subtle</p>
            <div className="flex flex-wrap gap-4">
              {VARIANTS.map((v) => (
                <div key={`soft-${v.id}`} className="flex flex-col items-center gap-1.5">
                  <Avatar>
                    <AvatarFallback variant={v.id} appearance="soft">
                      {v.label.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-muted-foreground font-mono">{v.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outline */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Contorno</p>
            <div className="flex flex-wrap gap-4">
              {VARIANTS.map((v) => (
                <div key={`outline-${v.id}`} className="flex flex-col items-center gap-1.5">
                  <Avatar>
                    <AvatarFallback variant={v.id} appearance="outline">
                      {v.label.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-muted-foreground font-mono">{v.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mapeo Automático de Iniciales y Badges de Estado */}
        <div className="space-y-4 p-6 rounded-xl border border-border bg-surface/50 shadow-sm">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mapeo Automático de Iniciales e Insignias de Estado</h4>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex flex-col items-center gap-2">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Juan Diego</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar>
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">María Clara</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Genérico</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="relative">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>cn</AvatarFallback>
                <AvatarBadge className="bg-success" />
              </Avatar>
              <span className="text-caption text-muted-foreground">En línea</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="relative">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>cn</AvatarFallback>
                <AvatarBadge className="bg-danger" />
              </Avatar>
              <span className="text-caption text-muted-foreground">Ocupado</span>
            </div>
          </div>
        </div>
    </div>
  );
}
