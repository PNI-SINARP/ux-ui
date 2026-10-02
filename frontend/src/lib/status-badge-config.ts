import { type BadgeProps } from "@/components/ui/badge";

export type StatusBadgeConfig = Omit<BadgeProps, "children"> & { label: string };

export const STATUS_BADGE_CONFIG: Record<string, StatusBadgeConfig> = {
  // EstadoUsuario
  "PENDIENTE_ACTIVACION": { tone: "warning", appearance: "soft", scale: "50", dot: true, label: "Pendiente Activación" },
  "ACTIVO": { tone: "success", appearance: "soft", scale: "100", dot: true, label: "Activo" },
  "SUSPENDIDO": { tone: "neutral", appearance: "soft", scale: "200", dot: true, label: "Suspendido" },
  "RETIRADO": { tone: "neutral", appearance: "outline", scale: "400", dot: true, label: "Retirado" },

  // EstadoSolicitudIngreso
  "Pendiente": { tone: "warning", appearance: "soft", scale: "50", dot: true, label: "Pendiente" },
  "PENDIENTE_ENVIO": { tone: "secondary", appearance: "soft", scale: "50", dot: true, label: "Pendiente Envío" },
  "PENDIENTE_ASIGNACION_GESTION": { tone: "warning", appearance: "outline", scale: "300", dot: true, label: "Pend. Asignación Gestión" },
  "EN_REVISION_GESTION": { tone: "info", appearance: "soft", scale: "100", dot: true, label: "En Revisión Gestión" },
  "APROBADO_GESTION": { tone: "success", appearance: "soft", scale: "50", dot: true, label: "Aprobado por Gestión" },
  "PENDIENTE_ASIGNACION_NORMATIVIDAD": { tone: "primary", appearance: "outline", scale: "300", dot: true, label: "Pend. Asignación Normativa" },
  "PENDIENTE_GENERAR_RESOLUCION": { tone: "primary", appearance: "soft", scale: "50", dot: true, label: "Pend. Generar Resolución" },
  "EN_GENERACION_RESOLUCION": { tone: "info", appearance: "soft", scale: "200", dot: true, label: "En Generación Resolución" },
  "Aprobada": { tone: "success", appearance: "soft", scale: "100", dot: true, label: "Aprobada" },
  "Rechazada": { tone: "danger", appearance: "soft", scale: "50", dot: true, label: "Rechazada" },

  // Otros estados detectados en EstadoSolicitudIngreso (fallback por si acaso, aunque no mencionados en el listado para sobreescribir exacto)
  "GENERACION_PENDIENTE": { tone: "info", appearance: "soft", scale: "200", dot: true, label: "Generación Pendiente" },
  "RESOLUCION_GENERADA": { tone: "success", appearance: "soft", scale: "50", dot: true, label: "Resolución Generada" },
  "PENDIENTE_DE_FIRMA": { tone: "warning", appearance: "outline", scale: "300", dot: true, label: "Pendiente de Firma" },
  "INSTITUCION_ACTIVA": { tone: "success", appearance: "soft", scale: "100", dot: true, label: "Institución Activa" },
  "EN_REVISION_NORMATIVIDAD": { tone: "info", appearance: "soft", scale: "100", dot: true, label: "En Revisión Normatividad" },
  "Cancelada": { tone: "danger", appearance: "outline", scale: "400", dot: true, label: "Cancelada" },

  // ProyectoInteroperabilidad
  "Borrador": { tone: "neutral", appearance: "soft", scale: "50", dot: true, label: "Borrador" },
  "En revisión": { tone: "info", appearance: "soft", scale: "100", dot: true, label: "En Revisión" },
  "Observada": { tone: "warning", appearance: "soft", scale: "100", dot: true, label: "Observada" },
  "Autorizada": { tone: "primary", appearance: "soft", scale: "100", dot: true, label: "Autorizada" },
  "Servicio habilitado": { tone: "success", appearance: "soft", scale: "100", dot: true, label: "Servicio Habilitado" },

  // FuenteEstado
  "PUBLICADO": { tone: "success", appearance: "soft", scale: "100", dot: true, label: "Publicado" },
  "OCULTO": { tone: "neutral", appearance: "outline", scale: "300", dot: true, label: "Oculto" },
  "DESACTIVADO": { tone: "neutral", appearance: "soft", scale: "200", dot: true, label: "Desactivado" },

  // EstadoNovedad
  "En validación": { tone: "info", appearance: "soft", scale: "100", dot: true, label: "En Validación" },
  "Finalizada": { tone: "secondary", appearance: "soft", scale: "100", dot: true, label: "Finalizada" },
  "No procede": { tone: "danger", appearance: "outline", scale: "300", dot: true, label: "No Procede" },
};

/**
 * Función utilitaria para obtener la configuración visual de un estado.
 * Si el estado no está definido en el diccionario central, se retorna un valor fallback neutral.
 */
export function getStatusBadgeConfig(estado: string | undefined): StatusBadgeConfig {
  if (!estado || !STATUS_BADGE_CONFIG[estado]) {
    return { tone: "neutral", appearance: "soft", scale: "100", dot: true, label: estado || "Desconocido" };
  }
  return STATUS_BADGE_CONFIG[estado];
}
