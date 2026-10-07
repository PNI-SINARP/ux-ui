"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export type EstadoSuplencia =
  | "SIN_SUPLENCIA"
  | "PROGRAMADA"
  | "ACTIVA"
  | "ACTIVACION_PENDIENTE"
  | "FINALIZADA"
  | "DESACTIVADA_ADMINISTRATIVAMENTE"
  | "DESPLAZADA_POR_SUPLENCIA_MANUAL";

export type ModalidadSuplencia = "PROGRAMADA" | "ADMINISTRATIVA" | "NINGUNA";

export type EstadoCoordinadorTitular = "ACTIVO" | "TEMPORALMENTE_INACTIVO" | "INACTIVO_TEMPORAL" | "SUSPENDIDO";
export type EstadoCoordinadorSuplente = "ENROLADO_SIN_ACCESO" | "ACTIVO" | "SUSPENDIDO";

export interface EventoTrazabilidadSuplencia {
  id: string;
  fechaHora: string;
  evento: string;
  actor: string;
  modalidad: "Programada" | "Administrativa" | "Automática (Portal)";
  motivo?: string;
  estado: string;
}

export interface NotificacionSuplencia {
  id: string;
  destinatario: string;
  canal: "Correo";
  asunto: string;
  mensaje: string;
  fechaHora: string;
  estadoEntrega: "Entregado" | "Pendiente";
}

export interface SuplenciaInstitucional {
  id: string;
  idInstitucion: string;
  institucion: string;
  rucInstitucion: string;
  titular: {
    nombre: string;
    cedula: string;
    correo: string;
    cargo: string;
    estado: EstadoCoordinadorTitular;
  };
  suplente: {
    nombre: string;
    cedula: string;
    correo: string;
    cargo: string;
    estado: EstadoCoordinadorSuplente;
    enrolado: boolean;
  };
  modalidad: ModalidadSuplencia;
  estado: EstadoSuplencia;
  fechaInicial?: string; // YYYY-MM-DD
  fechaFinal?: string; // YYYY-MM-DD
  instanteInicioReal?: string; // ISO 8601 UTC
  instanteRestitucionReal?: string; // ISO 8601 UTC
  motivo?: string;
  actorCreacion: string;
  ultimaActualizacion: string;
  programacionPreviaDesplazada?: {
    fechaInicial: string;
    fechaFinal: string;
    fechaRegistro: string;
  };
  trazabilidad: EventoTrazabilidadSuplencia[];
  notificaciones: NotificacionSuplencia[];
}

const STORAGE_KEY_SUPLENCIAS = "dinarp_suplencias_store_v1";

