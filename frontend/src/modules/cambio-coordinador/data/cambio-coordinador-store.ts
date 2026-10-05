"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useSolicitudesIngresoStore,
  getStoredSolicitudesIngreso,
  saveStoredSolicitudesIngreso,
  type SolicitudIngreso,
  type DatosAnexoC
} from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

export type CaracterCoordinador = "TITULAR" | "SUPLENTE";
export type EstadoCoordinadorInstitucional = "ACTIVO" | "ENROLADO_SIN_ACCESO" | "SUSPENDIDO" | "INACTIVO";
export type TipoFirmanteAnexoC = "MAXIMA_AUTORIDAD" | "DELEGADO_AUTORIZADO";
export type EstadoDocumentoAnexoC = "Borrador" | "Firmado" | "Firma verificada";
export type EstadoTramiteAnexoC =
  | "Enviado a Gestión"
  | "Pendiente de asignación"
  | "En revisión"
  | "Aprobado"
  | "Rechazado"
  | "Enrolamiento pendiente"
  | "Aplicado";

export interface CoordinadorInstitucional {
  nombreCompleto: string;
  cedula: string;
  correo: string;
  cargo: string;
  caracter: CaracterCoordinador;
  estado: EstadoCoordinadorInstitucional;
  anexoBAprobado: boolean;
  fechaDesignacion?: string;
  telefono?: string;
}

export interface AutorizacionDelegado {
  archivoNombre: string;
  archivoTamano: string;
  fechaSubida: string;
  url?: string;
}

export interface ValidacionFirmaECAnexoC {
  estado: "VALIDA" | "RECHAZADA" | "CADUCADA" | "NO_VERIFICADA" | "PENDIENTE";
  transaccionId?: string;
  firmante?: string;
  fechaFirma?: string;
  huellaSha256?: string;
  entidadCertificadora?: string;
  mensajeError?: string;
}

export interface RevisorAsignado {
  id: string;
  nombre: string;
  cargo: string;
  fechaAsignacion: string;
  observaciones?: string;
}

export interface TrazabilidadEventoAnexoC {
  id: string;
  fecha: string;
  accion: string;
  actor: string;
  rol: string;
  detalle: string;
}

export interface TramiteCambioCoordinador {
  id: string;
  numeroTramite: string;
  institucion: string;
  ruc: string;
  fechaSolicitud: string;
  caracter: CaracterCoordinador;
  coordinadorSaliente: CoordinadorInstitucional;
  coordinadorEntrante: {
    nombreCompleto: string;
    cedula: string;
    correo: string;
    cargo: string;
    motivo: string;
    poseeCuentaSistema?: boolean;
    poseeAnexoBAprobado?: boolean;
  };
  firmanteTipo: TipoFirmanteAnexoC;
  autorizacionDelegado?: AutorizacionDelegado;
  estadoDocumento: EstadoDocumentoAnexoC;
  estadoTramite: EstadoTramiteAnexoC;
  firmaEC: ValidacionFirmaECAnexoC;
  revisorAsignado?: RevisorAsignado;
  motivoRechazo?: string;
  fechaEfectiva?: string;
  trazabilidad: TrazabilidadEventoAnexoC[];
  datosAnexoC: DatosAnexoC;
}

export interface InstitucionConfig {
  nombre: string;
  ruc: string;
  estado: "Institución activa" | "Suspendida" | "Inactiva";
  direccion: string;
  representanteLegal: string;
  titular: CoordinadorInstitucional;
  suplente: CoordinadorInstitucional;
}

const STORAGE_KEY_CAMBIO_COORD = "dinarp_cambio_coordinador_store_v1";
const STORAGE_KEY_INSTITUCION_MINEDUC = "dinarp_institucion_mineduc_config_v1";

export const INSTITUCION_MINEDUC_DEFAULT: InstitucionConfig = {
  nombre: "Ministerio de Educación",
  ruc: "1760004560001",
  estado: "Institución activa",
  direccion: "Av. Amazonas N34-451 y Atahualpa, Quito, Ecuador",
  representanteLegal: "Carlos Andrade",
  titular: {
    nombreCompleto: "Juan Pérez",
    cedula: "1712345678",
    correo: "juan.perez@educacion.gob.ec",
    cargo: "Director de Tecnologías de la Información",
    caracter: "TITULAR",
    estado: "ACTIVO",
    anexoBAprobado: true,
    fechaDesignacion: "15/01/2025",
    telefono: "023961300 ext. 1201"
  },
  suplente: {
    nombreCompleto: "Mariana Almeida",
    cedula: "1714443322",
    correo: "m.almeida@educacion.gob.ec",
    cargo: "Especialista de Sistemas y Seguridad",
    caracter: "SUPLENTE",
    estado: "ACTIVO",
    anexoBAprobado: true,
    fechaDesignacion: "15/01/2025",
    telefono: "023961300 ext. 1205"
  }
};

