"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ImageOff, Upload, RotateCcw } from "lucide-react";
import { cn, getAssetPath } from "@/lib/utils";
import { toast } from "sonner";

interface LogoManagerCardProps {
  slot?: "horizontal" | "vertical" | "escudo" | "favicon" | "sión-lema";
  title: string;
  description: string;
  badge1: string;
  badge2?: string;
  defaultLightImg?: string;
  defaultDarkImg?: string;
  monoLightImg?: string;
  monoDarkImg?: string;
  maxHeightClass?: string;
  allowedFormats?: string;
  isMissing?: boolean;
}

export function LogoManagerCard({
  title,
  description,
  badge1,
  badge2,
  defaultLightImg = "",
  defaultDarkImg = "",
  monoLightImg,
  monoDarkImg,
  maxHeightClass = "max-h-16",
  isMissing = false,
}: LogoManagerCardProps) {
  const [variant, setVariant] = React.useState<"color" | "mono">("color");
  const [customImg, setCustomImg] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasMono = Boolean(monoLightImg && monoDarkImg);
  const activeLightImg = customImg || (variant === "mono" && hasMono ? (monoLightImg || defaultLightImg) : defaultLightImg);
  const activeDarkImg = customImg || (variant === "mono" && hasMono ? (monoDarkImg || defaultDarkImg) : defaultDarkImg);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato no válido", { description: "Por favor sube un archivo de imagen (PNG, JPG, SVG o WEBP)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImg(result);
      toast.success("Logotipo cargado", { description: `Se actualizó el logo "${title}" con éxito.` });
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setCustomImg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Logotipo restaurado", { description: "Se volvió al logotipo oficial predeterminado." });
  };

  const hasImage = Boolean(customImg || (!isMissing && (activeLightImg || activeDarkImg)));

  return (
    <div className={cn("flex flex-col rounded-3xl overflow-hidden group bg-surface border transition-all", customImg ? "border-primary/50 shadow-md ring-1 ring-primary/20" : isMissing ? "border-dashed border-border/60 shadow-xs" : "border-border/60 shadow-xs")}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
      />

      {/* Image Box */}
      {!hasImage ? (
        <div className="h-48 w-full bg-muted/20 flex flex-col items-center justify-center p-6 text-center border-b border-dashed border-border/60">
          <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <ImageOff className="size-5 text-muted-foreground/50" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Recurso faltante</span>
          <span className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
            Puedes subir tu propio logo para simular su integración
          </span>
          <Button
            variant="neutral"
            size="sm"
            className="mt-3 rounded-full text-xs"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="size-3.5" />}
          >
            Subir logo
          </Button>
        </div>
      ) : (
        <div className="relative h-48 p-6 flex flex-col items-center justify-center border-b border-border/40 bg-surface/50">
          {hasMono && !customImg && (
            <div className="absolute top-3 right-3 flex bg-surface border border-border rounded-full p-1 shadow-sm z-10">
              <button
                type="button"
                onClick={() => setVariant("color")}
                className={cn("px-3 py-1 text-[10px] font-bold rounded-full transition-colors uppercase tracking-wider cursor-pointer", variant === "color" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/20")}
              >
                Color
              </button>
              <button
                type="button"
                onClick={() => setVariant("mono")}
                className={cn("px-3 py-1 text-[10px] font-bold rounded-full transition-colors uppercase tracking-wider cursor-pointer", variant === "mono" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/20")}
              >
                Mono
              </button>
            </div>
          )}

          {customImg && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <Badge tone="primary" appearance="soft" size="sm" className="font-bold text-[10px]">
                PERSONALIZADO
              </Badge>
              <button
                type="button"
                onClick={handleReset}
                title="Restaurar original"
                className="size-7 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          )}

          {activeLightImg && (
            <img
              src={customImg || getAssetPath(activeLightImg)}
              alt={`${title} Light`}
              className={`dark:hidden ${maxHeightClass} w-auto object-contain transition-transform group-hover:scale-105`}
            />
          )}
          {activeDarkImg && (
            <img
              src={customImg || getAssetPath(activeDarkImg)}
              alt={`${title} Dark`}
              className={`hidden dark:block ${maxHeightClass} w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md`}
            />
          )}
        </div>
      )}

      {/* Info Aaarea */}
      <div className="p-6 flex flex-col flex-1 bg-surface">
        <div className="flex gap-2 mb-4">
          <Badge tone={!hasImage ? "neutral" : "info"} appearance="soft" size="sm" className="font-bold uppercase tracking-wider text-[10px] px-2.5 py-1">
            {badge1}
          </Badge>
          {badge2 && (
            <Badge tone={!hasImage ? "neutral" : "warning"} appearance="soft" size="sm" className="font-bold uppercase tracking-wider text-[10px] px-2.5 py-1">
              {badge2}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <h3 className="text-foreground font-bold text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 min-h-[3rem]">
            {description}
          </p>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row gap-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full rounded-full text-xs"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="size-3.5" />}
          >
            {customImg ? "Cambiar archivo" : "Subir nuevo logo"}
          </Button>

          {hasImage && !isMissing && (
            <a href={activeLightImg} download={`${title.toLowerCase().replace(/\s+/g, "-")}.png`} className="w-full">
              <Button variant="neutral" size="sm" className="w-full rounded-full text-xs" leftIcon={<Download className="size-3.5" />}>
                Descargar
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