function generarIdOpaco(prefijo: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefijo}-${timestamp}-${rand}`;
}

function getFechaHoraActualFormateada(): string {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, "0");
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const anio = now.getFullYear();
  const horas = String(now.getHours()).padStart(2, "0");
  const minutos = String(now.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

export const INITIAL_SUPLENCIAS_DATA: SuplenciaInstitucional[] = [
  {
    id: "SUP-2026-001",
    idInstitucion: "INST-MINEDUC",
    institucion: "Ministerio de Educación",
    rucInstitucion: "1760004560001",
    titular: {
      nombre: "Juan Pérez",
      cedula: "1712345678",
      correo: "juan.perez@educacion.gob.ec",
      cargo: "Director de Tecnologías de la Información",
      estado: "ACTIVO",
    },
    suplente: {
      nombre: "Mariana Almeida",
      cedula: "1714443322",
      correo: "m.almeida@educacion.gob.ec",
      cargo: "Especialista de Sistemas y Seguridad",
      estado: "ENROLADO_SIN_ACCESO",
      enrolado: true,
    },
    modalidad: "NINGUNA",
    estado: "SIN_SUPLENCIA",
    actorCreacion: "Sistema DINARP",
    ultimaActualizacion: "05/10/2026 08:30",
    trazabilidad: [
      {
        id: "EVT-SUP-001",
        fechaHora: "15/01/2025 09:00",
        evento: "Titular restituido",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        motivo: "Inicio de ciclo operativo regular",
        estado: "Titular activo",
      },
    ],
    notificaciones: [],
  },
  {
    id: "SUP-2026-002",
    idInstitucion: "INST-REG-CIVIL",
    institucion: "Dirección General de Registro Civil, Identificación y Cedulación",
    rucInstitucion: "1760001550001",
    titular: {
      nombre: "Ing. Esteban Javier Morales Salazar",
      cedula: "1712345678",
      correo: "esteban.morales@registrocivil.gob.ec",
      cargo: "Coordinador General de Servicios de Información",
      estado: "ACTIVO",
    },
    suplente: {
      nombre: "Andrés Viteri",
      cedula: "1715556677",
      correo: "andres.viteri@registrocivil.gob.ec",
      cargo: "Analista de Interoperabilidad",
      estado: "ENROLADO_SIN_ACCESO",
      enrolado: true,
    },
    modalidad: "PROGRAMADA",
    estado: "PROGRAMADA",
    fechaInicial: "2026-10-15",
    fechaFinal: "2026-10-25",
    actorCreacion: "Ing. Esteban Javier Morales Salazar",
    ultimaActualizacion: "02/10/2026 14:15",
    trazabilidad: [
      {
        id: "EVT-SUP-002",
        fechaHora: "02/10/2026 14:15",
        evento: "Inactividad programada",
        actor: "Ing. Esteban Javier Morales Salazar",
        modalidad: "Programada",
        motivo: "Período vacacional anual reglamentario",
        estado: "Programada",
      },
    ],
    notificaciones: [],
  },
  {
    id: "SUP-2026-003",
    idInstitucion: "INST-GUAYAQUIL",
    institucion: "Gobierno Autónomo Descentralizado Municipal de Guayaquil",
    rucInstitucion: "0960000220001",
    titular: {
      nombre: "Javier Bohórquez",
      cedula: "0912345678",
      correo: "jbohorquez@guayaquil.gob.ec",
      cargo: "Director de Tecnologías de la Información",
      estado: "TEMPORALMENTE_INACTIVO",
    },
    suplente: {
      nombre: "Roberto Cedeño",
      cedula: "0918887766",
      correo: "rcedeno@guayaquil.gob.ec",
      cargo: "Subdirector de Sistemas",
      estado: "ACTIVO",
      enrolado: true,
    },
    modalidad: "ADMINISTRATIVA",
    estado: "ACTIVA",
    instanteInicioReal: new Date("2026-10-01T08:00:00Z").toISOString(),
    motivo: "Licencia médica de fuerza mayor sin previa programación en el portal.",
    actorCreacion: "Admin DINARP",
    ultimaActualizacion: "01/10/2026 08:00",
    trazabilidad: [
      {
        id: "EVT-SUP-003-1",
        fechaHora: "01/10/2026 08:00",
        evento: "Suplencia activada administrativamente",
        actor: "Admin DINARP",
        modalidad: "Administrativa",
        motivo: "Licencia médica de fuerza mayor sin previa programación.",
        estado: "Activa",
      },
      {
        id: "EVT-SUP-003-2",
        fechaHora: "01/10/2026 08:00",
        evento: "Titular temporalmente inhabilitado",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Titular inactivo",
      },
      {
        id: "EVT-SUP-003-3",
        fechaHora: "01/10/2026 08:01",
        evento: "Suplente habilitado",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Suplente activo",
      },
      {
        id: "EVT-SUP-003-4",
        fechaHora: "01/10/2026 08:01",
        evento: "Director de Gestión notificado",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Notificado",
      },
    ],
    notificaciones: [
      {
        id: "NOTIF-001",
        destinatario: "Roberto Cedeño (Suplente)",
        canal: "Correo",
        asunto: "Habilitación de acceso institucional por suplencia administrativa",
        mensaje: "Se ha activado su acceso institucional como Coordinador SINARP suplente del GAD Municipal de Guayaquil.",
        fechaHora: "01/10/2026 08:01",
        estadoEntrega: "Entregado",
      },
    ],
  },
  {
    id: "SUP-2026-004",
    idInstitucion: "INST-MSP",
    institucion: "Ministerio de Salud Pública",
    rucInstitucion: "1760001230001",
    titular: {
      nombre: "Juan Carlos Pérez Gómez",
      cedula: "1715489621",
      correo: "juan.perez@msp.gob.ec",
      cargo: "Director Nacional de Vigilancia Epidemiológica",
      estado: "ACTIVO",
    },
    suplente: {
      nombre: "Elena Castro",
      cedula: "1719998877",
      correo: "elena.castro@msp.gob.ec",
      cargo: "Especialista de Sistemas Sanitarios",
      estado: "ENROLADO_SIN_ACCESO",
      enrolado: true,
    },
    modalidad: "PROGRAMADA",
    estado: "FINALIZADA",
    fechaInicial: "2026-09-10",
    fechaFinal: "2026-09-20",
    instanteInicioReal: new Date("2026-09-10T00:00:00Z").toISOString(),
    instanteRestitucionReal: new Date("2026-09-21T00:00:00Z").toISOString(),
    actorCreacion: "Juan Carlos Pérez Gómez",
    ultimaActualizacion: "21/09/2026 00:01",
    trazabilidad: [
      {
        id: "EVT-SUP-004-1",
        fechaHora: "01/09/2026 10:00",
        evento: "Inactividad programada",
        actor: "Juan Carlos Pérez Gómez",
        modalidad: "Programada",
        estado: "Programada",
      },
      {
        id: "EVT-SUP-004-2",
        fechaHora: "10/09/2026 00:00",
        evento: "Titular temporalmente inhabilitado",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Titular inactivo",
      },
      {
        id: "EVT-SUP-004-3",
        fechaHora: "10/09/2026 00:01",
        evento: "Suplente habilitado",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Suplente activo",
      },
      {
        id: "EVT-SUP-004-4",
        fechaHora: "21/09/2026 00:00",
        evento: "Suplencia finalizada",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Finalizada",
      },
      {
        id: "EVT-SUP-004-5",
        fechaHora: "21/09/2026 00:01",
        evento: "Titular restituido",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Titular activo",
      },
    ],
    notificaciones: [],
  },
  {
    id: "SUP-2026-005",
    idInstitucion: "INST-MINTEL",
    institucion: "Ministerio de Telecomunicaciones y Sociedad de la Información",
    rucInstitucion: "1768151240001",
    titular: {
      nombre: "Ana María Pérez Gómez",
      cedula: "1722334455",
      correo: "ana.perez@mintel.gob.ec",
      cargo: "Directora de Interoperabilidad",
      estado: "ACTIVO",
    },
    suplente: {
      nombre: "Luis Fernando Torres",
      cedula: "1711223344",
      correo: "luis.torres@mintel.gob.ec",
      cargo: "Especialista en Datos de Gobierno Electrónico",
      estado: "ENROLADO_SIN_ACCESO",
      enrolado: true,
    },
    modalidad: "ADMINISTRATIVA",
    estado: "DESACTIVADA_ADMINISTRATIVAMENTE",
    actorCreacion: "Admin DINARP",
    ultimaActualizacion: "28/09/2026 17:30",
    motivo: "Comisión oficial en el extranjero concluida; titular se reincorpora al cargo.",
    trazabilidad: [
      {
        id: "EVT-SUP-005-1",
        fechaHora: "20/09/2026 09:00",
        evento: "Suplencia activada administrativamente",
        actor: "Admin DINARP",
        modalidad: "Administrativa",
        motivo: "Comisión de servicios al exterior",
        estado: "Activa",
      },
      {
        id: "EVT-SUP-005-2",
        fechaHora: "28/09/2026 17:30",
        evento: "Suplencia desactivada por Administrador",
        actor: "Admin DINARP",
        modalidad: "Administrativa",
        motivo: "Reincorporación de titular a funciones",
        estado: "Desactivada",
      },
      {
        id: "EVT-SUP-005-3",
        fechaHora: "28/09/2026 17:31",
        evento: "Titular restituido",
        actor: "Sistema DINARP",
        modalidad: "Automática (Portal)",
        estado: "Titular activo",
      },
    ],
    notificaciones: [],
  },
];

export function useSuplenciasStore() {
  const [suplencias, setSuplencias] = useState<SuplenciaInstitucional[]>(INITIAL_SUPLENCIAS_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga inicial de localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUPLENCIAS);
      if (stored) {
        setSuplencias(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading suplencias store", e);
    }
    setIsLoaded(true);
  }, []);

  // Guardado reactivo en localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_SUPLENCIAS, JSON.stringify(suplencias));
    } catch (e) {
      console.error("Error saving suplencias store", e);
    }
  }, [suplencias, isLoaded]);

  // Obtener suplencia de la institución del Coordinador Titular (Ministerio de Educación por defecto)
  const getSuplenciaMineduc = useCallback((): SuplenciaInstitucional => {
    const found = suplencias.find((s) => s.idInstitucion === "INST-MINEDUC");
    return found || suplencias[0];
  }, [suplencias]);

  /**
   * AUS-01: Programar inactividad del titular (Juan Pérez)
   */
  const programarInactividad = useCallback(
    (idInstitucion: string, fechaInicial: string, fechaFinal: string) => {
      let resultadoExitoso = false;

      setSuplencias((prev) =>
        prev.map((item) => {
          if (item.idInstitucion !== idInstitucion) return item;

          // Validaciones
          if (!fechaInicial || !fechaFinal) {
            toast.error("Fecha inicial y fecha final son obligatorias.");
            return item;
          }

          if (fechaInicial > fechaFinal) {
            toast.error("La fecha inicial no puede ser posterior a la fecha final.");
            return item;
          }

          if (item.titular.estado !== "ACTIVO") {
            toast.error("El coordinador titular debe tener cuenta y rol activo para programar suplencia.");
            return item;
          }

          if (!item.suplente.enrolado) {
            toast.error("Debe existir un coordinador suplente enrolado en la institución.");
            return item;
          }

          if (item.estado === "ACTIVA") {
            toast.error("Ya existe una suplencia activa en esta institución.");
            return item;
          }

          const fechaActualStr = getFechaHoraActualFormateada();

          const nuevoEvento: EventoTrazabilidadSuplencia = {
            id: generarIdOpaco("EVT-PRG"),
            fechaHora: fechaActualStr,
            evento: "Inactividad programada",
            actor: item.titular.nombre,
            modalidad: "Programada",
            motivo: `Programación del ${fechaInicial} al ${fechaFinal}`,
            estado: "Programada",
          };

          resultadoExitoso = true;

          return {
            ...item,
            estado: "PROGRAMADA",
            modalidad: "PROGRAMADA",
            fechaInicial,
            fechaFinal,
            actorCreacion: item.titular.nombre,
            ultimaActualizacion: fechaActualStr,
            // Regla fundamental: Programar la inactividad NO significa activar inmediatamente al suplente
            titular: {
              ...item.titular,
              estado: "ACTIVO",
            },
            suplente: {
              ...item.suplente,
              estado: "ENROLADO_SIN_ACCESO",
            },
            trazabilidad: [nuevoEvento, ...item.trazabilidad],
          };
        })
      );

      if (resultadoExitoso) {
        toast.success("Inactividad programada exitosamente", {
          description: `Al iniciar el período se verificará de nuevo si el suplente puede habilitarse. Período: ${fechaInicial} al ${fechaFinal}`,
        });
      }
      return resultadoExitoso;
    },
    []
  );

  /**
   * Cancelar inactividad programada antes de que inicie
   */
  const cancelarProgramacion = useCallback((idInstitucion: string) => {
    setSuplencias((prev) =>
      prev.map((item) => {
        if (item.idInstitucion !== idInstitucion) return item;
        const fechaActualStr = getFechaHoraActualFormateada();

        const nuevoEvento: EventoTrazabilidadSuplencia = {
          id: generarIdOpaco("EVT-CAN"),
          fechaHora: fechaActualStr,
          evento: "Programación de inactividad cancelada",
          actor: item.titular.nombre,
          modalidad: "Programada",
          motivo: "Cancelación voluntaria por el titular antes de la fecha inicial.",
          estado: "Sin suplencia",
        };

        return {
          ...item,
          estado: "SIN_SUPLENCIA",
          modalidad: "NINGUNA",
          fechaInicial: undefined,
          fechaFinal: undefined,
          ultimaActualizacion: fechaActualStr,
          titular: { ...item.titular, estado: "ACTIVO" },
          suplente: { ...item.suplente, estado: "ENROLADO_SIN_ACCESO" },
          trazabilidad: [nuevoEvento, ...item.trazabilidad],
        };
      })
    );
    toast.info("Programación de inactividad cancelada");
  }, []);

  /**
   * AUS-03: Simulación de inicio automático de suplencia programada
   */
  const simularInicioSuplenciaProgramada = useCallback((idInstitucion: string) => {
    let resultado = false;
    setSuplencias((prev) =>
      prev.map((item) => {
        if (item.idInstitucion !== idInstitucion) return item;
        if (item.estado !== "PROGRAMADA") {
          toast.error("La suplencia debe estar en estado 'Programada' para iniciar.");
          return item;
        }

        // AUS-03 CA1 & CA4:
        // 1. Deshabilitar titular
        // 2. Solo después habilitar suplente
        // Regla fundamental: Nunca ambos activos simultáneamente
        const fechaActualStr = getFechaHoraActualFormateada();
        const nowIso = new Date().toISOString();

        const evtTitular: EventoTrazabilidadSuplencia = {
          id: generarIdOpaco("EVT-TIT-DES"),
          fechaHora: fechaActualStr,
          evento: "Titular temporalmente inhabilitado",
          actor: "Sistema DINARP",
          modalidad: "Automática (Portal)",
          motivo: "Llegada de la fecha inicial programada",
          estado: "Titular inactivo",
        };

        const evtSuplente: EventoTrazabilidadSuplencia = {
          id: generarIdOpaco("EVT-SUP-HAB"),
          fechaHora: fechaActualStr,
          evento: "Suplente habilitado",
          actor: "Sistema DINARP",
          modalidad: "Automática (Portal)",
          motivo: "Acceso institucional concedido a Mariana Almeida",
          estado: "Suplente activo",
        };

        const evtActiva: EventoTrazabilidadSuplencia = {
          id: generarIdOpaco("EVT-SUP-ACT"),
          fechaHora: fechaActualStr,
          evento: "Suplencia activada",
          actor: "Sistema DINARP",
          modalidad: "Automática (Portal)",
          motivo: "Activación automática por temporizador institucional",
          estado: "Activa",
        };

        const evtNotif: EventoTrazabilidadSuplencia = {
          id: generarIdOpaco("EVT-NOT-DIR"),
          fechaHora: fechaActualStr,
          evento: "Director de Gestión notificado",
          actor: "Sistema DINARP",
          modalidad: "Automática (Portal)",
          estado: "Notificado",
        };

        const notifSuplente: NotificacionSuplencia = {
          id: generarIdOpaco("NOT-SUP"),
          destinatario: `${item.suplente.nombre} (Suplente)`,
          canal: "Correo",
          asunto: "Activación de suplencia institucional - Portal DINARP",
          mensaje: `Se ha activado su acceso institucional como Coordinador SINARP de ${item.institucion}.`,
          fechaHora: fechaActualStr,
          estadoEntrega: "Entregado",
        };

        const notifDirector: NotificacionSuplencia = {
          id: generarIdOpaco("NOT-DIR"),
          destinatario: "Director de Gestión (DINARP)",
          canal: "Correo",
          asunto: `Suplencia activa en ${item.institucion}`,
          mensaje: `El coordinador titular ${item.titular.nombre} ha iniciado su inactividad. El suplente ${item.suplente.nombre} ha asumido funciones.`,
          fechaHora: fechaActualStr,
          estadoEntrega: "Entregado",
        };

        resultado = true;

        return {
          ...item,
          estado: "ACTIVA",
          instanteInicioReal: nowIso,
          ultimaActualizacion: fechaActualStr,
          titular: {
            ...item.titular,
            estado: "TEMPORALMENTE_INACTIVO",
          },
          suplente: {
            ...item.suplente,
            estado: "ACTIVO",
          },
          trazabilidad: [evtNotif, evtActiva, evtSuplente, evtTitular, ...item.trazabilidad],
          notificaciones: [notifDirector, notifSuplente, ...item.notificaciones],
        };
      })
    );

    if (resultado) {
      toast.success("Suplencia activada automáticamente", {
        description: "Mariana Almeida asume funciones. Titular Juan Pérez temporalmente inhabilitado.",
      });
    }
  }, []);

  /**
   * AUS-03: Simulación de fin de período programado (restitución automática)
   */
  const simularFinSuplenciaProgramada = useCallback((idInstitucion: string) => {
    let resultado = false;
    setSuplencias((prev) =>
      prev.map((item) => {
        if (item.idInstitucion !== idInstitucion) return item;
        if (item.estado !== "ACTIVA" || item.modalidad !== "PROGRAMADA") {
          toast.error("La suplencia programada debe estar activa para finalizarla.");
          return item;
        }

        // AUS-03 CA1:
        // 1. Deshabilitar suplente
        // 2. Restaurar acceso institucional del titular
        // Regla fundamental: Nunca ambos activos a la vez
        const fechaActualStr = getFechaHoraActualFormateada();
        const nowIso = new Date().toISOString();

        const evtFin: EventoTrazabilidadSuplencia = {
          id: generarIdOpaco("EVT-FIN"),
          fechaHora: fechaActualStr,
          evento: "Suplencia finalizada",
          actor: "Sistema DINARP",
          modalidad: "Automática (Portal)",
          motivo: "Conclusión de fecha final programada",
          estado: "Finalizada",
        };

        const evtRestituido: EventoTrazabilidadSuplencia = {
          id: generarIdOpaco("EVT-REST"),
          fechaHora: fechaActualStr,
          evento: "Titular restituido",
          actor: "Sistema DINARP",
          modalidad: "Automática (Portal)",
          motivo: "Acceso institucional restaurado a Juan Pérez",
          estado: "Titular activo",
        };

        const notifRestitucion: NotificacionSuplencia = {
          id: generarIdOpaco("NOT-REST"),
          destinatario: `${item.titular.nombre} (Titular)`,
          canal: "Correo",
          asunto: "Restitución de funciones de Coordinador SINARP",
          mensaje: `El período de suplencia ha concluido. Su acceso como Coordinador Titular de ${item.institucion} ha sido restablecido.`,
          fechaHora: fechaActualStr,
          estadoEntrega: "Entregado",
        };

        resultado = true;

        return {
          ...item,
          estado: "FINALIZADA",
          instanteRestitucionReal: nowIso,
          ultimaActualizacion: fechaActualStr,
          titular: {
            ...item.titular,
            estado: "ACTIVO",
          },
          suplente: {
            ...item.suplente,
            estado: "ENROLADO_SIN_ACCESO",
          },
          trazabilidad: [evtRestituido, evtFin, ...item.trazabilidad],
          notificaciones: [notifRestitucion, ...item.notificaciones],
        };
      })
    );

    if (resultado) {
      toast.success("Suplencia finalizada. Titular Juan Pérez restituido.", {
        description: "Acceso institucional de Mariana Almeida retirado. Acceso de Juan Pérez restaurado.",
      });
    }
  }, []);

  /**
   * AUS-02: Activar suplencia administrativamente (Admin DINARP)
   */
  const activarSuplenciaAdministrativa = useCallback(
    (idInstitucion: string, motivo: string) => {
      let resultado = false;

      if (!motivo || motivo.trim().length < 10) {
        toast.error("El motivo de activación es obligatorio (mínimo 10 caracteres según PAR-07).");
        return false;
      }

      setSuplencias((prev) =>
        prev.map((item) => {
          if (item.idInstitucion !== idInstitucion) return item;

          // Exige suplente enrolado
          if (!item.suplente.enrolado) {
            toast.error("El suplente debe completar Anexo B antes de activar la suplencia.");
            return item;
          }

          if (item.suplente.estado === "SUSPENDIDO") {
            toast.error("Reactiva la cuenta del suplente antes de activar la suplencia.");
            return item;
          }

          const fechaActualStr = getFechaHoraActualFormateada();
          const nowIso = new Date().toISOString();

          // AUS-02 CA4: Si existía una ausencia programada que se solapa, marcarla Desplazada por suplencia manual
          const trazabilidadAdicional: EventoTrazabilidadSuplencia[] = [];
          let programacionPrevia: SuplenciaInstitucional["programacionPreviaDesplazada"] = undefined;

          if (item.estado === "PROGRAMADA" && item.fechaInicial && item.fechaFinal) {
            programacionPrevia = {
              fechaInicial: item.fechaInicial,
              fechaFinal: item.fechaFinal,
              fechaRegistro: item.ultimaActualizacion,
            };
            trazabilidadAdicional.push({
              id: generarIdOpaco("EVT-DESP"),
              fechaHora: fechaActualStr,
              evento: "Desplazada por suplencia manual",
              actor: "Sistema DINARP",
              modalidad: "Administrativa",
              motivo: `Programación del ${item.fechaInicial} al ${item.fechaFinal} desplazada por activación de Admin DINARP.`,
              estado: "Desplazada por suplencia manual",
            });
          }

          // AUS-03 conmutación:
          // 1. Deshabilitar acceso institucional del titular
          // 2. Solo después habilitar acceso institucional del suplente
          const evtAdmin: EventoTrazabilidadSuplencia = {
            id: generarIdOpaco("EVT-ADM-ACT"),
            fechaHora: fechaActualStr,
            evento: "Suplencia activada administrativamente",
            actor: "Admin DINARP",
            modalidad: "Administrativa",
            motivo: motivo.trim(),
            estado: "Activa",
          };

          const evtTitularDes: EventoTrazabilidadSuplencia = {
            id: generarIdOpaco("EVT-TIT-DES2"),
            fechaHora: fechaActualStr,
            evento: "Titular temporalmente inhabilitado",
            actor: "Sistema DINARP",
            modalidad: "Automática (Portal)",
            estado: "Titular inactivo",
          };

          const evtSuplenteHab: EventoTrazabilidadSuplencia = {
            id: generarIdOpaco("EVT-SUP-HAB2"),
            fechaHora: fechaActualStr,
            evento: "Suplente habilitado",
            actor: "Sistema DINARP",
            modalidad: "Automática (Portal)",
            estado: "Suplente activo",
          };

          const evtNotifDir: EventoTrazabilidadSuplencia = {
            id: generarIdOpaco("EVT-NOT-DIR2"),
            fechaHora: fechaActualStr,
            evento: "Director de Gestión notificado",
            actor: "Sistema DINARP",
            modalidad: "Automática (Portal)",
            estado: "Notificado",
          };

          const notifSuplente: NotificacionSuplencia = {
            id: generarIdOpaco("NOT-SUP2"),
            destinatario: `${item.suplente.nombre} (Suplente)`,
            canal: "Correo",
            asunto: "Activación administrativa de suplencia - Portal DINARP",
            mensaje: `El Administrador DINARP ha activado su acceso institucional como Coordinador SINARP de ${item.institucion}. Motivo: ${motivo}`,
            fechaHora: fechaActualStr,
            estadoEntrega: "Entregado",
          };

          const notifDirector: NotificacionSuplencia = {
            id: generarIdOpaco("NOT-DIR2"),
            destinatario: "Director de Gestión (DINARP)",
            canal: "Correo",
            asunto: `Suplencia administrativa activada: ${item.institucion}`,
            mensaje: `Admin DINARP activó la suplencia para ${item.institucion}. Suplente ${item.suplente.nombre} asume funciones.`,
            fechaHora: fechaActualStr,
            estadoEntrega: "Entregado",
          };

          resultado = true;

          return {
            ...item,
            estado: "ACTIVA",
            modalidad: "ADMINISTRATIVA",
            instanteInicioReal: nowIso,
            instanteRestitucionReal: undefined,
            motivo: motivo.trim(),
            actorCreacion: "Admin DINARP",
            ultimaActualizacion: fechaActualStr,
            fechaInicial: undefined,
            fechaFinal: undefined,
            programacionPreviaDesplazada: programacionPrevia,
            titular: {
              ...item.titular,
              estado: "TEMPORALMENTE_INACTIVO",
            },
            suplente: {
              ...item.suplente,
              estado: "ACTIVO",
            },
            trazabilidad: [
              evtNotifDir,
              evtSuplenteHab,
              evtTitularDes,
              evtAdmin,
              ...trazabilidadAdicional,
              ...item.trazabilidad,
            ],
            notificaciones: [notifDirector, notifSuplente, ...item.notificaciones],
          };
        })
      );

      if (resultado) {
        toast.success("Suplencia activada administrativamente", {
          description: "Titular temporalmente suspendido; suplente habilitado.",
        });
      }
      return resultado;
    },
    []
  );

  /**
   * AUS-02: Desactivar suplencia administrativa (Admin DINARP)
   */
  const desactivarSuplenciaAdministrativa = useCallback(
    (idInstitucion: string, motivoDesactivacion: string) => {
      let resultado = false;

      if (!motivoDesactivacion || motivoDesactivacion.trim().length < 5) {
        toast.error("El motivo de desactivación es obligatorio.");
        return false;
      }

      setSuplencias((prev) =>
        prev.map((item) => {
          if (item.idInstitucion !== idInstitucion) return item;

          const fechaActualStr = getFechaHoraActualFormateada();
          const nowIso = new Date().toISOString();

          // AUS-03 reversión:
          // 1. Retirar acceso institucional del suplente
          // 2. Restaurar al titular
          const evtDesact: EventoTrazabilidadSuplencia = {
            id: generarIdOpaco("EVT-ADM-DES"),
            fechaHora: fechaActualStr,
            evento: "Suplencia desactivada por Administrador",
            actor: "Admin DINARP",
            modalidad: "Administrativa",
            motivo: motivoDesactivacion.trim(),
            estado: "Desactivada administrativamente",
          };

          const evtRestitucion: EventoTrazabilidadSuplencia = {
            id: generarIdOpaco("EVT-REST2"),
            fechaHora: fechaActualStr,
            evento: "Titular restituido",
            actor: "Sistema DINARP",
            modalidad: "Automática (Portal)",
            motivo: "Restitución de acceso institucional a titular",
            estado: "Titular activo",
          };

          const notifRestitucion: NotificacionSuplencia = {
            id: generarIdOpaco("NOT-REST2"),
            destinatario: `${item.titular.nombre} (Titular)`,
            canal: "Correo",
            asunto: "Restitución de acceso como Coordinador SINARP Titular",
            mensaje: `El Administrador DINARP ha desactivado la suplencia administrativa. Su acceso en ${item.institucion} ha sido restaurado.`,
            fechaHora: fechaActualStr,
            estadoEntrega: "Entregado",
          };

          resultado = true;

          return {
            ...item,
            estado: "DESACTIVADA_ADMINISTRATIVAMENTE",
            instanteRestitucionReal: nowIso,
            ultimaActualizacion: fechaActualStr,
            // Regla AUS-02 CA4: no reactivar en silencio la programación desplazada:
            // el titular debe confirmarla de nuevo si aún la necesita.
            titular: {
              ...item.titular,
              estado: "ACTIVO",
            },
            suplente: {
              ...item.suplente,
              estado: "ENROLADO_SIN_ACCESO",
            },
            trazabilidad: [evtRestitucion, evtDesact, ...item.trazabilidad],
            notificaciones: [notifRestitucion, ...item.notificaciones],
          };
        })
      );

      if (resultado) {
        toast.success("Suplencia desactivada exitosamente", {
          description: "Titular restituido. Acceso del suplente finalizado.",
        });
      }
      return resultado;
    },
    []
  );

  /**
   * Resetear simulación para demostraciones limpias
   */
  const resetearSimulacion = useCallback((idInstitucion?: string) => {
    if (idInstitucion) {
      const defaultItem = INITIAL_SUPLENCIAS_DATA.find((i) => i.idInstitucion === idInstitucion);
      if (defaultItem) {
        setSuplencias((prev) =>
          prev.map((item) => (item.idInstitucion === idInstitucion ? { ...defaultItem } : item))
        );
      }
    } else {
      setSuplencias(INITIAL_SUPLENCIAS_DATA);
    }
    toast.info("Simulación reiniciada al estado de fábrica.");
  }, []);

  const getSuplenciaByInstitucion = useCallback(
    (idInstitucion: string): SuplenciaInstitucional | undefined => {
      return suplencias.find((s) => s.idInstitucion === idInstitucion);
    },
    [suplencias]
  );

  return {
    suplencias,
    isLoaded,
    getSuplenciaMineduc,
    getSuplenciaByInstitucion,
    programarInactividad,
    cancelarProgramacion,
    simularInicioSuplenciaProgramada,
    simularFinSuplenciaProgramada,
    activarSuplenciaAdministrativa,
    desactivarSuplenciaAdministrativa,
    resetearSimulacion,
  };
}

export interface UsuarioSimulacionSuplencia {
  id: string;
  cedula: string;
  nombre: string;
  rol: "ADMIN" | "COORDINADOR_SINARP";
  designacion?: "TITULAR" | "SUPLENTE";
  rolTitulo: string;
  institucion: string;
  iniciales: string;
  estadoBase: "ACTIVO" | "ENROLADO_SIN_ACCESO";
}

export const USUARIO_ADMIN: UsuarioSimulacionSuplencia = {
  id: "1799999999",
  cedula: "1799999999",
  nombre: "Admin Portal",
  rol: "ADMIN",
  rolTitulo: "Administrador DINARP",
  institucion: "Dirección Nacional de Registros Públicos",
  iniciales: "AP",
  estadoBase: "ACTIVO",
};

export const USUARIO_COORDINADOR_TITULAR: UsuarioSimulacionSuplencia = {
  id: "1712345678",
  cedula: "1712345678",
  nombre: "Juan Pérez",
  rol: "COORDINADOR_SINARP",
  designacion: "TITULAR",
  rolTitulo: "Coordinador Titular SINARP",
  institucion: "Ministerio de Educación",
  iniciales: "JP",
  estadoBase: "ACTIVO",
};

export const USUARIO_COORDINADOR_SUPLENTE: UsuarioSimulacionSuplencia = {
  id: "1714443322",
  cedula: "1714443322",
  nombre: "Mariana Almeida",
  rol: "COORDINADOR_SINARP",
  designacion: "SUPLENTE",
  rolTitulo: "Coordinador Suplente SINARP",
  institucion: "Ministerio de Educación",
  iniciales: "MA",
  estadoBase: "ENROLADO_SIN_ACCESO",
};
