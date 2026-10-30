"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  Copy,
  Check,
  X,
  Fingerprint,
  Search,
  User,
  ChevronRight,
  ArrowLeft,
  FileText,
  FileSignature,
  ArrowLeftRight,
  Users,
  ShieldCheck,
  Shield,
  KeyRound,
  RefreshCw,
  UserCheck,
  Layers,
  Database,
  Clock,
  FolderKanban,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type FlowType =
  | "id-admin"
  | "id-usuario"
  | "id-activacion"
  | "anexo-a"
  | "anexo-b"
  | "anexo-c"
  | "suplencias"
  | "interoperabilidad"
  | "proyectos"
  | "fuentes"
  | "excepcional"
  | "consumo"
  | "operacion"
  | "administracion"
  | "todos";

export interface AccountRouteAction {
  label: string;
  route: string;
  huBadge?: string;
}

export interface FlowAccountOverride {
  order: number;
  roleName?: string;
  userName?: string;
  description?: string;
  access?: string;
  storiesBadge?: string;
  actions?: AccountRouteAction[];
}

export interface TestAccountItem {
  roleName: string;
  userName: string;
  cedula: string;
  description: string;
  access: string;
  storiesBadge?: string;
  flows: FlowType[];
  actions: AccountRouteAction[];
  flowOverrides?: Partial<Record<FlowType, FlowAccountOverride>>;
}