export const INITIAL_TRAMITES_CAMBIO: TramiteCambioCoordinador[] = [
  {
    id: "CAM-00023",
    numeroTramite: "CAM-00023",
    institucion: "Ministerio de Educación",
    ruc: "1760004560001",
    fechaSolicitud: "04/10/2026 10:15",
    caracter: "TITULAR",
    coordinadorSaliente: {
      nombreCompleto: "Juan Pérez",
      cedula: "1712345678",
      correo: "juan.perez@educacion.gob.ec",
      cargo: "Director de Tecnologías de la Información",
      caracter: "TITULAR",
      estado: "ACTIVO",
      anexoBAprobado: true,
      fechaDesignacion: "15/01/2025"
    },
    coordinadorEntrante: {
      nombreCompleto: "Roberto Carlos Dávila Silva",
      cedula: "1721345987",
      correo: "roberto.davila@educacion.gob.ec",
      cargo: "Director Nacional de Tecnologías y Conectividad",
      motivo: "Reestructuración administrativa interna de la institución educativa.",
      poseeCuentaSistema: false,
      poseeAnexoBAprobado: false
    },
    firmanteTipo: "MAXIMA_AUTORIDAD",
    estadoDocumento: "Firma verificada",
    estadoTramite: "Pendiente de asignación",
    firmaEC: {
      estado: "VALIDA",
      transaccionId: "FEC-2026-90412",
      firmante: "Carlos Andrade (Representante Institucional)",
      fechaFirma: "04/10/2026 10:15",
      huellaSha256: "8f4b23a9d18e5472bc19448a0fd329c4ba598e12d5e381023d8c1109a1bf04e1",
      entidadCertificadora: "Banco Central del Ecuador (BCE)"
    },
    trazabilidad: [
      {
        id: "tz-1",
        fecha: "04/10/2026 10:05",
        accion: "Borrador de Anexo C generado",
        actor: "Carlos Andrade",
        rol: "Representante Institucional",
        detalle: "Se ingresaron los datos del Coordinador saliente y entrante bajo el formulario oficial ARP-R03."
      },
      {
        id: "tz-2",
        fecha: "04/10/2026 10:15",
        accion: "Firma electrónica suscrita mediante FirmaEC",
        actor: "Carlos Andrade",
        rol: "Representante Institucional",
        detalle: "Certificado digital validado con éxito. Transacción FirmaEC: FEC-2026-90412."
      },
      {
        id: "tz-3",
        fecha: "04/10/2026 10:15",
        accion: "Anexo C enviado al Área de Gestión",
        actor: "Carlos Andrade",
        rol: "Representante Institucional",
        detalle: "Trámite registrado formalmente con identificador CAM-00023. Estado: Pendiente de asignación."
      }
    ],
    datosAnexoC: {
      nombreEntidad: "Ministerio de Educación",
      representanteLegalNombre: "Carlos Andrade",
      esDelegado: false,
      aplicaCambioTitular: true,
      aplicaCambioSuplente: false,
      aplicaDesignacionInicialSuplente: false,
      nuevoTitularNombre: "Roberto Carlos Dávila Silva",
      nuevoTitularCedula: "1721345987",
      nuevoTitularCargo: "Director Nacional de Tecnologías y Conectividad",
      nuevoTitularMotivo: "Reestructuración administrativa interna de la institución educativa.",
      nuevoTitularEmail: "roberto.davila@educacion.gob.ec",
      ciudadFirma: "Quito D.M.",
      fechaFirma: "04/10/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R03_Cambio_Coordinador_MinEduc.pdf"
    }
  }
];

