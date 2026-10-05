export type EstadoFuente =
  | "BORRADOR"
  | "CONFIGURACION"
  | "EN_REVISION"
  | "DEVUELTA"
  | "APROBADA"
  | "PUBLICADA";

export type ModalidadSoportada = "API individual" | "API masiva" | "Ambas modalidades";

export type TipoDatoPruebas = "Sintético" | "Anonimizado" | "Real" | "Indeterminado";

export type ConectorTipo =
  | "Oracle"
  | "PostgreSQL"
  | "MySQL"
  | "MongoDB"
  | "SFTP"
  | "REST"
  | "SOAP";

export type TipoDatoCanonico = "Texto" | "Entero" | "Decimal" | "Fecha" | "Booleano";

export type ReglaConversion =
  | "Identidad"
  | "TextoAEntero"
  | "TextoADecimal"
  | "TextoAFechaISO"
  | "TextoABooleano"
  | "EnteroADecimal";

export type ClasificacionCampo = "Accesible" | "Confidencial";

export interface ParametroConsulta {
  id_parametro: string;
  nombre: string;
  tipo: TipoDatoCanonico;
  obligatorio: boolean;
  es_identificador_persona: boolean;
  operadores_permitidos: string[];
  restriccion?: {
    patron?: string;
    valor_min?: string | number;
    valor_max?: string | number;
    lista_valores?: string[];
  };
}

export interface CampoFuente {
  id_campo: string;
  incluido: boolean;
  ruta_origen: string;
  nombre_publicado: string;
  tipo_origen: string;
  tipo_origen_canonico: TipoDatoCanonico;
  tipo_normalizado: TipoDatoCanonico;
  regla_conversion: ReglaConversion;
  admite_nulo: boolean;
  descripcion: string;
  es_identificador_persona: boolean;
  clasificacion?: ClasificacionCampo | null;
}

export interface EvidenciaPruebaConexion {
  id_prueba: string;
  instante_prueba: string;
  latencia_ms: number;
  resultado: "Satisfactoria" | "Fallida" | "Incierta";
  huella_muestra: string;
  version_conector: string;
  etapas: {
    etapa: string;
    estado: "ok" | "error" | "warning";
    detalle: string;
  }[];
}

export interface ConfiguracionConexion {
  tipo_conector: ConectorTipo;
  host?: string;
  puerto?: number;
  base_datos?: string;
  esquema?: string;
  url_endpoint?: string;
  usuario?: string;
  secreto_referencia?: string;
  tls_activo?: boolean;
  ultima_prueba?: EvidenciaPruebaConexion;
}

export interface TrazabilidadEvento {
  id_evento: string;
  fecha: string;
  actor: string;
  rol: string;
  accion: string;
  estado_resultante: EstadoFuente;
  observaciones?: string;
}

export interface DespliegueFuente {
  id_despliegue: string;
  url_publica: string;
  version_api: string;
  fecha_publicacion: string;
  ambiente: "Producción" | "Pruebas";
  proxy_endpoint: string;
}