export const TEST_ACCOUNTS_DATA: TestAccountItem[] = [
  // ── ACTOR ADMINISTRADOR (ID-00 A ID-05, ID-08, ID-10, ID-11, ID-14, ID-15) ──
  {
    roleName: "Administrador del Sistema",
    userName: "Admin Portal",
    cedula: "1799999999",
    description: "Control total de identidades: crea, edita, suspende y da de baja cuentas internas. Configura áreas DINARP, catálogo de roles, audita eventos, gestiona coordinadores y atiende recuperación asistida de 2FA.",
    access: "Cuentas Internas (/cuentas-internas), Auditoría (/auditoria-cuentas), Coordinadores (/coordinadores), Catálogo de Áreas (/areas), Catálogo de Roles (/roles) y Gestión de Recuperaciones (/gestion-recuperaciones).",
    storiesBadge: "ID-00..15 · BN-04 (AUS-02)",
    flows: ["id-admin", "suplencias", "excepcional", "operacion", "administracion"],
    actions: [
      { label: "Parámetros, instituciones y primer Administrador", route: "/parametros-portal", huBadge: "PAR-08,09,15,16 · INS-08..10 · ID-00" },
      { label: "Mesa de ayuda y parámetros", route: "/soporte", huBadge: "INC-02, INC-04, PAR-03, PAR-06" },
      { label: "Vigencia de enlaces de extracción", route: "/parametros-excepcional", huBadge: "PAR-04" },
      { label: "Cuentas Internas", route: "/cuentas-internas", huBadge: "ID-01..04" },
      { label: "Auditoría de Cuentas", route: "/auditoria-cuentas", huBadge: "ID-05" },
      { label: "Gestión Coordinadores", route: "/coordinadores", huBadge: "ID-10, 11" },
      { label: "Gestión de Suplencias", route: "/suplencias", huBadge: "AUS-02" },
      { label: "Catálogo de Áreas", route: "/areas", huBadge: "ID-15" },
      { label: "Catálogo de Roles", route: "/roles", huBadge: "ID-14" },
      { label: "Recuperación Asistida", route: "/gestion-recuperaciones", huBadge: "ID-08" },
    ]
  },

  // ── ACTOR USUARIO HABILITADO (ID-06, ID-07) ──
  {
    roleName: "Usuario Habilitado",
    userName: "Funcionario Habilitado",
    cedula: "1788888888",
    description: "Funcionario interno con cuenta activa y doble factor. Autenticación con cédula, contraseña y OTP de Google Authenticator. Puede autogestionar restablecimiento de contraseña.",
    access: "Login 2FA (/login), Restablecer Contraseña (/recuperar-contrasena) y bandeja institucional según su área.",
    storiesBadge: "ID-06, ID-07",
    flows: ["id-usuario"],
    actions: [
      { label: "Ingreso con 2FA (OTP)", route: "/login", huBadge: "ID-06" },
      { label: "Restablecer Contraseña", route: "/recuperar-contrasena", huBadge: "ID-07" },
    ]
  },

  // ── ACTOR USUARIO EN ACTIVACIÓN Y GOOGLE AUTHENTICATOR (ID-09, ID-12) ──
  {
    roleName: "Usuario en Activación (Vinculación 2FA)",
    userName: "Usuario Pendiente Activación",
    cedula: "1718956234",
    description: "Usuario nuevo con cuenta pendiente de activación. Establece su contraseña inicial desde enlace de 1 solo uso y escanea código QR para vincular Google Authenticator en app móvil.",
    access: "Pantalla de Activación (/establecer-contrasena) y Enrolamiento TOTP (/vincular-autenticador).",
    storiesBadge: "ID-09, ID-12",
    flows: ["id-activacion"],
    actions: [
      { label: "Establecer Contraseña Inicial", route: "/establecer-contrasena", huBadge: "ID-09" },
      { label: "Vincular Google Authenticator", route: "/vincular-autenticador", huBadge: "ID-12" },
    ]
  },

  // ── FLUJO ANEXO A (REGISTRO INSTITUCIÓN Y RESOLUCIÓN - BN-01: INS-01 A INS-07) ──
  {
    roleName: "Representante Legal / Solicitante",
    userName: "Marcelo Albuja",
    cedula: "1710001112",
    description: "Máxima autoridad de entidad requirente. Registra la institución en DINARP, firma la solicitud de interoperabilidad y designa a los coordinadores institucionales.",
    access: "Formulario de Registro Institucional (Anexo A) y seguimiento de resolución jurídica.",
    storiesBadge: "BN-01 · INS-01 a INS-03",
    flows: ["anexo-a"],
    actions: [
      { label: "Nueva Solicitud (Anexo A)", route: "/registro-institucion", huBadge: "INS-01..03" },
      { label: "Mis Expedientes Anexo A", route: "/expedientes-anexo-a", huBadge: "INS-03..07" },
      { label: "Seguimiento Coordinadores (Anexo B)", route: "/expedientes-anexo-b", huBadge: "ENR-01..04" },
      { label: "Mis Expedientes Anexo C", route: "/expedientes-anexo-c", huBadge: "CAM-01..04" },
    ]
  },
  {
    roleName: "Director Área de Gestión",
    userName: "Director Gestión",
    cedula: "1711223344",
    description: "Recibe trámites institucionales en bandejas separadas por anexo (Anexos A, B y C) y solicitudes de acceso a fuentes (BN-07). Asigna y reasigna revisores del Equipo de Gestión, y autoriza la formalización final.",
    access: "Asignación Anexo A (/asignacion-solicitudes), Asignación Anexo B (/asignacion-anexo-b), Asignación Anexo C (/asignacion-anexo-c), Asignación Interoperabilidad (/acceso-interoperabilidad/asignacion) y Formalización (/formalizacion).",
    storiesBadge: "BN-01..03 · BN-07 (SOL-03)",
    flows: ["anexo-a", "anexo-b", "anexo-c", "interoperabilidad", "excepcional", "consumo", "operacion", "administracion"],
    actions: [
      { label: "Bajas, restablecimiento y plantillas", route: "/ciclo-fuentes", huBadge: "FUE-08, FUE-11, PAR-14, 15" },
      { label: "Reportes y anomalías", route: "/reportes", huBadge: "REP-01, OPS-02" },
      { label: "Revisar y aprobar ampliaciones", route: "/consumo-api", huBadge: "ADD-06, ADD-07" },
      { label: "Entrega excepcional: asignar calificación", route: "/entrega-excepcional", huBadge: "EXT-02" },
      { label: "Anexo A — Asignación", route: "/asignacion-solicitudes", huBadge: "INS-04" },
      { label: "Anexo B — Asignación", route: "/asignacion-anexo-b", huBadge: "ENR-03" },
      { label: "Anexo C — Asignación", route: "/asignacion-anexo-c", huBadge: "CAM-02" },
      { label: "Asignar Revisor Fuente (BN-07)", route: "/acceso-interoperabilidad/asignacion", huBadge: "SOL-03" },
      { label: "Formalización de Acceso", route: "/formalizacion", huBadge: "FOR-01" },
    ],
    flowOverrides: {
      interoperabilidad: {
        order: 2,
        roleName: "2. Director de Gestión",
        userName: "Director Gestión",
        storiesBadge: "BN-07 · SOL-03",
        description: "Paso 2 del flujo BPMN BN-07. Recibe las solicitudes enviadas y subsanadas por las instituciones consumidoras, consulta el expediente y asigna o recupera/reasigna un revisor activo del Equipo de Gestión conservando el historial (SOL-03).",
        access: "Bandeja de Asignación de Acceso a Fuentes (/acceso-interoperabilidad/asignacion) y Formalización (/formalizacion).",
        actions: [
          { label: "Asignar / Reasignar Revisor (SOL-03)", route: "/acceso-interoperabilidad/asignacion", huBadge: "SOL-03" },
          { label: "Formalización de Acceso", route: "/formalizacion", huBadge: "FOR-01" },
        ],
      },
    },
  },
  {
    roleName: "Revisor Área de Gestión",
    userName: "Ana Torres (Revisor)",
    cedula: "1111111111",
    description: "Evalúa expedientes en bandejas independientes para Anexo A, Anexo B y Anexo C, además de solicitudes de acceso a fuentes (BN-07).",
    access: "Revisión Anexo A (/solicitudes-pendientes), Revisión Anexo B (/revision-anexo-b), Revisión Anexo C (/revision-anexo-c) y Revisión Interoperabilidad (/revision-gestion).",
    storiesBadge: "BN-01..03 · BN-07 (SOL-04)",
    flows: ["anexo-a", "anexo-b", "anexo-c", "interoperabilidad", "excepcional", "consumo", "operacion", "administracion"],
    actions: [
      { label: "Restablecer fuentes", route: "/ciclo-fuentes", huBadge: "FUE-11" },
      { label: "Revisar anomalías de consumo", route: "/operacion", huBadge: "OPS-02" },
      { label: "Revisar ampliaciones", route: "/consumo-api", huBadge: "ADD-07" },
      { label: "Entrega excepcional: calificar e informe final", route: "/entrega-excepcional", huBadge: "EXT-02" },
      { label: "Anexo A — Revisión", route: "/solicitudes-pendientes", huBadge: "INS-05" },
      { label: "Anexo B — Revisión", route: "/revision-anexo-b", huBadge: "ENR-04" },
      { label: "Anexo C — Revisión", route: "/revision-anexo-c", huBadge: "CAM-03" },
      { label: "Revisar Solicitud Fuente (BN-07)", route: "/revision-gestion", huBadge: "SOL-04" },
    ],
    flowOverrides: {
      interoperabilidad: {
        order: 3,
        roleName: "3. Revisor del Equipo de Gestión",
        userName: "Ana Torres (Revisor)",
        storiesBadge: "BN-07 · SOL-04",
        description: "Paso 3 del flujo BPMN BN-07. Evalúa la solicitud asignada (finalidad por campo, cupo estimado y anexos). Registra observaciones estructuradas para subsanación en 3 días hábiles o aprueba la revisión (derivando a DPI si contiene campos confidenciales, o a formalización si solo tiene accesibles) (SOL-04).",
        access: "Bandeja de Revisión del Equipo de Gestión (/revision-gestion).",
        actions: [
          { label: "Evaluar Solicitudes Asignadas (SOL-04)", route: "/revision-gestion", huBadge: "SOL-04" },
        ],
      },
    },
  },
  {
    roleName: "Director de Normatividad",
    userName: "Director Normativa",
    cedula: "2222222222",
    description: "Recibe expedientes de incorporación institucional (Anexo A) aprobados por Gestión, asigna al Analista de Normatividad y da el visto bueno final a la resolución antes de la firma de la Máxima Autoridad.",
    access: "Elaborar resoluciones (/revision-normativa).",
    storiesBadge: "BN-01 (INS-06, 07)",
    flows: ["anexo-a", "excepcional", "operacion", "administracion"],
    actions: [
      { label: "Plantilla de la resolución", route: "/parametros-portal", huBadge: "PAR-14" },
      { label: "Reportes y trazabilidad por cédula", route: "/reportes", huBadge: "REP-02..04" },
      { label: "Parámetros de la entrega excepcional", route: "/parametros-excepcional", huBadge: "PAR-17" },
      { label: "Elaborar resoluciones (Anexo A)", route: "/revision-normativa", huBadge: "INS-06, 07" },
    ],
  },
  {
    roleName: "Analista de Normatividad",
    userName: "Revisor Normativa",
    cedula: "3333333333",
    description: "Carga el informe técnico firmado (favorable o desfavorable), elabora la resolución de incorporación institucional (Anexo A) y da el primer visto bueno. Si el informe es desfavorable, el expediente queda Rechazado por Normatividad.",
    access: "Elaborar resoluciones (/revision-normativa).",
    storiesBadge: "BN-01 (INS-06)",
    flows: ["anexo-a", "operacion"],
    actions: [
      { label: "Reportes y trazabilidad por cédula", route: "/reportes", huBadge: "REP-02..04" },
      { label: "Elaborar resoluciones (Anexo A)", route: "/revision-normativa", huBadge: "INS-06" },
    ],
  },
  {
    roleName: "Director de Protección de la Información (DPI)",
    userName: "Director DPI",
    cedula: "4444444444",
    description: "Recibe solicitudes de acceso a fuentes con campos confidenciales aprobadas por Gestión (BN-07), asigna o reasigna revisores del Equipo DPI y suscribe la segunda firma electrónica del informe favorable (SOL-07, SOL-08).",
    access: "Asignar revisiones DPI (/revision-normativa/asignacion) y Firmar informes DPI (/revision-normativa/asignacion?tab=informes).",
    storiesBadge: "BN-07 (SOL-07, 08)",
    flows: ["interoperabilidad", "excepcional", "consumo", "administracion"],
    actions: [
      { label: "Plantilla del informe de recomendación", route: "/parametros-portal", huBadge: "PAR-14" },
      { label: "Firmar informe de ampliación", route: "/consumo-api", huBadge: "ADD-07" },
      { label: "Entrega excepcional: informe de DPI", route: "/entrega-excepcional", huBadge: "EXT-02" },
      { label: "Asignar revisiones DPI (SOL-07)", route: "/revision-normativa/asignacion", huBadge: "SOL-07" },
      { label: "Firmar informes DPI (SOL-08)", route: "/revision-normativa/asignacion?tab=informes", huBadge: "SOL-08" },
    ],
    flowOverrides: {
      interoperabilidad: {
        order: 4,
        roleName: "4. Director de Protección de la Información (DPI)",
        userName: "Director DPI",
        storiesBadge: "BN-07 · SOL-07, SOL-08",
        description: "Paso 4 y Firma Final del flujo BPMN BN-07 (solicitudes con datos confidenciales aprobadas por Gestión). Recibe la solicitud, asigna o reasigna un revisor activo del Equipo DPI (SOL-07), revisa el informe favorable generado en plataforma y suscribe la 2.ª firma electrónica (SOL-08).",
        access: "Asignar revisiones DPI (/revision-normativa/asignacion) y Firmar informes DPI (/revision-normativa/asignacion?tab=informes).",
        actions: [
          { label: "Asignar revisiones DPI (SOL-07)", route: "/revision-normativa/asignacion", huBadge: "SOL-07" },
          { label: "Firmar informes DPI (SOL-08)", route: "/revision-normativa/asignacion?tab=informes", huBadge: "SOL-08" },
        ],
      },
    },
  },
  {
    roleName: "Revisor de Protección de la Información (DPI)",
    userName: "Carlos Mora (Revisor DPI)",
    cedula: "5555555555",
    description: "Evalúa los campos confidenciales solicitados y su justificación jurídica LOPDP (BN-07). Registra observaciones para subsanación en 3 días hábiles (SOL-07) o elabora en plataforma y suscribe con primera firma electrónica el informe favorable para enviarlo al Director DPI (SOL-08).",
    access: "Evaluar datos confidenciales (/revision-normativa/fuentes) y Elaborar informes DPI (/revision-normativa/fuentes?tab=informes).",
    storiesBadge: "BN-07 (SOL-07, 08)",
    flows: ["interoperabilidad", "excepcional", "consumo"],
    actions: [
      { label: "Revisar campos confidenciales de ampliación", route: "/consumo-api", huBadge: "ADD-07" },
      { label: "Entrega excepcional: informe de DPI", route: "/entrega-excepcional", huBadge: "EXT-02" },
      { label: "Evaluar datos confidenciales (SOL-07)", route: "/revision-normativa/fuentes", huBadge: "SOL-07" },
      { label: "Elaborar informes DPI (SOL-08)", route: "/revision-normativa/fuentes?tab=informes", huBadge: "SOL-08" },
    ],
    flowOverrides: {
      interoperabilidad: {
        order: 5,
        roleName: "5. Revisor del Equipo de Protección de la Información (DPI)",
        userName: "Carlos Mora (Revisor DPI)",
        storiesBadge: "BN-07 · SOL-07, SOL-08",
        description: "Paso 5 del flujo BPMN BN-07 (evaluación de datos confidenciales). Revisa en detalle los campos confidenciales solicitados, su finalidad y justificación jurídica LOPDP. Registra observaciones para subsanación en 3 días hábiles (SOL-07) o elabora el informe favorable directamente en plataforma y suscribe la 1.ª firma electrónica para enviarlo al Director DPI (SOL-08).",
        access: "Evaluar datos confidenciales (/revision-normativa/fuentes) y Elaborar informes DPI (/revision-normativa/fuentes?tab=informes).",
        actions: [
          { label: "Evaluar datos confidenciales (SOL-07)", route: "/revision-normativa/fuentes", huBadge: "SOL-07" },
          { label: "Elaborar informes DPI (SOL-08)", route: "/revision-normativa/fuentes?tab=informes", huBadge: "SOL-08" },
        ],
      },
    },
  },

  // ── FLUJO ANEXO B (ENROLAMIENTO COORDINADOR / ACUERDO - BN-02: ENR-01 A ENR-04) ──
  {
    roleName: "Coordinador Titular (Prerregistrado)",
    userName: "Roberto Dávila",
    cedula: "1715489621",
    description: "Coordinador notificado tras resolución aprobada. Ingresa para formalizar su designación mediante firma electrónica del Acuerdo de Confidencialidad (Anexo B).",
    access: "Flujo de Enrolamiento y firma electrónica de Acuerdo (/enrolamiento-coordinador).",
    storiesBadge: "BN-02 · ENR-01..04",
    flows: ["anexo-b"],
    actions: [
      { label: "Enrolamiento de Coordinador", route: "/enrolamiento-coordinador", huBadge: "ENR-01..04" },
    ]
  },

  // ── FLUJO ANEXO C (CAMBIO DE COORDINADOR - BN-03: CAM-01 A CAM-03) ──
  {
    roleName: "Representante Institucional",
    userName: "Carlos Andrade",
    cedula: "1716789019",
    description: "Autoridad que tramita el reemplazo motivado de un coordinador institucional (titular o suplente) por desvinculación o reestructuración (Anexo C).",
    access: "Formulario de Solicitud de Cambio de Coordinador (/cambio-coordinador).",
    storiesBadge: "BN-03 · CAM-01",
    flows: ["anexo-c"],
    actions: [
      { label: "Cambio de Coordinador", route: "/cambio-coordinador", huBadge: "CAM-01" },
    ]
  },

  // ── FLUJO GESTIÓN DE SUPLENCIAS (TEMPORAL Y ADMIN - BN-04: AUS-01 A AUS-03) ──
  {
    roleName: "Coordinador Titular (Suplencias)",
    userName: "Juan Pérez",
    cedula: "1234567890",
    description: "Coordinador titular que planifica y registra su inactividad temporal (AUS-01) en el calendario institucional para habilitar la delegación de permisos.",
    access: "Gestión de Suplencias (/suplencias) y programación de ausencia temporal.",
    storiesBadge: "BN-04 · AUS-01",
    flows: ["suplencias"],
    actions: [
      { label: "Programar Inactividad", route: "/suplencias", huBadge: "AUS-01" },
    ]
  },
  {
    roleName: "Coordinador Suplente",
    userName: "Mariana Almeida",
    cedula: "1714443322",
    description: "Coordinador suplente enrolado en estado Enrolado sin acceso. Se conmuta automáticamente durante la ausencia del titular o por activación administrativa (AUS-03).",
    access: "Gestión de Suplencias (/suplencias) y verificación de conmutación de permisos institucionales.",
    storiesBadge: "BN-04 · AUS-01..03",
    flows: ["suplencias"],
    actions: [
      { label: "Ver Estado de Suplencia", route: "/suplencias", huBadge: "AUS-03" },
    ]
  },

  // ── FLUJO INTEROPERABILIDAD Y SOLICITUD DE ACCESO A FUENTE (BN-05: PRJ-01, PRJ-02 · BN-07: SOL-01..08) ──
  {
    roleName: "Coordinador SINARP",
    userName: "Andrea López (MinEduc)",
    cedula: "1712345678",
    description: "Coordinador SINARP de entidad requirente. Elige proyecto y 1 fuente publicada, selecciona campos y cupo, declara finalidad por campo y justificación jurídica si hay confidenciales, envía solicitud (SOL-02) y subsana observaciones dentro de 3 días hábiles (SOL-05).",
    access: "Mis Solicitudes (/acceso-interoperabilidad/solicitudes), Nueva Solicitud (/acceso-interoperabilidad/solicitudes/nueva), Subsanación (/acceso-interoperabilidad/solicitudes/[id]/corregir), Catálogo (/catalogo-interoperabilidad) y Proyectos (/proyectos).",
    storiesBadge: "BN-05 (PRJ-01..02) · BN-07 (SOL-01, 02, 05)",
    flows: ["interoperabilidad", "proyectos", "fuentes", "excepcional", "consumo", "operacion", "administracion"],
    actions: [
      { label: "Solicitar baja de fuente", route: "/ciclo-fuentes", huBadge: "FUE-08" },
      { label: "Alertas de consumo y tickets", route: "/operacion", huBadge: "OPS-01, INC-01" },
      { label: "Consumo por API, saldo, masivo y ampliaciones", route: "/consumo-api", huBadge: "API-01..06, ADD-01..05" },
      { label: "Entrega excepcional: solicitar y descargar", route: "/entrega-excepcional", huBadge: "EXT-01, 03, 05, 07" },
      { label: "Mis Solicitudes (BN-07)", route: "/acceso-interoperabilidad/solicitudes", huBadge: "SOL-01" },
      { label: "Nueva Solicitud (Wizard)", route: "/acceso-interoperabilidad/solicitudes/nueva", huBadge: "SOL-02" },
      { label: "Subsanar Observación (SOL-05)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-0092/corregir", huBadge: "SOL-05" },
      { label: "Explorar Catálogo", route: "/catalogo-interoperabilidad", huBadge: "CAT-01" },
      { label: "Bandeja de Proyectos", route: "/proyectos", huBadge: "PRJ-01" },
      { label: "Crear borrador de fuente (FUE-01)", route: "/proveedor/fuentes", huBadge: "FUE-01" },
    ],
    flowOverrides: {
      interoperabilidad: {
        order: 1,
        roleName: "1. Coordinador SINARP",
        userName: "Andrea López (MinEduc)",
        storiesBadge: "BN-07 · SOL-01, SOL-02, SOL-05",
        description: "Paso 1 y Subsanación del flujo BPMN BN-07. Consulta sus solicitudes de acceso (SOL-01), crea y envía nuevas solicitudes seleccionando proyecto, 1 fuente publicada, campos con finalidad individual y justificación jurídica LOPDP si incluye confidenciales (SOL-02), y subsana observaciones dentro del plazo de 3 días hábiles generando una nueva versión (SOL-05).",
        access: "Mis Solicitudes (/acceso-interoperabilidad/solicitudes), Nueva Solicitud (/acceso-interoperabilidad/solicitudes/nueva), Subsanación (/acceso-interoperabilidad/solicitudes/[id]/corregir) y Catálogo (/catalogo-interoperabilidad).",
        actions: [
          { label: "Mis Solicitudes (SOL-01)", route: "/acceso-interoperabilidad/solicitudes", huBadge: "SOL-01" },
          { label: "Nueva Solicitud (SOL-02)", route: "/acceso-interoperabilidad/solicitudes/nueva", huBadge: "SOL-02" },
          { label: "Subsanar Solicitud Observada (SOL-05)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-0092/corregir", huBadge: "SOL-05" },
          { label: "Explorar Catálogo", route: "/catalogo-interoperabilidad", huBadge: "CAT-01" },
        ],
      },
    },
  },
  {
    roleName: "Aprobador Institucional",
    userName: "Dr. Roberto Méndez",
    cedula: "1719876543",
    description: "Evalúa la pertinencia jurídica y finalidad de uso de las solicitudes de interoperabilidad. Carga informes de justificación, firma y emite resolución de aprobación o solicita ajustes.",
    access: "Bandeja de Aprobación de Solicitudes (/acceso-interoperabilidad) y dictamen jurídico.",
    storiesBadge: "SOL-10, INS-07",
    flows: ["anexo-a", "excepcional", "operacion"],
    actions: [
      { label: "Seguimiento de trámites", route: "/reportes", huBadge: "REP-05" },
      { label: "Entrega excepcional: autorizar y firmar", route: "/entrega-excepcional", huBadge: "EXT-02" },
      { label: "Evaluar Solicitudes", route: "/acceso-interoperabilidad", huBadge: "SOL-10" },
      { label: "Firmar resoluciones (Máxima Autoridad)", route: "/firma-resoluciones", huBadge: "INS-07" },
    ]
  },
  {
    roleName: "Dirección de Control y Evaluación",
    userName: "Lcda. Elena Paredes",
    cedula: "6666666666",
    description: "Vigila el cumplimiento de la Resolución 003-NG-DINARP-2023: consulta el tablero de autorizaciones excepcionales, registra controles con hallazgos y suspende una autorización de forma motivada.",
    access: "Tablero de control (/control-excepcional) y pestaña Control de cada autorización.",
    storiesBadge: "EXT-08",
    flows: ["excepcional"],
    actions: [
      { label: "Tablero de control", route: "/control-excepcional", huBadge: "EXT-08" },
      { label: "Autorizaciones excepcionales", route: "/entrega-excepcional", huBadge: "EXT-03, 08" },
    ],
  },
  {
    roleName: "Dirección Jurídica",
    userName: "Abg. Sofía Cevallos",
    cedula: "7777777777",
    description: "Prepara y firma la adenda privada con la plantilla contractual vigente cuando una ampliación de campos o de cupo fue aprobada.",
    access: "Pestaña Ampliaciones de /consumo-api.",
    storiesBadge: "ADD-04",
    flows: ["consumo", "administracion"],
    actions: [
      { label: "Regularizar efectos económicos", route: "/ciclo-fuentes", huBadge: "ECO-01" },{ label: "Firmar adendas", route: "/consumo-api", huBadge: "ADD-04" }],
  },
  {
    roleName: "Analista de Facturación",
    userName: "Lcda. Patricia Morales",
    cedula: "1718765432",
    description: "Verifica comprobantes de pago registrados en plataforma externa SIGEF para entidades con solicitudes de interoperabilidad aranceladas y emite validación formal financiera.",
    access: "Módulo Financiero y Facturación de Solicitudes (/acceso-interoperabilidad).",
    storiesBadge: "FAC-01 · PAG-01..04",
    flows: ["consumo"],
    actions: [
      { label: "Confirmar pago de adenda", route: "/consumo-api", huBadge: "ADD-06" },
      { label: "Validación de Pagos", route: "/acceso-interoperabilidad", huBadge: "PAG-02" },
    ]
  },

  // ── FLUJO INCORPORAR Y PUBLICAR FUENTE (BN-06: FUE-01 A FUE-05, FUE-10, FUE-12, CNX-01/02) ──
  {
    roleName: "Coordinador Proveedor (Entidad Emisora)",
    userName: "Carlos Mendoza (Registro Civil)",
    cedula: "1720304050",
    description: "Coordinador de la institución proveedora activa (Dirección General de Registro Civil, Identificación y Cedulación). Administra fuentes de información institucional, gestiona pruebas técnicas de conexión VPN (FUE-02), esquemas canónicos (FUE-03), publicación de fuentes (FUE-05) y atiende solicitudes de interoperabilidad.",
    access: "Gestión de Fuentes (/proveedor/fuentes), Solicitudes de Acceso (/acceso-interoperabilidad/solicitudes) y Catálogo (/catalogo-interoperabilidad).",
    storiesBadge: "BN-06 · FUE-01..05",
    flows: ["fuentes"],
    actions: [
      { label: "Mis Fuentes de Datos", route: "/proveedor/fuentes", huBadge: "FUE-01..05" },
      { label: "Solicitudes de Acceso", route: "/acceso-interoperabilidad/solicitudes", huBadge: "BN-07" },
      { label: "Catálogo de Interoperabilidad", route: "/catalogo-interoperabilidad", huBadge: "CAT-01" },
    ]
  },
  {
    roleName: "Equipo de TI / Infraestructura (DTD)",
    userName: "Carlos Mena",
    cedula: "1716543210",
    description: "Responsable técnico de conectividad y despliegue. Gestiona conectores reutilizables (CNX-01/02), homologa motores no soportados (FUE-12), analiza diagnósticos de conexión VPN (FUE-02/10), y realiza la publicación en el API Gateway (FUE-05).",
    access: "Gestión de Conectores (/tecnologia/conectores) y Homologación de Orígenes (/tecnologia/homologaciones).",
    storiesBadge: "BN-06 · CNX-01/02 · FUE-05, 12",
    flows: ["fuentes", "excepcional", "consumo", "operacion", "administracion"],
    actions: [
      { label: "Suspender y retirar fuentes", route: "/ciclo-fuentes", huBadge: "FUE-09, FUE-10" },
      { label: "Monitoreo e incidentes", route: "/operacion", huBadge: "OPS-03..05, INC-03" },
      { label: "Aprobar programaciones masivas", route: "/consumo-api", huBadge: "API-06" },
      { label: "Entrega excepcional: informe tecnológico y lotes", route: "/entrega-excepcional", huBadge: "EXT-02, 04" },
      { label: "Gestión de Conectores", route: "/tecnologia/conectores", huBadge: "CNX-01/02" },
      { label: "Homologación de Orígenes", route: "/tecnologia/homologaciones", huBadge: "FUE-12" },
    ]
  },
  {
    roleName: "Dirección de Gestión y Registro (DGR)",
    userName: "María Torres",
    cedula: "1717654321",
    description: "Revisor funcional de fuentes. Evalúa la viabilidad institucional, pertinencia de los campos expuestos, verifica la prueba técnica de conexión y emite dictamen de aprobación o rechazo (FUE-04). Suspende fuentes preventivamente ante fallos técnicos (FUE-10).",
    access: "Revisión y Aprobación de Fuentes (/gestion/fuentes).",
    storiesBadge: "BN-06 · FUE-04, 10",
    flows: ["fuentes", "consumo", "operacion"],
    actions: [
      { label: "Seguimiento de trámites", route: "/reportes", huBadge: "REP-05" },
      { label: "Coordinar programaciones masivas", route: "/consumo-api", huBadge: "API-06" },
      { label: "Revisión de Fuentes", route: "/gestion/fuentes", huBadge: "FUE-04" },
    ]
  },
  {
    roleName: "Dirección de Protección de Información (DPI)",
    userName: "Daniela Ruiz",
    cedula: "1715432109",
    description: "Oficial de privacidad y protección de datos personales. Evalúa cada campo expuesto y clasifica su sensibilidad como Accesible o Confidencial según la LOPDP; comprueba datos sintéticos o anonimizados para habilitar pruebas (FUE-04).",
    access: "Revisión y Clasificación LOPDP (/gestion/fuentes).",
    storiesBadge: "BN-06 · FUE-04 (LOPDP)",
    flows: ["fuentes"],
    actions: [
      { label: "Clasificación de Campos LOPDP", route: "/gestion/fuentes", huBadge: "FUE-04" },
    ]
  }
];