function getStoredTramites(): TramiteCambioCoordinador[] {
  if (typeof window === "undefined") return INITIAL_TRAMITES_CAMBIO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAMBIO_COORD);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CAMBIO_COORD, JSON.stringify(INITIAL_TRAMITES_CAMBIO));
      return INITIAL_TRAMITES_CAMBIO;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRAMITES_CAMBIO;
  }
}

function saveStoredTramites(data: TramiteCambioCoordinador[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CAMBIO_COORD, JSON.stringify(data));
  } catch (e) {
    console.error("Error guardando tramites cambio coordinador:", e);
  }
}

function getStoredInstitucion(): InstitucionConfig {
  if (typeof window === "undefined") return INSTITUCION_MINEDUC_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INSTITUCION_MINEDUC);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INSTITUCION_MINEDUC, JSON.stringify(INSTITUCION_MINEDUC_DEFAULT));
      return INSTITUCION_MINEDUC_DEFAULT;
    }
    return JSON.parse(raw);
  } catch {
    return INSTITUCION_MINEDUC_DEFAULT;
  }
}

function saveStoredInstitucion(data: InstitucionConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_INSTITUCION_MINEDUC, JSON.stringify(data));
  } catch (e) {
    console.error("Error guardando institucion config:", e);
  }
}

// Sincroniza un trámite CAM con el store global de solicitudes de ingresos de DINARP
function syncWithGestionIngresosStore(tramite: TramiteCambioCoordinador) {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredSolicitudesIngreso();
    const existingIndex = list.findIndex((s) => s.id === tramite.id || s.id === tramite.numeroTramite);

    const docList = ["ARP-R03_Cambio_Coordinador_Institucional.pdf"];
    if (tramite.firmanteTipo === "DELEGADO_AUTORIZADO" && tramite.autorizacionDelegado) {
      docList.push(tramite.autorizacionDelegado.archivoNombre);
    }

    const solItem: SolicitudIngreso = {
      id: tramite.numeroTramite,
      tipoTramite: "PROCESO_C_CAMBIO_COORDINADOR",
      codigoDocumental: "ARP-R03",
      tituloTramite: "Cambio de Coordinador Institucional (ARP-R03)",
      cedula: tramite.coordinadorEntrante.cedula,
      nombres: tramite.coordinadorEntrante.nombreCompleto.split(" ")[0] || tramite.coordinadorEntrante.nombreCompleto,
      apellidos: tramite.coordinadorEntrante.nombreCompleto.split(" ").slice(1).join(" ") || "",
      nombreCompleto: tramite.coordinadorEntrante.nombreCompleto,
      iniciales: tramite.coordinadorEntrante.nombreCompleto.slice(0, 2).toUpperCase(),
      correo: tramite.coordinadorEntrante.correo,
      institucion: tramite.institucion,
      fechaSolicitud: tramite.fechaSolicitud,
      estado:
        tramite.estadoTramite === "Pendiente de asignación" || tramite.estadoTramite === "Enviado a Gestión"
          ? "Pendiente"
          : tramite.estadoTramite === "En revisión"
          ? "EN_REVISION_GESTION"
          : tramite.estadoTramite === "Aprobado" || tramite.estadoTramite === "Aplicado" || tramite.estadoTramite === "Enrolamiento pendiente"
          ? "Aprobada"
          : tramite.estadoTramite === "Rechazado"
          ? "Rechazada"
          : "Pendiente",
      revisorGestion: tramite.revisorAsignado?.nombre,
      revisor: tramite.revisorAsignado?.nombre,
      fechaAsignacionGestion: tramite.revisorAsignado?.fechaAsignacion,
      observacionesAsignacion: tramite.revisorAsignado?.observaciones,
      documentos: docList,
      anexoC: tramite.datosAnexoC,
      historial: tramite.trazabilidad.map((tz) => ({
        id: tz.id,
        fechaHora: tz.fecha,
        accion: tz.accion,
        realizadoPor: tz.actor,
        rol: tz.rol,
        detalles: tz.detalle
      }))
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...solItem };
    } else {
      list.unshift(solItem);
    }
    saveStoredSolicitudesIngreso(list);
  } catch (err) {
    console.error("Error sincronizando trámite con solicitudes de ingreso:", err);
  }
}

