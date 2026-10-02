"use client";

import { useState, useEffect, useCallback } from "react";

export type EstadoCoordinador = "ACTIVO" | "SUSPENDIDO" | "PENDIENTE_ACTIVACION";
export type TipoDesignacion = "TITULAR" | "SUPLENTE";
export type EstadoSincronizacion = "SINCRONIZADO" | "PENDIENTE_SINCRONIZACION" | "ERROR";

export interface EventoCoordinadorAuditoria {
  id: string;
  fecha: string;
  accion: string;
  actor: string;
  causa: string;
  caso?: string;
  autorizacion?: string;
  evidencia?: string;
  notificacionEnviada: boolean;
  sesionesInvalidadas?: boolean;
  detalles: string;
}

export interface CoordinadorCuenta {
  id: string;
  cedula: string;
  nombreCompleto: string;
  correo: string; // Correo vigente actual (Verificado)
  correoVerificado: boolean;
  
  // ID-10: Nuevo correo declarado mantenido por separado
  nuevoCorreoPendiente?: string;
  estadoNuevoCorreo?: "PENDIENTE_VERIFICACION" | "VERIFICADO";
  fechaDeclaracionNuevoCorreo?: string;

  // ID-10: Condición de recuperación ID-08 para reinicio de TOTP
  recuperacionId08Autorizada: boolean;
  codigoRecuperacionId08?: string;
  fechaAutorizacionId08?: string;

  // ID-11 & Identity Platform Sync
  sincronizacionIdentityPlatform: EstadoSincronizacion;
  mensajeSincronizacion?: string;

  telefono: string;
  cargo: string;
  institucion: string;
  rucInstitucion: string;
  tipoDesignacion: TipoDesignacion;
  estado: EstadoCoordinador;
  anexoBAprobado: boolean;
  anexoBDocumento?: string;
  designacionVigente: boolean;
  totpConfigurado: boolean;
  sesionesActivas: number;
  ultimoAcceso?: string;
  ultimaActualizacion: string;
  fechaDesignacion: string;
  motivoSuspension?: string;
  fechaSuspension?: string;
  responsableSuspension?: string;
  historial: EventoCoordinadorAuditoria[];
}