export interface FlowOption {
  id: FlowType;
  title: string;
  subtitle: string;
  description: string;
  section: "identidad" | "tramites" | "interoperabilidad" | "fuentes" | "general";
  sectionTitle?: string;
  bnCode?: string;
  tag?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FLOW_OPTIONS: FlowOption[] = [
  // ── FLUJOS DE IDENTIDAD (ID-00 A ID-15) ──
  {
    id: "id-admin",
    title: "Flujo Administrador",
    subtitle: "Cuentas internas, auditoría, coordinadores, áreas y roles",
    description: "Administrador del Sistema para ID-00 a ID-05, ID-08, ID-10, ID-11, ID-14 e ID-15",
    section: "identidad",
    sectionTitle: "Flujos de Identidad (ID-00 a ID-15)",
    tag: "ID-00 a 05, 08, 10, 11, 14, 15",
    icon: Shield,
  },
  {
    id: "id-usuario",
    title: "Usuario Habilitado",
    subtitle: "Ingreso con cédula/OTP y restablecimiento",
    description: "Autenticación 2FA Google Authenticator (ID-06) y restablecer contraseña (ID-07)",
    section: "identidad",
    tag: "ID-06 & ID-07",
    icon: KeyRound,
  },
  {
    id: "id-activacion",
    title: "Activación y Google Authenticator",
    subtitle: "Contraseña inicial y vinculación app 2FA",
    description: "Establecer contraseña inicial (ID-09) y vincular Google Authenticator (ID-12)",
    section: "identidad",
    tag: "ID-09 & ID-12",
    icon: RefreshCw,
  },

  // ── FLUJOS DE TRÁMITES INSTITUCIONALES (ANEXOS) ──
  {
    id: "anexo-a",
    title: "Flujo Anexo A",
    bnCode: "BN-01",
    subtitle: "Registro de Institución y Resolución Jurídica",
    description: "Solicitante, Gestión y Normativa",
    section: "tramites",
    sectionTitle: "Flujos de Trámites Institucionales",
    tag: "INS-01 a INS-07",
    icon: FileText,
  },
  {
    id: "anexo-b",
    title: "Flujo Anexo B",
    bnCode: "BN-02",
    subtitle: "Enrolamiento de Coordinador (Acuerdo)",
    description: "Coordinador Titular Prerregistrado y Gestión",
    section: "tramites",
    tag: "ENR-01 a ENR-04",
    icon: FileSignature,
  },
  {
    id: "anexo-c",
    title: "Flujo Anexo C",
    bnCode: "BN-03",
    subtitle: "Cambio de Coordinador (CAM-01)",
    description: "Representante Institucional y Gestión",
    section: "tramites",
    tag: "CAM-01 a CAM-03",
    icon: ArrowLeftRight,
  },
  {
    id: "suplencias",
    title: "Gestión de Suplencias (Temporal y Admin)",
    bnCode: "BN-04",
    subtitle: "Inactividad programada y activación administrativa",
    description: "Coordinador Titular (AUS-01), Administrador DINARP (AUS-02) y Conmutación de Permisos (AUS-03)",
    section: "tramites",
    tag: "AUS-01 a AUS-03",
    icon: Clock,
  },

  // ── FLUJO INTEROPERABILIDAD Y CONSUMO DE DATOS ──
  {
    id: "proyectos",
    title: "Proyectos Institucionales",
    bnCode: "BN-05",
    subtitle: "Crear y consultar proyectos (PRJ-01 y PRJ-02)",
    description: "Coordinador Institucional: gestión, consulta y solicitudes de interoperabilidad",
    section: "interoperabilidad",
    sectionTitle: "Proyectos y Solicitudes de Acceso (BN-05 y BN-07)",
    tag: "PRJ-01, 02",
    icon: FolderKanban,
  },
  {
    id: "interoperabilidad",
    title: "Solicitar y Evaluar Acceso a Fuente",
    bnCode: "BN-07",
    subtitle: "Solicitud, evaluación en Gestión, evaluación DPI (confidenciales), informe y subsanación",
    description: "1. Coordinador SINARP → 2. Director Gestión → 3. Revisor Gestión → 4. Director DPI → 5. Revisor DPI",
    section: "interoperabilidad",
    tag: "SOL-01 a SOL-08 · DPI",
    icon: Layers,
  },

  // ── FLUJO INCORPORAR Y PUBLICAR FUENTE (BN-06: FUE-01 A FUE-05, FUE-10, FUE-12, CNX-01/02) ──
  {
    id: "fuentes",
    title: "Incorporar y Publicar Fuente",
    bnCode: "BN-06",
    subtitle: "Registro de fuente, conexión VPN, mapeo de campos, clasificación y catálogo",
    description: "Coordinador Proveedor (FUE-01..03), Revisores DGR/DPI (FUE-04), TI DTD (FUE-05, 12) y Coordinador Consumidor (CAT-01)",
    section: "fuentes",
    sectionTitle: "Incorporación y Publicación de Fuentes (BN-06)",
    tag: "FUE-01..05, 10, 12 · CAT-01",
    icon: Database,
  },

  // ── ENTREGA DIRECTA Y EXCEPCIONAL (Res. 003-NG-DINARP-2023: EXT-01 a EXT-08, PAR-17, PAR-04) ──
  {
    id: "excepcional",
    title: "Entrega directa y excepcional",
    subtitle: "Solicitud, calificación, informes vinculantes, autorización, lotes, descarga, renovación y control",
    description: "Coordinador SINARP → Gestión → TI → DPI → Máxima Autoridad; Control y Evaluación vigila y suspende",
    section: "interoperabilidad",
    tag: "EXT-01 a EXT-08 · PAR-17",
    icon: Layers,
  },

  // ── CONSUMO POR API Y AMPLIACIONES (API-01 a API-06, ADD-01 a ADD-07) ──
  {
    id: "consumo",
    title: "Consumo por API y ampliaciones",
    subtitle: "Pruebas, consulta individual y masiva, saldo, programación masiva y ampliación de alcance",
    description: "Coordinador SINARP → DGR y Tecnología (masivo) · Gestión, DPI, Jurídica y Facturación (ampliaciones)",
    section: "interoperabilidad",
    tag: "API-01..06 · ADD-01..07",
    icon: Layers,
  },

  // ── OPERACIÓN Y SOPORTE (OPS-01 a 05, REP-01 a 05, INC-01 a 04, PAR-03, PAR-06) ──
  {
    id: "operacion",
    title: "Operación y soporte",
    subtitle: "Alertas, monitoreo, reportes, seguimiento de trámites e incidentes",
    description: "Coordinador, Gestión, Normatividad, Tecnología, DGR y Administrador (mesa de ayuda)",
    section: "interoperabilidad",
    tag: "OPS-01..05 · REP-01..05 · INC-01..04",
    icon: Layers,
  },

  // ── ADMINISTRACIÓN DEL PORTAL (PAR-08 a 16, FUE-08 a 11, ECO-01, INS-08 a 10, ID-00) ──
  {
    id: "administracion",
    title: "Administración del Portal",
    subtitle: "Parámetros, ciclo de vida de las fuentes, instituciones y primer Administrador",
    description: "Administrador, Normatividad, DPI, Gestión, Tecnología y Jurídica",
    section: "interoperabilidad",
    tag: "PAR-08..16 · FUE-08..11 · ECO-01 · INS-08..10 · ID-00",
    icon: Layers,
  },

  // ── GENERAL ──
  {
    id: "todos",
    title: "Ver todas las cuentas",
    subtitle: "Listado completo de roles y cédulas de prueba",
    description: "Todos los roles de DINARP, instituciones, interoperabilidad y fuentes",
    section: "general",
    sectionTitle: "Catálogo Completo",
    tag: "Todas",
    icon: Users,
  },
];

interface DinarpTestAccountsDrawerProps {
  onSelectCedula?: (cedula: string) => void;
}

export function DinarpTestAccountsDrawer({ onSelectCedula }: DinarpTestAccountsDrawerProps) {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCedula, setCopiedCedula] = useState<string | null>(null);