export function useCambioCoordinadorStore() {
  const [tramites, setTramites] = useState<TramiteCambioCoordinador[]>([]);
  const [institucion, setInstitucion] = useState<InstitucionConfig>(INSTITUCION_MINEDUC_DEFAULT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedTramites = getStoredTramites();
    const loadedInst = getStoredInstitucion();
    setTramites(loadedTramites);
    setInstitucion(loadedInst);
    setIsLoaded(true);

    // Sync baseline CAM-00023 into gestion ingresos store
    if (loadedTramites.length > 0) {
      loadedTramites.forEach((t) => syncWithGestionIngresosStore(t));
    }
  }, []);

  const getTramiteById = useCallback(
    (id: string) => {
      return tramites.find((t) => t.id === id || t.numeroTramite === id) || null;
    },
    [tramites]
  );

  const crearSolicitud = useCallback(
    (nueva: Omit<TramiteCambioCoordinador, "id" | "numeroTramite" | "trazabilidad">) => {
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const nextNum = tramites.length + 24;
      const numeroTramite = `CAM-${String(nextNum).padStart(5, "0")}`;

      const trazabilidad: TrazabilidadEventoAnexoC[] = [
        {
          id: `tz-${Date.now()}-1`,
          fecha: fechaStr,
          accion: "Borrador de Anexo C completado",
          actor: "Carlos Andrade",
          rol: "Representante Institucional",
          detalle: `Sustitución de Coordinador ${nueva.caracter} solicitada para ${nueva.coordinadorEntrante.nombreCompleto}.`
        },
        {
          id: `tz-${Date.now()}-2`,
          fecha: fechaStr,
          accion: "Firma electrónica suscrita mediante FirmaEC",
          actor: "Carlos Andrade",
          rol: "Representante Institucional",
          detalle: `Documento firmado digitalmente con transacción: ${nueva.firmaEC.transaccionId || "FEC-2026-" + Math.floor(10000 + Math.random() * 90000)}.`
        },
        {
          id: `tz-${Date.now()}-3`,
          fecha: fechaStr,
          accion: "Anexo C enviado al Área de Gestión",
          actor: "Carlos Andrade",
          rol: "Representante Institucional",
          detalle: `Trámite ${numeroTramite} remitido formalmente para asignación y verificación.`
        }
      ];

      const item: TramiteCambioCoordinador = {
        ...nueva,
        id: numeroTramite,
        numeroTramite,
        trazabilidad
      };

      setTramites((prev) => {
        const updated = [item, ...prev];
        saveStoredTramites(updated);
        return updated;
      });

      syncWithGestionIngresosStore(item);
      return item;
    },
    [tramites.length]
  );

  const asignarRevisor = useCallback((tramiteId: string, revisor: { id: string; nombre: string; cargo: string; observaciones?: string }) => {
    const now = new Date();
    const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setTramites((prev) => {
      const updated = prev.map((t) => {
        if (t.id === tramiteId || t.numeroTramite === tramiteId) {
          const newTz: TrazabilidadEventoAnexoC = {
            id: `tz-${Date.now()}`,
            fecha: fechaStr,
            accion: "Asignación de revisor",
            actor: "Director Gestión",
            rol: "Director Área de Gestión",
            detalle: `Trámite asignado a ${revisor.nombre} (${revisor.cargo}) para revisión del Anexo C.`
          };
          const updatedTramite: TramiteCambioCoordinador = {
            ...t,
            estadoTramite: "En revisión",
            revisorAsignado: {
              id: revisor.id,
              nombre: revisor.nombre,
              cargo: revisor.cargo,
              fechaAsignacion: fechaStr,
              observaciones: revisor.observaciones
            },
            trazabilidad: [...t.trazabilidad, newTz]
          };
          syncWithGestionIngresosStore(updatedTramite);
          return updatedTramite;
        }
        return t;
      });
      saveStoredTramites(updated);
      return updated;
    });
  }, []);

  const rechazarCambio = useCallback((tramiteId: string, motivo: string) => {
    const now = new Date();
    const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setTramites((prev) => {
      const updated = prev.map((t) => {
        if (t.id === tramiteId || t.numeroTramite === tramiteId) {
          const newTz: TrazabilidadEventoAnexoC = {
            id: `tz-${Date.now()}`,
            fecha: fechaStr,
            accion: "Cambio de coordinador rechazado",
            actor: "Ana Torres (Revisor)",
            rol: "Revisor Área de Gestión",
            detalle: `Motivo del rechazo: ${motivo}. El Coordinador actual conserva su vínculo institucional.`
          };
          const updatedTramite: TramiteCambioCoordinador = {
            ...t,
            estadoTramite: "Rechazado",
            motivoRechazo: motivo,
            trazabilidad: [...t.trazabilidad, newTz]
          };
          syncWithGestionIngresosStore(updatedTramite);
          return updatedTramite;
        }
        return t;
      });
      saveStoredTramites(updated);
      return updated;
    });
  }, []);

  const aprobarCambio = useCallback(
    (tramiteId: string, opcionCaso: "AUTO" | "CASO_A" | "CASO_B" = "AUTO") => {
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      setTramites((prev) => {
        const updated = prev.map((t) => {
          if (t.id === tramiteId || t.numeroTramite === tramiteId) {
            // Evaluamos si el entrante tiene Anexo B aprobado para ESTA institución y carácter
            const tieneB =
              opcionCaso === "CASO_A"
                ? true
                : opcionCaso === "CASO_B"
                ? false
                : Boolean(t.coordinadorEntrante.poseeAnexoBAprobado);

            if (tieneB) {
              // CASO A: Ya posee Anexo B aprobado
              const newTz: TrazabilidadEventoAnexoC = {
                id: `tz-${Date.now()}`,
                fecha: fechaStr,
                accion: "Cambio de coordinador aplicado",
                actor: "Ana Torres (Revisor)",
                rol: "Revisor Área de Gestión",
                detalle: `Se validó Anexo B vigente. Se retiró vínculo institucional del saliente (${t.coordinadorSaliente.nombreCompleto}) y se habilitó vínculo del entrante (${t.coordinadorEntrante.nombreCompleto}). Cambio aplicado con fecha efectiva ${fechaStr}.`
              };
              const updatedTramite: TramiteCambioCoordinador = {
                ...t,
                estadoTramite: "Aplicado",
                fechaEfectiva: fechaStr,
                trazabilidad: [...t.trazabilidad, newTz]
              };

              // Actualizamos el coordinador institucional en la institución activa
              setInstitucion((prevInst) => {
                const updatedInst: InstitucionConfig = { ...prevInst };
                const nuevoCoord: CoordinadorInstitucional = {
                  nombreCompleto: t.coordinadorEntrante.nombreCompleto,
                  cedula: t.coordinadorEntrante.cedula,
                  correo: t.coordinadorEntrante.correo,
                  cargo: t.coordinadorEntrante.cargo,
                  caracter: t.caracter,
                  estado: "ACTIVO",
                  anexoBAprobado: true,
                  fechaDesignacion: fechaStr
                };

                if (t.caracter === "TITULAR") {
                  updatedInst.titular = nuevoCoord;
                } else {
                  updatedInst.suplente = nuevoCoord;
                }
                saveStoredInstitucion(updatedInst);
                return updatedInst;
              });

              syncWithGestionIngresosStore(updatedTramite);
              return updatedTramite;
            } else {
              // CASO B: NO posee Anexo B aprobado -> Requiere enrolamiento
              const newTz: TrazabilidadEventoAnexoC = {
                id: `tz-${Date.now()}`,
                fecha: fechaStr,
                accion: "Cambio aprobado con enrolamiento pendiente",
                actor: "Ana Torres (Revisor)",
                rol: "Revisor Área de Gestión",
                detalle: `Cambio de coordinador aprobado formalmente. El nuevo Coordinador (${t.coordinadorEntrante.nombreCompleto}) no posee Anexo B suscrito para esta institución; se generó invitación para enrolamiento.`
              };
              const updatedTramite: TramiteCambioCoordinador = {
                ...t,
                estadoTramite: "Enrolamiento pendiente",
                fechaEfectiva: fechaStr,
                trazabilidad: [...t.trazabilidad, newTz]
              };
              syncWithGestionIngresosStore(updatedTramite);
              return updatedTramite;
            }
          }
          return t;
        });
        saveStoredTramites(updated);
        return updated;
      });
    },
    []
  );

  const resetStore = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_CAMBIO_COORD);
    localStorage.removeItem(STORAGE_KEY_INSTITUCION_MINEDUC);
    setTramites(INITIAL_TRAMITES_CAMBIO);
    setInstitucion(INSTITUCION_MINEDUC_DEFAULT);
    INITIAL_TRAMITES_CAMBIO.forEach((t) => syncWithGestionIngresosStore(t));
  }, []);

  return {
    tramites,
    institucion,
    isLoaded,
    getTramiteById,
    crearSolicitud,
    asignarRevisor,
    aprobarCambio,
    rechazarCambio,
    resetStore
  };
}

