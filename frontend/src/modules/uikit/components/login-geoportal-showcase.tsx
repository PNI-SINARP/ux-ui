"use client";

import React from "react";
import { SubSection } from './sub-section';
import { UserCircle2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { InputGroup, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, ArrowRight, LayoutList, Layers, MousePointerClick } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Stepper, Step } from "@/components/ui/stepper";

const LOGIN_STEPS: Step[] = [
  { id: "info", title: "Info", icon: LayoutList },
  { id: "cards", title: "Tarjetas", icon: Layers },
  { id: "buttons", title: "Botones", icon: MousePointerClick },
];

const defaultLoginConfig = {
  title: "Bienvenido al \n Geoportal DINARP",
  description: "Información geoespacial, análisis de riesgos e indicadores territoriales para apoyar la toma de decisiones sobre las instituciones educativas.",
  cards: [
    { title: "Visor territorial", description: "Explora instituciones educativas, capas geográficas y áaaaareas de influencia.", icon: "Map", color: "primary" },
    { title: "Riesgos e indicadores", description: "Consulta niveles de riesgo, alertas e indicadores del entorno educativo.", icon: "FileText", color: "success" },
    { title: "Reportes y fichas", description: "Analiza información territorial y genera fichas y reportes institucionales.", icon: "BarChart3", color: "info" },
    { title: "Asistente IA", description: "Consulta información del Geoportal útilizando lenguaje natural.", icon: "Bot", color: "warning" },
  ],
  loginButtonText: "Iniciar sesión",
  googleButtonText: "Iniciar sesión con Google",
};

export function LoginGeoportalShowcase() {
  const [config, setConfig] = React.useState(defaultLoginConfig);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [draftConfig, setDraftConfig] = React.useState(defaultLoginConfig);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleSave = () => {
    setConfig(draftConfig);
    setIsModalOpen(false);
    toast.success("Configuración del login guardada correctamente");
  };

  const handleOpen = () => {
    setDraftConfig(config);
    setActiveStep(0);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_LOGIN', payload: config }, '*');
    }
  }, [config]);

  return (
    <div className="space-y-6">
      {/* ── Preview container ── */}
      <div className="flex justify-center">
        <div className="relative border border-border rounded-xl overflow-hidden shadow-sm bg-background w-full">
          <iframe
            ref={iframeRef}
            src={`/login-geoportal`}
            className="w-full h-[800px] border-none bg-background pointer-events-auto"
            title="Login Preview"
            onLoad={() => {
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_LOGIN', payload: config }, '*');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