  const getFlowCount = (flowId: FlowType) => {
    if (flowId === "todos") return TEST_ACCOUNTS_DATA.length;
    return TEST_ACCOUNTS_DATA.filter((acc) => acc.flows.includes(flowId)).length;
  };

  const handleCopy = (cedula: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(cedula);
    setCopiedCedula(cedula);
    if (onSelectCedula) {
      onSelectCedula(cedula);
    }
    toast.success("Cédula copiada al portapapeles", {
      description: cedula,
    });
    setTimeout(() => {
      setCopiedCedula(null);
    }, 2000);
  };

  const filteredAccounts = useMemo(() => {
    if (!selectedFlow) return [];

    const matched = TEST_ACCOUNTS_DATA.filter((acc) =>
      selectedFlow === "todos" ? true : acc.flows.includes(selectedFlow)
    )
      .map((acc) => {
        const override = acc.flowOverrides?.[selectedFlow];
        if (!override) return { acc, order: 999 };
        return {
          acc: {
            ...acc,
            roleName: override.roleName ?? acc.roleName,
            userName: override.userName ?? acc.userName,
            description: override.description ?? acc.description,
            access: override.access ?? acc.access,
            storiesBadge: override.storiesBadge ?? acc.storiesBadge,
            actions: override.actions ?? acc.actions,
          },
          order: override.order,
        };
      })
      .sort((a, b) => a.order - b.order)
      .map((item) => item.acc);

    if (!searchQuery.trim()) return matched;

    const q = searchQuery.toLowerCase().trim();
    return matched.filter(
      (acc) =>
        acc.roleName.toLowerCase().includes(q) ||
        acc.userName.toLowerCase().includes(q) ||
        acc.cedula.includes(q) ||
        acc.description.toLowerCase().includes(q) ||
        acc.access.toLowerCase().includes(q) ||
        (acc.storiesBadge && acc.storiesBadge.toLowerCase().includes(q))
    );
  }, [selectedFlow, searchQuery]);

