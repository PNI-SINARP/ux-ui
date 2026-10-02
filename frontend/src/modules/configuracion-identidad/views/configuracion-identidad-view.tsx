"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Server,
  Lock,
  RotateCcw,
  History,
  Info,
  CheckCircle2,
  AlertTriangle,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  ConfiguracionIdentidad,
  EventoAuditoria,
  FeedbackMensaje,
  ResultadoPrueba,
} from "../data/types";
import {
  CONFIGURACION_ACTIVA_INICIAL,
  HISTORIAL_AUDITORIA_INICIAL,
  FEEDBACK_TEXTOS,
  detectarDatosPruebaEnProduccion,
  generarHashTransaccion,
  incrementarVersion,
} from "../data/mock-data";
import { FormularioIdentidad } from "../components/formulario-identidad";
import { BarraAccionesIdentidad } from "../components/barra-acciones-identidad";
import { AlertaFeedback } from "../components/alerta-feedback";
import { PanelAuditoriaVersiones } from "../components/panel-auditoria-versiones";
import { EstadoConfiguracionBadge } from "../components/estado-configuracion-badge";

export function ConfiguracionIdentidadView() {
  // Estado de la configuración de trabajo (en edición o activa)
  const [configuracion, setConfiguracion] = useState<ConfiguracionIdentidad>(
    CONFIGURACION_ACTIVA_INICIAL
  );

  // Configuración previa activa preservada para rollbacks en caso de fallo técnico
  const [configuracionActivaPrevia, setConfiguracionActivaPrevia] = useState<ConfiguracionIdentidad>(
    CONFIGURACION_ACTIVA_INICIAL
  );

  // Historial inmutable de auditoría y versiones
  const [historialAuditoria, setHistorialAuditoria] = useState<EventoAuditoria[]>(
    HISTORIAL_AUDITORIA_INICIAL
  );

  // Estado del motor de pruebas técnicas
  const [isTesting, setIsTesting] = useState(false);

  // Mensaje de feedback oficial (usado para Alert y Toast)
  const [feedback, setFeedback] = useState<FeedbackMensaje | null>({
    tipo: "success",
    titulo: "Configuración activa",
    mensaje: FEEDBACK_TEXTOS.ACTIVA_SATISFACTORIA,
    codigo: "ACTIVA_SATISFACTORIA",
  });

  const obtenerFechaHoraActual = () => {
    const now = new Date();
    return `${now.toLocaleDateString("es-EC")} ${now.toLocaleTimeString("es-EC")}`;
  };

  /* ──────────────────────────────────────────────────────────────────────────
     ACCIÓN 1: GUARDAR BORRADOR
     ────────────────────────────────────────────────────────────────────────── */
  const handleGuardarBorrador = () => {
    const fechaHora = obtenerFechaHoraActual();
    const nuevaVersion =
      configuracion.estado === "Activa"
        ? incrementarVersion(configuracion.version)
        : configuracion.version;

    const nuevaConfig: ConfiguracionIdentidad = {
      ...configuracion,
      version: nuevaVersion,
      estado: "Borrador",
      pruebaSuperada: false,
      ultimaActualizacion: fechaHora,
    };

    setConfiguracion(nuevaConfig);

    const evento: EventoAuditoria = {
      id: `aud-${Date.now()}`,
      fecha: fechaHora,
      version: nuevaVersion,
      actor: "Administrador Técnico Autorizado (ADMIN)",
      accion: "Guardar borrador",
      entorno: nuevaConfig.entorno,
      estadoResultante: "Borrador",
      detalles: `Borrador guardado: Entorno ${nuevaConfig.entorno}, Proyecto: ${nuevaConfig.proyectoId}, Factor: ${nuevaConfig.proveedorPrimerFactor}`,
      hashTransaccion: generarHashTransaccion(),
    };

    setHistorialAuditoria([evento, ...historialAuditoria]);

    const feedbackItem: FeedbackMensaje = {
      tipo: "warning",
      titulo: "Borrador registrado",
      mensaje: FEEDBACK_TEXTOS.GUARDADA_PENDIENTE,
      codigo: "GUARDADA_PENDIENTE",
    };
    setFeedback(feedbackItem);
    toast.info(FEEDBACK_TEXTOS.GUARDADA_PENDIENTE, {
      description: "Los cambios fueron registrados como borrador. Ejecuta la prueba técnica para avanzar.",
    });
  };

  /* ──────────────────────────────────────────────────────────────────────────
     ACCIÓN 2: PROBAR CONFIGURACIÓN
     ────────────────────────────────────────────────────────────────────────── */
  const handleProbarConfiguracion = (forzarFallo: boolean = false) => {
    // Regla: no permitir configuración de Producción con datos de entorno de Pruebas
    if (
      configuracion.entorno === "Producción" &&
      detectarDatosPruebaEnProduccion(configuracion.proyectoId, "Producción")
    ) {
      const feedbackItem: FeedbackMensaje = {
        tipo: "danger",
        titulo: "Violación de directiva de aislamiento",
        mensaje: FEEDBACK_TEXTOS.NO_ACTIVA_REVISA,
        codigo: "ENTORNO_INCOMPATIBLE",
      };
      setFeedback(feedbackItem);
      toast.error(FEEDBACK_TEXTOS.NO_ACTIVA_REVISA, {
        description: "El entorno de Producción no tolera nombres o secretos de prueba/staging.",
      });
      return;
    }

    setIsTesting(true);

    setTimeout(() => {
      setIsTesting(false);
      const fechaHora = obtenerFechaHoraActual();

      if (forzarFallo) {
        // Fallo en la prueba o sincronización:
        // REGLA: Si falla sincronización/prueba, mantener configuración anterior (rollback / keep previous active)
        const resultadoFallo: ResultadoPrueba = {
          fecha: fechaHora,
          entornoProbado: configuracion.entorno,
          exitosa: false,
          latenciaMs: 1420,
          serviciosValidados: [
            { nombre: "Identity Platform Discovery", estado: "OK", mensaje: "Endpoint accesible" },
            { nombre: "Servicio TOTP RFC 6238", estado: "ERROR", mensaje: "Desfase temporal excesivo (drift > 120s)" },
            { nombre: "Verificación SMTP Correo", estado: "ERROR", mensaje: "Rechazo de handshake TLS" },
          ],
          observacionTecnica: "Fallo de sincronización técnica. Se mantiene la configuración anterior para salvaguardar el servicio.",
        };

        const configFallida: ConfiguracionIdentidad = {
          ...configuracion,
          estado: "Fallida",
          pruebaSuperada: false,
          ultimoResultadoPrueba: resultadoFallo,
          ultimaActualizacion: fechaHora,
        };

        setConfiguracion(configFallida);

        const eventoAuditoriaFallo: EventoAuditoria = {
          id: `aud-${Date.now()}`,
          fecha: fechaHora,
          version: configuracion.version,
          actor: "Administrador Técnico Autorizado (ADMIN)",
          accion: "Probar configuración",
          entorno: configuracion.entorno,
          estadoResultante: "Fallida",
          detalles: `Prueba técnica FALLIDA: ${resultadoFallo.observacionTecnica}. Se preserva versión activa ${configuracionActivaPrevia.version}.`,
          hashTransaccion: generarHashTransaccion(),
        };

        setHistorialAuditoria([eventoAuditoriaFallo, ...historialAuditoria]);

        const feedbackItem: FeedbackMensaje = {
          tipo: "danger",
          titulo: "Fallo en prueba técnica",
          mensaje: FEEDBACK_TEXTOS.NO_ACTIVA_REVISA,
          codigo: "NO_ACTIVA_REVISA",
        };
        setFeedback(feedbackItem);
        toast.error(FEEDBACK_TEXTOS.NO_ACTIVA_REVISA, {
          description: "La prueba técnica no fue superada. Se mantiene la configuración anterior activa.",
        });
      } else {
        // Éxito en la prueba:
        const resultadoExito: ResultadoPrueba = {
          fecha: fechaHora,
          entornoProbado: configuracion.entorno,
          exitosa: true,
          latenciaMs: 38,
          serviciosValidados: [
            { nombre: "Identity Platform Discovery", estado: "OK", mensaje: "Respuesta en 14ms (HTTP 200 OK)" },
            { nombre: "Servicio TOTP RFC 6238", estado: "OK", mensaje: "Algoritmo HMAC sincronizado correctamente" },
            { nombre: "Verificación SMTP Correo", estado: "OK", mensaje: "Certificados TLS y política de correo validados" },
          ],
          observacionTecnica: `Prueba sintética de acceso completada con éxito en entorno ${configuracion.entorno}.`,
        };

        const configProbada: ConfiguracionIdentidad = {
          ...configuracion,
          estado: "Pendiente de prueba", // Listo para activar tras superar la prueba
          pruebaSuperada: true,
          ultimoResultadoPrueba: resultadoExito,
          ultimaActualizacion: fechaHora,
        };

        setConfiguracion(configProbada);

        const eventoAuditoriaExito: EventoAuditoria = {
          id: `aud-${Date.now()}`,
          fecha: fechaHora,
          version: configuracion.version,
          actor: "Administrador Técnico Autorizado (ADMIN)",
          accion: "Probar configuración",
          entorno: configuracion.entorno,
          estadoResultante: "Pendiente de prueba",
          detalles: `Prueba técnica SUPERADA: Latencia ${resultadoExito.latenciaMs}ms, 3/3 servicios operativos en ${configuracion.entorno}.`,
          hashTransaccion: generarHashTransaccion(),
        };

        setHistorialAuditoria([eventoAuditoriaExito, ...historialAuditoria]);

        const feedbackItem: FeedbackMensaje = {
          tipo: "warning",
          titulo: "Prueba técnica aprobada",
          mensaje: FEEDBACK_TEXTOS.GUARDADA_PENDIENTE,
          codigo: "GUARDADA_PENDIENTE",
        };
        setFeedback(feedbackItem);
        toast.success(FEEDBACK_TEXTOS.GUARDADA_PENDIENTE, {
          description: "Prueba satisfactoria. La configuración está lista para ser activada.",
        });
      }
    }, 750);
  };

  /* ──────────────────────────────────────────────────────────────────────────
     ACCIÓN 3: ACTIVAR
     ────────────────────────────────────────────────────────────────────────── */
  const handleActivar = () => {
    // REGLA: no marcar como Activa hasta superar la prueba
    if (!configuracion.pruebaSuperada || configuracion.estado !== "Pendiente de prueba") {
      const feedbackItem: FeedbackMensaje = {
        tipo: "danger",
        titulo: "Activación denegada",
        mensaje: FEEDBACK_TEXTOS.NO_ACTIVA_REVISA,
        codigo: "NO_ACTIVA_REVISA",
      };
      setFeedback(feedbackItem);
      toast.error(FEEDBACK_TEXTOS.NO_ACTIVA_REVISA, {
        description: "No se puede activar una configuración sin haber superado la prueba técnica correspondiente.",
      });
      return;
    }

    // Regla de compatibilidad de entorno
    if (
      configuracion.entorno === "Producción" &&
      detectarDatosPruebaEnProduccion(configuracion.proyectoId, "Producción")
    ) {
      const feedbackItem: FeedbackMensaje = {
        tipo: "danger",
        titulo: "Violación de aislamiento",
        mensaje: FEEDBACK_TEXTOS.NO_ACTIVA_REVISA,
        codigo: "ENTORNO_INCOMPATIBLE",
      };
      setFeedback(feedbackItem);
      toast.error(FEEDBACK_TEXTOS.NO_ACTIVA_REVISA, {
        description: "El entorno de Producción no tolera identificadores de entorno de Pruebas.",
      });
      return;
    }

    const fechaHora = obtenerFechaHoraActual();
    const versionActivada = configuracion.version;

    const configActiva: ConfiguracionIdentidad = {
      ...configuracion,
      estado: "Activa",
      ultimaActualizacion: fechaHora,
    };

    setConfiguracion(configActiva);
    // Respaldamos como la nueva configuración activa previa oficial
    setConfiguracionActivaPrevia(configActiva);

    const eventoAuditoria: EventoAuditoria = {
      id: `aud-${Date.now()}`,
      fecha: fechaHora,
      version: versionActivada,
      actor: "Administrador Técnico Autorizado (ADMIN)",
      accion: "Activar",
      entorno: configActiva.entorno,
      estadoResultante: "Activa",
      detalles: `Configuración ${versionActivada} activada formalmente en ${configActiva.entorno}. TOTP: ${configActiva.totpActivo ? "Activo" : "Inactivo"}, Vigencia: ${configActiva.horasVigenciaRecuperacion}h.`,
      hashTransaccion: generarHashTransaccion(),
    };

    setHistorialAuditoria([eventoAuditoria, ...historialAuditoria]);

    const feedbackItem: FeedbackMensaje = {
      tipo: "success",
      titulo: "Activación en caliente completada",
      mensaje: FEEDBACK_TEXTOS.ACTIVA_SATISFACTORIA,
      codigo: "ACTIVA_SATISFACTORIA",
    };
    setFeedback(feedbackItem);
    toast.success(FEEDBACK_TEXTOS.ACTIVA_SATISFACTORIA, {
      description: `La versión ${versionActivada} ahora rige la autenticación del portal.`,
    });
  };

  /* ──────────────────────────────────────────────────────────────────────────
     ACCIÓN DE RESTAURACIÓN / ROLLBACK
     ────────────────────────────────────────────────────────────────────────── */
  const handleRestaurarActivaPrevia = () => {
    const fechaHora = obtenerFechaHoraActual();
    setConfiguracion({ ...configuracionActivaPrevia });

    const eventoRollback: EventoAuditoria = {
      id: `aud-${Date.now()}`,
      fecha: fechaHora,
      version: configuracionActivaPrevia.version,
      actor: "Administrador Técnico Autorizado (ADMIN)",
      accion: "Restauración automática (Rollback)",
      entorno: configuracionActivaPrevia.entorno,
      estadoResultante: "Activa",
      detalles: `Restauración de versión activa previa ${configuracionActivaPrevia.version} tras contingencia técnica.`,
      hashTransaccion: generarHashTransaccion(),
    };

    setHistorialAuditoria([eventoRollback, ...historialAuditoria]);

    const feedbackItem: FeedbackMensaje = {
      tipo: "info",
      titulo: "Restauración ejecutada",
      mensaje: "Se ha restituido la última configuración activa aprobada en el sistema.",
      codigo: "SECRETO_INFO",
    };
    setFeedback(feedbackItem);
    toast.info("Configuración activa restaurada", {
      description: `Se reactivó la versión ${configuracionActivaPrevia.version}.`,
    });
  };

  return (
    <WireframeDashboardLayout
      activeMenu="configuracion-identidad"
      currentRole="ADMIN"
      breadcrumbs={[
        { label: "Administración" },
        { label: "Configuración de Identidad" },
      ]}
    >
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
        {/* Cabecera Principal con Identidad y Rol Técnico */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                  Configuración de Identity Platform
                </h1>
                <Badge tone="neutral" appearance="soft" size="sm" className="font-mono">
                  {configuracion.version}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Ajuste de parámetros de identidad, directivas de autenticación, políticas de correo y trazabilidad técnica.
              </p>
            </div>

            {/* Badge de Rol Autorizado */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge tone="primary" appearance="soft" size="md" className="gap-1.5 font-semibold">
                <ShieldCheck className="size-4" />
                <span>Administrador Técnico Autorizado</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Alerta de Feedback Dinámica Oficial del UI Kit */}
        <AlertaFeedback feedback={feedback} onCerrar={() => setFeedback(null)} />

        {/* Formulario Principal de Configuración Técnica */}
        <FormularioIdentidad
          configuracion={configuracion}
          onChange={setConfiguracion}
          configuracionActivaPrevia={configuracionActivaPrevia}
        />

        {/* Barra de Acciones de Control Técnico */}
        <BarraAccionesIdentidad
          configuracion={configuracion}
          isTesting={isTesting}
          onGuardarBorrador={handleGuardarBorrador}
          onProbarConfiguracion={handleProbarConfiguracion}
          onActivar={handleActivar}
          onRestaurarActivaPrevia={handleRestaurarActivaPrevia}
        />

        {/* Panel de Trazabilidad y Auditoría de Versiones */}
        <PanelAuditoriaVersiones eventos={historialAuditoria} />
      </div>
    </WireframeDashboardLayout>
  );
}
