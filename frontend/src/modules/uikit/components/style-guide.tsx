"use client";
import { SubSection } from "./sub-section";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Palette,
  Layers,
  Type,
  Box,
  SquareDashed,
  Moon,
  Sun,
  Circle,
  Download,
  Contrast,
  Image as ImageIcon, ImageOff,
  Edit2,
  Ruler,
  LayoutGrid,
  ShieldCheck,
  Pointer,
  Monitor,
  AlertTriangle,
  Check,
  X,
  Copy,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function interpolateColor(hex1: string, hex2: string, factor: number) {
  const cleanHex1 = hex1.replace("#", "");
  const cleanHex2 = hex2.replace("#", "");
  const c1 = parseInt(cleanHex1.length === 3 ? cleanHex1.split("").map((x) => x + x).join("") : cleanHex1, 16);
  const c2 = parseInt(cleanHex2.length === 3 ? cleanHex2.split("").map((x) => x + x).join("") : cleanHex2, 16);
  const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function generateScaleFromBase(baseHex: string) {
  return [
    { level: "50", hex: interpolateColor("#FFFFFF", baseHex, 0.08) },
    { level: "100", hex: interpolateColor("#FFFFFF", baseHex, 0.20) },
    { level: "200", hex: interpolateColor("#FFFFFF", baseHex, 0.38) },
    { level: "300", hex: interpolateColor("#FFFFFF", baseHex, 0.58) },
    { level: "400", hex: interpolateColor("#FFFFFF", baseHex, 0.80) },
    { level: "500", hex: baseHex.toUpperCase() },
    { level: "600", hex: interpolateColor(baseHex, "#000000", 0.18) },
    { level: "700", hex: interpolateColor(baseHex, "#000000", 0.35) },
    { level: "800", hex: interpolateColor(baseHex, "#000000", 0.55) },
    { level: "900", hex: interpolateColor(baseHex, "#000000", 0.75) },
  ];
}

const COLOR_PRESETS = [
  { name: "DINARP Púrpura", hex: "#454193" },
  { name: "DINARP Secundario", hex: "#2D2D96" },
  { name: "Azul Océano", hex: "#0284C7" },
  { name: "Verde Esmeralda", hex: "#16A34A" },
  { name: "Ámbar Dorado", hex: "#D97706" },
  { name: "Rojo Carmesí", hex: "#DC2626" },
  { name: "Teal Marino", hex: "#0D9488" },
  { name: "Violeta Profundo", hex: "#7C3AED" },
  { name: "Rosa Vibrante", hex: "#DB2777" },
  { name: "Pizarra Neutro", hex: "#475569" },
];

function getContrastTextColor(hex: string): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return "#0f172a";
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#0f172a" : "#ffffff";
}

const STEP_ROLES: Record<string, string> = {
  "50": "Fondo sútil",
  "100": "Superficie",
  "200": "Borde suave",
  "300": "Borde medio",
  "400": "Decorativo",
  "500": "Base / Marca",
  "600": "Hover",
  "700": "Presionado",
  "800": "Texto oscuro",
  "900": "Alto contraste",
  "1": "Dato 1",
  "2": "Dato 2",
  "3": "Dato 3",
  "4": "Dato 4",
  "5": "Dato 5",
  "6": "Dato 6",
};
import { Button } from "@/components/ui/button";
import { LogoManagerCard } from "./logo-manager-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Spinner } from "@/components/ui/data-display";

const SEMANTIC_COLORS = [
  {
    name: "Primary",
    title: "Primary",
    hex: "#454193",
    variable: "--primary",
    class: "bg-primary",
    foreground: "text-primary-foreground",
    description: (
      <>
        Color principal para acciones importantes y elementos institucionales.
        Se útiliza, por ejemplo, en botones principales, navegación y
        encabezados destacados.
      </>
    ),
  },
  {
    name: "Secondary",
    title: "Secondary",
    hex: "#8F91C7",
    variable: "--secondary",
    class: "bg-secondary",
    foreground: "text-secondary-foreground",
    description: (
      <>
        Color de apoyo para acciones menos prioritarias, etiquetas, elementos
        complementarios y fondos suaves.
      </>
    ),
  },
  {
    name: "Success",
    title: "Success",
    hex: "#338A86",
    variable: "--success",
    class: "bg-success",
    foreground: "text-success-foreground",
    description: (
      <>
        Indica que una acción se aarealizó correctamente o que un proceso terminó
        de forma satisfactoria.
      </>
    ),
  },
  {
    name: "Warning",
    title: "Warning",
    hex: "#FFB55C",
    variable: "--warning",
    class: "bg-warning",
    foreground: "text-warning-foreground",
    description: (
      <>
        Advierte sobre una situación que requiere atención, pero que todavía no
        representa un error crítico.
      </>
    ),
  },
  {
    name: "Danger",
    title: "Danger",
    hex: "#BC5974",
    variable: "--danger",
    class: "bg-danger",
    foreground: "text-danger-foreground",
    description: (
      <>
        Indica errores, situaciones críticas o acciones que pueden tener
        consecuencias importantes.
      </>
    ),
  },
  {
    name: "Info", title: "Info", hex: "#5E6893",
    variable: "--info",
    class: "bg-info",
    foreground: "text-info-foreground",
    description: (
      <>
        Se útiliza para mostrar información úúútil, instrucciones, ayuda o
        contexto adicional.
      </>
    ),
  },
  {
    name: "Surface",
    title: "Surface",
    hex: "#F4F7F9",
    variable: "--surface",
    class: "bg-surface",
    foreground: "text-foreground",
    description: (
      <>
        Color útilizado como fondo de tarjetas, paneles y áaaaareas donde se
        organiza el contenido.
      </>
    ),
  },
  {
    name: "Muted",
    title: "Muted",
    hex: "#6F7F8F",
    variable: "--muted",
    class: "bg-muted",
    foreground: "text-muted-foreground",
    description: (
      <>
        Se útiliza en información que debe permanecer visible pero con menor
        importancia visual.
      </>
    ),
  },
  {
    name: "Accent",
    title: "Accent",
    hex: "#2A4A7F",
    variable: "--accent",
    class: "bg-accent",
    foreground: "text-accent-foreground",
    description: (
      <>
        Color útilizado para destacar elementos específicos de la interfaz sión
        reemplazar el color principal.
      </>
    ),
  },
];