  const currentFlowConfig = FLOW_OPTIONS.find((f) => f.id === selectedFlow);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Botón flotante para alternar apertura / cierre */}
      {!isOpen && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedFlow(null);
                  setSearchQuery("");
                  setIsOpen(true);
                }}
                className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-3.5 py-2 h-auto flex items-center gap-2 border border-primary/20 backdrop-blur-md animate-fade-in group"
              >
                <Fingerprint className="size-4 shrink-0 text-white" />
                <span className="text-xs font-semibold text-white">Cuentas de prueba</span>
                <Badge
                  tone="neutral"
                  appearance="soft"
                  size="sm"
                  className="px-1.5 py-0.5 font-bold ml-1 text-[9px] h-4 bg-white/20 text-white border-0"
                >
                  {TEST_ACCOUNTS_DATA.length}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Ver roles y cédulas de prueba (ID-01 a ID-15, Anexos y Todos)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Panel flotante desplegable */}
      {isOpen && (
        <div className="w-88 sm:w-120 bg-surface/98 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl p-4 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">
                  Roles y Cédulas de Prueba
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {selectedFlow
                    ? "Haz clic para copiar la cédula al portapapeles"
                    : "¿Deseas ver un flujo en específico o todos?"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* VISTA 1: CARDS DE SELECCIÓN DE FLUJO */}
          {selectedFlow === null && (
            <div className="py-2.5 space-y-3 overflow-y-auto flex-1 pr-1 -mr-1 [scrollbar-width:thin]">
              <div className="text-[11px] font-semibold text-muted-foreground px-0.5 pt-0.5">
                Selecciona un flujo para consultar sus cuentas:
              </div>

              {(["identidad", "tramites", "interoperabilidad", "fuentes", "general"] as const).map((sectionKey) => {
                const sectionFlows = FLOW_OPTIONS.filter((f) => f.section === sectionKey);
                if (sectionFlows.length === 0) return null;
                const sectionTitle = sectionFlows[0].sectionTitle;

                return (
                  <div key={sectionKey} className="space-y-1.5">
                    {sectionTitle && (
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 pt-1 flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-primary/80 inline-block"></span>
                        <span>{sectionTitle}</span>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {sectionFlows.map((flow) => {
                        const IconComponent = flow.icon;
                        const count = getFlowCount(flow.id);

                        return (
                          <button
                            key={flow.id}
                            type="button"
                            onClick={() => {
                              setSelectedFlow(flow.id);
                              setSearchQuery("");
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-border/60 hover:border-border hover:bg-muted/40 transition-all group flex items-center justify-between"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 pr-2">
                              <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 mt-0.5">
                                <IconComponent className="size-4" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                                    {flow.title}
                                  </span>
                                  {flow.bnCode && (
                                    <Badge
                                      tone="primary"
                                      appearance="solid"
                                      size="sm"
                                      className="text-[9px] px-1.5 py-0 font-bold bg-primary text-primary-foreground shadow-xs"
                                    >
                                      {flow.bnCode}
                                    </Badge>
                                  )}
                                  <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px] px-1.5 py-0">
                                    {count} {count === 1 ? "rol" : "roles"}
                                  </Badge>
                                  {flow.tag && (
                                    <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px] px-1.5 py-0 font-mono text-muted-foreground/90">
                                      {flow.tag}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[11px] text-foreground/80 truncate">
                                  {flow.subtitle}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {flow.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VISTA 2: LISTA DE CUENTAS DEL FLUJO SELECCIONADO */}
          {selectedFlow !== null && (
            <div className="flex flex-col flex-1 min-h-0 pt-2 space-y-2">
              {/* Barra superior con volver y título */}
              <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFlow(null);
                    setSearchQuery("");
                  }}
                  className="h-7 px-2 text-xs font-semibold text-primary hover:text-primary/80 gap-1 -ml-1"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Volver a flujos</span>
                </Button>
                <div className="flex items-center gap-1.5">
                  {currentFlowConfig?.bnCode && (
                    <Badge
                      tone="primary"
                      appearance="solid"
                      size="sm"
                      className="text-[9px] px-1.5 py-0 font-bold bg-primary text-primary-foreground shadow-xs"
                    >
                      {currentFlowConfig.bnCode}
                    </Badge>
                  )}
                  <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                    {currentFlowConfig?.title}
                  </Badge>
                </div>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por rol, nombre o cédula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 bg-muted/30"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Listado de Cédulas y Roles */}
              <div className="overflow-y-auto py-1 divide-y divide-border/40 space-y-1.5 pr-1 -mr-1 flex-1 [scrollbar-width:thin]">
                {filteredAccounts.map((acc) => {
                  const isCopied = copiedCedula === acc.cedula;
                  return (
                    <div
                      key={`${selectedFlow}-${acc.cedula}-${acc.roleName}`}
                      onClick={() => handleCopy(acc.cedula)}
                      className="p-3 rounded-xl cursor-pointer transition-colors flex flex-col gap-2 group border border-border/40 hover:border-border hover:bg-muted/30"
                    >
                      {/* Cabecera: Rol, insigne discreta, usuario, cédula y botón Copiar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-foreground">
                              {acc.roleName}
                            </p>
                            {acc.storiesBadge && (
                              <Badge
                                tone={acc.storiesBadge.includes("BN-") ? "primary" : "neutral"}
                                appearance="soft"
                                size="sm"
                                className={cn(
                                  "text-[9px] px-1.5 py-0 font-mono",
                                  acc.storiesBadge.includes("BN-")
                                    ? "border-primary/40 text-primary bg-primary/10 font-semibold"
                                    : "text-muted-foreground/80"
                                )}
                              >
                                {acc.storiesBadge}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="size-3 text-muted-foreground/70 shrink-0" />
                              <span className="font-medium text-foreground/80">{acc.userName}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">Cédula:</span>
                              <span className="text-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono font-medium text-[11px]">
                                {acc.cedula}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const cleanRoleTitle = acc.roleName.replace(/^\d+\.\s*/, "").replace(/\s*[—-]\s*.*$/, "");
                              const logged = login(acc.cedula, { name: acc.userName, roleTitle: cleanRoleTitle });
                              toast.success(`Sesión activa: ${logged.name}`, {
                                description: `Rol: ${logged.roleTitle}`,
                              });
                              const defaultRoute = acc.actions?.[0]?.route ? `${acc.actions[0].route}/` : "/catalogo-interoperabilidad/";
                              router.push(defaultRoute);
                              setTimeout(() => {
                                if (typeof window !== "undefined" && window.location.pathname.includes("/login")) {
                                  window.location.assign(defaultRoute);
                                }
                              }, 350);
                            }}
                            className="text-xs h-7 px-2.5 gap-1 text-primary hover:bg-primary/10 border-primary/30 shrink-0 shadow-2xs font-medium"
                            title="Iniciar sesión directamente con este usuario"
                          >
                            <LogIn className="size-3" />
                            <span className="text-[10px] font-semibold">Entrar</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleCopy(acc.cedula, e)}
                            className="text-xs h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground shrink-0 border border-border/50 group-hover:bg-surface group-hover:border-border"
                          >
                            {isCopied ? (
                              <>
                                <Check className="size-3.5 text-success" />
                                <span className="text-[10px] text-success font-medium">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5" />
                                <span className="text-[10px]">Copiar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Bloque descriptivo: Qué hace y A qué tiene acceso */}
                      <div className="bg-muted/30 border border-border/40 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-foreground/90 shrink-0 text-[10px] uppercase tracking-wider pt-0.5">
                            Qué hace:
                          </span>
                          <span className="text-muted-foreground text-[11px] leading-snug">
                            {acc.description}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 pt-1 border-t border-border/30">
                          <span className="font-semibold text-primary shrink-0 text-[10px] uppercase tracking-wider pt-0.5">
                            Acceso:
                          </span>
                          <span className="text-foreground/90 font-medium text-[11px] leading-snug">
                            {acc.access}
                          </span>
                        </div>
                      </div>

                      {/* Botones directos a las rutas del flujo */}
                      {acc.actions && acc.actions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {acc.actions.map((act) => {
                            const routeHref = act.route.includes("?") || act.route.endsWith("/") ? act.route : `${act.route}/`;
                            return (
                              <Link
                                key={`${acc.cedula}-${act.route}`}
                                href={routeHref}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cleanRoleTitle = acc.roleName.replace(/^\d+\.\s*/, "").replace(/\s*[—-]\s*.*$/, "");
                                  const logged = login(acc.cedula, { name: acc.userName, roleTitle: cleanRoleTitle });
                                  toast.success(`Sesión activa: ${logged.name}`, {
                                    description: `Rol: ${logged.roleTitle}`,
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/25 transition-all shadow-2xs group/btn"
                              >
                                <span>{act.label}</span>
                                <ChevronRight className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No se encontraron cuentas que coincidan con la búsqueda.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2.5 mt-auto border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary inline-block"></span>
              <span>
                {selectedFlow
                  ? `${filteredAccounts.length} cuentas en este flujo`
                  : "Selecciona un flujo para ver sus cuentas"}
              </span>
            </span>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-[11px] h-6 px-2"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
