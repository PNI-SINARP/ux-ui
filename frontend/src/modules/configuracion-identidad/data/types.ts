export type EntornoIdentidad = "Pruebas" | "Producción";

export type EstadoConfiguracion = "Borrador" | "Pendiente de prueba" | "Activa" | "Fallida";

export type PoliticaCorreoVerificado =
  | "Estricta obligatoria"
  | "Requerida post-registro"
  | "Opcional en pruebas";

export type ProveedorPrimerFactor =
  | "Identity Platform (Email/Password)"
  | "SAML 2.0 Federado DINARP"
  | "OIDC Institucional (Gob.ec)"
  | "Active Directory Federado";

export interface ResultadoPrueba {
  fecha: string;
  entornoProbado: EntornoIdentidad;
  exitosa: boolean;
  latenciaMs: number;
  serviciosValidados: {
    nombre: string;
    estado: "OK" | "ERROR";
    mensaje: string;
  }[];
  observacionTecnica: string;
}

export interface ConfiguracionIdentidad {
  id: string;
  proyectoId: string;
  entorno: EntornoIdentidad;
  politicaCorreoVerificado: PoliticaCorreoVerificado;
  proveedorPrimerFactor: ProveedorPrimerFactor;
  totpActivo: boolean;
  horasVigenciaRecuperacion: number;
  version: string;
  estado: EstadoConfiguracion;
  ultimaActualizacion: string;
  actualizadoPor: string;
  secretoEnmascarado: string;
  hashIntegridad: string;
  pruebaSuperada: boolean;
  ultimoResultadoPrueba?: ResultadoPrueba | null;
}

export type TipoAccionAuditoria =
  | "Guardar borrador"
  | "Probar configuración"
  | "Activar"
  | "Restauración automática (Rollback)";

export interface EventoAuditoria {
  id: string;
  fecha: string;
  version: string;
  actor: string;
  accion: TipoAccionAuditoria;
  entorno: EntornoIdentidad;
  estadoResultante: EstadoConfiguracion;
  detalles: string;
  hashTransaccion: string;
}

export interface FeedbackMensaje {
  tipo: "success" | "warning" | "danger" | "info";
  titulo: string;
  mensaje: string;
  codigo: "GUARDADA_PENDIENTE" | "ACTIVA_SATISFACTORIA" | "NO_ACTIVA_REVISA" | "ENTORNO_INCOMPATIBLE" | "SECRETO_INFO";
}