export interface FuenteDatos {
  id: string;
  nombre: string;
  descripcion_fuente: string;
  version_propuesta: string;
  version_api?: string;
  id_institucion_proveedora: string;
  institucion_proveedora_nombre: string;
  id_coordinador_registrador: string;
  coordinador_nombre: string;
  estado: EstadoFuente;
  sla_fuente: {
    disponibilidad_objetivo: number;
    tiempo_maximo_respuesta_ms: number;
  };
  modalidades_soportadas: ModalidadSoportada;
  formato_respuesta: "application/json" | "application/xml";
  tipo_dato_pruebas: TipoDatoPruebas;
  parametros_consulta: ParametroConsulta[];
  conexion: ConfiguracionConexion;
  campos: CampoFuente[];
  despliegue?: DespliegueFuente;
  observaciones_gestion?: string;
  fecha_observacion?: string;
  revisor_gestion?: string;
  historial: TrazabilidadEvento[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export const INSTITUCIONES_PROVEEDORAS_DEFAULT = [
  "Dirección General de Registro Civil",
  "Agencia Nacional de Tránsito",
  "Servicio de Rentas Internas",
  "Instituto Ecuatoriano de Seguridad Social",
  "Ministerio de Salud Pública",
  "Ministerio de Educación",
];

export function isProviderInstitution(institutionName?: string | null): boolean {
  if (!institutionName) return false;
  return INSTITUCIONES_PROVEEDORAS_DEFAULT.some((prov) =>
    institutionName.toLowerCase().includes(prov.toLowerCase())
  );
}

export const CONECTORES_CATALOGO: {
  tipo: ConectorTipo;
  nombre: string;
  version: string;
  protocolo: string;
  descripcion: string;
}[] = [
  {
    tipo: "PostgreSQL",
    nombre: "PostgreSQL Connector",
    version: "v4.2.1",
    protocolo: "TCP/IP 5432 - TLS v1.3",
    descripcion: "Conexión directa vía red VPN institucional con lectura cifrada.",
  },
  {
    tipo: "Oracle",
    nombre: "Oracle Database Connector",
    version: "v3.1.0",
    protocolo: "Oracle Net 1521 - SSL TCPS",
    descripcion: "Conexión de alta concurrencia para bases transaccionales Oracle 19c/21c.",
  },
  {
    tipo: "REST",
    nombre: "REST API Gateway Connector",
    version: "v2.0.0",
    protocolo: "HTTPS REST JSON / OpenAPI",
    descripcion: "Integración con servicios web REST protegidos por API Key o mTLS.",
  },
  {
    tipo: "MySQL",
    nombre: "MySQL Database Connector",
    version: "v3.5.0",
    protocolo: "TCP/IP 3306 - TLS v1.3",
    descripcion: "Lectura de bases de datos relacionales MySQL / MariaDB.",
  },
  {
    tipo: "SOAP",
    nombre: "SOAP Web Services Connector",
    version: "v1.8.0",
    protocolo: "HTTPS SOAP 1.1 / 1.2 XML WSDL",
    descripcion: "Consumo de servicios web empresariales heredados.",
  },
  {
    tipo: "SFTP",
    nombre: "SFTP Secure Batch Connector",
    version: "v2.2.0",
    protocolo: "SSH / SFTP Puerto 22",
    descripcion: "Transferencia segura por lotes con autenticación por llave pública.",
  },
  {
    tipo: "MongoDB",
    nombre: "MongoDB Document Connector",
    version: "v1.5.0",
    protocolo: "MongoDB Wire Protocol TLS",
    descripcion: "Consultas de lectura a colecciones de documentos JSON / BSON.",
  },
];

export const ESQUEMA_MOCK_REGISTRO_CIVIL: CampoFuente[] = [
      {
        id_campo: "CMP-01",
        incluido: true,
        ruta_origen: "persona.numero_cedula",
        nombre_publicado: "cedula",
        tipo_origen: "VARCHAR2(10)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Número de cédula de ciudadanía ecuatoriana de 10 dígitos.",
        es_identificador_persona: true,
        clasificacion: null,
      },
      {
        id_campo: "CMP-02",
        incluido: true,
        ruta_origen: "persona.nombres",
        nombre_publicado: "nombres",
        tipo_origen: "VARCHAR2(100)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Nombres registrados de la persona natural.",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-03",
        incluido: true,
        ruta_origen: "persona.apellidos",
        nombre_publicado: "apellidos",
        tipo_origen: "VARCHAR2(100)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Apellidos paterno y materno del ciudadano.",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-04",
        incluido: true,
        ruta_origen: "persona.fecha_nacimiento",
        nombre_publicado: "fecha_nacimiento",
        tipo_origen: "DATE",
        tipo_origen_canonico: "Fecha",
        tipo_normalizado: "Fecha",
        regla_conversion: "TextoAFechaISO",
        admite_nulo: false,
        descripcion: "Fecha de nacimiento en formato estándar ISO-8601 (AAAA-MM-DD).",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-05",
        incluido: true,
        ruta_origen: "persona.genero",
        nombre_publicado: "genero",
        tipo_origen: "VARCHAR2(20)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: true,
        descripcion: "Género registrado según partida de nacimiento.",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-06",
        incluido: true,
        ruta_origen: "persona.estado_civil",
        nombre_publicado: "estado_civil",
        tipo_origen: "VARCHAR2(30)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Estado civil actual del ciudadano (Soltero, Casado, Divorciado, etc.).",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-07",
        incluido: true,
        ruta_origen: "persona.condicion_ciudadano",
        nombre_publicado: "condicion_ciudadano",
        tipo_origen: "VARCHAR2(20)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Condición vital del ciudadano (Ciudadano, Fallecido).",
        es_identificador_persona: false,
        clasificacion: null,
      },
    ];

export const FUENTES_INICIALES: FuenteDatos[] = [
  {
    id: "FUE-RC-001",
    nombre: "Consulta de Datos Biográficos y Registro Civil",
    descripcion_fuente:
      "Servicio institucional provisto por la Dirección General de Registro Civil para verificación en línea de identidad, nombres, apellidos, condición ciudadana y estado civil.",
    version_propuesta: "v1.0.0",
    id_institucion_proveedora: "INST-DGRC-01",
    institucion_proveedora_nombre: "Dirección General de Registro Civil",
    id_coordinador_registrador: "1712345678",
    coordinador_nombre: "Andrea López",
    estado: "EN_REVISION",
    sla_fuente: {
      disponibilidad_objetivo: 99.8,
      tiempo_maximo_respuesta_ms: 350,
    },
    modalidades_soportadas: "Ambas modalidades",
    formato_respuesta: "application/json",
    tipo_dato_pruebas: "Sintético",
    parametros_consulta: [
      {
        id_parametro: "PAR-01",
        nombre: "numero_cedula",
        tipo: "Texto",
        obligatorio: true,
        es_identificador_persona: true,
        operadores_permitidos: ["Igual"],
        restriccion: { patron: "^[0-9]{10}$" },
      },
      {
        id_parametro: "PAR-02",
        nombre: "codigo_dactilar",
        tipo: "Texto",
        obligatorio: false,
        es_identificador_persona: false,
        operadores_permitidos: ["Igual"],
        restriccion: { patron: "^[A-Z0-9]{10}$" },
      },
    ],
    conexion: {
      tipo_conector: "Oracle",
      host: "10.160.4.12",
      puerto: 1521,
      base_datos: "DGRCPRD",
      esquema: "INTEROP_PUB",
      usuario: "usr_dinarp_read",
      secreto_referencia: "kms://arn:aws:kms:ec-dinarp:secrets/dgrc-oracle-key-v1",
      tls_activo: true,
      ultima_prueba: {
        id_prueba: "PRB-2026-0819",
        instante_prueba: "2026-10-04T14:30:00Z",
        latencia_ms: 38,
        resultado: "Satisfactoria",
        huella_muestra: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        version_conector: "v3.1.0",
        etapas: [
          { etapa: "Resolución de red y túnel VPN DINARP", estado: "ok", detalle: "Enrutamiento exitoso por túnel VPN dedicado." },
          { etapa: "Autenticación segura (KMS)", estado: "ok", detalle: "Credencial validada en almacén de secretos sin exposición." },
          { etapa: "Permisos de lectura (SELECT ONLY)", estado: "ok", detalle: "Acceso exclusivo de solo lectura en esquema INTEROP_PUB." },
          { etapa: "Inspección de estructura y muestra", estado: "ok", detalle: "Respuesta en 38 ms con 7 atributos detectados." },
        ],
      },
    },
    campos: ESQUEMA_MOCK_REGISTRO_CIVIL,
    historial: [
      {
        id_evento: "EVT-101",
        fecha: "2026-10-04T14:10:00Z",
        actor: "Andrea López",
        rol: "Coordinador SINARP",
        accion: "Creación de borrador de fuente FUE-01",
        estado_resultante: "BORRADOR",
        observaciones: "Borrador inicial registrado.",
      },
      {
        id_evento: "EVT-102",
        fecha: "2026-10-04T14:30:00Z",
        actor: "Andrea López",
        rol: "Coordinador SINARP",
        accion: "Prueba de conexión técnica FUE-02 Satisfactoria",
        estado_resultante: "CONFIGURACION",
        observaciones: "Conexión validada desde red DINARP en 38 ms.",
      },
      {
        id_evento: "EVT-103",
        fecha: "2026-10-04T14:45:00Z",
        actor: "Andrea López",
        rol: "Coordinador SINARP",
        accion: "Envío a revisión de Gestión FUE-03",
        estado_resultante: "EN_REVISION",
        observaciones: "Esquema y normalización enviados para clasificación y aprobación.",
      },
    ],
    fecha_creacion: "2026-10-04T14:10:00Z",
    fecha_actualizacion: "2026-10-04T14:45:00Z",
  },
  {
    id: "FUE-ANT-002",
    nombre: "Consulta de Licencias de Conducir y Puntos",
    descripcion_fuente:
      "Servicio provisto por la Agencia Nacional de Tránsito para verificar el estado de licencias de conducir, categorías autorizadas y puntos vigentes por conductor.",
    version_propuesta: "v1.0.0",
    id_institucion_proveedora: "INST-ANT-02",
    institucion_proveedora_nombre: "Agencia Nacional de Tránsito",
    id_coordinador_registrador: "1719876543",
    coordinador_nombre: "Roberto Zambrano",
    estado: "DEVUELTA",
    sla_fuente: {
      disponibilidad_objetivo: 99.5,
      tiempo_maximo_respuesta_ms: 450,
    },
    modalidades_soportadas: "API individual",
    formato_respuesta: "application/json",
    tipo_dato_pruebas: "Indeterminado",
    parametros_consulta: [
      {
        id_parametro: "PAR-ANT-01",
        nombre: "numero_identificacion",
        tipo: "Texto",
        obligatorio: true,
        es_identificador_persona: true,
        operadores_permitidos: ["Igual"],
        restriccion: { patron: "^[0-9]{10}$" },
      },
    ],
    conexion: {
      tipo_conector: "PostgreSQL",
      host: "10.150.12.8",
      puerto: 5432,
      base_datos: "ant_licencias",
      esquema: "public",
      usuario: "dinarp_ro",
      secreto_referencia: "kms://arn:aws:kms:ec-dinarp:secrets/ant-pg-key-v1",
      tls_activo: true,
      ultima_prueba: {
        id_prueba: "PRB-2026-0771",
        instante_prueba: "2026-10-03T11:20:00Z",
        latencia_ms: 64,
        resultado: "Satisfactoria",
        huella_muestra: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
        version_conector: "v4.2.1",
        etapas: [
          { etapa: "Resolución de red VPN DINARP", estado: "ok", detalle: "Túnel activo." },
          { etapa: "Autenticación KMS", estado: "ok", detalle: "Secreto verificado." },
          { etapa: "Permisos de lectura", estado: "ok", detalle: "Lectura concedida." },
          { etapa: "Inspección de estructura", estado: "ok", detalle: "5 campos detectados." },
        ],
      },
    },
    campos: [
      {
        id_campo: "CMP-ANT-01",
        incluido: true,
        ruta_origen: "licencia.cedula",
        nombre_publicado: "cedula_conductor",
        tipo_origen: "VARCHAR(10)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Cédula del conductor autorizado.",
        es_identificador_persona: true,
        clasificacion: null,
      },
      {
        id_campo: "CMP-ANT-02",
        incluido: true,
        ruta_origen: "licencia.tipo_licencia",
        nombre_publicado: "categoria_licencia",
        tipo_origen: "VARCHAR(5)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Tipo o categoría de licencia (Tipo A, B, C, D, E, F, G).",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-ANT-03",
        incluido: true,
        ruta_origen: "licencia.puntos_saldo",
        nombre_publicado: "puntos_vigentes",
        tipo_origen: "INTEGER",
        tipo_origen_canonico: "Entero",
        tipo_normalizado: "Entero",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Puntos vigentes en la licencia del conductor (escala 0 a 30).",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-ANT-04",
        incluido: true,
        ruta_origen: "licencia.fecha_emision",
        nombre_publicado: "fecha_emision",
        tipo_origen: "DATE",
        tipo_origen_canonico: "Fecha",
        tipo_normalizado: "Fecha",
        regla_conversion: "TextoAFechaISO",
        admite_nulo: false,
        descripcion: "Fecha en que se expidió la licencia.",
        es_identificador_persona: false,
        clasificacion: null,
      },
      {
        id_campo: "CMP-ANT-05",
        incluido: true,
        ruta_origen: "licencia.fecha_caducidad",
        nombre_publicado: "fecha_vencimiento",
        tipo_origen: "DATE",
        tipo_origen_canonico: "Fecha",
        tipo_normalizado: "Fecha",
        regla_conversion: "TextoAFechaISO",
        admite_nulo: false,
        descripcion: "Fecha de expiración de la licencia.",
        es_identificador_persona: false,
        clasificacion: null,
      },
    ],
    observaciones_gestion:
      "Se detecta tipo_dato_pruebas = 'Indeterminado'. Conforme a FUE-04, no se pueden habilitar consultas en Pruebas hasta certificar datos Sintéticos o Anonimizados. Asimismo, ajustar el tiempo máximo de SLA para alinearse a la norma técnica.",
    fecha_observacion: "2026-10-04T16:00:00Z",
    revisor_gestion: "Ana Torres (Equipo de Gestión)",
    historial: [
      {
        id_evento: "EVT-201",
        fecha: "2026-10-03T11:00:00Z",
        actor: "Roberto Zambrano",
        rol: "Coordinador SINARP",
        accion: "Creación de fuente",
        estado_resultante: "BORRADOR",
      },
      {
        id_evento: "EVT-202",
        fecha: "2026-10-03T11:30:00Z",
        actor: "Roberto Zambrano",
        rol: "Coordinador SINARP",
        accion: "Envío a revisión de Gestión",
        estado_resultante: "EN_REVISION",
      },
      {
        id_evento: "EVT-203",
        fecha: "2026-10-04T16:00:00Z",
        actor: "Ana Torres",
        rol: "Equipo de Gestión",
        accion: "Devolución con observaciones (FUE-04)",
        estado_resultante: "DEVUELTA",
        observaciones:
          "Se detecta tipo_dato_pruebas = 'Indeterminado'. Conforme a FUE-04, no se pueden habilitar consultas en Pruebas hasta certificar datos Sintéticos o Anonimizados. Asimismo, ajustar el tiempo máximo de SLA para alinearse a la norma técnica.",
      },
    ],
    fecha_creacion: "2026-10-03T11:00:00Z",
    fecha_actualizacion: "2026-10-04T16:00:00Z",
  },
  {
    id: "FUE-SRI-003",
    nombre: "Validación de Registro Único de Contribuyentes (RUC)",
    descripcion_fuente:
      "Servicio oficial provisto por el Servicio de Rentas Internas para verificar estado tributario, razón social, actividad económica y condición de contribuyente especial o RISE.",
    version_propuesta: "v1.0.0",
    id_institucion_proveedora: "INST-SRI-03",
    institucion_proveedora_nombre: "Servicio de Rentas Internas",
    id_coordinador_registrador: "1709876123",
    coordinador_nombre: "Guillermo Paredes",
    estado: "APROBADA",
    sla_fuente: {
      disponibilidad_objetivo: 99.9,
      tiempo_maximo_respuesta_ms: 200,
    },
    modalidades_soportadas: "Ambas modalidades",
    formato_respuesta: "application/json",
    tipo_dato_pruebas: "Sintético",
    parametros_consulta: [
      {
        id_parametro: "PAR-SRI-01",
        nombre: "numero_ruc",
        tipo: "Texto",
        obligatorio: true,
        es_identificador_persona: true,
        operadores_permitidos: ["Igual"],
        restriccion: { patron: "^[0-9]{13}$" },
      },
    ],
    conexion: {
      tipo_conector: "REST",
      url_endpoint: "https://api-interop.sri.gob.ec/v1/ruc",
      secreto_referencia: "kms://arn:aws:kms:ec-dinarp:secrets/sri-apikey-v2",
      tls_activo: true,
      ultima_prueba: {
        id_prueba: "PRB-2026-0640",
        instante_prueba: "2026-10-02T09:40:00Z",
        latencia_ms: 24,
        resultado: "Satisfactoria",
        huella_muestra: "4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6769730",
        version_conector: "v2.0.0",
        etapas: [
          { etapa: "Handshake mTLS seguro", estado: "ok", detalle: "Certificado DINARP aceptado." },
          { etapa: "Autenticación de encabezado", estado: "ok", detalle: "Token verificado." },
          { etapa: "Validación de contrato OpenAPI", estado: "ok", detalle: "Esquema conforme." },
        ],
      },
    },
    campos: [
      {
        id_campo: "CMP-SRI-01",
        incluido: true,
        ruta_origen: "contribuyente.ruc",
        nombre_publicado: "ruc",
        tipo_origen: "STRING(13)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Número de RUC de 13 dígitos.",
        es_identificador_persona: true,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-SRI-02",
        incluido: true,
        ruta_origen: "contribuyente.razon_social",
        nombre_publicado: "razon_social",
        tipo_origen: "STRING(150)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Razón social o denominación comercial registrada.",
        es_identificador_persona: false,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-SRI-03",
        incluido: true,
        ruta_origen: "contribuyente.estado_contribuyente",
        nombre_publicado: "estado_tributario",
        tipo_origen: "STRING(30)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Estado tributario (Activo, Pasivo, Suspendido).",
        es_identificador_persona: false,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-SRI-04",
        incluido: true,
        ruta_origen: "contribuyente.actividad_economica_principal",
        nombre_publicado: "actividad_economica",
        tipo_origen: "STRING(250)",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: true,
        descripcion: "Descripción de la actividad principal CIIU.",
        es_identificador_persona: false,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-SRI-05",
        incluido: true,
        ruta_origen: "contribuyente.obligado_contabilidad",
        nombre_publicado: "obligado_contabilidad",
        tipo_origen: "BOOLEAN",
        tipo_origen_canonico: "Booleano",
        tipo_normalizado: "Booleano",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Indica si el contribuyente está obligado a llevar contabilidad.",
        es_identificador_persona: false,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-SRI-06",
        incluido: true,
        ruta_origen: "contribuyente.ingresos_declarados_anuales",
        nombre_publicado: "ingresos_declarados",
        tipo_origen: "DECIMAL(14,2)",
        tipo_origen_canonico: "Decimal",
        tipo_normalizado: "Decimal",
        regla_conversion: "Identidad",
        admite_nulo: true,
        descripcion: "Monto anual declarado en la última declaración de renta.",
        es_identificador_persona: false,
        clasificacion: "Confidencial",
      },
    ],
    observaciones_gestion:
      "Fuente aprobada satisfactoriamente por el Área de Gestión. Todos los campos fueron revisados y clasificados (5 Accesibles, 1 Confidencial). El Coordinador Institucional puede proceder a la publicación en el catálogo.",
    fecha_observacion: "2026-10-03T15:30:00Z",
    revisor_gestion: "Ana Torres (Equipo de Gestión)",
    historial: [
      {
        id_evento: "EVT-301",
        fecha: "2026-10-02T09:00:00Z",
        actor: "Guillermo Paredes",
        rol: "Coordinador SINARP",
        accion: "Creación y prueba de fuente",
        estado_resultante: "CONFIGURACION",
      },
      {
        id_evento: "EVT-302",
        fecha: "2026-10-02T10:00:00Z",
        actor: "Guillermo Paredes",
        rol: "Coordinador SINARP",
        accion: "Envío a revisión de Gestión",
        estado_resultante: "EN_REVISION",
      },
      {
        id_evento: "EVT-303",
        fecha: "2026-10-03T15:30:00Z",
        actor: "Ana Torres",
        rol: "Equipo de Gestión",
        accion: "Aprobación y clasificación de campos (FUE-04)",
        estado_resultante: "APROBADA",
        observaciones:
          "Todos los campos clasificados. 5 Accesibles y 1 Confidencial (ingresos_declarados). Habilitada para publicación FUE-05.",
      },
    ],
    fecha_creacion: "2026-10-02T09:00:00Z",
    fecha_actualizacion: "2026-10-03T15:30:00Z",
  },
  {
    id: "FUE-MED-004",
    nombre: "Registro Nacional de Títulos y Grados Académicos",
    descripcion_fuente:
      "Servicio oficial provisto por el Ministerio de Educación para validar autenticidad de títulos de bachiller y certificados de educación media registrados a nivel nacional.",
    version_propuesta: "v1.0.0",
    version_api: "v1.0.0",
    id_institucion_proveedora: "INST-MINEDUC-04",
    institucion_proveedora_nombre: "Ministerio de Educación",
    id_coordinador_registrador: "1714443322",
    coordinador_nombre: "Mariana Almeida",
    estado: "PUBLICADA",
    sla_fuente: {
      disponibilidad_objetivo: 99.7,
      tiempo_maximo_respuesta_ms: 300,
    },
    modalidades_soportadas: "Ambas modalidades",
    formato_respuesta: "application/json",
    tipo_dato_pruebas: "Sintético",
    parametros_consulta: [
      {
        id_parametro: "PAR-MED-01",
        nombre: "identificacion_estudiante",
        tipo: "Texto",
        obligatorio: true,
        es_identificador_persona: true,
        operadores_permitidos: ["Igual"],
        restriccion: { patron: "^[0-9]{10}$" },
      },
    ],
    conexion: {
      tipo_conector: "REST",
      url_endpoint: "https://titulos.educacion.gob.ec/api/v1/certificados",
      secreto_referencia: "kms://arn:aws:kms:ec-dinarp:secrets/mineduc-api-v1",
      tls_activo: true,
      ultima_prueba: {
        id_prueba: "PRB-2026-0511",
        instante_prueba: "2026-09-28T10:15:00Z",
        latencia_ms: 45,
        resultado: "Satisfactoria",
        huella_muestra: "d41d8cd98f00b204e9800998ecf8427e",
        version_conector: "v2.0.0",
        etapas: [
          { etapa: "Conexión TLS", estado: "ok", detalle: "Canal seguro activo." },
          { etapa: "Prueba de contrato", estado: "ok", detalle: "Lectura verificada." },
        ],
      },
    },
    campos: [
      {
        id_campo: "CMP-MED-01",
        incluido: true,
        ruta_origen: "titulo.cedula",
        nombre_publicado: "cedula_estudiante",
        tipo_origen: "STRING",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Cédula de identidad del titular del título.",
        es_identificador_persona: true,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-MED-02",
        incluido: true,
        ruta_origen: "titulo.nombre_completo",
        nombre_publicado: "nombre_titular",
        tipo_origen: "STRING",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Nombres y apellidos completos del estudiante.",
        es_identificador_persona: false,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-MED-03",
        incluido: true,
        ruta_origen: "titulo.especialidad",
        nombre_publicado: "especialidad_bachillerato",
        tipo_origen: "STRING",
        tipo_origen_canonico: "Texto",
        tipo_normalizado: "Texto",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Especialidad o mención obtenida en el título.",
        es_identificador_persona: false,
        clasificacion: "Accesible",
      },
      {
        id_campo: "CMP-MED-04",
        incluido: true,
        ruta_origen: "titulo.ano_graduacion",
        nombre_publicado: "ano_graduacion",
        tipo_origen: "INTEGER",
        tipo_origen_canonico: "Entero",
        tipo_normalizado: "Entero",
        regla_conversion: "Identidad",
        admite_nulo: false,
        descripcion: "Año civil de refrendación y graduación.",
        es_identificador_persona: false,
        clasificacion: "Accesible",
      },
    ],
    despliegue: {
      id_despliegue: "DSP-2026-9912",
      url_publica: "https://api.dinarp.gob.ec/v1/educacion/titulos",
      version_api: "v1.0.0",
      fecha_publicacion: "2026-09-30T17:00:00Z",
      ambiente: "Producción",
      proxy_endpoint: "https://gateway.dinarp.gob.ec/proxy/mineduc-titulos-v1",
    },
    historial: [
      {
        id_evento: "EVT-401",
        fecha: "2026-09-28T09:00:00Z",
        actor: "Mariana Almeida",
        rol: "Coordinador SINARP",
        accion: "Creación de fuente",
        estado_resultante: "BORRADOR",
      },
      {
        id_evento: "EVT-402",
        fecha: "2026-09-28T10:30:00Z",
        actor: "Mariana Almeida",
        rol: "Coordinador SINARP",
        accion: "Envío a revisión de Gestión",
        estado_resultante: "EN_REVISION",
      },
      {
        id_evento: "EVT-403",
        fecha: "2026-09-29T14:00:00Z",
        actor: "Ana Torres",
        rol: "Equipo de Gestión",
        accion: "Aprobación de fuente (FUE-04)",
        estado_resultante: "APROBADA",
      },
      {
        id_evento: "EVT-404",
        fecha: "2026-09-30T17:00:00Z",
        actor: "Mariana Almeida",
        rol: "Coordinador SINARP",
        accion: "Publicación en catálogo y despliegue de versión v1.0.0 (FUE-05)",
        estado_resultante: "PUBLICADA",
        observaciones: "Publicación confirmada. Despliegue DSP-2026-9912 activo en Apigee.",
      },
    ],
    fecha_creacion: "2026-09-28T09:00:00Z",
    fecha_actualizacion: "2026-09-30T17:00:00Z",
  },
];
