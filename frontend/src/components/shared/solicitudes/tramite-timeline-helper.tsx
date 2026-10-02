import React from "react";
import {
  Building2,
  Clock,
  UserPlus,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  History,
  Send,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { TimelineItem } from "@/components/ui/timeline";
import { SolicitudIngreso } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

/**
 * Parsea una fecha textual para permitir cálculos cronológicos relativos exactos.
 */
function parseBaseDate(dateStr?: string): Date {
  if (!dateStr) return new Date(2026, 8, 29, 9, 7);
  try {
    const clean = dateStr.replace(/,/g, "").trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      const dParts = parts[0].split("/").map(Number);
      let year = dParts[2] || 2026;
      if (year < 100) year += 2000;
      const month = (dParts[1] || 1) - 1;
      const day = dParts[0] || 1;

      let hours = 9;
      let minutes = 0;
      const timeMatch = parts[1].match(/^(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const isPm = /p\.?\s*m\.?/i.test(clean) || /pm/i.test(clean);
        const isAm = /a\.?\s*m\.?/i.test(clean) || /am/i.test(clean);
        if (isPm && hours < 12) hours += 12;
        if (isAm && hours === 12) hours = 0;
      }
      const d = new Date(year, month, day, hours, minutes);
      if (!isNaN(d.getTime())) return d;
    }
  } catch {
    // fallback
  }
  return new Date(2026, 8, 29, 9, 7);
}

/**
 * Formatea un objeto Date al estándar DD/MM/YYYY HH:mm.
 */
function formatTimelineDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Normaliza y deduplica los eventos cronológicos de un trámite
 * para garantizar que cada acción real aparezca una sola vez.
 */
export function deduplicateTimelineItems(rawItems: TimelineItem[]): TimelineItem[] {
  const result: TimelineItem[] = [];
  const seenSignatures = new Set<string>();

  for (const item of rawItems) {
    const cleanTitle = (item.title || "").trim().toLowerCase();
    const cleanDate = (item.date || "").trim().toLowerCase();

    // Filtro por firma combinada: título + fecha
    const titleDateSig = `${cleanTitle}|${cleanDate}`;
    
    // Filtro consecutivo: si el evento inmediatamente anterior tiene el mismo título
    const isConsecutiveDuplicate =
      result.length > 0 &&
      result[result.length - 1].title?.trim().toLowerCase() === cleanTitle;

    if (!seenSignatures.has(titleDateSig) && !isConsecutiveDuplicate) {
      seenSignatures.add(titleDateSig);
      result.push(item);
    }
  }

  return result;
}

/**
 * Construye la trazabilidad completa del trámite desde el Registro de Institución
 * (Anexo A completado â†’ Enviado a FirmaEC â†’ Firma verificada en FirmaEC â†’
 *  Datos de firma confirmados â†’ Solicitud enviada a Gestión DINARP â†’
 *  Asignación de revisor â†’ Pendiente de revisión / En revisión).
 */
export function buildTramiteTimelineItems(solicitud: SolicitudIngreso | null | undefined): TimelineItem[] {
  if (!solicitud) return [];

  const rawItems: TimelineItem[] = [];

  // Datos base del solicitante, representante y entidad
  const firmanteNombre =
    solicitud.anexoA?.representanteLegalNombre ||
    solicitud.anexoC?.representanteLegalNombre ||
    solicitud.anexoB?.representanteLegalNombre ||
    solicitud.nombreCompleto ||
    "Representante Legal";

  const institucionNombre =
    solicitud.institucion ||
    solicitud.anexoA?.nombreEntidad ||
    "Entidad Solicitante";

  // Calcular cronología previa a partir del primer evento registrado o fechaSolicitud
  const primerEventoHistorial = solicitud.historial && solicitud.historial[0];
  const fechaBaseStr = primerEventoHistorial?.fechaHora || primerEventoHistorial?.fecha || solicitud.fechaSolicitud || "29/09/2026 09:07";
  const baseDate = parseBaseDate(fechaBaseStr);

  const t_anexo_completado = new Date(baseDate.getTime() - 25 * 60 * 1000);
  const t_enviado_firma = new Date(baseDate.getTime() - 15 * 60 * 1000);
  const t_firma_verificada = new Date(baseDate.getTime() - 6 * 60 * 1000);
  const t_datos_confirmados = new Date(baseDate.getTime() - 3 * 60 * 1000);
  const t_envio_gestion = baseDate;

  // Si es Proceso B (Enrolamiento de Coordinador - Anexo B)
  if (solicitud.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR") {
    rawItems.push({
      id: "invitacion-b-validada",
      title: "Invitación validada",
      description: `Invitación B vigente verificada para ${firmanteNombre} como ${solicitud.anexoB?.rolAsignado || "Coordinador Designado"} de ${institucionNombre}.`,
      date: formatTimelineDate(t_anexo_completado),
      status: "neutral",
      statusLabel: "INVITACIÓN VALIDADA",
      icon: <UserCheck className="size-4" />,
      user: firmanteNombre,
    });

    rawItems.push({
      id: "anexo-b-iniciado",
      title: "Anexo B iniciado",
      description: `Borrador del Anexo B completado y términos del Acuerdo de Uso y Confidencialidad revisados para suscripción digital.`,
      date: formatTimelineDate(new Date(baseDate.getTime() - 20 * 60 * 1000)),
      status: "neutral",
      statusLabel: "BORRADOR COMPLETADO",
      icon: <FileText className="size-4" />,
      user: firmanteNombre,
    });

    rawItems.push({
      id: "enviado-firmaec",
      title: "Enviado a FirmaEC",
      description: `Acuerdo de Uso y Confidencialidad (${solicitud.codigoDocumental || "ARP-R02"}) enviado al servicio de FirmaEC para proceso de suscripción digital del Coordinador.`,
      date: formatTimelineDate(t_enviado_firma),
      status: "info",
      statusLabel: "ENVIADO A FIRMA",
      icon: <Send className="size-4" />,
      user: firmanteNombre,
    });

    rawItems.push({
      id: "firma-verificada-firmaec",
      title: "Firma verificada en FirmaEC",
      description: `FirmaEC confirmó correctamente la firma electrónica del documento ARP-R02 y se validaron los datos del certificado digital de ${firmanteNombre}.`,
      date: formatTimelineDate(t_firma_verificada),
      status: "success",
      statusLabel: "FIRMA VERIFICADA",
      icon: <ShieldCheck className="size-4" />,
      user: "FirmaEC · Servicio de Certificación",
    });

    rawItems.push({
      id: "datos-firma-confirmados",
      title: "Datos de firma confirmados",
      description: "Validación técnica de integridad del archivo firmado, estampa cronológica y hash criptográfico.",
      date: formatTimelineDate(t_datos_confirmados),
      status: "success",
      statusLabel: "DATOS CONFIRMADOS",
      icon: <FileCheck2 className="size-4" />,
      user: "Portal Web DINARP / Interoperabilidad",
    });

    rawItems.push({
      id: "solicitud-enviada-gestion",
      title: "Anexo B enviado a Gestión DINARP",
      description: "Acuerdo de Confidencialidad ingresado formalmente a la bandeja de entrada de la Dirección de Gestión y Registro DINARP para asignación de revisor.",
      date: solicitud.fechaSolicitud || formatTimelineDate(t_envio_gestion),
      status: "info",
      statusLabel: "INGRESADO A GESTIÓN",
      icon: <Building2 className="size-4" />,
      user: firmanteNombre,
    });
  } else {
    // 1. Hito: Anexo A completado
    rawItems.push({
      id: "anexo-a-completado",
      title: "Anexo A completado",
      description: `Formulario de solicitud de acceso al SINARP completado en el Portal Web DINARP con información institucional de ${institucionNombre}, coordinadores y servicios solicitados.`,
      date: formatTimelineDate(t_anexo_completado),
      status: "neutral",
      statusLabel: "COMPLETADO",
      icon: <FileText className="size-4" />,
      user: firmanteNombre,
    });

    // 2. Hito: Enviado a FirmaEC
    rawItems.push({
      id: "enviado-firmaec",
      title: "Enviado a FirmaEC",
      description: `Documento generado (${solicitud.codigoDocumental || "ARP-R01"}) enviado al servicio de FirmaEC para proceso de suscripción digital del Representante Legal o delegado acreditado.`,
      date: formatTimelineDate(t_enviado_firma),
      status: "info",
      statusLabel: "ENVIADO A FIRMA",
      icon: <Send className="size-4" />,
      user: firmanteNombre,
    });

    // 3. Hito: Firma verificada en FirmaEC
    rawItems.push({
      id: "firma-verificada-firmaec",
      title: "Firma verificada en FirmaEC",
      description: `FirmaEC confirmó correctamente la firma electrónica del documento y se recuperaron y validaron los datos correspondientes del certificado digital del firmante (${firmanteNombre}).`,
      date: formatTimelineDate(t_firma_verificada),
      status: "success",
      statusLabel: "FIRMA VERIFICADA",
      icon: <ShieldCheck className="size-4" />,
      user: "FirmaEC · Servicio de Certificación",
    });

    // 4. Hito: Datos de firma confirmados
    rawItems.push({
      id: "datos-firma-confirmados",
      title: "Datos de firma confirmados",
      description: "Validación técnica de integridad del archivo firmado, estampa cronológica y coincidencia de identidad del firmante con personería jurídica.",
      date: formatTimelineDate(t_datos_confirmados),
      status: "success",
      statusLabel: "DATOS CONFIRMADOS",
      icon: <FileCheck2 className="size-4" />,
      user: "Portal Web DINARP / Interoperabilidad",
    });

    // 5. Hito: Solicitud enviada a Gestión DINARP
    rawItems.push({
      id: "solicitud-enviada-gestion",
      title: "Solicitud enviada a Gestión DINARP",
      description: "Expediente digital verificado e ingresado formalmente a la bandeja de entrada de la Dirección de Gestión y Registro DINARP para asignación de revisor.",
      date: solicitud.fechaSolicitud || formatTimelineDate(t_envio_gestion),
      status: "info",
      statusLabel: "INGRESADO A GESTIÓN",
      icon: <Building2 className="size-4" />,
      user: solicitud.nombreCompleto || institucionNombre,
    });
  }

  // 6. Historial de eventos posteriores en Gestión (Asignación, Reasignación, Revisiones, Resoluciones)
  if (solicitud.historial && solicitud.historial.length > 0) {
    solicitud.historial.forEach((h, idx) => {
      const accionLower = (h.accion || "").toLowerCase();
      const detallesLower = (h.detalles || "").toLowerCase();

      // Descartar registros genéricos previos duplicados
      if (
        accionLower.includes("solicitud registrada en portal") ||
        accionLower.includes("solicitud ingresada en portal") ||
        accionLower.includes("ingreso-solicitud") ||
        accionLower.includes("anexo a completado") ||
        accionLower.includes("enviado a firmaec") ||
        accionLower.includes("firma verificada en firmaec") ||
        accionLower.includes("datos de firma confirmados") ||
        accionLower.includes("solicitud enviada a gestión dinarp")
      ) {
        return;
      }

      const isCierre =
        accionLower.includes("rechaz") ||
        accionLower.includes("cancel") ||
        accionLower.includes("cierr") ||
        accionLower.includes("fallo") ||
        accionLower.includes("no concluida") ||
        accionLower.includes("deneg");

      const isSubsanacion =
        accionLower.includes("subsanac") ||
        accionLower.includes("observad") ||
        detallesLower.includes("subsanac") ||
        detallesLower.includes("observaci");

      const isFirmaResolucion =
        accionLower.includes("firma") && (accionLower.includes("resoluc") || accionLower.includes("firmaec"));

      const isInvitacionB =
        accionLower.includes("invitac") || accionLower.includes("coordinador");

      const isInstitucionActiva =
        accionLower.includes("institución activ") || accionLower.includes("institucion activ");

      const isAprobado =
        accionLower.includes("aprob") ||
        accionLower.includes("resoluci") ||
        accionLower.includes("finaliz") ||
        accionLower.includes("activa");

      const isReasignado =
        accionLower.includes("reasign") ||
        detallesLower.includes("reasignad");

      const isRevision =
        !isReasignado &&
        (accionLower.includes("pendiente de revis") ||
          accionLower.includes("en revis") ||
          (accionLower.includes("inici") && accionLower.includes("revis")) ||
          accionLower.includes("análisis técnico") ||
          accionLower.includes("analisis tecnico") ||
          accionLower.includes("verificación documental") ||
          accionLower.includes("verificacion documental"));

      const isAsignado =
        !isReasignado &&
        !isRevision &&
        (accionLower.includes("asignac") ||
          accionLower.includes("asignad") ||
          accionLower.includes("asignado a") ||
          accionLower.includes("revisor"));

      let status: TimelineItem["status"] = "neutral";
      let statusLabel = "REGISTRADO";
      let icon: React.ReactNode = <FileText className="size-4" />;

      if (isCierre) {
        status = "danger";
        if (accionLower.includes("rechaz") || detallesLower.includes("rechaz")) {
          statusLabel = "RECHAZADO";
        } else if (accionLower.includes("cancel") || detallesLower.includes("cancel")) {
          statusLabel = "CANCELADO";
        } else if (accionLower.includes("fallo") || accionLower.includes("no concluida")) {
          statusLabel = "ERROR EN FIRMA";
        } else {
          statusLabel = "CERRADO";
        }
        icon = <XCircle className="size-4" />;
      } else if (isSubsanacion) {
        status = "danger";
        statusLabel = "REQUIERE SUBSANACIÓN";
        icon = <AlertTriangle className="size-4" />;
      } else if (isInstitucionActiva) {
        status = "success";
        statusLabel = "INSTITUCIÓN ACTIVA";
        icon = <CheckCircle2 className="size-4" />;
      } else if (isInvitacionB) {
        status = "info";
        statusLabel = "INVITACIÓN B";
        icon = <CheckCircle2 className="size-4" />;
      } else if (isFirmaResolucion) {
        status = accionLower.includes("no") ? "danger" : "success";
        statusLabel = accionLower.includes("no") ? "FIRMA FALLIDA" : "FIRMA VERIFICADA";
        icon = <ShieldCheck className="size-4" />;
      } else if (isAprobado) {
        status = "success";
        if (accionLower.includes("gesti")) {
          statusLabel = "APROBADO GESTIÓN";
        } else if (accionLower.includes("normativ") || accionLower.includes("resoluc")) {
          statusLabel = "RESOLUCIÓN GENERADA";
        } else {
          statusLabel = "APROBADO";
        }
        icon = <CheckCircle2 className="size-4" />;
      } else if (isReasignado) {
        status = "warning";
        statusLabel = "REASIGNADO";
        icon = <RotateCcw className="size-4" />;
      } else if (isRevision) {
        status = "warning";
        statusLabel = "EN REVISIÓN";
        icon = <Clock className="size-4" />;
      } else if (isAsignado) {
        status = "primary";
        statusLabel = "ASIGNADO";
        icon = <UserPlus className="size-4" />;
      } else {
        status = "neutral";
        statusLabel = "HISTÓRICO";
        icon = <History className="size-4" />;
      }

      let cleanTitle = h.accion;
      if (isAsignado && !isReasignado) {
        if (!accionLower.includes("normativ")) {
          cleanTitle = "Asignación de trámite a Gestión";
        }
      } else if (isReasignado) {
        if (!accionLower.includes("normativ")) {
          cleanTitle = "Reasignación de trámite";
        }
      }

      rawItems.push({
        id: h.id || `hist-${idx}`,
        title: cleanTitle,
        description: h.detalles || undefined,
        date: h.fechaHora || h.fecha || "Fecha registrada",
        status,
        statusLabel,
        icon,
        user: h.realizadoPor || undefined,
      });
    });
  }

  // 7. Evento sintético en curso: si el trámite tiene revisor asignado y no está concluido
  const isNormatividad = solicitud.estado.includes("NORMATIVIDAD") || solicitud.estado.includes("RESOLUCION");
  const revisorActual = isNormatividad ? solicitud.revisorNormatividad : (solicitud.revisorGestion || solicitud.revisor);
  const esEstadoFinal = ["Aprobada", "APROBADO_FINAL", "Rechazada", "Cancelada"].includes(solicitud.estado);

  if (revisorActual && revisorActual !== "Por asignar" && !solicitud.revisionIniciada && !esEstadoFinal) {
    const yaExisteRevision = rawItems.some((i) => {
      const t = i.title.toLowerCase();
      return t.includes("pendiente de revisión") || t.includes("en revisión");
    });

    if (!yaExisteRevision) {
      const fechaAsig =
        solicitud.fechaAsignacionGestion ||
        solicitud.fechaAsignacionNormatividad ||
        primerEventoHistorial?.fechaHora ||
        solicitud.fechaSolicitud ||
        formatTimelineDate(baseDate);

      

      rawItems.push({
        id: "pendiente-revision-step",
        title: isNormatividad ? "Pendiente de formulación de resolución" : "Pendiente de revisión",
        description: isNormatividad 
          ? `Trámite asignado al funcionario ${revisorActual}. En espera de formulación y emisión de la resolución institucional.` 
          : `Trámite asignado al funcionario ${revisorActual}. En espera de verificación documental y análisis técnico.`,
        date: fechaAsig,
        status: "warning",
        statusLabel: "EN REVISIÓN",
        icon: <Clock className="size-4" />,
        user: revisorActual,
      });
    }
  }

  // 8. Deduplicación final
  const uniqueItems = deduplicateTimelineItems(rawItems);

  // 9. Jerarquía visual: el último evento cronológico es el actual (isCurrent: true)
  const total = uniqueItems.length;
  return uniqueItems.map((item, index) => ({
    ...item,
    isCurrent: index === total - 1,
  }));
}