const FULL_SCALES = [
  {
    name: "Primary",
    title: "Primary",
    prefix: "primary",
    colors: [
      { level: "50", hex: "#F5F5F8" },
      { level: "100", hex: "#EAE9F1" },
      { level: "200", hex: "#C9C7DC" },
      { level: "300", hex: "#A4A1C4" },
      { level: "400", hex: "#7875A8" },
      { level: "500", hex: "#454193" },
      { level: "600", hex: "#373377" },
      { level: "700", hex: "#2A275A" },
      { level: "800", hex: "#1C193D" },
      { level: "900", hex: "#0F0D20" },
    ],
  },
  {
    name: "Secondary",
    title: "Secondary",
    prefix: "secondary",
    colors: [
      { level: "50", hex: "#F6F6FA" },
      { level: "100", hex: "#EBEBF3" },
      { level: "200", hex: "#D0D1E7" },
      { level: "300", hex: "#B5B6D9" },
      { level: "400", hex: "#A0A2D0" },
      { level: "500", hex: "#8F91C7" },
      { level: "600", hex: "#7274A0" },
      { level: "700", hex: "#565779" },
      { level: "800", hex: "#3A3A52" },
      { level: "900", hex: "#1D1D2A" },
    ],
  },
  {
    name: "Success",
    title: "Success",
    prefix: "success",
    colors: [
      { level: "50", hex: "#E6F0F0" },
      { level: "100", hex: "#CCE2E1" },
      { level: "200", hex: "#99C5C3" },
      { level: "300", hex: "#66A7A4" },
      { level: "400", hex: "#338A86" },
      { level: "500", hex: "#006D68" },
      { level: "600", hex: "#005753" },
      { level: "700", hex: "#00413E" },
      { level: "800", hex: "#002C2A" },
      { level: "900", hex: "#001615" },
    ],
  },
  {
    name: "Warning",
    title: "Warning",
    prefix: "warning",
    colors: [
      { level: "50", hex: "#FFF6EB" },
      { level: "100", hex: "#FFEDD6" },
      { level: "200", hex: "#FFDAAD" },
      { level: "300", hex: "#FFC885" },
      { level: "400", hex: "#FFB55C" },
      { level: "500", hex: "#FFA333" },
      { level: "600", hex: "#CC8229" },
      { level: "700", hex: "#99621F" },
      { level: "800", hex: "#664114" },
      { level: "900", hex: "#33210A" },
    ],
  },
  {
    name: "Danger",
    title: "Danger",
    prefix: "danger",
    colors: [
      { level: "50", hex: "#FAF3F5" },
      { level: "100", hex: "#F5E7EB" },
      { level: "200", hex: "#E2B8C4" },
      { level: "300", hex: "#CF899C" },
      { level: "400", hex: "#BC5974" },
      { level: "500", hex: "#9F1239" },
      { level: "600", hex: "#7F0E2E" },
      { level: "700", hex: "#5F0B22" },
      { level: "800", hex: "#400717" },
      { level: "900", hex: "#20040B" },
    ],
  },
  {
    name: "Info",
    title: "Info",
    prefix: "info",
    colors: [
      { level: "50", hex: "#F7F7F8" },
      { level: "100", hex: "#E5E6E9" },
      { level: "200", hex: "#BFC2CB" },
      { level: "300", hex: "#9599AD" },
      { level: "400", hex: "#5E6893" },
      { level: "500", hex: "#2C3459" },
      { level: "600", hex: "#20274A" },
      { level: "700", hex: "#171E3E" },
      { level: "800", hex: "#111733" },
      { level: "900", hex: "#0C1127" },
    ],
  },
  {
    name: "Neutral",
    title: "Gris base",
    prefix: "neutral",
    colors: [
      { level: "50", hex: "#FFFFFF" },
      { level: "100", hex: "#F8F9FA" },
      { level: "200", hex: "#E9ECEF" },
      { level: "300", hex: "#DEE2E6" },
      { level: "400", hex: "#CED4da" },
      { level: "500", hex: "#ADB5BD" },
      { level: "600", hex: "#6C757D" },
      { level: "700", hex: "#495057" },
      { level: "800", hex: "#343A40" },
      { level: "900", hex: "#212529" },
    ],
  },
  {
    name: "Surface",
    title: "Surface",
    prefix: "surface",
    colors: [
      { level: "50", hex: "#FEFFFF" },
      { level: "100", hex: "#FEFEFE" },
      { level: "200", hex: "#FCFDFD" },
      { level: "300", hex: "#FAFBFC" },
      { level: "400", hex: "#F7F9FB" },
      { level: "500", hex: "#F4F7F9" },
      { level: "600", hex: "#C3C6C7" },
      { level: "700", hex: "#929495" },
      { level: "800", hex: "#626364" },
      { level: "900", hex: "#313132" },
    ],
  },
  {
    name: "Muted",
    title: "Muted",
    prefix: "muted",
    colors: [
      { level: "50", hex: "#F8F9F9" },
      { level: "100", hex: "#F1F2F4" },
      { level: "200", hex: "#D4D9DD" },
      { level: "300", hex: "#B7BFC7" },
      { level: "400", hex: "#9AA5B1" },
      { level: "500", hex: "#6F7F8F" },
      { level: "600", hex: "#596672" },
      { level: "700", hex: "#434C56" },
      { level: "800", hex: "#2C3339" },
      { level: "900", hex: "#16191D" },
    ],
  },
  {
    name: "Accent",
    title: "Accent",
    prefix: "accent",
    colors: [
      { level: "50", hex: "#F4F6F9" },
      { level: "100", hex: "#EAEDF2" },
      { level: "200", hex: "#BFC9D9" },
      { level: "300", hex: "#95A5BF" },
      { level: "400", hex: "#6A80A5" },
      { level: "500", hex: "#2A4A7F" },
      { level: "600", hex: "#223B66" },
      { level: "700", hex: "#192C4C" },
      { level: "800", hex: "#111E33" },
      { level: "900", hex: "#080F19" },
    ],
  },
  {
    name: "Data",
    title: "Gráficos y Datos",
    prefix: "chart",
    colors: [
      { level: "1", hex: "#2563EB" },
      { level: "2", hex: "#0891B2" },
      { level: "3", hex: "#7C3AED" },
      { level: "4", hex: "#15803D" },
      { level: "5", hex: "#D97706" },
      { level: "6", hex: "#BE185D" },
    ],
  },
  {
    name: "Avatar",
    title: "Avatar Dinámico",
    prefix: "avatar",
    colors: [
      { level: "0-bg", hex: "#FEE2E2" },
      { level: "1-bg", hex: "#FFEDD5" },
      { level: "2-bg", hex: "#FEF3C7" },
      { level: "3-bg", hex: "#ECFCCB" },
      { level: "4-bg", hex: "#DCFCE7" },
      { level: "5-bg", hex: "#D1FAE5" },
      { level: "6-bg", hex: "#CCFBF1" },
      { level: "7-bg", hex: "#CFFAFE" },
      { level: "8-bg", hex: "#E0F2FE" },
      { level: "9-bg", hex: "#DBEAFE" },
      { level: "10-bg", hex: "#E0E7FF" },
      { level: "11-bg", hex: "#EDE9FE" },
      { level: "12-bg", hex: "#F3E8FF" },
      { level: "13-bg", hex: "#FAE8FF" },
      { level: "14-bg", hex: "#FCE7F3" },
      { level: "15-bg", hex: "#FFE4E6" },
    ],
  },
];

const TYPOGRAPHY_SCALE = [
  {
    level: "H1",
    style: "Título Principal",
    size: "32px",
    lineHeight: "40px",
    weight: "700",
    usage: "Encabezados principales de página",
    className: "text-h1 font-heading font-bold",
  },
  {
    level: "H2",
    style: "Título Secundario",
    size: "24px",
    lineHeight: "32px",
    weight: "600",
    usage: "Secciones dentro de una página",
    className: "text-h2 font-heading font-semibold",
  },
  {
    level: "H3",
    style: "Título Terciario",
    size: "20px",
    lineHeight: "28px",
    weight: "600",
    usage: "Subsecciones o tarjetas",
    className: "text-h3 font-heading font-semibold",
  },
  {
    level: "Body",
    style: "Texto del Cuerpo",
    size: "16px",
    lineHeight: "24px",
    weight: "400",
    usage: "Contenido principal y párrafos",
    className: "text-body font-normal",
  },
  {
    level: "Body Small",
    style: "Texto Secundario",
    size: "14px",
    lineHeight: "20px",
    weight: "400",
    usage: "Descripciones cortas, listas",
    className: "text-body-sm font-normal",
  },
  {
    level: "Caption",
    style: "Nota al Pie",
    size: "12px",
    lineHeight: "16px",
    weight: "400",
    usage: "Metadatos, avisos legales",
    className: "text-caption font-normal",
  },
  {
    level: "Button",
    style: "Texto del Botón",
    size: "14px",
    lineHeight: "20px",
    weight: "500",
    usage: "Etiquetas de botones y acciones",
    className: "text-body-sm font-medium",
  },
];

