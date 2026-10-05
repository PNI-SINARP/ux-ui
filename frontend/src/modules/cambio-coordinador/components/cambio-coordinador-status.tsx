"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  UserCheck,
  Send,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EstadoDocumentoAnexoC,
  EstadoTramiteAnexoC
} from "../data/cambio-coordinador-store";

interface DocumentoStatusBadgeProps {
  status: EstadoDocumentoAnexoC;
  size?: "sm" | "md";
  className?: string;
}

export function DocumentoStatusBadge({
  status,
  size = "md",
  className
}: DocumentoStatusBadgeProps) {
  switch (status) {
    case "Borrador":
      return (
        <Badge
          tone="neutral"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-border", className)}
        >
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span>Borrador</span>
        </Badge>
      );
    case "Firmado":
      return (
        <Badge
          tone="primary"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-primary/20", className)}
        >
          <FileCheck2 className="h-3 w-3 text-primary" />
          <span>Firmado</span>
        </Badge>
      );
    case "Firma verificada":
      return (
        <Badge
          tone="success"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-success/20", className)}
        >
          <CheckCircle2 className="h-3 w-3 text-success" />
          <span>Firma verificada</span>
        </Badge>
      );
    default:
      return (
        <Badge tone="neutral" appearance="soft" size={size} className={className}>
          {status}
        </Badge>
      );
  }
}

interface TramiteStatusBadgeProps {
  status: EstadoTramiteAnexoC;
  size?: "sm" | "md";
  className?: string;
}

export function TramiteStatusBadge({
  status,
  size = "md",
  className
}: TramiteStatusBadgeProps) {
  switch (status) {
    case "Enviado a Gestión":
      return (
        <Badge
          tone="primary"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-primary/20", className)}
        >
          <Send className="h-3 w-3 text-primary" />
          <span>Enviado a Gestión</span>
        </Badge>
      );
    case "Pendiente de asignación":
      return (
        <Badge
          tone="warning"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-warning/20", className)}
        >
          <Clock className="h-3 w-3 text-warning" />
          <span>Pendiente de asignación</span>
        </Badge>
      );
    case "En revisión":
      return (
        <Badge
          tone="primary"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-primary/20", className)}
        >
          <Clock className="h-3 w-3 text-primary" />
          <span>En revisión</span>
        </Badge>
      );
    case "Aprobado":
      return (
        <Badge
          tone="success"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-success/20", className)}
        >
          <CheckCircle2 className="h-3 w-3 text-success" />
          <span>Aprobado</span>
        </Badge>
      );
    case "Enrolamiento pendiente":
      return (
        <Badge
          tone="warning"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-warning/20", className)}
        >
          <UserPlus className="h-3 w-3 text-warning" />
          <span>Enrolamiento pendiente</span>
        </Badge>
      );
    case "Aplicado":
      return (
        <Badge
          tone="success"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-success/20", className)}
        >
          <UserCheck className="h-3 w-3 text-success" />
          <span>Aplicado</span>
        </Badge>
      );
    case "Rechazado":
      return (
        <Badge
          tone="danger"
          appearance="soft"
          size={size}
          className={cn("gap-1.5 font-medium border border-danger/20", className)}
        >
          <XCircle className="h-3 w-3 text-danger" />
          <span>Rechazado</span>
        </Badge>
      );
    default:
      return (
        <Badge tone="neutral" appearance="soft" size={size} className={className}>
          {status}
        </Badge>
      );
  }
}