export function asignarRevisorStandalone(
  tramiteId: string,
  revisor: { id: string; nombre: string; cargo: string; observaciones?: string }
) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const list = getStoredTramites();
  const updated = list.map((t) => {
    if (t.id === tramiteId || t.numeroTramite === tramiteId) {
      const newTz: TrazabilidadEventoAnexoC = {
        id: `tz-${Date.now()}`,
        fecha: fechaStr,
        accion: "Asignación de revisor",
        actor: "Director Gestión",
        rol: "Director Área de Gestión",
        detalle: `Trámite asignado a ${revisor.nombre} (${revisor.cargo}) para revisión del Anexo C.`
      };
      const updatedTramite: TramiteCambioCoordinador = {
        ...t,
        estadoTramite: "En revisión",
        revisorAsignado: {
          id: revisor.id,
          nombre: revisor.nombre,
          cargo: revisor.cargo,
          fechaAsignacion: fechaStr,
          observaciones: revisor.observaciones
        },
        trazabilidad: [...t.trazabilidad, newTz]
      };
      syncWithGestionIngresosStore(updatedTramite);
      return updatedTramite;
    }
    return t;
  });
  saveStoredTramites(updated);
}

export function aprobarCambioStandalone(
  tramiteId: string,
  opcionCaso: "AUTO" | "CASO_A" | "CASO_B" = "AUTO"
) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const list = getStoredTramites();
  const updated = list.map((t) => {
    if (t.id === tramiteId || t.numeroTramite === tramiteId) {
      const tieneB =
        opcionCaso === "CASO_A"
          ? true
          : opcionCaso === "CASO_B"
          ? false
          : Boolean(t.coordinadorEntrante.poseeAnexoBAprobado);

      const nuevoEstado = tieneB ? "Aplicado" : "Enrolamiento pendiente";
      const newTz: TrazabilidadEventoAnexoC = {
        id: `tz-${Date.now()}`,
        fecha: fechaStr,
        accion: tieneB ? "Cambio de coordinador aplicado" : "Anexo C aprobado - Enrolamiento pendiente",
        actor: "Ana Torres (Revisor)",
        rol: "Revisor Área de Gestión",
        detalle: tieneB
          ? `Se validó Anexo B vigente. Se retiró vínculo del saliente (${t.coordinadorSaliente.nombreCompleto}) y se habilitó al entrante (${t.coordinadorEntrante.nombreCompleto}). Cambio aplicado con fecha efectiva ${fechaStr}.`
          : `Anexo C aprobado. Se generó invitación de enrolamiento para que ${t.coordinadorEntrante.nombreCompleto} suscriba el Acuerdo de Confidencialidad (Anexo B).`
      };

      const updatedTramite: TramiteCambioCoordinador = {
        ...t,
        estadoTramite: nuevoEstado,
        fechaEfectiva: tieneB ? fechaStr : undefined,
        trazabilidad: [...t.trazabilidad, newTz]
      };

      syncWithGestionIngresosStore(updatedTramite);
      return updatedTramite;
    }
    return t;
  });
  saveStoredTramites(updated);
}

export function rechazarCambioStandalone(tramiteId: string, motivo: string) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const list = getStoredTramites();
  const updated = list.map((t) => {
    if (t.id === tramiteId || t.numeroTramite === tramiteId) {
      const newTz: TrazabilidadEventoAnexoC = {
        id: `tz-${Date.now()}`,
        fecha: fechaStr,
        accion: "Cambio de coordinador rechazado",
        actor: "Ana Torres (Revisor)",
        rol: "Revisor Área de Gestión",
        detalle: `Motivo del rechazo: ${motivo}. El Coordinador actual conserva su vínculo institucional.`
      };
      const updatedTramite: TramiteCambioCoordinador = {
        ...t,
        estadoTramite: "Rechazado",
        motivoRechazo: motivo,
        trazabilidad: [...t.trazabilidad, newTz]
      };
      syncWithGestionIngresosStore(updatedTramite);
      return updatedTramite;
    }
    return t;
  });
  saveStoredTramites(updated);
}