export function StyleGuide({
  registerSection,
}: {
  registerSection?: (id: string, el: HTMLElement | null) => void;
}) {
  const [scales, setScales] = useState(FULL_SCALES);
  const [activeScaleName, setActiveScaleName] = useState(FULL_SCALES[0].name);
  const activeScale =
    scales.find((s) => s.name === activeScaleName) || scales[0];
  const [scaleViewMode, setScaleViewMode] = useState<"detail" | "matrix">("detail");
  const [simulatedColors, setSimulatedColors] = useState<
    Record<string, string>
  >({});
  const [editingScale, setEditingScale] = useState<{
    scaleName: string;
    baseHex: string;
    newBaseHex: string;
    prefix: string;
  } | null>(null);
  const [editingColor, setEditingColor] = useState<{
    name: string;
    hex: string;
    newHex?: string;
    scaleId?: string;
    level?: string;
  } | null>(null);
  const [isApplyingColor, setIsApplyingColor] = useState(false);

  // tipografía
  const [simulatedFonts, setSimulatedFonts] = useState<{
    heading: string;
    body: string;
  }>({ heading: "Metropolis", body: "Metropolis" });
  const [editingFontFamily, setEditingFontFamily] = useState<{
    id: "heading" | "body";
    title: string;
    currentFont: string;
    newFont?: string;
  } | null>(null);
  const [isApplyingFont, setIsApplyingFont] = useState(false);
  const [showConfirmFont, setShowConfirmFont] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada: ${text}`);
  };

  const handleApplyScaleColor = (scaleName: string, newHex: string) => {
    const generatedShades = generateScaleFromBase(newHex);

    setScales((prev) =>
      prev.map((s) => {
        if (s.name.toLowerCase() === scaleName.toLowerCase()) {
          return {
            ...s,
            colors: generatedShades,
          };
        }
        return s;
      })
    );

    const targetScale = scales.find(
      (s) => s.name.toLowerCase() === scaleName.toLowerCase()
    );
    const prefix = targetScale?.prefix || scaleName.toLowerCase();

    generatedShades.forEach((shade) => {
      document.documentElement.style.setProperty(
        `--primitive-${prefix}-${shade.level}`,
        shade.hex
      );
    });

    const semanticMap: Record<string, string> = {
      primary: "--primary",
      secondary: "--secondary",
      success: "--success",
      warning: "--warning",
      danger: "--danger",
      info: "--info",
    };
    if (semanticMap[prefix]) {
      document.documentElement.style.setProperty(semanticMap[prefix], newHex);
    }

    toast.success("Escala cromática actualizada", {
      description: `La familia "${scaleName}" y la tabla de colores se actualizaron a ${newHex}.`,
    });
    setEditingScale(null);
  };

  const handleResetScales = () => {
    setScales(FULL_SCALES);
    FULL_SCALES.forEach((scale) => {
      scale.colors.forEach((c) => {
        document.documentElement.style.removeProperty(
          `--primitive-${scale.prefix}-${c.level}`
        );
      });
      const semanticMap: Record<string, string> = {
        primary: "--primary",
        secondary: "--secondary",
        success: "--success",
        warning: "--warning",
        danger: "--danger",
        info: "--info",
      };
      if (semanticMap[scale.prefix]) {
        document.documentElement.style.removeProperty(semanticMap[scale.prefix]);
      }
    });
    toast.info("Paleta restaurada", {
      description: "Se han restablecido todas las escalas al estándar original.",
    });
  };

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* Subsección 0: Brand Assets / Logos Oficiales */}
      <SubSection
        id="foundations-logos"
        registerSection={registerSection}
        title="Recursos de Marca: Logotipos"
        icon={ImageIcon}
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
          {/* Card 1: Horizontal */}
          <LogoManagerCard
            slot="horizontal"
            title="Logotipo Horizontal"
            description="Versión principal del logotipo con lema. Recomendada para encabezados, páginas web, documentos y espacios horizontales."
            badge1="HORIZONTAL"
            badge2="PRINCIPAL"
            defaultLightImg="/logo-horizontal.svg"
            defaultDarkImg="/logo-horizontal-blanco.svg"
            monoLightImg="/logo-horizontal-outline-azul.svg"
            monoDarkImg="/logo-horizontal-outline-blanco.svg"
          />

          {/* Card 2: Vertical */}
          <LogoManagerCard
            slot="vertical"
            title="Logotipo Vertical"
            description="Versión vertical del logotipo. Diseñada para composiciones verticales y banners donde el espacio horizontal es reducido."
            badge1="VERTICAL"
            badge2="SECUNDARIO"
            defaultLightImg="/logo-vertical.svg"
            defaultDarkImg="/logo-vertical-blanco.svg"
            monoLightImg="/logo-vertical-outline-azul.svg"
            monoDarkImg="/logo-vertical-outline-blanco.svg"
          />

          {/* Card 3: Símbolo / Compacto */}
          <LogoManagerCard
            slot="sión-lema"
            title="Favicon / Símbolo"
            description="Símbolo representativo (Favicon). Ideal para pestañas del navegador, sidebars contraídos y elementos muy compactos."
            badge1="FAVICON"
            badge2="SÍMBOLO"
            defaultLightImg="/favicon-light.svg"
            defaultDarkImg="/favicon-dark.svg"
            monoLightImg="/favicon-light.svg"
            monoDarkImg="/favicon-dark.svg"
          />

          {/* Card 4: Escudo Nacional */}
          <LogoManagerCard
            slot="escudo"
            title="Escudo Nacional / Institucional"
            description="Versión formal del escudo para documentos oficiales y encabezados de alta jerarquía."
            badge1="ESCUDO"
            badge2="OFICIAL"
            defaultLightImg="/escudo-light.svg"
            defaultDarkImg="/escudo-dark.svg"
            monoLightImg="/escudo-light.svg"
            monoDarkImg="/escudo-dark.svg"
          />
        </div>
      </SubSection>

      {/* Subsección 1.5: Colores de Marca */}
      <SubSection
        id="foundations-colors"
        registerSection={registerSection}
        title="Colores Generales Base y Semánticos"
        icon={Contrast}
        description="Los colores semánticos ayudan a reconocer rápidamente qué está ocurriendo en la interfaz. Cada color comunica un significado específico, como éxito, advertencia, error o información. Estos son colores generales base y semánticos."
      >
        <div className="flex flex-col gap-14">
          {[
            {
              title: "Los Principales",
              dot: "bg-primary",
              filters: ["Primary", "Secondary", "Accent"],
            },
            {
              title: "Semánticos",
              dot: "bg-info",
              filters: ["Success", "Warning", "Danger", "Info"],
            },
            { title: "Otros", dot: "bg-muted", filters: ["Surface", "Muted"] },
          ].map((category) => (
            <div key={category.title} className="flex flex-col gap-8">
              <h4 className="text-2xl font-heading font-bold text-foreground flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${category.dot}`} />
                {category.title}
              </h4>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {SEMANTIC_COLORS.filter((color) =>
                  category.filters.includes(color.name),
                ).map((color) => {
                  const matchingScale = scales.find(
                    (s) => s.name.toLowerCase() === color.name.toLowerCase()
                  );
                  const currentHex =
                    matchingScale?.colors.find(
                      (c) => c.level === "500" || c.level === "1"
                    )?.hex || color.hex;

                  return (
                    <div
                      key={color.name}
                      className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-[2rem] border border-border/40 shadow-sm bg-surface/30 hover:bg-surface hover:shadow-md hover:border-border/80 transition-all duration-300 group"
                    >
                      {/* Swatch */}
                      <div
                        className="w-full h-32 sm:w-32 sm:h-32 rounded-2xl shrink-0 shadow-sm ring-1 ring-black/5 relative overflow-hidden transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundColor: currentHex }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-3 flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
                              {color.title}
                            </h3>
                            <Badge tone="neutral" appearance="soft" className="uppercase text-[9px] font-bold tracking-widest px-2 shadow-none bg-muted/40">
                              {color.name}
                            </Badge>
                          </div>
                          <code className="text-[11px] sm:text-xs font-mono font-bold text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-md border border-border/50">
                            {currentHex}
                          </code>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {color.description}
                        </p>
                        {matchingScale && (
                          <div className="pt-1">
                            <Button
                              variant="neutral"
                              size="sm"
                              className="rounded-full text-xs"
                              onClick={() => {
                                setEditingScale({
                                  scaleName: matchingScale.name,
                                  baseHex: currentHex,
                                  newBaseHex: currentHex,
                                  prefix: matchingScale.prefix,
                                });
                              }}
                            >
                              <Edit2 className="size-3 mr-1.5" />
                              Personalizar escala
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      {/* Subsección 2: Escalas Cromáticas Primitivas */}
      <SubSection
        id="foundations-scales"
        registerSection={registerSection}
        title="Escalas Cromáticas"
        icon={Palette}
        description={
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Escalas cromáticas primitivas Â· 50–900
            </span>
            <p>
              Cada color principal cuenta con diferentes tonos, desde los más
              claros hasta los más oscuros. Estas variaciones permiten caarear
              fondos, bordes, estados al pasar el cursor, elementos
              seleccionados y textos manteniendo una misma familia visual.
            </p>
          </div>
        }
      >
        {/* Top Control Bar: Tabs & View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <Tabs
            value={activeScaleName}
            onValueChange={setActiveScaleName}
            className="w-full lg:w-auto"
          >
            <TabsList className="flex flex-wrap h-auto w-full justify-start lg:w-auto lg:inline-flex p-1 bg-surface border border-border/60 rounded-2xl gap-1">
              {scales.map((scale) => {
                const baseColor =
                  scale.colors.find((c) => c.level === "500" || c.level === "1" || c.level === "0-bg")?.hex ||
                  "#000000";
                const isSelected = activeScaleName === scale.name;
                return (
                  <TabsTrigger
                    key={scale.name}
                    value={scale.name}
                    className={cn(
                      "gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                    )}
                  >
                    <span
                      className="size-2 rounded-full ring-1 ring-black/10 shrink-0"
                      style={{ backgroundColor: baseColor }}
                    />
                    {scale.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-surface border border-border/60 rounded-2xl self-start lg:self-auto shrink-0">
            <button
              onClick={() => setScaleViewMode("detail")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                scaleViewMode === "detail"
                  ? "bg-muted text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" />
              Detalle Rampa
            </button>
            <button
              onClick={() => setScaleViewMode("matrix")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                scaleViewMode === "matrix"
                  ? "bg-muted text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Layers className="size-3.5" />
              Matriz Completa
            </button>
          </div>
        </div>

        {/* View 1: Detailed Ramp View */}
        {scaleViewMode === "detail" && (
          <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-xs flex flex-col gap-8">
            {/* Scale Header & Continuous Spectrum */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-4 rounded-full ring-2 ring-border"
                      style={{
                        backgroundColor:
                          activeScale.colors.find((c) => c.level === "500" || c.level === "1")?.hex ||
                          "currentColor",
                      }}
                    />
                    <h3 className="text-2xl font-heading font-bold text-foreground tracking-tight">
                      {activeScale.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      size="sm"
                      className="font-mono text-[10px] uppercase font-bold"
                    >
                      Token: bg-{activeScale.prefix}-*
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {activeScale.colors.length} escalones de contraste
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => {
                      const base = activeScale.colors.find((c) => c.level === "500" || c.level === "1")?.hex || "#454193";
                      setEditingScale({
                        scaleName: activeScale.name,
                        baseHex: base,
                        newBaseHex: base,
                        prefix: activeScale.prefix,
                      });
                    }}
                  >
                    <Edit2 className="size-3.5 mr-1.5" />
                    Editar Escala
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => {
                      const base = activeScale.colors.find((c) => c.level === "500" || c.level === "1");
                      if (base) handleCopy(base.hex, `HEX ${activeScale.name} Base`);
                    }}
                  >
                    <Copy className="size-3.5 mr-1.5" />
                    Copiar HEX Base
                  </Button>
                  <Button
                    variant="neutral"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={handleResetScales}
                    title="Restablecer paleta original"
                  >
                    <RotateCcw className="size-3.5 mr-1.5" />
                    Restablecer
                  </Button>
                </div>
              </div>

              {/* Continuous Connected Spectrum Ribbon */}
              <div className="flex flex-col gap-2">
                <div className="h-6 w-full rounded-2xl overflow-hidden flex border border-border/60 shadow-inner">
                  {activeScale.colors.map((c) => (
                    <button
                      key={c.level}
                      onClick={() => handleCopy(`bg-${activeScale.prefix}-${c.level}`, "Clase Tailwind")}
                      className="h-full flex-1 transition-all duration-200 hover:scale-y-125 origin-bottom relative group cursor-pointer"
                      style={{ backgroundColor: c.hex }}
                      title={`${activeScale.prefix}-${c.level} (${c.hex})`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center px-1 text-[10px] font-mono text-muted-foreground">
                  <span>â† Tonos Claros (Fondos / Superficies)</span>
                  <span>Tonos Oscuros (Bordes / Textos) â†’</span>
                </div>
              </div>
            </div>

            {/* Swatches Ramp Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {activeScale.colors.map((color) => {
                const specificSimulatedColor =
                  simulatedColors[`${activeScale.name}-${color.level}`];
                const isSimulatedBase = !!simulatedColors[activeScale.name];
                const isMain =
                  color.level === "500" ||
                  color.level === "1" ||
                  color.level === "0-bg";

                const displayHex =
                  specificSimulatedColor ||
                  (isSimulatedBase && isMain
                    ? simulatedColors[activeScale.name]
                    : color.hex);

                const textColor = getContrastTextColor(displayHex);
                const role = STEP_ROLES[color.level] || `Nivel ${color.level}`;

                return (
                  <div
                    key={color.level}
                    className="group flex flex-col rounded-2xl bg-surface border border-border/60 overflow-hidden shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    {/* Top Swatch Block */}
                    <div
                      className="relative h-24 w-full p-2.5 flex flex-col justify-between transition-transform duration-300"
                      style={{ backgroundColor: displayHex }}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className="font-bold font-mono text-xs tracking-tight"
                          style={{ color: textColor }}
                        >
                          {color.level}
                        </span>

                        {isMain && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full backdrop-blur-md bg-black/20 text-white shadow-xs">
                            Base
                          </span>
                        )}
                      </div>

                      {/* Hover 1-click copy action on swatch */}
                      <button
                        onClick={() => handleCopy(`bg-${activeScale.prefix}-${color.level}`, "Clase Tailwind")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg backdrop-blur-md bg-black/25 text-white self-end hover:scale-110 active:scale-95"
                        title="Copiar clase Tailwind"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>

                    {/* Meta & Token Info */}
                    <div className="p-2.5 flex flex-col gap-1.5 bg-surface flex-1 justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-foreground/80 truncate">
                          {role}
                        </p>
                        <button
                          onClick={() => handleCopy(displayHex, "HEX")}
                          className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center justify-between w-full group/hex"
                          title="Copiar HEX"
                        >
                          <span>{displayHex}</span>
                          <Copy className="size-2.5 opacity-0 group-hover/hex:opacity-100" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleCopy(`bg-${activeScale.prefix}-${color.level}`, "Clase Tailwind")}
                        className="w-full text-center text-[9px] font-mono py-1 px-1 rounded-md bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors truncate"
                        title="Copiar token Tailwind"
                      >
                        bg-{activeScale.prefix}-{color.level}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Comparative Matrix View */}
        {scaleViewMode === "matrix" && (
          <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-heading font-bold text-foreground">
                Matriz Comparativa de Todas las Escalas
              </h3>
              <p className="text-xs text-muted-foreground">
                Compara la consistencia tonal y luminosidad en paralelo entre todas las familias cromáticas.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {scales.map((scale) => (
                <div
                  key={scale.name}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-2xl bg-surface border border-border/50 hover:border-primary/40 transition-colors"
                >
                  <div className="w-40 shrink-0 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveScaleName(scale.name);
                        setScaleViewMode("detail");
                      }}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors text-left flex items-center gap-2"
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            scale.colors.find((c) => c.level === "500" || c.level === "1" || c.level === "0-bg")?.hex ||
                            "#000",
                        }}
                      />
                      {scale.name}
                    </button>
                    <code className="text-[10px] font-mono text-muted-foreground">
                      {scale.prefix}
                    </code>
                  </div>

                  <div className="flex-1 h-10 rounded-xl overflow-hidden flex border border-border/60 shadow-inner">
                    {scale.colors.map((c) => {
                      const textColor = getContrastTextColor(c.hex);
                      return (
                        <button
                          key={c.level}
                          onClick={() => handleCopy(`bg-${scale.prefix}-${c.level}`, "Clase Tailwind")}
                          style={{ backgroundColor: c.hex }}
                          className="flex-1 h-full flex flex-col items-center justify-center transition-transform hover:scale-y-125 origin-center group relative cursor-pointer"
                          title={`${scale.name} ${c.level}: ${c.hex}`}
                        >
                          <span
                            className="text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: textColor }}
                          >
                            {c.level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SubSection>

      {/* Subsección 3: Sistema Tipográfico */}
      <SubSection
        id="foundations-typography"
        registerSection={registerSection}
        title="tipografía"
        icon={Type}
        description={
          <>
            Jerarquía visual útilizando{" "}
            <strong className="text-foreground">
              {simulatedFonts.heading}
            </strong>{" "}
            para títulos y encabezados, combinada con{" "}
            <strong className="text-foreground">{simulatedFonts.body}</strong>{" "}
            para cuerpo de texto.
          </>
        }
      >
        <div className="flex flex-col gap-10">
          {[
            {
              id: "heading" as const,
              title: "tipografía de títulos",
              currentFont: simulatedFonts.heading,
              items: TYPOGRAPHY_SCALE.filter((t) =>
                t.className.includes("font-heading"),
              ),
            },
            {
              id: "body" as const,
              title: "tipografía de cuerpo",
              currentFont: simulatedFonts.body,
              items: TYPOGRAPHY_SCALE.filter(
                (t) => !t.className.includes("font-heading"),
              ),
            },
          ].map((group) => (
            <div key={group.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-h4 font-bold text-foreground flex items-center gap-2">
                  {group.title}{" "}
                  <Badge
                    appearance="soft"
                    tone="neutral"
                    className="ml-2 font-mono"
                  >
                    {group.currentFont}
                  </Badge>
                </h4>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() =>
                    setEditingFontFamily({
                      id: group.id,
                      title: group.title,
                      currentFont: group.currentFont,
                      newFont: group.currentFont,
                    })
                  }
                >
                  <Edit2 className="size-3.5 mr-1.5" />
                  Cambiar tipografía
                </Button>
              </div>

              <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-card text-left shadow-sm">
                <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-4 border-b border-border bg-muted/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-2">Token</div>
                  <div className="col-span-3">Esúútilo & Peso</div>
                  <div className="col-span-2">Tamaño</div>
                  <div className="col-span-5">Muestra</div>
                </div>
                {group.items.map((type, i) => (
                  <div
                    key={type.level}
                    className={cn(
                      "grid grid-cols-1 md:grid-cols-12 gap-6 px-8 py-6 md:items-center",
                      i !== group.items.length - 1 && "border-b border-border",
                    )}
                  >
                    <div className="md:col-span-2 flex items-center justify-start">
                      <span className="font-mono text-sm font-bold text-primary">
                        {type.level}
                      </span>
                    </div>
                    <div className="md:col-span-3 flex flex-col justify-center items-start text-left">
                      <span className="text-sm font-medium text-foreground">
                        {type.style}
                      </span>
                      <span className="text-caption text-muted-foreground mt-0.5">
                        {type.weight}
                      </span>
                    </div>
                    <div className="md:col-span-2 flex flex-col items-start justify-center gap-1">
                      <Badge
                        tone="neutral"
                        appearance="soft"
                        size="md"
                        className="font-mono"
                      >
                        {type.size}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        LH: {type.lineHeight}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "md:col-span-5 truncate text-left flex items-center justify-start text-foreground",
                        type.className,
                      )}
                      style={{ fontFamily: group.currentFont }}
                    >
                      El veloz murciélago hindú comía...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      {/* Subsección 4: Sombras y Elevación */}
      <SubSection
        id="foundations-shadows"
        registerSection={registerSection}
        title="Sombras y Elevación"
        icon={Layers}
        description="Sistema de sombras semánticas para establecer jerarquía y caarear sensación de volumen aareal."
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[
            {
              level: "xs",
              class: "shadow-xs",
              desc: "Elementos interactivos pequeños, inputs",
            },
            {
              level: "sm",
              class: "shadow-sm",
              desc: "Botones, tarjetas sútiles",
            },
            {
              level: "md",
              class: "shadow-md",
              desc: "Dropdowns, menús, tarjetas elevadas",
            },
            {
              level: "lg",
              class: "shadow-lg",
              desc: "Modales, popovers destacados",
            },
          ].map((shadow) => (
            <div
              key={shadow.level}
              className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-[2rem] border border-border/40 shadow-sm bg-surface/30 hover:bg-surface hover:shadow-md hover:border-border/80 transition-all duration-300 group"
            >
              {/* Swatch */}
              <div className="w-full h-32 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center p-2 rounded-3xl bg-white dark:bg-neutral-950 border border-border/20 shadow-inner">
                <div
                  className={cn(
                    "w-full h-full bg-surface border border-border/30 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-1.5 relative overflow-hidden",
                    shadow.class
                  )}
                >
                  <span className="text-2xl font-heading font-bold text-foreground">
                    {shadow.level.toUpperCase()}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-3 flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight uppercase">
                      {shadow.level}
                    </h3>
                  </div>
                  <code className="text-[11px] sm:text-xs font-mono font-bold text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-md border border-border/50">
                    var(--elevation-{shadow.level})
                  </code>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {shadow.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      {/* Subsección 5: Radios y Bordes */}
      <SubSection
        id="foundations-radius"
        registerSection={registerSection}
        title="Radios y Bordes"
        icon={SquareDashed}
        description="Redondez base del sistema (0.75rem) aplicada proporcionalmente a los elementos."
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[
            {
              level: "sm",
              class: "rounded-sm",
              px: "4.8px",
              desc: "Inputs o chips compactos",
            },
            {
              level: "md",
              class: "rounded-md",
              px: "9.6px",
              desc: "Controles y elementos secundarios",
            },
            {
              level: "lg",
              class: "rounded-lg",
              px: "12px",
              desc: "Tarjetas y paneles",
            },
            {
              level: "xl",
              class: "rounded-xl",
              px: "16.8px",
              desc: "Modales y contenedores grandes",
            },
            {
              level: "full",
              class: "rounded-full",
              px: "100%",
              desc: "Botones principales y avatares",
            },
          ].map((radius) => (
            <div
              key={radius.level}
              className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-[2rem] border border-border/40 shadow-sm bg-surface/30 hover:bg-surface hover:shadow-md hover:border-border/80 transition-all duration-300 group"
            >
              {/* Swatch */}
              <div className="w-full h-32 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center p-2 rounded-3xl bg-white dark:bg-neutral-950 border border-border/20 shadow-inner">
                <div
                  className={cn(
                    "w-full h-full bg-surface border-2 border-border/60 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 relative overflow-hidden",
                    radius.class
                  )}
                >
                  <span className="font-mono text-lg font-bold text-foreground tracking-tight">
                    {radius.px}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-3 flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight uppercase">
                      {radius.level}
                    </h3>
                  </div>
                  <code className="text-[11px] sm:text-xs font-mono font-bold text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-md border border-border/50">
                    var(--radius-{radius.level})
                  </code>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {radius.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      {/* Subsección 6: Espaciado */}
      <SubSection
        id="foundations-spacing"
        registerSection={registerSection}
        title="Espaciado"
        icon={Ruler}
        description="Escala útilizada para mantener consistencia en márgenes, paddings y separación entre elementos."
      >
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            DINARP útiliza la escala de espaciado definida por el sistema. Se
            recomienda evitar valores arbitrarios fuera de esta escala.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { px: "4px", token: "space-1", w: "w-1" },
              { px: "8px", token: "space-2", w: "w-2" },
              { px: "12px", token: "space-3", w: "w-3" },
              { px: "16px", token: "space-4", w: "w-4" },
              { px: "20px", token: "space-5", w: "w-5" },
              { px: "24px", token: "space-6", w: "w-6" },
              { px: "32px", token: "space-8", w: "w-8" },
              { px: "40px", token: "space-10", w: "w-10" },
              { px: "48px", token: "space-12", w: "w-12" },
            ].map((space) => (
              <div
                key={space.token}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-surface shadow-sm hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-16 flex flex-col gap-0.5 shrink-0">
                  <span className="font-bold text-foreground">{space.px}</span>
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 w-fit px-1.5 py-0.5 rounded border border-border">
                    {space.token}
                  </span>
                </div>
                <div className="flex-1 flex justify-start">
                  <div
                    className={cn(
                      "h-6 bg-primary/20 rounded-sm border border-primary/30",
                      space.w,
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SubSection>

      {/* Subsección 7: Grid y Layout */}
      <SubSection
        id="foundations-grid-layout"
        registerSection={registerSection}
        title="Grid y Layout"
        icon={LayoutGrid}
        description="Estructura útilizada para organizar y alinear el contenido en las diferentes resoluciones de DINARP."
      >
        <div className="flex flex-col gap-12">
          {/* Grid visual */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xl font-heading font-bold text-foreground">
              Grid Responsivo
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm max-w-5xl mb-2">
              <div className="p-4 rounded-xl border border-border/60 bg-surface flex flex-col gap-1.5 shadow-xs">
                <span className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                  <div className="size-1.5 rounded-full bg-primary" />
                  Estructura Base
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Divide el lienzo en <strong className="text-foreground">columnas</strong>, <strong className="text-foreground">gutters</strong> y <strong className="text-foreground">márgenes</strong> para asegurar orden y proporción uniforme en todos los módulos.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-surface flex flex-col gap-1.5 shadow-xs">
                <span className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                  <div className="size-1.5 rounded-full bg-primary" />
                  Baareakpoints
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Desktop:</strong> 12 col Â· <strong className="text-foreground">Tablet:</strong> 8 col Â· <strong className="text-foreground">Mobile:</strong> 4 col con apilamiento fluido y prioridad visual.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-surface flex flex-col gap-1.5 shadow-xs">
                <span className="font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
                  <div className="size-1.5 rounded-full bg-primary" />
                  Comportamiento
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Distribuciones complejas (ej. 8 col formulario + 4 col panel) se transforman en flujos apilados de ancho completo en móvil.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Desktop */}
              <div className="flex flex-col gap-4 border border-border/60 rounded-[2rem] p-6 bg-surface shadow-sm">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-foreground">Desktop</h5>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    12 columnas
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-2">
                  <span>Gutter: 24px</span>
                  <span>Â·</span>
                  <span>Margen: 32px</span>
                </div>
                <div className="flex gap-1 h-32 w-full px-4 border-x-[3px] border-primary bg-primary/5 rounded-lg shadow-inner">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded border border-primary/30 h-full shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Tablet */}
              <div className="flex flex-col gap-4 border border-border/60 rounded-[2rem] p-6 bg-surface shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-foreground">Tablet</h5>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    8 columnas
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-2">
                  <span>Gutter: 24px</span>
                  <span>Â·</span>
                  <span>Margen: 24px</span>
                </div>
                <div className="flex gap-1.5 h-32 w-full px-3 border-x-[3px] border-primary bg-primary/5 rounded-lg shadow-inner">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded border border-primary/30 h-full shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-4 border border-border/60 rounded-[2rem] p-6 bg-surface shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-foreground">Mobile</h5>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    4 columnas
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mb-2">
                  <span>Gutter: 16px</span>
                  <span>Â·</span>
                  <span>Margen: 16px</span>
                </div>
                <div className="flex gap-2 h-32 w-full px-2 border-x-[3px] border-primary bg-primary/5 rounded-lg shadow-inner">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded border border-primary/30 h-full shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>


        </div>
      </SubSection>



      <Dialog
        open={!!editingColor}
        onOpenChange={(open) => !open && setEditingColor(null)}
      >
        <DialogContent variant="warning" className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-warning">
              Editar color {editingColor?.name}
            </DialogTitle>
            <DialogDescription>
              vas a modificar el color base del sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Color actual */}
              <div className="flex flex-col gap-2 items-center">
                <span className="text-sm font-bold text-foreground">
                  Color actual
                </span>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface w-full">
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm"
                    style={{ backgroundColor: editingColor?.hex }}
                  />
                  <span className="font-mono text-base font-bold uppercase">
                    {editingColor?.hex}
                  </span>
                </div>
              </div>

              {/* Right Column: Nuevo color */}
              <div className="flex flex-col gap-2 items-center">
                <span className="text-sm font-bold text-foreground">
                  Nuevo color (Simulación)
                </span>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface w-full relative">
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm relative overflow-hidden"
                    style={{
                      backgroundColor:
                        editingColor?.newHex || editingColor?.hex,
                    }}
                  >
                    <input
                      type="color"
                      value={
                        editingColor?.newHex || editingColor?.hex || "#000000"
                      }
                      onChange={(e) =>
                        setEditingColor((prev) =>
                          prev ? { ...prev, newHex: e.target.value } : null,
                        )
                      }
                      className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer opacity-0"
                    />
                  </div>
                  <span className="font-mono text-base font-bold uppercase">
                    {editingColor?.newHex || editingColor?.hex}
                  </span>
                </div>
              </div>
            </div>

            {/* Alert */}
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-center gap-3 font-sans">
              <svg
                className="size-5 text-warning shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex flex-col gap-2 flex-1">
                {editingColor &&
                  [
                    "Government Accent 1",
                    "Government Accent 2",
                    "Government Accent 3",
                  ].includes(editingColor.name) ? (
                  <p className="text-sm text-warning-900 dark:text-warning-200 text-left font-normal">
                    Este color es un acento gubernamental y{" "}
                    <strong className="font-bold">
                      no cuenta con una escala cromática
                    </strong>{" "}
                    de 10 tonos en el sistema. Su modificación solo afectará a
                    esta variable en particular.
                  </p>
                ) : (
                  <p className="text-sm text-warning-900 dark:text-warning-200 text-left font-normal">
                    Estás editando el color base (
                    <strong className="font-bold">tono 500</strong>) de la
                    escala. El resto de los tonos debe{" "}
                    <strong className="font-bold">
                      terminar de editarse en la escala
                    </strong>
                    , por lo que se recomienda caarear o generar la escala a
                    partir de este.
                  </p>
                )}

                {editingColor &&
                  [
                    "Government Primary",
                    "Government Secondary",
                    "Government Info",
                  ].includes(editingColor.name) && (
                    <p className="text-sm text-warning-900 dark:text-warning-200 font-medium mt-1 text-left">
                      Al cambiar este color gubernamental, también estás
                      modificando el color base de la escala semántica{" "}
                      <strong className="font-bold">
                        {editingColor.name === "Government Primary"
                          ? "Primary"
                          : editingColor.name === "Government Secondary"
                            ? "Secondary"
                            : "Info"}
                      </strong>
                      , lo que afectará las variables y componentes de
                      desarrollo.
                    </p>
                  )}

                {editingColor &&
                  editingColor.scaleId &&
                  editingColor.level === "500" && (
                    <p className="text-sm text-warning-900 dark:text-warning-200 font-medium mt-1 text-left">
                      Al editar el tono 500, estás modificando el color
                      principal de toda la escala{" "}
                      <strong className="font-bold">
                        {editingColor.scaleId}
                      </strong>
                      {["Primary", "Secondary", "Info"].includes(
                        editingColor.scaleId,
                      ) &&
                        ` y su color gubernamental asociado, lo que impactará directamente en las variables de desarrollo y el diseño general.`}
                    </p>
                  )}
              </div>
            </div>
          </div>

          <DialogFooter className="w-full pt-4">
            <div className="grid grid-cols-2 w-full gap-3">
              <Button
                variant="neutral"
                className="w-full"
                onClick={() => setEditingColor(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="warning"
                className="w-full whitespace-nowrap"
                disabled={isApplyingColor}
                onClick={async () => {
                  if (!editingColor?.newHex) {
                    setEditingColor(null);
                    return;
                  }

                  const updates: Record<string, string> = {};
                  if (editingColor.scaleId) {
                    if (editingColor.level === "500" || !editingColor.level) {
                      updates[editingColor.scaleId] = editingColor.newHex;
                      if (editingColor.scaleId === "Primary")
                        updates["Government Primary"] = editingColor.newHex;
                      if (editingColor.scaleId === "Secondary")
                        updates["Government Secondary"] = editingColor.newHex;
                      if (editingColor.scaleId === "Info")
                        updates["Government Info"] = editingColor.newHex;
                    } else {
                      updates[`${editingColor.scaleId}-${editingColor.level}`] =
                        editingColor.newHex;
                    }
                  } else {
                    updates[editingColor.name] = editingColor.newHex;
                    if (editingColor.name === "Government Primary")
                      updates["Primary"] = editingColor.newHex;
                    if (editingColor.name === "Government Secondary")
                      updates["Secondary"] = editingColor.newHex;
                    if (editingColor.name === "Government Info")
                      updates["Info"] = editingColor.newHex;
                  }

                  setIsApplyingColor(true);
                  try {
                    const res = await fetch("/api/kit-colors", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ updates }),
                    });
                    if (!res.ok)
                      throw new Error(
                        (await res.json().catch(() => null))?.error ??
                        `HTTP ${res.status}`,
                      );

                    setSimulatedColors((prev) => ({ ...prev, ...updates }));
                    toast.success("Color actualizado", {
                      description:
                        "Se guardó en el bucket de borrador del kit.",
                    });
                  } catch (err) {
                    toast.error("No se pudo guardar el color", {
                      description:
                        err instanceof Error
                          ? err.message
                          : "Error desconocido.",
                    });
                  } finally {
                    setIsApplyingColor(false);
                    setEditingColor(null);
                  }
                }}
              >
                {isApplyingColor ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Confirmar cambio"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Typography Family Edit Dialog */}
      <Dialog
        open={!!editingFontFamily && !showConfirmFont}
        onOpenChange={(open) => !open && setEditingFontFamily(null)}
      >
        <DialogContent
          variant="info"
          className="sm:max-w-xl"
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target?.closest('[data-slot="combobox-content"]')) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target?.closest('[data-slot="combobox-content"]')) {
              e.preventDefault();
            }
          }}
          onFocusOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target?.closest('[data-slot="combobox-content"]')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-info">Cambiar tipografía</DialogTitle>
            <DialogDescription>
              Selecciona la nueva familia tipográfica que útilizará esta escala.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-6">
            {/* Combobox container */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-foreground">
                  tipografía actual
                </span>
                <Badge
                  appearance="outline"
                  tone="neutral"
                  size="md"
                  className="capitalize"
                >
                  {editingFontFamily?.currentFont}
                </Badge>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <span className="text-sm font-semibold text-foreground text-left px-1">
                  Nueva tipografía
                </span>
                <div className="w-full">
                  <Combobox
                    value={editingFontFamily?.newFont || ""}
                    onValueChange={(val) => {
                      if (val)
                        setEditingFontFamily((prev) =>
                          prev ? { ...prev, newFont: val as string } : null,
                        );
                    }}
                  >
                    <ComboboxInput placeholder="Buscar o seleccionar tipografía..." />
                    <ComboboxContent>
                      <ComboboxList>
                        {[
                          "Metropolis",
                          "Montserrat",
                          "Poppins",
                          "Roboto",
                          "Inter",
                          "Open Sans",
                          "Lato",
                          "Oswald",
                        ].map((font) => (
                          <ComboboxItem
                            key={font}
                            value={font}
                            className={cn(
                              "flex items-center justify-between",
                              editingFontFamily?.newFont === font &&
                              "bg-primary/5 text-primary font-bold",
                            )}
                          >
                            <span style={{ fontFamily: font }}>{font}</span>
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <div className="p-4 bg-info/10 border border-info/30 rounded-xl flex items-center gap-3 mt-1">
                  <svg
                    className="size-5 text-info shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-info-900 dark:text-info-200 flex-1 text-left">
                    Selecciona únicamente la familia tipográfica. La escala de
                    tamaños, pesos y alturas de línea se conservará.
                  </p>
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-foreground">
                Vista previa
              </span>
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Actual */}
                <div className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Actual
                  </span>
                  <span className="font-medium">
                    {editingFontFamily?.currentFont}
                  </span>
                  <div
                    className="text-4xl"
                    style={{ fontFamily: editingFontFamily?.currentFont }}
                  >
                    Aa
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ fontFamily: editingFontFamily?.currentFont }}
                  >
                    Título de ejemplo
                  </div>
                  <div
                    className="text-sm"
                    style={{ fontFamily: editingFontFamily?.currentFont }}
                  >
                    Texto de ejemplo
                  </div>
                </div>

                {/* Right: Nueva */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-3">
                  <span className="text-xs font-bold text-primary uppercase">
                    Nueva
                  </span>
                  <span className="font-medium text-primary">
                    {editingFontFamily?.newFont}
                  </span>
                  <div
                    className="text-4xl text-primary"
                    style={{ fontFamily: editingFontFamily?.newFont }}
                  >
                    Aa
                  </div>
                  <div
                    className="text-lg font-bold text-primary"
                    style={{ fontFamily: editingFontFamily?.newFont }}
                  >
                    Título de ejemplo
                  </div>
                  <div
                    className="text-sm text-primary"
                    style={{ fontFamily: editingFontFamily?.newFont }}
                  >
                    Texto de ejemplo
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="w-full pt-4">
            <div className="grid grid-cols-2 w-full gap-3">
              <Button
                variant="neutral"
                className="w-full"
                onClick={() => setEditingFontFamily(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="info"
                className="w-full whitespace-nowrap"
                onClick={() => setShowConfirmFont(true)}
                disabled={
                  !editingFontFamily?.newFont ||
                  editingFontFamily.newFont === editingFontFamily.currentFont
                }
              >
                Aplicar tipografía
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Font Dialog */}
      <Dialog open={showConfirmFont} onOpenChange={setShowConfirmFont}>
        <DialogContent variant="warning" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-warning">
              Â¿Cambiar esta tipografía?
            </DialogTitle>
            <DialogDescription>
              La nueva familia se aplicará a todos los esúútilos asociados a esta
              escala tipográfica. Los tamaños, pesos y alturas de línea se
              conservarán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full pt-4 mt-2">
            <div className="flex flex-col w-full gap-3">
              <Button
                variant="warning"
                className="w-full"
                disabled={isApplyingFont}
                onClick={() => {
                  if (!editingFontFamily?.newFont) return;
                  setIsApplyingFont(true);
                  try {
                    const fontName = editingFontFamily.newFont;
                    const linkId = `google-font-${fontName.replace(/\s+/g, "-")}`;
                    if (!document.getElementById(linkId)) {
                      const link = document.createElement("link");
                      link.id = linkId;
                      link.rel = "stylesheet";
                      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800&display=swap`;
                      document.head.appendChild(link);
                    }

                    if (editingFontFamily.id === "heading") {
                      document.documentElement.style.setProperty(
                        "--font-heading",
                        `'${fontName}', sans-serif`
                      );
                    } else {
                      document.documentElement.style.setProperty(
                        "--font-sans",
                        `'${fontName}', sans-serif`
                      );
                    }

                    setSimulatedFonts((prev) => ({
                      ...prev,
                      [editingFontFamily.id]: fontName,
                    }));

                    toast.success("tipografía actualizada", {
                      description: `Se aplicó la familia "${fontName}" a ${editingFontFamily.id === "heading" ? "títulos" : "cuerpo de texto"
                        }.`,
                    });
                    setEditingFontFamily(null);
                    setShowConfirmFont(false);
                  } catch (err) {
                    toast.error("No se pudo aplicar la tipografía", {
                      description:
                        err instanceof Error
                          ? err.message
                          : "Error desconocido.",
                    });
                  } finally {
                    setIsApplyingFont(false);
                  }
                }}
              >
                {isApplyingFont ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Aplicando...
                  </>
                ) : (
                  "Confirmar cambio"
                )}
              </Button>
              <Button
                variant="neutral"
                className="w-full"
                disabled={isApplyingFont}
                onClick={() => setShowConfirmFont(false)}
              >
                Cancelar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Color Scale */}
      <Dialog
        open={Boolean(editingScale)}
        onOpenChange={(open) => !open && setEditingScale(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <span>Personalizar Escala: {editingScale?.scaleName}</span>
            </DialogTitle>
            <DialogDescription>
              Selecciona o ingresa un nuevo color base (Nivel 500). El sistema
              calculará automáticamente toda la rampa cromática (50–900) y
              actualizará la tabla y componentes en tiempo aareal.
            </DialogDescription>
          </DialogHeader>

          {editingScale && (
            <div className="flex flex-col gap-6 py-4">
              {/* Color Picker Control */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="relative size-16 rounded-2xl overflow-hidden shadow-inner border border-border/80 shrink-0">
                  <input
                    type="color"
                    value={editingScale.newBaseHex}
                    onChange={(e) =>
                      setEditingScale((prev) =>
                        prev ? { ...prev, newBaseHex: e.target.value.toUpperCase() } : null
                      )
                    }
                    className="absolute -inset-4 size-24 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col flex-1 w-full gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Código HEX del color base
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingScale.newBaseHex}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith("#")) val = `#${val}`;
                        setEditingScale((prev) =>
                          prev ? { ...prev, newBaseHex: val.toUpperCase() } : null
                        );
                      }}
                      className="h-10 px-3 rounded-xl border border-border bg-surface font-mono font-bold text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Paletas sugeridas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setEditingScale((prev) =>
                          prev ? { ...prev, newBaseHex: preset.hex } : null
                        )
                      }
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer",
                        editingScale.newBaseHex.toLowerCase() === preset.hex.toLowerCase()
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        className="size-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview of Generated 10-Shade Scale */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Rampa generada en vivo (50 â†’ 900):</span>
                  <span className="font-mono text-[10px]">10 escalones</span>
                </div>
                <div className="h-12 w-full rounded-2xl overflow-hidden flex border border-border shadow-inner">
                  {generateScaleFromBase(editingScale.newBaseHex).map((shade) => {
                    const textC = getContrastTextColor(shade.hex);
                    return (
                      <div
                        key={shade.level}
                        className="flex-1 h-full flex flex-col items-center justify-center relative group"
                        style={{ backgroundColor: shade.hex }}
                        title={`${shade.level}: ${shade.hex}`}
                      >
                        <span
                          className="text-[9px] font-mono font-bold opacity-80"
                          style={{ color: textC }}
                        >
                          {shade.level}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="neutral"
              className="rounded-full"
              onClick={() => setEditingScale(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="rounded-full"
              disabled={!editingScale?.newBaseHex}
              onClick={() => {
                if (editingScale) {
                  handleApplyScaleColor(editingScale.scaleName, editingScale.newBaseHex);
                }
              }}
            >
              Aplicar a la tabla y componentes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}