export const INITIAL_COORDINADORES: CoordinadorCuenta[] = [
  {
    id: "COORD-001",
    cedula: "0912345678",
    nombreCompleto: "Javier Bohórquez",
    correo: "jbohorquez@guayaquil.gob.ec",
    correoVerificado: true,
    nuevoCorreoPendiente: "j.bohorquez.nuevo@guayaquil.gob.ec",
    estadoNuevoCorreo: "PENDIENTE_VERIFICACION",
    fechaDeclaracionNuevoCorreo: "01/10/2026 09:30",
    recuperacionId08Autorizada: true,
    codigoRecuperacionId08: "REC-ID08-2026-0045",
    fechaAutorizacionId08: "30/09/2026",
    sincronizacionIdentityPlatform: "SINCRONIZADO",
    telefono: "042594800 ext. 1120",
    cargo: "Director de Tecnologías de la Información",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Guayaquil",
    rucInstitucion: "0960000220001",
    tipoDesignacion: "TITULAR",
    estado: "ACTIVO",
    anexoBAprobado: true,
    anexoBDocumento: "ARP-R02_Acuerdo_Confidencialidad_Guayaquil.pdf",
    designacionVigente: true,
    totpConfigurado: true,
    sesionesActivas: 1,
    ultimoAcceso: "30/09/2026 11:20",
    ultimaActualizacion: "01/10/2026 09:30",
    fechaDesignacion: "15/01/2026",
    historial: [
      {
        id: "h-c-101-2",
        fecha: "01/10/2026 09:30",
        accion: "Declaración de nuevo correo",
        actor: "Administrador DINARP",
        caso: "CASO-2026-0891",
        autorizacion: "OFICIO-MINTEL-2026-0112",
        causa: "Actualización de dominio de correo institucional.",
        notificacionEnviada: true,
        detalles: "Nuevo correo declarado: j.bohorquez.nuevo@guayaquil.gob.ec en estado Pendiente de verificación. Correo vigente mantenido."
      },
      {
        id: "h-c-101",
        fecha: "15/01/2026 09:00",
        accion: "Cuenta creada por enrolamiento Anexo B",
        actor: "Sistema DINARP",
        causa: "Aprobación de trámite SOL-ING-110",
        evidencia: "Resolución Nro. DINARP-DGR-2026-0042-R",
        notificacionEnviada: true,
        detalles: "Designación como Coordinador Titular formalizada."
      }
    ]
  },
  {
    id: "COORD-002",
    cedula: "4444444444",
    nombreCompleto: "Ing. Carlos Alberto Morales Viteri",
    correo: "carlos.morales@cuenca.gob.ec",
    correoVerificado: true,
    recuperacionId08Autorizada: false,
    sincronizacionIdentityPlatform: "SINCRONIZADO",
    telefono: "072842100 ext. 204",
    cargo: "Director de Tecnologías de la Información",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Cuenca",
    rucInstitucion: "0160000270001",
    tipoDesignacion: "TITULAR",
    estado: "ACTIVO",
    anexoBAprobado: true,
    anexoBDocumento: "ARP-R02_Acuerdo_Confidencialidad_Cuenca.pdf",
    designacionVigente: true,
    totpConfigurado: true,
    sesionesActivas: 2,
    ultimoAcceso: "30/09/2026 09:45",
    ultimaActualizacion: "30/09/2026 09:45",
    fechaDesignacion: "20/01/2026",
    historial: [
      {
        id: "h-c-102",
        fecha: "20/01/2026 10:15",
        accion: "Cuenta creada por enrolamiento Anexo B",
        actor: "Sistema DINARP",
        causa: "Aprobación de trámite SOL-ING-109",
        evidencia: "Resolución Nro. DINARP-DGR-2026-0038-R",
        notificacionEnviada: true,
        detalles: "Designación como Coordinador Titular formalizada."
      }
    ]
  },
  {
    id: "COORD-003",
    cedula: "1722334455",
    nombreCompleto: "Ana María Pérez Gómez",
    correo: "ana.perez@mintel.gob.ec",
    correoVerificado: true,
    recuperacionId08Autorizada: true,
    codigoRecuperacionId08: "REC-ID08-2026-0089",
    fechaAutorizacionId08: "28/09/2026",
    sincronizacionIdentityPlatform: "PENDIENTE_SINCRONIZACION",
    mensajeSincronizacion: "Cambio de cuenta pendiente de sincronización",
    telefono: "023931000 ext. 3310",
    cargo: "Directora de Interoperabilidad",
    institucion: "Ministerio de Telecomunicaciones y de la Sociedad de la Información",
    rucInstitucion: "1768151240001",
    tipoDesignacion: "TITULAR",
    estado: "ACTIVO",
    anexoBAprobado: true,
    anexoBDocumento: "ARP-R02_Acuerdo_Confidencialidad_MINTEL.pdf",
    designacionVigente: true,
    totpConfigurado: true,
    sesionesActivas: 1,
    ultimoAcceso: "29/09/2026 16:30",
    ultimaActualizacion: "01/10/2026 08:15",
    fechaDesignacion: "10/02/2026",
    historial: [
      {
        id: "h-c-103-2",
        fecha: "01/10/2026 08:15",
        accion: "Actualización de perfil institucional",
        actor: "Administrador DINARP",
        causa: "Sincronización de atributos de entidad",
        notificacionEnviada: true,
        detalles: "Cambio registrado localmente; pendiente de confirmación en Identity Platform."
      },
      {
        id: "h-c-103",
        fecha: "10/02/2026 14:00",
        accion: "Enrolamiento institucional completado",
        actor: "Sistema DINARP",
        causa: "Resolución ministerial MINTEL",
        evidencia: "Resolución Nro. DINARP-DGR-2026-0055-R",
        notificacionEnviada: true,
        detalles: "Activación de credenciales con Google Authenticator verificado."
      }
    ]
  },
  {
    id: "COORD-004",
    cedula: "1711223344",
    nombreCompleto: "Luis Fernando Torres",
    correo: "luis.torres@mintel.gob.ec",
    correoVerificado: true,
    recuperacionId08Autorizada: false,
    sincronizacionIdentityPlatform: "SINCRONIZADO",
    telefono: "023931000 ext. 3315",
    cargo: "Especialista en Datos y Servicios de Gobierno Electrónico",
    institucion: "Ministerio de Telecomunicaciones y de la Sociedad de la Información",
    rucInstitucion: "1768151240001",
    tipoDesignacion: "SUPLENTE",
    estado: "ACTIVO",
    anexoBAprobado: true,
    anexoBDocumento: "ARP-R02_Acuerdo_Suplente_MINTEL.pdf",
    designacionVigente: true,
    totpConfigurado: true,
    sesionesActivas: 0,
    ultimoAcceso: "28/09/2026 12:10",
    ultimaActualizacion: "28/09/2026 12:10",
    fechaDesignacion: "10/02/2026",
    historial: [
      {
        id: "h-c-104",
        fecha: "10/02/2026 14:30",
        accion: "Enrolamiento de Suplente completado",
        actor: "Sistema DINARP",
        causa: "Resolución ministerial MINTEL",
        evidencia: "Resolución Nro. DINARP-DGR-2026-0055-R",
        notificacionEnviada: true,
        detalles: "Designación en calidad de Suplente debidamente suscrita."
      }
    ]
  },
  {
    id: "COORD-005",
    cedula: "1712345678",
    nombreCompleto: "Ing. Esteban Javier Morales Salazar",
    correo: "esteban.morales@registrocivil.gob.ec",
    correoVerificado: true,
    recuperacionId08Autorizada: false,
    sincronizacionIdentityPlatform: "SINCRONIZADO",
    telefono: "023814400 ext. 5020",
    cargo: "Coordinador General de Servicios de Información",
    institucion: "Dirección General de Registro Civil, Identificación y Cedulación",
    rucInstitucion: "1760001550001",
    tipoDesignacion: "TITULAR",
    estado: "ACTIVO",
    anexoBAprobado: true,
    anexoBDocumento: "ARP-R02_Acuerdo_Registro_Civil.pdf",
    designacionVigente: true,
    totpConfigurado: true,
    sesionesActivas: 2,
    ultimoAcceso: "30/09/2026 08:15",
    ultimaActualizacion: "30/09/2026 08:15",
    fechaDesignacion: "05/01/2026",
    historial: [
      {
        id: "h-c-105",
        fecha: "05/01/2026 11:00",
        accion: "Enrolamiento institucional completado",
        actor: "Sistema DINARP",
        causa: "Solicitud de Interoperabilidad Registral",
        evidencia: "Resolución Nro. DINARP-DGR-2026-0012-R",
        notificacionEnviada: true,
        detalles: "Coordinador Titular activo."
      }
    ]
  },
  {
    id: "COORD-006",
    cedula: "1715489621",
    nombreCompleto: "Juan Carlos Pérez Gómez",
    correo: "juan.perez@msp.gob.ec",
    correoVerificado: true,
    recuperacionId08Autorizada: true,
    codigoRecuperacionId08: "REC-ID08-2026-0104",
    fechaAutorizacionId08: "19/09/2026",
    sincronizacionIdentityPlatform: "SINCRONIZADO",
    telefono: "023814400 ext. 4100",
    cargo: "Director Nacional de Vigilancia Epidemiológica e Interoperabilidad",
    institucion: "Ministerio de Salud Pública",
    rucInstitucion: "1760001230001",
    tipoDesignacion: "TITULAR",
    estado: "SUSPENDIDO",
    anexoBAprobado: true,
    anexoBDocumento: "ARP-R02_Acuerdo_MSP.pdf",
    designacionVigente: true,
    totpConfigurado: false, // Condición faltante para reactivar: requiere TOTP
    sesionesActivas: 0,
    ultimoAcceso: "18/09/2026 17:00",
    ultimaActualizacion: "20/09/2026 10:00",
    fechaDesignacion: "12/01/2026",
    motivoSuspension: "Reinicio preventivo de credenciales por solicitud de la entidad. Requiere re-vincular Google Authenticator antes de reactivar.",
    fechaSuspension: "20/09/2026 10:00",
    responsableSuspension: "Administrador DINARP",
    historial: [
      {
        id: "h-c-106-2",
        fecha: "20/09/2026 10:00",
        accion: "Suspensión de cuenta",
        actor: "Administrador DINARP",
        caso: "CASO-MSP-2026-019",
        autorizacion: "Oficio Nro. MSP-CGTI-2026-0312-O",
        causa: "Reinicio preventivo de credenciales por solicitud de la entidad.",
        notificacionEnviada: true,
        sesionesInvalidadas: true,
        detalles: "Sesiones invalidadas. No se habilitó automáticamente al suplente. Requiere TOTP para reactivar."
      }
    ]
  },
  {
    id: "COORD-007",
    cedula: "1724589632",
    nombreCompleto: "Carlos Alberto Andrade Villacís",
    correo: "carlos.andrade@educacion.gob.ec",
    correoVerificado: true,
    recuperacionId08Autorizada: false,
    sincronizacionIdentityPlatform: "SINCRONIZADO",
    telefono: "023961300 ext. 1500",
    cargo: "Director de Tecnologías Educativas",
    institucion: "Ministerio de Educación",
    rucInstitucion: "1760004560001",
    tipoDesignacion: "TITULAR",
    estado: "SUSPENDIDO",
    anexoBAprobado: false, // Condición faltante para reactivar: requiere Anexo B
    designacionVigente: true,
    totpConfigurado: true,
    sesionesActivas: 0,
    ultimoAcceso: "10/09/2026 14:00",
    ultimaActualizacion: "15/09/2026 09:30",
    fechaDesignacion: "01/02/2026",
    motivoSuspension: "Falta de suscripción de Acuerdo de Confidencialidad Anexo B actualizado.",
    fechaSuspension: "15/09/2026 09:30",
    responsableSuspension: "Administrador DINARP",
    historial: [
      {
        id: "h-c-107",
        fecha: "15/09/2026 09:30",
        accion: "Suspensión por falta de Anexo B suscrito",
        actor: "Administrador DINARP",
        caso: "CASO-MINEDUC-2026-042",
        autorizacion: "Informe Nro. DINARP-DN-2026-0089-I",
        causa: "Falta de suscripción de Acuerdo de Confidencialidad Anexo B actualizado.",
        notificacionEnviada: true,
        sesionesInvalidadas: true,
        detalles: "Cuenta suspendida hasta la aprobación formal del Anexo B. Suplente no habilitado."
      }
    ]
  }
];

