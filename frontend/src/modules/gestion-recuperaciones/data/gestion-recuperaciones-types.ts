export type EstadoRecuperacion =
  | "PENDIENTE"
  | "EN_VALIDACION"
  | "EN_CONCILIACION"
  | "COMPLETADO";

export type DecisionAdministrativa =
  | "PENDIENTE"
  | "AUTORIZADA"
  | "DENEGADA";

export type TipoCuentaUsuario =
  | "CUENTA_INTERNA"
  | "COORDINADOR";

export type MotivoRecuperacion =
  | "PERDIDA_AUTENTICADOR"
  | "PERDIDA_CAMBIO_DISPOSITIVO"
  | "PERDIDA_CORREO"
  | "PERDIDA_ACCESO_CANAL";

export type MetodoVerificacion =
  | "VIDEOROSTRO_REGISTRO_CIVIL"
  | "VALIDACION_NOTARIAL"
  | "OFICIO_MAXIMA_AUTORIDAD"
  | "COMPARECENCIA_PRESENCIAL";

export interface EvidenciaArchivo {
  id: string;
  nombre: string;
  tamano: string;
  tipo: string;
  fechaSubida: string;
  hashSha256: string;
  subidoPor: string;
  urlDescarga?: string;
}

export interface BloqueoCanalInfo {
  activo: boolean;
  fechaBloqueo?: string;
  canalBloqueado?: string;
  sesionesInvalidadas: number;
  ipSolicitante?: string;
}

export interface IncidenciaConciliacion {
  codigoIncidencia: string;
  descripcion: string;
  fechaFallo: string;
  moduloAfectado: string;
  requiereSincronizacionManual: boolean;
}

export interface EventoHistorialRecuperacion {
  id: string;
  fecha: string;
  actor: string;
  accion: string;
  detalle: string;
  tipo: "info" | "warning" | "success" | "danger";
}

export interface CasoRecuperacion {
  id: string; // e.g. "REC-2026-001"
  cedula: string;
  usuarioNombre: string; // persona
  usuarioCorreo: string;
  tipoCuenta: TipoCuentaUsuario;
  tipoCuentaLabel: string; // "Cuenta interna" | "Coordinador"
  factorCanalPerdido: string; // e.g. "Google Authenticator (TOTP)", "Dispositivo móvil enrolado"
  motivo: MotivoRecuperacion;
  motivoLabel: string;
  motivoDescripcion: string;
  estado: EstadoRecuperacion; // PENDIENTE | EN_VALIDACION | EN_CONCILIACION | COMPLETADO
  decision: DecisionAdministrativa; // PENDIENTE | AUTORIZADA | DENEGADA
  fechaSolicitud: string; // DD/MM/YYYY HH:mm
  fechaResolucion?: string;
  operadorAsignado: string;
  cuentaRelacionada: string; // e.g. "USR-INT-003" o "COORD-INST-082"
  institucionNombre?: string;
  metodoAplicado: MetodoVerificacion;
  metodoAplicadoLabel: string;
  evidencias: EvidenciaArchivo[];
  referenciaAutorizacion?: string; // e.g. "AUT-ID08-2026-0412"
  bloqueoCanalAnterior: BloqueoCanalInfo;
  resultado?: string | null;
  motivoDecision?: string;
  observacionesOperador?: string;
  incidenciaConciliacion?: IncidenciaConciliacion;
  historial: EventoHistorialRecuperacion[];
  procesoContinuacion?: "ID-02" | "ID-10";
}
