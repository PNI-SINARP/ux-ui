export type EstadoArea = "Borrador" | "Activa" | "Inactiva";

export type TipoAccionArea =
  | "CREACION"
  | "EDICION"
  | "ACTIVACION"
  | "INACTIVACION"
  | "REACTIVACION"
  | "RETIRO_LOGICO";

export interface EventoTrazabilidadArea {
  id: string;
  version: string;
  autor: string;
  autorCargo?: string;
  motivo: string;
  fecha: string; // DD/MM/YYYY HH:mm
  tipoAccion: TipoAccionArea;
  estadoResultante: EstadoArea;
  detalles?: string;
}

export interface UsuarioVinculado {
  id: string;
  cedula: string;
  nombreCompleto: string;
  correo: string;
  cargo: string;
  rol: string;
  estado: string;
}

export interface TramiteVinculado {
  id: string;
  codigo: string;
  asunto: string;
  solicitante: string;
  institucion: string;
  estado: "En revisión" | "Asignado" | "Pendiente" | "Cerrado";
  vigente: boolean;
  fecha: string;
}

export interface TareaVinculada {
  id: string;
  titulo: string;
  asignadoA: string;
  estado: "Pendiente" | "En curso" | "Completada";
  prioridad: "Alta" | "Media" | "Baja";
  vigente: boolean;
  fechaLimite: string;
}

export interface AreaDinarp {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  responsableNombre: string;
  responsableCargo: string;
  responsableCorreo: string;
  estado: EstadoArea;
  version: string;
  referenciada: boolean;
  usuarios: UsuarioVinculado[];
  tramites: TramiteVinculado[];
  tareas: TareaVinculada[];
  trazabilidad: EventoTrazabilidadArea[];
  fechaCreacion: string;
  ultimaActualizacion: string;
}

export interface ImpactoArea {
  cuentasVinculadasCount: number;
  tramitesVigentesCount: number;
  tareasVigentesCount: number;
  totalObligaciones: number;
  puedeInactivar: boolean;
  motivosBloqueo: string[];
}