const STORAGE_KEY_COORDINADORES = "dinarp_coordinadores_cuentas_v2";

export function useCoordinadoresStore() {
  const [coordinadores, setCoordinadores] = useState<CoordinadorCuenta[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COORDINADORES);
      if (stored) {
        setCoordinadores(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY_COORDINADORES, JSON.stringify(INITIAL_COORDINADORES));
        setCoordinadores(INITIAL_COORDINADORES);
      }
    } catch {
      setCoordinadores(INITIAL_COORDINADORES);
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = useCallback((items: CoordinadorCuenta[]) => {
    setCoordinadores(items);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_COORDINADORES, JSON.stringify(items));
      } catch (e) {
        console.error("Error saving coordinadores:", e);
      }
    }
  }, []);

  const getCoordinadorById = useCallback((id: string) => {
    return coordinadores.find((c) => c.id === id || c.cedula === id);
  }, [coordinadores]);

  const getFechaHoraActual = () => {
    const now = new Date();
    return `${now.toLocaleDateString("es-EC")} ${now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // ID-10: Declarar nuevo correo (manteniéndolo separado del vigente, en estado Pendiente de verificación)
  const declararNuevoCorreo = useCallback((
    id: string,
    params: {
      nuevoCorreo: string;
      motivo: string;
      caso: string;
      autorizacion: string;
      actor: string;
      simularFalloSync?: boolean;
    }
  ) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false, error: "Coordinador no encontrado" };

    const coord = { ...list[index] };
    const fechaHora = getFechaHoraActual();

    // Conservar correo vigente, registrar nuevo correo separado en estado pendiente
    coord.nuevoCorreoPendiente = params.nuevoCorreo.trim();
    coord.estadoNuevoCorreo = "PENDIENTE_VERIFICACION";
    coord.fechaDeclaracionNuevoCorreo = fechaHora;
    coord.ultimaActualizacion = fechaHora;

    if (params.simularFalloSync) {
      coord.sincronizacionIdentityPlatform = "PENDIENTE_SINCRONIZACION";
      coord.mensajeSincronizacion = "Cambio de cuenta pendiente de sincronización";
    } else {
      coord.sincronizacionIdentityPlatform = "SINCRONIZADO";
      coord.mensajeSincronizacion = undefined;
    }

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-dec-mail-${Date.now()}`,
      fecha: fechaHora,
      accion: "Declaración de nuevo correo",
      actor: params.actor || "Administrador DINARP",
      causa: params.motivo,
      caso: params.caso,
      autorizacion: params.autorizacion,
      notificacionEnviada: true,
      detalles: `Nuevo correo declarado: ${coord.nuevoCorreoPendiente} (Pendiente de verificación). El correo vigente ${coord.correo} se conserva hasta verificación.`
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord, sincronizacionPendiente: !!params.simularFalloSync };
  }, [coordinadores, saveToStorage]);

  // Confirmar verificación de nuevo correo (sustituye el correo vigente)
  const verificarNuevoCorreo = useCallback((
    id: string,
    params: {
      actor: string;
      simularFalloSync?: boolean;
    }
  ) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false, error: "Coordinador no encontrado" };

    const coord = { ...list[index] };
    if (!coord.nuevoCorreoPendiente) {
      return { success: false, error: "No existe un nuevo correo pendiente de verificación" };
    }

    const fechaHora = getFechaHoraActual();
    const anteriorCorreo = coord.correo;
    coord.correo = coord.nuevoCorreoPendiente;
    coord.correoVerificado = true;
    coord.nuevoCorreoPendiente = undefined;
    coord.estadoNuevoCorreo = undefined;
    coord.fechaDeclaracionNuevoCorreo = undefined;
    coord.sesionesActivas = 0; // Invalida sesiones por cambio de correo verificado
    coord.ultimaActualizacion = fechaHora;

    if (params.simularFalloSync) {
      coord.sincronizacionIdentityPlatform = "PENDIENTE_SINCRONIZACION";
      coord.mensajeSincronizacion = "Cambio de cuenta pendiente de sincronización";
    } else {
      coord.sincronizacionIdentityPlatform = "SINCRONIZADO";
      coord.mensajeSincronizacion = undefined;
    }

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-verif-mail-${Date.now()}`,
      fecha: fechaHora,
      accion: "Sustitución de correo por verificación exitosa",
      actor: params.actor || "Administrador DINARP",
      causa: "Verificación confirmada del canal de correo institucional",
      notificacionEnviada: true,
      sesionesInvalidadas: true,
      detalles: `Correo verificado actualizado a: ${coord.correo}. Correo anterior sustituido: ${anteriorCorreo}. Se invalidaron sesiones activas.`
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord, sincronizacionPendiente: !!params.simularFalloSync };
  }, [coordinadores, saveToStorage]);

  // Cancelar declaración de nuevo correo
  const cancelarNuevoCorreoPendiente = useCallback((
    id: string,
    params: { actor: string; motivo: string }
  ) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false, error: "Coordinador no encontrado" };

    const coord = { ...list[index] };
    const correoDescartado = coord.nuevoCorreoPendiente;
    coord.nuevoCorreoPendiente = undefined;
    coord.estadoNuevoCorreo = undefined;
    coord.fechaDeclaracionNuevoCorreo = undefined;
    coord.ultimaActualizacion = getFechaHoraActual();

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-cancel-mail-${Date.now()}`,
      fecha: coord.ultimaActualizacion,
      accion: "Cancelación de nuevo correo pendiente",
      actor: params.actor || "Administrador DINARP",
      causa: params.motivo,
      notificacionEnviada: true,
      detalles: `Se canceló la solicitud del nuevo correo: ${correoDescartado}. Se mantiene vigente: ${coord.correo}.`
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord };
  }, [coordinadores, saveToStorage]);

  // Reiniciar TOTP (únicamente permitido si existe recuperación autorizada)
  const reiniciarTotp = useCallback((
    id: string,
    params: {
      motivo: string;
      caso: string;
      autorizacion: string;
      actor: string;
      simularFalloSync?: boolean;
    }
  ) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false, error: "Coordinador no encontrado" };

    const coord = { ...list[index] };

    // Regla estricta: permitir reinicio de TOTP únicamente si existe recuperación autorizada
    if (!coord.recuperacionId08Autorizada) {
      return {
        success: false,
        error: "Operación rechazada: Solo se permite el reinicio de factor TOTP si existe una solicitud de recuperación previamente autorizada."
      };
    }

    const fechaHora = getFechaHoraActual();
    coord.totpConfigurado = false;
    coord.sesionesActivas = 0; // Invalida todas las sesiones activas
    coord.ultimaActualizacion = fechaHora;

    if (params.simularFalloSync) {
      coord.sincronizacionIdentityPlatform = "PENDIENTE_SINCRONIZACION";
      coord.mensajeSincronizacion = "Cambio de cuenta pendiente de sincronización";
    } else {
      coord.sincronizacionIdentityPlatform = "SINCRONIZADO";
      coord.mensajeSincronizacion = undefined;
    }

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-reset-totp-${Date.now()}`,
      fecha: fechaHora,
      accion: "Reinicio de factor Google Authenticator",
      actor: params.actor || "Administrador DINARP",
      causa: params.motivo,
      caso: params.caso,
      autorizacion: params.autorizacion || coord.codigoRecuperacionId08,
      evidencia: `Solicitud de recuperación: ${coord.codigoRecuperacionId08 || "Autorizada"}`,
      notificacionEnviada: true,
      sesionesInvalidadas: true,
      detalles: "Segundo factor TOTP reiniciado. Sesiones invalidadas de inmediato. Requiere vinculación en próximo acceso."
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord, sincronizacionPendiente: !!params.simularFalloSync };
  }, [coordinadores, saveToStorage]);

  // ID-10: Actualizar teléfono
  const actualizarTelefono = useCallback((
    id: string,
    params: {
      nuevoTelefono: string;
      motivo: string;
      actor: string;
    }
  ) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false, error: "Coordinador no encontrado" };

    const coord = { ...list[index] };
    coord.telefono = params.nuevoTelefono.trim();
    coord.ultimaActualizacion = getFechaHoraActual();

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-tel-${Date.now()}`,
      fecha: coord.ultimaActualizacion,
      accion: "Actualización de teléfono institucional",
      actor: params.actor || "Administrador DINARP",
      causa: params.motivo,
      notificacionEnviada: false,
      detalles: `Teléfono actualizado a: ${coord.telefono}.`
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord };
  }, [coordinadores, saveToStorage]);

  // ID-11: Suspender cuenta
  const suspenderCoordinador = useCallback((
    id: string,
    params: {
      causa: string;
      caso?: string;
      autorizacion?: string;
      actor: string;
      simularFalloSync?: boolean;
    }
  ) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false, error: "Coordinador no encontrado" };

    const coord = { ...list[index] };
    const fechaHora = getFechaHoraActual();

    coord.estado = "SUSPENDIDO";
    coord.motivoSuspension = params.causa;
    coord.fechaSuspension = fechaHora;
    coord.responsableSuspension = params.actor || "Administrador DINARP";
    coord.sesionesActivas = 0; // Invalida todas las sesiones y evita nuevo ingreso
    coord.ultimaActualizacion = fechaHora;

    if (params.simularFalloSync) {
      coord.sincronizacionIdentityPlatform = "PENDIENTE_SINCRONIZACION";
      coord.mensajeSincronizacion = "Cambio de cuenta pendiente de sincronización";
    } else {
      coord.sincronizacionIdentityPlatform = "SINCRONIZADO";
      coord.mensajeSincronizacion = undefined;
    }

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-susp-${Date.now()}`,
      fecha: fechaHora,
      accion: "Suspensión de cuenta",
      actor: params.actor || "Administrador DINARP",
      causa: params.causa,
      caso: params.caso,
      autorizacion: params.autorizacion,
      notificacionEnviada: true,
      sesionesInvalidadas: true,
      detalles: `Cuenta suspendida. Invalidadas todas las sesiones y denegado nuevo ingreso. No se habilita automáticamente al suplente.`
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord, sincronizacionPendiente: !!params.simularFalloSync };
  }, [coordinadores, saveToStorage]);

  // ID-11: Reactivar cuenta (exige Anexo B aprobado, rol vigente y TOTP configurado)
  const reactivarCoordinador = useCallback((
    id: string,
    params: {
      causa: string;
      caso?: string;
      autorizacion?: string;
      actor: string;
      simularFalloSync?: boolean;
    }
  ) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false, error: "Coordinador no encontrado" };

    const coord = { ...list[index] };

    // Regla estricta ID-11: reactivar exige 1) Anexo B aprobado, 2) rol/designación vigente y 3) TOTP configurado
    const requisitosFaltantes: string[] = [];
    if (!coord.anexoBAprobado) {
      requisitosFaltantes.push("Acuerdo Anexo B aprobado");
    }
    if (!coord.designacionVigente) {
      requisitosFaltantes.push("Designación institucional vigente");
    }
    if (!coord.totpConfigurado) {
      requisitosFaltantes.push("Google Authenticator (TOTP) configurado");
    }

    // Si alguna condición falla, mantener la cuenta suspendida
    if (requisitosFaltantes.length > 0) {
      return {
        success: false,
        conservaSuspension: true,
        requisitosFaltantes,
        error: `No es posible reactivar la cuenta. Faltan los siguientes requisitos indispensables: ${requisitosFaltantes.join(", ")}. La cuenta se mantendrá suspendida.`
      };
    }

    const fechaHora = getFechaHoraActual();
    coord.estado = "ACTIVO";
    coord.motivoSuspension = undefined;
    coord.fechaSuspension = undefined;
    coord.responsableSuspension = undefined;
    coord.ultimaActualizacion = fechaHora;

    if (params.simularFalloSync) {
      coord.sincronizacionIdentityPlatform = "PENDIENTE_SINCRONIZACION";
      coord.mensajeSincronizacion = "Cambio de cuenta pendiente de sincronización";
    } else {
      coord.sincronizacionIdentityPlatform = "SINCRONIZADO";
      coord.mensajeSincronizacion = undefined;
    }

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-react-${Date.now()}`,
      fecha: fechaHora,
      accion: "Reactivación de cuenta",
      actor: params.actor || "Administrador DINARP",
      causa: params.causa,
      caso: params.caso,
      autorizacion: params.autorizacion,
      notificacionEnviada: true,
      detalles: "Reactivación confirmada. Se validaron los 3 requisitos: Anexo B aprobado, designación vigente y autenticador TOTP activo."
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord, sincronizacionPendiente: !!params.simularFalloSync };
  }, [coordinadores, saveToStorage]);

  // Sincronizar manualmente con Identity Platform
  const sincronizarIdentityPlatform = useCallback((id: string) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return { success: false };

    const coord = { ...list[index] };
    coord.sincronizacionIdentityPlatform = "SINCRONIZADO";
    coord.mensajeSincronizacion = undefined;
    coord.ultimaActualizacion = getFechaHoraActual();

    const nuevoEvento: EventoCoordinadorAuditoria = {
      id: `evt-sync-${Date.now()}`,
      fecha: coord.ultimaActualizacion,
      accion: "Sincronización con Identity Platform",
      actor: "Sistema DINARP",
      causa: "Reintento exitoso de sincronización de credenciales",
      notificacionEnviada: false,
      detalles: "Atributos y credenciales sincronizados satisfactoriamente con el proveedor de identidad."
    };

    coord.historial = [nuevoEvento, ...(coord.historial || [])];
    list[index] = coord;
    saveToStorage(list);

    return { success: true, coordinador: coord };
  }, [coordinadores, saveToStorage]);

  // Vincular TOTP (simulación para pruebas de habilitación)
  const vincularTotpCoordinador = useCallback((id: string) => {
    const list = [...coordinadores];
    const index = list.findIndex((c) => c.id === id || c.cedula === id);
    if (index === -1) return false;

    const coord = { ...list[index] };
    coord.totpConfigurado = true;
    coord.ultimaActualizacion = getFechaHoraActual();

    coord.historial = [
      {
        id: `evt-totp-${Date.now()}`,
        fecha: coord.ultimaActualizacion,
        accion: "Google Authenticator vinculado",
        actor: coord.nombreCompleto,
        causa: "Vinculación exitosa de segundo factor TOTP",
        notificacionEnviada: true,
        detalles: "Factor TOTP operativo con código de autenticación verificado."
      },
      ...(coord.historial || [])
    ];

    list[index] = coord;
    saveToStorage(list);
    return true;
  }, [coordinadores, saveToStorage]);

  return {
    coordinadores,
    isLoaded,
    getCoordinadorById,
    declararNuevoCorreo,
    verificarNuevoCorreo,
    cancelarNuevoCorreoPendiente,
    reiniciarTotp,
    actualizarTelefono,
    suspenderCoordinador,
    reactivarCoordinador,
    sincronizarIdentityPlatform,
    vincularTotpCoordinador
  };
}
