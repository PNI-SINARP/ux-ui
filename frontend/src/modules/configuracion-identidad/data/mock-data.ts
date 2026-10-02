import {
  ConfiguracionIdentidad,
  EventoAuditoria,
  PoliticaCorreoVerificado,
  ProveedorPrimerFactor,
  FeedbackMensaje,
} from "./types";

export const OPCIONES_POLITICA_CORREO: PoliticaCorreoVerificado[] = [
  "Estricta obligatoria",
  "Requerida post-registro",
  "Opcional en pruebas",
];

export const OPCIONES_PROVEEDOR: ProveedorPrimerFactor[] = [
  "Identity Platform (Email/Password)",
  "SAML 2.0 Federado DINARP",
  "OIDC Institucional (Gob.ec)",
  "Active Directory Federado",
];

export const OPCIONES_VIGENCIA_HORAS = [1, 2, 4, 8, 12, 24];

export const FEEDBACK_TEXTOS = {
  GUARDADA_PENDIENTE: "Configuración de identidad guardada; pendiente de prueba",
  ACTIVA_SATISFACTORIA: "Configuración de identidad activa; prueba satisfactoria",
  NO_ACTIVA_REVISA: "Configuración no activa; revisa la prueba",
} as const;

export const CONFIGURACION_ACTIVA_INICIAL: ConfiguracionIdentidad = {
  id: "cfg-id-prod-001",
  proyectoId: "dinarp-identity-prod-core",
  entorno: "Producción",
  politicaCorreoVerificado: "Estricta obligatoria",
  proveedorPrimerFactor: "SAML 2.0 Federado DINARP",
  totpActivo: true,
  horasVigenciaRecuperacion: 2,
  version: "v1.4.0",
  estado: "Activa",
  ultimaActualizacion: "28/09/2026 14:30:22",
  actualizadoPor: "Administrador Técnico Autorizado",
  secretoEnmascarado: "••••••••••••••••••••7F8B",
  hashIntegridad: "SHA256:d8a9f301b2c45e679a0123456789abcdef0123456789abcdef0123456789abcd",
  pruebaSuperada: true,
  ultimoResultadoPrueba: {
    fecha: "28/09/2026 14:28:10",
    entornoProbado: "Producción",
    exitosa: true,
    latenciaMs: 42,
    serviciosValidados: [
      { nombre: "Identity Platform Discovery", estado: "OK", mensaje: "Endpoint OIDC/SAML respondiendo en 12ms" },
      { nombre: "Servicio TOTP RFC 6238", estado: "OK", mensaje: "Sincronización de drift temporal validada" },
      { nombre: "Verificación SMTP Correo", estado: "OK", mensaje: "Certificados TLS válidos en dominio institucional" },
    ],
    observacionTecnica: "Validación integral superada sin anomalías en entorno productivo.",
  },
};

export const CONFIGURACION_BORRADOR_PRUEBAS: ConfiguracionIdentidad = {
  id: "cfg-id-stg-002",
  proyectoId: "dinarp-identity-staging-lab",
  entorno: "Pruebas",
  politicaCorreoVerificado: "Requerida post-registro",
  proveedorPrimerFactor: "Identity Platform (Email/Password)",
  totpActivo: true,
  horasVigenciaRecuperacion: 4,
  version: "v1.4.1",
  estado: "Borrador",
  ultimaActualizacion: "01/10/2026 10:15:00",
  actualizadoPor: "Administrador Técnico Autorizado",
  secretoEnmascarado: "••••••••••••••••••••3E42",
  hashIntegridad: "SHA256:9f301b2c45e679a0123456789abcdef0123456789abcdef0123456789abcde8a",
  pruebaSuperada: false,
  ultimoResultadoPrueba: null,
};

export const HISTORIAL_AUDITORIA_INICIAL: EventoAuditoria[] = [
  {
    id: "aud-001",
    fecha: "28/09/2026 14:30:22",
    version: "v1.4.0",
    actor: "Administrador Técnico Autorizado (ADMIN)",
    accion: "Activar",
    entorno: "Producción",
    estadoResultante: "Activa",
    detalles: "Activación formal tras prueba de latencia (42ms) y validación de TOTP obligatorio.",
    hashTransaccion: "SHA256:d8a9f301b2c45e679a0123456789abcdef0123456789abcdef0123456789abcd",
  },
  {
    id: "aud-002",
    fecha: "28/09/2026 14:28:10",
    version: "v1.4.0",
    actor: "Administrador Técnico Autorizado (ADMIN)",
    accion: "Probar configuración",
    entorno: "Producción",
    estadoResultante: "Pendiente de prueba",
    detalles: "Prueba integral de autenticación con 3 servicios verificados satisfactoriamente.",
    hashTransaccion: "SHA256:7b11c99f01ab2c45e679a0123456789abcdef0123456789abcdef0123456789a",
  },
  {
    id: "aud-003",
    fecha: "25/09/2026 09:12:45",
    version: "v1.3.9",
    actor: "Administrador Técnico Autorizado (ADMIN)",
    accion: "Guardar borrador",
    entorno: "Producción",
    estadoResultante: "Borrador",
    detalles: "Ajuste de política de correo verificado a Estricta obligatoria y reducción de vigencia a 2h.",
    hashTransaccion: "SHA256:4a56c78e90123456789abcdef0123456789abcdef0123456789abcdef0123456",
  },
  {
    id: "aud-004",
    fecha: "15/09/2026 16:40:11",
    version: "v1.3.8",
    actor: "Administrador Técnico Autorizado (ADMIN)",
    accion: "Restauración automática (Rollback)",
    entorno: "Producción",
    estadoResultante: "Activa",
    detalles: "Reversión preventiva automática tras fallo en prueba sintética de segundo factor.",
    hashTransaccion: "SHA256:11223344556677889900aabbccddeeff0011223344556677889900aabbccddee",
  },
];

/**
 * Valida si se intentan usar identificadores de prueba en Producción
 */
export function detectarDatosPruebaEnProduccion(
  proyectoId: string,
  entorno: "Pruebas" | "Producción"
): boolean {
  if (entorno !== "Producción") return false;
  const lower = proyectoId.toLowerCase();
  const palabrasPrueba = ["test", "staging", "lab", "dev", "demo", "prueba", "qa"];
  return palabrasPrueba.some((palabra) => lower.includes(palabra));
}

/**
 * Incrementa la versión menor (ej: v1.4.0 -> v1.4.1)
 */
export function incrementarVersion(versionActual: string): string {
  const match = versionActual.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return "v1.0.1";
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  const patch = parseInt(match[3], 10) + 1;
  return `v${major}.${minor}.${patch}`;
}

/**
 * Genera un hash pseudo-criptográfico para auditoría inmutable
 */
export function generarHashTransaccion(): string {
  const chars = "0123456789abcdef";
  let hash = "SHA256:";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
