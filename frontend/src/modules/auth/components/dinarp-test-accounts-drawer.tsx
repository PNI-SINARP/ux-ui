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
  | "formalizacion"
  | "proyectos"
  | "fuentes"
  | "cambio-fuente"
  | "excepcional"
  | "consumo"
  | "ampliaciones"
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
    access: "Cuentas Internas (/cuentas-internas), Auditoría (/auditoria-cuentas), Coordinadores (/coordinadores), Catálogo de Áreas (/areas), Catálogo de Roles (/roles), Gestión de Recuperaciones (/gestion-recuperaciones) y Parámetros de Consumo (/parametros-consumo).",
    storiesBadge: "ID-00..15 · BN-04 (AUS-02) · BN-08 (PAR-01, PAG-05) · BN-09 (PAR-07)",
    flows: ["id-admin", "suplencias", "formalizacion", "consumo", "operacion", "administracion"],
    actions: [
      { label: "Parámetros, instituciones y primer Administrador", route: "/parametros-portal", huBadge: "PAR-08,09,15,16 · INS-08..10 · ID-00" },
      { label: "Parámetros de consumo y alertas (BN-09)", route: "/parametros-consumo", huBadge: "PAR-07" },
      { label: "Parámetros de soporte e incidentes", route: "/parametros-operacion", huBadge: "PAR-03, PAR-06" },
      { label: "Cuentas Internas", route: "/cuentas-internas", huBadge: "ID-01..04" },
      { label: "Auditoría de Cuentas", route: "/auditoria-cuentas", huBadge: "ID-05" },
      { label: "Gestión Coordinadores", route: "/coordinadores", huBadge: "ID-10, 11" },
      { label: "Gestión de Suplencias", route: "/gestion-suplencias", huBadge: "AUS-02" },
      { label: "Catálogo de Áreas", route: "/areas", huBadge: "ID-15" },
      { label: "Catálogo de Roles", route: "/roles", huBadge: "ID-14" },
      { label: "Recuperación Asistida", route: "/gestion-recuperaciones", huBadge: "ID-08" },
      { label: "Tarifario y pasarela (BN-08)", route: "/configuracion-financiera", huBadge: "PAR-01, PAG-05" },
    ],
    flowOverrides: {
      formalizacion: {
        order: 7,
        roleName: "7. Administrador (Tarifario y Desbloqueo de Pago)",
        userName: "Admin Portal",
        storiesBadge: "BN-08 · TAR-01..02 · PAG-00, PAG-05 · FAC-02",
        description: "Configura tarifario arancelario y parámetros de pasarela de pago (TAR-01, TAR-02, PAG-00). En el subproceso BN-08 de contingencia financiera, reintenta emisión de factura electrónica (FAC-02) y desbloquea intentos de pago del Coordinador tras divergencias (PAG-05).",
        access: "Configuración Financiera (/configuracion-financiera) y Facturación / Conciliación (/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion).",
        actions: [
          { label: "Tarifario y pasarela (TAR-01..02, PAG-00)", route: "/configuracion-financiera", huBadge: "TAR-01..02" },
          { label: "Desbloquear intentos / Reintentar factura (PAG-05)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion", huBadge: "FAC-02, PAG-05" },
        ],
      },
      consumo: {
        order: 5,
        roleName: "5. Portal (Saldo y Alerta) / Administrador",
        userName: "Admin Portal",
        storiesBadge: "BN-09 · API-04, API-05 · PAR-07",
        description: "Carril 5 del flujo BPMN BN-09 (Portal: Saldo y Alerta). Configura los umbrales globales de alerta de consumo, tamaño máximo de lote y concurrencia (PAR-07) para el descuento de saldo y emisión de alertas preventivas (API-04, API-05).",
        access: "Parámetros de Consumo (/parametros-consumo).",
        actions: [
          { label: "Parámetros de consumo, lotes y umbrales (BN-09)", route: "/parametros-consumo", huBadge: "PAR-07" },
        ],
      },
    },
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
    ]
  },
  {
    roleName: "Director Área de Gestión",
    userName: "Director Gestión",
    cedula: "1711223344",
    description: "Recibe trámites institucionales en bandejas separadas por anexo (Anexos A, B y C) y solicitudes de acceso a fuentes (BN-07). Asigna y reasigna revisores del Equipo de Gestión, autoriza la formalización final (BN-08), aprueba ampliaciones de alcance o cupo (BN-10), gestiona entregas excepcionales (BN-11) y autoriza bajas de fuentes (BN-12).",
    access: "Asignación Anexo A (/asignacion-solicitudes), Asignación Anexo B (/asignacion-anexo-b), Asignación Anexo C (/asignacion-anexo-c), Asignación Interoperabilidad (/acceso-interoperabilidad/asignacion), Formalización (/formalizacion), Ampliaciones (/consumo-api), Entrega Excepcional (/entrega-excepcional) y Ciclo de Fuentes (/ciclo-fuentes).",
    storiesBadge: "BN-01..03 · BN-07 (SOL-03) · BN-08 (FOR-01) · BN-10 (ADD-03, 06, 07) · BN-11 (EXT-02) · BN-12 (FUE-08, 11)",
    flows: ["anexo-a", "anexo-b", "anexo-c", "interoperabilidad", "formalizacion", "cambio-fuente", "excepcional", "ampliaciones", "operacion", "administracion"],
    actions: [
      { label: "Bajas, restablecimiento y plantillas (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-08, FUE-11, PAR-14, 15" },
      { label: "Reportes y anomalías", route: "/reportes", huBadge: "REP-01, OPS-02" },
      { label: "Asignar y aprobar ampliaciones (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-06, ADD-07" },
      { label: "Entrega excepcional: asignar calificación (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
      { label: "Anexo A — Asignación", route: "/asignacion-solicitudes", huBadge: "INS-04" },
      { label: "Anexo B — Asignación", route: "/asignacion-anexo-b", huBadge: "ENR-03" },
      { label: "Anexo C — Asignación", route: "/asignacion-anexo-c", huBadge: "CAM-02" },
      { label: "Asignar Revisor Fuente (BN-07)", route: "/acceso-interoperabilidad/asignacion", huBadge: "SOL-03" },
      { label: "Formalización de Acceso (BN-08)", route: "/formalizacion", huBadge: "FOR-01" },
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
      formalizacion: {
        order: 5,
        roleName: "5. Dirección de Gestión",
        userName: "Director Gestión",
        storiesBadge: "BN-08 · SOL-09, SOL-10, PAG-04",
        description: "Carril Dirección de Gestión del flujo BPMN BN-08. Recibe solicitudes públicas listas (sin pago) o privadas con contrato firmado y pago confirmado, y ejecuta «Aprobar en forma definitiva» para disparar la configuración en Apigee.",
        access: "Bandeja de Formalización y Aprobación Definitiva (/formalizacion).",
        actions: [
          { label: "Aprobar en forma definitiva (BN-08)", route: "/formalizacion", huBadge: "SOL-09, 10" },
        ],
      },
      ampliaciones: {
        order: 2,
        roleName: "2. Dirección de Gestión",
        userName: "Director Gestión",
        storiesBadge: "BN-10 · ADD-03, ADD-06, ADD-07",
        description: "Carril 2 del flujo BPMN BN-10. Recibe la solicitud de ampliación de alcance o cupo, la asigna a un revisor del Equipo de Gestión, autoriza la ampliación si no requiere adenda o aprueba en forma definitiva tras la firma de adenda y conciliación de pago para actualizar Apigee (ADD-03, ADD-06, ADD-07).",
        access: "Ampliaciones de Alcance y Cupo (/consumo-api).",
        actions: [
          { label: "Asignar, autorizar y aprobar ampliaciones (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-06, ADD-07" },
        ],
      },
      excepcional: {
        order: 2,
        roleName: "2. Dirección de Gestión (Asignación y Supervisión)",
        userName: "Director Gestión",
        storiesBadge: "BN-11 · EXT-02",
        description: "Carril 2 del flujo BPMN BN-11 (Entrega directa y excepcional). Recibe la solicitud firmada por el Coordinador SINARP o la solicitud de renovación, asigna la calificación de admisibilidad y la elaboración del informe final al Equipo de Gestión y supervisa el cumplimiento de plazos (EXT-02).",
        access: "Bandeja de Entrega Directa y Excepcional (/entrega-excepcional).",
        actions: [
          { label: "Asignar calificación e informe final (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
        ],
      },
      "cambio-fuente": {
        order: 2,
        roleName: "2. Dirección de Gestión (Aprobar Baja / Restablecimiento)",
        userName: "Director Gestión",
        storiesBadge: "BN-12 · FUE-08, FUE-11",
        description: "Flujo BPMN BN-12 (Cambio, suspensión o extinción de fuente). Evalúa el impacto sobre las instituciones consumidoras activas y autoriza o rechaza la solicitud de extinción/baja definitiva o restablecimiento de la fuente (FUE-08, FUE-11).",
        access: "Ciclo de Vida de Fuentes (/ciclo-fuentes).",
        actions: [
          { label: "Evaluar bajas y restablecimiento de fuentes (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-08, FUE-11" },
        ],
      },
    },
  },
  {
    roleName: "Revisor Área de Gestión",
    userName: "Ana Torres (Revisor)",
    cedula: "1111111111",
    description: "Evalúa expedientes en bandejas independientes para Anexo A, Anexo B y Anexo C, solicitudes de acceso a fuentes (BN-07), ampliaciones de alcance o cupo (BN-10), entregas excepcionales (BN-11) y cambios o suspensiones de fuentes (BN-12).",
    access: "Revisión Anexo A (/solicitudes-pendientes), Revisión Anexo B (/revision-anexo-b), Revisión Anexo C (/revision-anexo-c), Revisión Interoperabilidad (/revision-gestion), Ampliaciones (/consumo-api), Entrega Excepcional (/entrega-excepcional) y Ciclo de Fuentes (/ciclo-fuentes).",
    storiesBadge: "BN-01..03 · BN-07 (SOL-04) · BN-10 (ADD-03, 06, 07) · BN-11 (EXT-02) · BN-12 (FUE-06..08, 11)",
    flows: ["anexo-a", "anexo-b", "anexo-c", "interoperabilidad", "cambio-fuente", "excepcional", "ampliaciones", "operacion", "administracion"],
    actions: [
      { label: "Cambio, suspensión y restablecimiento de fuentes (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-06..08, FUE-11" },
      { label: "Revisar anomalías de consumo", route: "/operacion", huBadge: "OPS-02" },
      { label: "Revisar ampliaciones de alcance y cupo (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-06, ADD-07" },
      { label: "Entrega excepcional: calificar e informe final (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
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
      ampliaciones: {
        order: 3,
        roleName: "3. Equipo de Gestión (Revisor)",
        userName: "Ana Torres (Revisor)",
        storiesBadge: "BN-10 · ADD-03, ADD-06, ADD-07",
        description: "Carril 3 del flujo BPMN BN-10. Evalúa la justificación funcional de los nuevos campos solicitados o del incremento de cupo mensual y emite su dictamen/recomendación (derivando a DPI si la ampliación incluye campos confidenciales) (ADD-03, ADD-06, ADD-07).",
        access: "Evaluación de Ampliaciones (/consumo-api).",
        actions: [
          { label: "Revisar y recomendar ampliación (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-06, ADD-07" },
        ],
      },
      excepcional: {
        order: 3,
        roleName: "3. Equipo de Gestión (Calificación e Informe Final)",
        userName: "Ana Torres (Revisor)",
        storiesBadge: "BN-11 · EXT-02, EXT-07",
        description: "Carril 3 del flujo BPMN BN-11. Verifica que la solicitud cumpla los supuestos de la Res. 003-NG-DINARP-2023 (`¿Supera calificación?`): si no cumple observa para subsanación; si se admite, solicita los informes vinculantes a TI y DPI, consolida el informe final de recomendación y gestiona renovaciones (EXT-02, EXT-07).",
        access: "Calificación e Informe Final de Entrega Excepcional (/entrega-excepcional).",
        actions: [
          { label: "Calificar admisibilidad y emitir informe final (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02, EXT-07" },
        ],
      },
      "cambio-fuente": {
        order: 3,
        roleName: "3. Equipo de Gestión (Evaluar Cambio, Suspensión o Baja)",
        userName: "Ana Torres (Revisor)",
        storiesBadge: "BN-12 · FUE-06, FUE-07, FUE-08, FUE-11",
        description: "Carril 2 del flujo BPMN BN-12 (`Equipo de Gestión`). Revisa la notificación de cambio de estructura, suspensión programada o extinción enviada por el Coordinador proveedor (`¿Cambio es compatible?` / `¿Solicitud de baja?`), coordina notificaciones y restablece fuentes suspendidas (FUE-06 a FUE-08, FUE-11).",
        access: "Ciclo de Vida de Fuentes (/ciclo-fuentes).",
        actions: [
          { label: "Revisar cambio, suspensión o baja de fuente (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-06..08, FUE-11" },
        ],
      },
    },
  },
  {
    roleName: "Director de Normatividad",
    userName: "Director Normativa",
    cedula: "2222222222",
    description: "Recibe expedientes de incorporación institucional (Anexo A) aprobados por Gestión, asigna al Analista de Normatividad, da el visto bueno final a la resolución antes de la firma de la Máxima Autoridad y administra los parámetros normativos de entrega excepcional (BN-11 · PAR-17).",
    access: "Elaborar resoluciones (/revision-normativa) y Parámetros de Entrega Excepcional (/parametros-excepcional).",
    storiesBadge: "BN-01 (INS-06, 07) · BN-11 (PAR-17)",
    flows: ["anexo-a", "excepcional", "operacion", "administracion"],
    actions: [
      { label: "Plantilla de la resolución", route: "/parametros-portal", huBadge: "PAR-14" },
      { label: "Reportes y trazabilidad por cédula", route: "/reportes", huBadge: "REP-02..04" },
      { label: "Parámetros de la entrega excepcional (BN-11)", route: "/parametros-excepcional", huBadge: "PAR-17" },
      { label: "Elaborar resoluciones (Anexo A)", route: "/revision-normativa", huBadge: "INS-06, 07" },
    ],
    flowOverrides: {
      excepcional: {
        order: 9,
        roleName: "9. Dirección de Normatividad (Parámetros Res. 003-NG-DINARP-2023)",
        userName: "Director Normativa",
        storiesBadge: "BN-11 · PAR-17",
        description: "Configura y publica las versiones de parámetros normativos del flujo BN-11: catálogo de supuestos habilitantes, mínimo de supuestos requeridos, plazos de calificación/informes, vigencia máxima de autorización y número máximo de renovaciones (PAR-17).",
        access: "Parámetros de Entrega Excepcional (/parametros-excepcional).",
        actions: [
          { label: "Configurar supuestos y plazos de entrega excepcional (BN-11)", route: "/parametros-excepcional", huBadge: "PAR-17" },
        ],
      },
    },
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
    description: "Recibe solicitudes de acceso a fuentes con campos confidenciales aprobadas por Gestión (BN-07), ampliaciones con campos confidenciales (BN-10) y solicitudes de entrega excepcional (BN-11); asigna o reasigna revisores del Equipo DPI y suscribe la segunda firma electrónica del informe vinculante (SOL-07, SOL-08, ADD-07, EXT-02).",
    access: "Asignar revisiones DPI (/revision-normativa/asignacion), Firmar informes DPI (/revision-normativa/asignacion?tab=informes), Ampliaciones (/consumo-api) y Entrega Excepcional (/entrega-excepcional).",
    storiesBadge: "BN-07 (SOL-07, 08) · BN-10 (ADD-03, 07) · BN-11 (EXT-02)",
    flows: ["interoperabilidad", "excepcional", "ampliaciones", "administracion"],
    actions: [
      { label: "Plantilla del informe de recomendación", route: "/parametros-portal", huBadge: "PAR-14" },
      { label: "Firmar informe de ampliación (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-07" },
      { label: "Entrega excepcional: informe de DPI (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
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
      ampliaciones: {
        order: 5,
        roleName: "5. Director de Protección de la Información (DPI)",
        userName: "Director DPI",
        storiesBadge: "BN-10 · ADD-03, ADD-07",
        description: "Carril 4 del flujo BPMN BN-10 (cuando la ampliación incluye campos confidenciales). Asigna la revisión LOPDP y suscribe la 2.ª firma electrónica del informe de recomendación de DPI antes de pasar a adenda o autorización final (ADD-03, ADD-07).",
        access: "Evaluación DPI de Ampliaciones (/consumo-api).",
        actions: [
          { label: "Firmar informe DPI de ampliación (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-07" },
        ],
      },
      excepcional: {
        order: 5,
        roleName: "5. Dirección de Protección de la Información (Director DPI)",
        userName: "Director DPI",
        storiesBadge: "BN-11 · EXT-02",
        description: "Carril 4 del flujo BPMN BN-11 (`DPI`). Tras el informe tecnológico de TI, asigna al revisor de DPI y suscribe el informe vinculante de protección de datos sobre los campos solicitados en la entrega excepcional (EXT-02).",
        access: "Bandeja e Informes de Entrega Excepcional (/entrega-excepcional).",
        actions: [
          { label: "Suscribir informe vinculante de DPI (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
        ],
      },
    },
  },
  {
    roleName: "Revisor de Protección de la Información (DPI)",
    userName: "Carlos Mora (Revisor DPI)",
    cedula: "5555555555",
    description: "Evalúa los campos confidenciales solicitados y su justificación jurídica LOPDP en solicitudes iniciales (BN-07), ampliaciones de alcance (BN-10) y entregas excepcionales (BN-11). Registra observaciones o elabora el informe vinculante (SOL-07, SOL-08, ADD-07, EXT-02).",
    access: "Evaluar datos confidenciales (/revision-normativa/fuentes), Elaborar informes DPI (/revision-normativa/fuentes?tab=informes), Ampliaciones (/consumo-api) y Entrega Excepcional (/entrega-excepcional).",
    storiesBadge: "BN-07 (SOL-07, 08) · BN-10 (ADD-03, 07) · BN-11 (EXT-02)",
    flows: ["interoperabilidad", "excepcional", "ampliaciones"],
    actions: [
      { label: "Revisar campos confidenciales de ampliación (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-07" },
      { label: "Entrega excepcional: informe de DPI (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
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
      ampliaciones: {
        order: 4,
        roleName: "4. Dirección de Protección de la Información (Revisor DPI)",
        userName: "Carlos Mora (Revisor DPI)",
        storiesBadge: "BN-10 · ADD-03, ADD-07",
        description: "Carril 4 del flujo BPMN BN-10 (`¿Incluye campos confidenciales?` = Sí). Evalúa la justificación jurídica LOPDP de los nuevos campos confidenciales solicitados en la ampliación y suscribe la 1.ª firma del informe favorable (ADD-03, ADD-07).",
        access: "Evaluación DPI de Ampliaciones (/consumo-api).",
        actions: [
          { label: "Evaluar campos confidenciales de ampliación (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-07" },
        ],
      },
      excepcional: {
        order: 6,
        roleName: "6. Equipo de Protección de la Información (Revisor DPI)",
        userName: "Carlos Mora (Revisor DPI)",
        storiesBadge: "BN-11 · EXT-02",
        description: "Carril 4 del flujo BPMN BN-11 (`DPI`). Evalúa la proporcionalidad, finalidad y medidas de resguardo de los campos solicitados en la entrega excepcional y elabora el informe técnico-jurídico vinculante de DPI (EXT-02).",
        access: "Evaluación DPI de Entrega Excepcional (/entrega-excepcional).",
        actions: [
          { label: "Elaborar informe vinculante de DPI (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
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
    description: "Coordinador SINARP de entidad requirente. Elige proyecto y 1 fuente publicada, selecciona campos y cupo, declara finalidad por campo y justificación jurídica si hay confidenciales, envía solicitud (SOL-02), subsana observaciones (SOL-05), consume la API (BN-09), solicita ampliaciones de alcance o cupo (BN-10) y tramita entregas excepcionales (BN-11).",
    access: "Mis Solicitudes (/acceso-interoperabilidad/solicitudes), Nueva Solicitud (/acceso-interoperabilidad/solicitudes/nueva), Subsanación (/acceso-interoperabilidad/solicitudes/[id]/corregir), Catálogo (/catalogo-interoperabilidad), Proyectos (/proyectos), Consumo por API / Ampliaciones (/consumo-api) y Entrega Excepcional (/entrega-excepcional).",
    storiesBadge: "BN-05 (PRJ-01..02) · BN-07 (SOL-01, 02, 05) · BN-08 (DOC-02, PAG-01, ACC-02) · BN-09 (API-01..06) · BN-10 (ADD-01..06) · BN-11 (EXT-01, 03, 05, 07) · BN-12 (FUE-06..08)",
    flows: ["interoperabilidad", "formalizacion", "proyectos", "cambio-fuente", "excepcional", "consumo", "ampliaciones", "operacion"],
    actions: [
      { label: "Soporte e incidentes", route: "/soporte", huBadge: "INC-01" },
      { label: "Consumo por API, saldo y programación masiva (BN-09)", route: "/consumo-api", huBadge: "API-01..06" },
      { label: "Solicitar ampliación de alcance o cupo (BN-10)", route: "/consumo-api", huBadge: "ADD-01..06" },
      { label: "Entrega excepcional: solicitar y descargar (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-01, 03, 05, 07" },
      { label: "Mis Solicitudes (BN-07 / BN-08)", route: "/acceso-interoperabilidad/solicitudes", huBadge: "SOL-01, ACC-02" },
      { label: "Nueva Solicitud (Wizard)", route: "/acceso-interoperabilidad/solicitudes/nueva", huBadge: "SOL-02" },
      { label: "Subsanar Observación (SOL-05)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-0092/corregir", huBadge: "SOL-05" },
      { label: "Firmar Contrato Privado (BN-08)", route: "/formalizacion/contratos", huBadge: "DOC-02" },
      { label: "Pagar Factura Electrónica (BN-08)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion", huBadge: "FAC-01, PAG-01" },
      { label: "Explorar Catálogo", route: "/catalogo-interoperabilidad", huBadge: "CAT-01" },
      { label: "Bandeja de Proyectos", route: "/proyectos", huBadge: "PRJ-01" },
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
      formalizacion: {
        order: 2,
        roleName: "2. Coordinador SINARP",
        userName: "Andrea López (Entidad Privada / Pública)",
        storiesBadge: "BN-08 · CON-03 · FAC-01 · PAG-01 · ACC-02",
        description: "Carril 2 del flujo BPMN BN-08. Si es institución privada: suscribe 1.ª firma del contrato electrónico (CON-03) y paga la factura electrónica mediante pasarela de pago o comprobante bancario (FAC-01, PAG-01). Finalmente recibe el acceso habilitado y consulta sus credenciales API (ACC-02).",
        access: "Contratos Privados (/formalizacion/contratos), Facturación y Pago (/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion) y Mis Solicitudes / Credenciales (/acceso-interoperabilidad/solicitudes).",
        actions: [
          { label: "Firmar Contrato (1.ª Firma · CON-03)", route: "/formalizacion/contratos", huBadge: "CON-03" },
          { label: "Pagar Factura Electrónica (PAG-01)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion", huBadge: "FAC-01, PAG-01" },
          { label: "Ver Credenciales y Acceso Habilitado (ACC-02)", route: "/acceso-interoperabilidad/solicitudes", huBadge: "ACC-02" },
        ],
      },
      consumo: {
        order: 1,
        roleName: "1. Aplicativo de la Institución / Coordinador SINARP",
        userName: "Andrea López (MinEduc / Privada)",
        storiesBadge: "BN-09 · API-01..06",
        description: "Carril 1 del flujo BPMN BN-09 (Consumo de la API). Realiza petición a la API en ambiente de pruebas (API-01) o producción (individual API-02 / masiva API-03), recibe la respuesta filtrada según su alcance, consulta el saldo de consultas y alertas de umbral (API-04, API-05) y programa cargas masivas (API-06).",
        access: "Consumo por API, Saldo y Programación Masiva (/consumo-api).",
        actions: [
          { label: "Consumo por API, Saldo y Programación Masiva (BN-09)", route: "/consumo-api", huBadge: "API-01..06" },
        ],
      },
      ampliaciones: {
        order: 1,
        roleName: "1. Coordinador SINARP (Solicitante de Ampliación)",
        userName: "Andrea López (MinEduc / Privada)",
        storiesBadge: "BN-10 · ADD-01, ADD-02, ADD-04, ADD-05, ADD-06",
        description: "Carril 1 y Subproceso Institución Consumidora del flujo BPMN BN-10. Inicia la solicitud eligiendo entre «Ampliar campos» de una fuente activa (ADD-01, ADD-02) o «Ampliar cupo» mensual de consultas (ADD-05). Si aplica adenda para institución privada, suscribe la 1.ª firma de la adenda (ADD-04) y registra el pago del diferencial (ADD-06).",
        access: "Ampliaciones de Alcance y Cupo (/consumo-api).",
        actions: [
          { label: "Solicitar ampliación de campos o cupo (BN-10)", route: "/consumo-api", huBadge: "ADD-01, ADD-02, ADD-05" },
          { label: "Firmar adenda y registrar pago (BN-10)", route: "/consumo-api", huBadge: "ADD-04, ADD-06" },
        ],
      },
      excepcional: {
        order: 1,
        roleName: "1. Coordinador SINARP (Solicitante y Descarga de Lotes)",
        userName: "Andrea López (MinEduc)",
        storiesBadge: "BN-11 · EXT-01, EXT-03, EXT-05, EXT-07",
        description: "Carril 1 del flujo BPMN BN-11 (Entrega directa y excepcional). Solicita entrega directa/excepcional o renovación declarando supuestos habilitantes de la Res. 003-NG-DINARP-2023 y firmando con FirmaEC (EXT-01, EXT-07), subsana observaciones dentro de plazo, ejecuta/programa lotes de extracción sobre autorizaciones vigentes (EXT-03) y descarga paquetes dentro de la vigencia del enlace verificando la eliminación posterior (EXT-05).",
        access: "Bandeja de Entrega Excepcional (/entrega-excepcional) y Nueva Solicitud (/entrega-excepcional/nueva).",
        actions: [
          { label: "Bandeja, lotes y descargas excepcionales (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-01, 03, 05, 07" },
          { label: "Nueva solicitud de entrega excepcional (BN-11)", route: "/entrega-excepcional/nueva", huBadge: "EXT-01" },
        ],
      },
      "cambio-fuente": {
        order: 5,
        roleName: "5. Institución Consumidora (Coordinador SINARP)",
        userName: "Andrea López (MinEduc)",
        storiesBadge: "BN-12 · FUE-06, FUE-07, FUE-08",
        description: "Carril 4 del flujo BPMN BN-12 (`Instituciones consumidoras`). Recibe la notificación anticipada de cambio de estructura, suspensión programada o extinción definitiva de la fuente y gestiona el impacto sobre sus proyectos y accesos activos (FUE-06 a FUE-08).",
        access: "Mis Solicitudes y Accesos (/acceso-interoperabilidad/solicitudes) y Catálogo (/catalogo-interoperabilidad).",
        actions: [
          { label: "Ver accesos impactados por cambio/suspensión de fuente (BN-12)", route: "/acceso-interoperabilidad/solicitudes", huBadge: "FUE-06..08" },
        ],
      },
    },
  },
  {
    roleName: "Máxima Autoridad DINARP",
    userName: "Dr. Roberto Méndez",
    cedula: "1719876543",
    description: "Suscribe electrónicamente las resoluciones de incorporación institucional (Anexo A · INS-07), firma la 2.ª firma en contratos privados de interoperabilidad (BN-08 · DOC-02) y adendas de ampliación (BN-10 · ADD-04), autoriza entregas excepcionales (BN-11 · EXT-02) y consulta el seguimiento ejecutivo de trámites (REP-05).",
    access: "Firma de Resoluciones (/firma-resoluciones), Firma de Contratos (/formalizacion/contratos), Adendas (/consumo-api), Entrega Excepcional (/entrega-excepcional) y Reportes (/reportes).",
    storiesBadge: "BN-01 (INS-07) · BN-08 (DOC-02) · BN-10 (ADD-04) · BN-11 (EXT-02) · REP-05",
    flows: ["anexo-a", "formalizacion", "excepcional", "ampliaciones", "operacion"],
    actions: [
      { label: "Firmar resoluciones (Máxima Autoridad)", route: "/firma-resoluciones", huBadge: "INS-07" },
      { label: "Firmar Contrato Privado (2.ª Firma · BN-08)", route: "/formalizacion/contratos", huBadge: "DOC-02" },
      { label: "Firmar Adenda de Ampliación (2.ª Firma · BN-10)", route: "/consumo-api", huBadge: "ADD-04" },
      { label: "Entrega excepcional: autorizar y firmar (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02" },
      { label: "Seguimiento ejecutivo de trámites", route: "/reportes", huBadge: "REP-05" },
    ],
    flowOverrides: {
      formalizacion: {
        order: 3,
        roleName: "3. Máxima Autoridad DINARP",
        userName: "Dr. Roberto Méndez",
        storiesBadge: "BN-08 · DOC-02",
        description: "Carril 4 del flujo BPMN BN-08 (Firmar contrato). Una vez firmado el contrato por el Coordinador SINARP de la institución privada, la Máxima Autoridad DINARP suscribe la 2.ª firma electrónica perfeccionando el contrato y disparando la emisión de factura electrónica.",
        access: "Gestión Contractual (/formalizacion/contratos).",
        actions: [
          { label: "Firmar Contrato (2.ª Firma · DOC-02)", route: "/formalizacion/contratos", huBadge: "DOC-02" },
        ],
      },
      ampliaciones: {
        order: 7,
        roleName: "7. Máxima Autoridad DINARP (2.ª Firma Adenda)",
        userName: "Dr. Roberto Méndez",
        storiesBadge: "BN-10 · ADD-04",
        description: "Subproceso de Firma de Adenda del flujo BPMN BN-10. Suscribe la 2.ª firma electrónica de la adenda contractual privada para perfeccionar el instrumento jurídico antes del cobro y actualización en Apigee (ADD-04).",
        access: "Adendas de Ampliación (/consumo-api) y Gestión Contractual (/formalizacion/contratos).",
        actions: [
          { label: "Suscribir 2.ª firma en adenda (BN-10)", route: "/consumo-api", huBadge: "ADD-04" },
        ],
      },
      excepcional: {
        order: 7,
        roleName: "7. Máxima Autoridad DINARP (Autorización y Firma)",
        userName: "Dr. Roberto Méndez",
        storiesBadge: "BN-11 · EXT-02, EXT-07",
        description: "Carril 6 del flujo BPMN BN-11 (`Máxima Autoridad`). Revisa los informes vinculantes (tecnológico, DPI e informe final de Gestión) y decide autorizar o rechazar la entrega directa y excepcional o su renovación mediante firma electrónica de la resolución (EXT-02, EXT-07).",
        access: "Autorización de Entrega Excepcional (/entrega-excepcional).",
        actions: [
          { label: "Autorizar o rechazar entrega excepcional (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02, EXT-07" },
        ],
      },
    },
  },
  {
    roleName: "Dirección de Control y Evaluación",
    userName: "Lcda. Elena Paredes",
    cedula: "6666666666",
    description: "Vigila el cumplimiento de la Resolución 003-NG-DINARP-2023 (BN-11): consulta el tablero de autorizaciones excepcionales, registra controles con hallazgos y suspende una autorización de forma motivada.",
    access: "Tablero de control (/control-excepcional) y pestaña Control de cada autorización.",
    storiesBadge: "BN-11 · EXT-08",
    flows: ["excepcional"],
    actions: [
      { label: "Tablero de control de autorizaciones (BN-11)", route: "/control-excepcional", huBadge: "EXT-08" },
    ],
    flowOverrides: {
      excepcional: {
        order: 8,
        roleName: "8. Dirección de Control y Evaluación (Control y Suspensión)",
        userName: "Lcda. Elena Paredes",
        storiesBadge: "BN-11 · EXT-08",
        description: "Carril 5 del subproceso de ejecución y control del flujo BPMN BN-11 (`Área de Control y Evaluación`). Realiza verificaciones posteriores sobre autorizaciones vigentes, registra controles sin novedad o con hallazgos (`¿Presenta hallazgos?`) y suspende motivadamente la autorización cancelando lotes pendientes (EXT-08).",
        access: "Tablero de Control Excepcional (/control-excepcional) y Detalle de Autorización (/entrega-excepcional).",
        actions: [
          { label: "Tablero de control y suspensión de autorizaciones (BN-11)", route: "/control-excepcional", huBadge: "EXT-08" },
        ],
      },
    },
  },
  {
    roleName: "Dirección Jurídica",
    userName: "Abg. Sofía Cevallos",
    cedula: "7777777777",
    description: "Gestiona plantillas de contrato privado (PAR-02), genera borradores contractuales con variables autocompletadas para instituciones privadas (DOC-01), verifica firmas bilaterales (DOC-03) y prepara adendas cuando se aprueban ampliaciones de alcance o cupo (BN-10 · ADD-04).",
    access: "Contratos de Acceso (/formalizacion/contratos) y Adendas de Ampliación (/consumo-api).",
    storiesBadge: "BN-08 (DOC-01..03, PAR-02) · BN-10 (ADD-04)",
    flows: ["formalizacion", "ampliaciones"],
    actions: [
      { label: "Contratos de acceso privado (BN-08)", route: "/formalizacion/contratos", huBadge: "DOC-01..03, PAR-02" },
      { label: "Adendas de ampliación contractual (BN-10)", route: "/consumo-api", huBadge: "ADD-04" },
    ],
    flowOverrides: {
      formalizacion: {
        order: 1,
        roleName: "1. Jurídica (Dirección Jurídica)",
        userName: "Abg. Sofía Cevallos",
        storiesBadge: "BN-08 · DOC-01..03, PAR-02",
        description: "Carril 3 del flujo BPMN BN-08 (Generar contrato). Cuando la solicitud lista para formalizar pertenece a una institución privada ('Sí' en compuerta ¿Institución privada?), Jurídica administra la plantilla vigente (PAR-02), genera el borrador contractual autocompletado (DOC-01) y lo envía a firma del Coordinador SINARP y Máxima Autoridad (DOC-02, DOC-03).",
        access: "Contratos de Acceso (/formalizacion/contratos).",
        actions: [
          { label: "Contratos de Acceso y Plantillas (DOC-01..03)", route: "/formalizacion/contratos", huBadge: "DOC-01..03, PAR-02" },
        ],
      },
      ampliaciones: {
        order: 6,
        roleName: "6. Jurídica (Generar y Validar Adenda)",
        userName: "Abg. Sofía Cevallos",
        storiesBadge: "BN-10 · ADD-04",
        description: "Carril 5 del flujo BPMN BN-10 (`¿Requiere adenda?` = Sí). Genera la adenda al contrato de interoperabilidad autocompletando los nuevos campos o el nuevo cupo mensual y verifica las firmas electrónicas del Coordinador SINARP y la Máxima Autoridad (ADD-04).",
        access: "Adendas de Ampliación Contractual (/consumo-api).",
        actions: [
          { label: "Generar y validar adenda contractual (BN-10)", route: "/consumo-api", huBadge: "ADD-04" },
        ],
      },
    },
  },
  {
    roleName: "Analista de Facturación",
    userName: "Lcda. Patricia Morales",
    cedula: "1718765432",
    description: "Procesa cobros y concilia pagos de facturas electrónicas de instituciones privadas en el flujo BN-08 (FAC-01..02, PAG-02..05), resuelve divergencias de monto o estado con pasarela y confirma pagos de adendas de ampliación en BN-10 (ADD-06).",
    access: "Tarifario y Pasarela (/configuracion-financiera), Facturación y Conciliación (/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion) y Cobro de Adendas (/consumo-api).",
    storiesBadge: "BN-08 (FAC-01..02, PAG-01..05) · BN-10 (ADD-06)",
    flows: ["formalizacion", "ampliaciones"],
    actions: [
      { label: "Tarifario y Pasarela (PAR-01, PAG-00)", route: "/configuracion-financiera", huBadge: "PAR-01, PAG-00" },
      { label: "Facturación y Conciliación (BN-08)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion", huBadge: "FAC-01..02, PAG-02..05" },
      { label: "Confirmar pago de adenda (BN-10)", route: "/consumo-api", huBadge: "ADD-06" },
    ],
    flowOverrides: {
      formalizacion: {
        order: 4,
        roleName: "4. Pasarela de Pago / Financiero",
        userName: "Lcda. Patricia Morales",
        storiesBadge: "BN-08 · FAC-01..02 · PAG-01..05",
        description: "Carril 5 y Subproceso financiero del flujo BPMN BN-08. Tras la 2.ª firma del contrato, el Portal emite factura electrónica (FAC-01) o encola reintentos si falla (FAC-02). Procesa el cobro y concilia el pago de la factura (PAG-02..04); si el pago es confirmado pasa a Dirección de Gestión, o ejecuta el subproceso de conciliar divergencias y desbloquear intentos (PAG-05).",
        access: "Facturación y Pasarela (/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion) y Configuración Financiera (/configuracion-financiera).",
        actions: [
          { label: "Procesar Cobro y Conciliar Factura (BN-08)", route: "/acceso-interoperabilidad/solicitudes/SOL-2026-005/facturacion", huBadge: "FAC-01..02, PAG-01..05" },
          { label: "Tarifario y Pasarela (PAR-01, PAG-00)", route: "/configuracion-financiera", huBadge: "PAR-01, PAG-00" },
        ],
      },
      ampliaciones: {
        order: 8,
        roleName: "8. Pasarela de Pago / Financiero (Adendas)",
        userName: "Lcda. Patricia Morales",
        storiesBadge: "BN-10 · ADD-05, ADD-06",
        description: "Carril 6 del flujo BPMN BN-10. Procesa el cobro y concilia el pago de la factura generada tras la firma de la adenda privada (`¿Pago confirmado?`) para habilitar la aprobación definitiva y actualización de cupo en Apigee (ADD-06).",
        access: "Facturación y Cobro de Adendas (/consumo-api).",
        actions: [
          { label: "Confirmar pago de adenda (BN-10)", route: "/consumo-api", huBadge: "ADD-06" },
        ],
      },
    },
  },

  // ── FLUJO INCORPORAR Y PUBLICAR FUENTE (BN-06: FUE-01 A FUE-05, FUE-10, FUE-12, CNX-01/02) Y CAMBIO/EXTINCIÓN (BN-12: FUE-06..08) ──
  {
    roleName: "Coordinador Proveedor (Entidad Emisora)",
    userName: "Carlos Mendoza (Registro Civil)",
    cedula: "1720304050",
    description: "Coordinador de la institución proveedora activa (Dirección General de Registro Civil, Identificación y Cedulación). Administra fuentes de información institucional, gestiona pruebas técnicas de conexión VPN (FUE-02), esquemas canónicos (FUE-03), publicación de fuentes (FUE-05), responde peticiones de datos (BN-09) y notifica cambios, suspensión o extinción de fuentes (BN-12: FUE-06 a FUE-08).",
    access: "Mis Fuentes de Datos (/proveedor/fuentes), Ciclo de las Fuentes (/ciclo-fuentes) y Catálogo (/catalogo-interoperabilidad).",
    storiesBadge: "BN-06 (FUE-01..05) · BN-09 (API-02..03, 06) · BN-12 (FUE-06..08)",
    flows: ["fuentes", "cambio-fuente", "consumo", "administracion"],
    actions: [
      { label: "Mis Fuentes de Datos (BN-06)", route: "/proveedor/fuentes", huBadge: "FUE-01..05" },
      { label: "Cambio, suspensión o baja de fuente (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-06..08" },
      { label: "Catálogo de Interoperabilidad", route: "/catalogo-interoperabilidad", huBadge: "CAT-01" },
    ],
    flowOverrides: {
      consumo: {
        order: 3,
        roleName: "3. Fuente de Datos (Coordinador Proveedor)",
        userName: "Carlos Mendoza (Registro Civil)",
        storiesBadge: "BN-09 · API-02, API-03, API-06",
        description: "Carril 4 del flujo BPMN BN-09 (Fuente de Datos). Procesa las consultas productivas individuales (API-02) y por lotes (API-03) enviadas por la API de Interoperabilidad DINARP y coordina la disponibilidad para ventanas de carga masiva (API-06).",
        access: "Mis Fuentes de Datos (/proveedor/fuentes).",
        actions: [
          { label: "Mis Fuentes de Datos (BN-09)", route: "/proveedor/fuentes", huBadge: "API-02..03, API-06" },
        ],
      },
      "cambio-fuente": {
        order: 1,
        roleName: "1. Coordinador Proveedor (Notificar Cambio, Suspensión o Baja)",
        userName: "Carlos Mendoza (Registro Civil)",
        storiesBadge: "BN-12 · FUE-06, FUE-07, FUE-08",
        description: "Carril 1 del flujo BPMN BN-12 (`Coordinador proveedor`). Inicia el proceso registrando una notificación de cambio en la estructura de la fuente (FUE-06), una suspensión temporal programada (FUE-07) o una solicitud motivada de extinción/baja definitiva (FUE-08).",
        access: "Ciclo de Vida de Fuentes (/ciclo-fuentes) y Mis Fuentes (/proveedor/fuentes).",
        actions: [
          { label: "Notificar cambio, suspensión o baja de fuente (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-06..08" },
          { label: "Mis Fuentes de Datos", route: "/proveedor/fuentes", huBadge: "FUE-01..05" },
        ],
      },
    },
  },
  {
    roleName: "Equipo de TI / Infraestructura (DTD)",
    userName: "Carlos Mena",
    cedula: "1716543210",
    description: "Responsable técnico de conectividad, API Gateway Apigee y despliegue. Configura acceso y credenciales en Apigee y gestiona su ciclo de vida (BN-08: ACC-01 a ACC-08), valida políticas en consumo API (BN-09), sincroniza ampliaciones en Apigee (BN-10: ACC-08), emite informe tecnológico y ejecuta lotes en entregas excepcionales (BN-11: EXT-02, 04), ejecuta suspensiones/bajas técnicas de fuentes (BN-12: FUE-06..08, 10), administra conectores (CNX-01/02) y publica fuentes (FUE-05).",
    access: "Acceso y Ciclo de Vida Apigee (/acceso-consumo), Consumo y Ampliaciones (/consumo-api), Entrega Excepcional (/entrega-excepcional), Ciclo de Fuentes (/ciclo-fuentes), Gestión de Conectores (/tecnologia/conectores) y Homologación de Orígenes (/tecnologia/homologaciones).",
    storiesBadge: "BN-06 (CNX-01/02, FUE-05, 12) · BN-08 (ACC-01..08) · BN-09 (API-01..06) · BN-10 (ACC-08) · BN-11 (EXT-02, 04) · BN-12 (FUE-06..08, 10)",
    flows: ["formalizacion", "fuentes", "cambio-fuente", "excepcional", "consumo", "ampliaciones", "operacion"],
    actions: [
      { label: "Configurar acceso y ciclo de vida en Apigee (BN-08 / BN-10)", route: "/acceso-consumo", huBadge: "ACC-01..08" },
      { label: "Monitoreo e incidentes", route: "/operacion", huBadge: "OPS-03..05, INC-03" },
      { label: "Aprobar programaciones masivas y sincronizar Apigee (BN-09 / BN-10)", route: "/consumo-api", huBadge: "API-06, ACC-08" },
      { label: "Entrega excepcional: informe tecnológico y lotes (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02, 04" },
      { label: "Ejecutar suspensión o baja técnica de fuente (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-06..08, 10" },
      { label: "Gestión de Conectores", route: "/tecnologia/conectores", huBadge: "CNX-01/02" },
      { label: "Homologación de Orígenes", route: "/tecnologia/homologaciones", huBadge: "FUE-12" },
    ],
    flowOverrides: {
      formalizacion: {
        order: 6,
        roleName: "6. Apigee / Equipo de TI (DTD)",
        userName: "Carlos Mena",
        storiesBadge: "BN-08 · ACC-01 a ACC-08",
        description: "Carril 7 y Subproceso Apigee del flujo BPMN BN-08. Tras la aprobación definitiva de Dirección de Gestión, aprovisiona y configura el acceso a la API en Apigee (ACC-01); si el aprovisionamiento es exitoso habilita el acceso y emite credenciales al Coordinador (ACC-02), o registra el fallo y permite reintentar (ACC-03). Además gestiona el subproceso de ciclo de vida del acceso en Apigee: rotación de credenciales, bloqueo por intentos fallidos, suspensión/reactivación y revocación (ACC-04 a ACC-08).",
        access: "Habilitación y Ciclo de Vida en Apigee (/acceso-consumo).",
        actions: [
          { label: "Configurar Acceso y Ciclo de Vida en Apigee (ACC-01..08)", route: "/acceso-consumo", huBadge: "ACC-01..08" },
        ],
      },
      consumo: {
        order: 2,
        roleName: "2. Apigee / API de Interoperabilidad DINARP (TI DTD)",
        userName: "Carlos Mena",
        storiesBadge: "BN-09 · API-01..06",
        description: "Carriles 2 y 3 del flujo BPMN BN-09. Valida autenticación y políticas en Apigee (`¿Supera validación?`), verifica estado de la fuente y saldo (`¿Cumple condiciones?`), consulta la fuente o retorna datos de prueba, filtra campos según alcance autorizado y aprueba ventanas de programación masiva (API-06).",
        access: "Consumo por API y Programación Masiva (/consumo-api) y Ciclo de Vida Apigee (/acceso-consumo).",
        actions: [
          { label: "Aprobar programaciones masivas y validar API (BN-09)", route: "/consumo-api", huBadge: "API-01..06" },
        ],
      },
      ampliaciones: {
        order: 9,
        roleName: "9. Portal / Apigee (Equipo de TI DTD)",
        userName: "Carlos Mena",
        storiesBadge: "BN-10 · ACC-08, ADD-03, ADD-06",
        description: "Carril 7 del flujo BPMN BN-10 (Portal / Apigee). Ejecuta las compuertas de validación de la solicitud y, tras la autorización final de Dirección de Gestión, actualiza en Apigee los campos autorizados o el nuevo cupo mensual vigente sin interrumpir el consumo activo (ACC-08).",
        access: "Ciclo de Vida Apigee (/acceso-consumo) y Ampliaciones (/consumo-api).",
        actions: [
          { label: "Actualizar alcance o cupo en Apigee (BN-10 · ACC-08)", route: "/acceso-consumo", huBadge: "ACC-08" },
          { label: "Verificar sincronización de ampliación (BN-10)", route: "/consumo-api", huBadge: "ADD-03, ADD-06" },
        ],
      },
      excepcional: {
        order: 4,
        roleName: "4. Equipo de TI / Infraestructura (Informe Tecnológico y Lotes)",
        userName: "Carlos Mena",
        storiesBadge: "BN-11 · EXT-02, EXT-04, PAR-04",
        description: "Carril 4 del flujo BPMN BN-11 (`TI` y `Portal / Equipo`). Emite el informe tecnológico vinculante sobre viabilidad de extracción, ejecuta y supervisa los lotes de extracción autorizados (`¿Extracción exitosa?`), atiende lotes escalados y administra la vigencia del enlace temporal de descarga (EXT-02, EXT-04, PAR-04).",
        access: "Entrega Excepcional (/entrega-excepcional) y Parámetros de Vigencia de Enlace (/parametros-excepcional).",
        actions: [
          { label: "Emitir informe tecnológico y gestionar lotes (BN-11)", route: "/entrega-excepcional", huBadge: "EXT-02, EXT-04" },
          { label: "Configurar vigencia de enlace de descarga (BN-11)", route: "/parametros-excepcional", huBadge: "PAR-04" },
        ],
      },
      "cambio-fuente": {
        order: 4,
        roleName: "4. Portal / Apigee (Equipo de TI DTD)",
        userName: "Carlos Mena",
        storiesBadge: "BN-12 · FUE-06, FUE-07, FUE-08, FUE-10",
        description: "Carril 3 del flujo BPMN BN-12 (`Portal / Apigee`). Al llegar la fecha efectiva de cambio, suspensión o baja de la fuente, actualiza la versión del esquema o suspende/revoca automáticamente los accesos y credenciales en Apigee e informa a las instituciones consumidoras (FUE-06 a FUE-08, FUE-10).",
        access: "Ciclo de Vida de Fuentes (/ciclo-fuentes) y Ciclo de Vida Apigee (/acceso-consumo).",
        actions: [
          { label: "Ejecutar cambio, suspensión o baja en Portal/Apigee (BN-12)", route: "/ciclo-fuentes", huBadge: "FUE-06..08, 10" },
          { label: "Ver accesos impactados en Apigee", route: "/acceso-consumo", huBadge: "ACC-06..07" },
        ],
      },
    },
  },
  {
    roleName: "Dirección de Gestión y Registro (DGR)",
    userName: "María Torres",
    cedula: "1717654321",
    description: "Revisor funcional de fuentes. Evalúa la viabilidad institucional, pertinencia de los campos expuestos, verifica la prueba técnica de conexión y emite dictamen de aprobación o rechazo (FUE-04). Suspende fuentes preventivamente ante fallos técnicos (FUE-10).",
    access: "Revisión y Aprobación de Fuentes (/gestion/fuentes).",
    storiesBadge: "BN-06 · FUE-04, 10 · BN-09 (API-06)",
    flows: ["fuentes", "consumo", "operacion"],
    actions: [
      { label: "Seguimiento de trámites", route: "/reportes", huBadge: "REP-05" },
      { label: "Coordinar programaciones masivas", route: "/consumo-api", huBadge: "API-06" },
      { label: "Revisión de Fuentes", route: "/gestion/fuentes", huBadge: "FUE-04" },
    ],
    flowOverrides: {
      consumo: {
        order: 4,
        roleName: "4. Dirección de Gestión y Registro (DGR — Masivo)",
        userName: "María Torres",
        storiesBadge: "BN-09 · API-06",
        description: "Coordina con la institución proveedora las ventanas de programación de consumo masivo antes de la aprobación técnica de TI (API-06).",
        access: "Consumo por API y Programación Masiva (/consumo-api).",
        actions: [
          { label: "Coordinar programaciones masivas (BN-09)", route: "/consumo-api", huBadge: "API-06" },
        ],
      },
    },
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
    sectionTitle: "Proyectos, Solicitudes, Formalización, Consumo y Entrega Excepcional (BN-05, BN-07 a BN-11)",
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
  {
    id: "formalizacion",
    title: "Formalizar Acceso y Habilitar Consumo",
    bnCode: "BN-08",
    subtitle: "Contrato privado (2 firmas), factura electrónica, pasarela/conciliación, aprobación definitiva y Apigee",
    description: "1. Jurídica → 2. Coordinador SINARP → 3. Máxima Autoridad → 4. Financiero/Pasarela → 5. Dirección Gestión → 6. Apigee (TI)",
    section: "interoperabilidad",
    tag: "CON-01..03 · FAC-01..02 · PAG-01..05 · SOL-09..10 · ACC-01..08",
    icon: ShieldCheck,
  },

  // ── FLUJO INCORPORAR Y PUBLICAR FUENTE (BN-06: FUE-01 A FUE-05, FUE-10, FUE-12, CNX-01/02) Y CAMBIO/EXTINCIÓN (BN-12) ──
  {
    id: "fuentes",
    title: "Incorporar y Publicar Fuente",
    bnCode: "BN-06",
    subtitle: "Registro de fuente, conexión VPN, mapeo de campos, clasificación y catálogo",
    description: "Coordinador Proveedor (FUE-01..03), Revisores DGR/DPI (FUE-04), TI DTD (FUE-05, 12) y Coordinador Consumidor (CAT-01)",
    section: "fuentes",
    sectionTitle: "Incorporación, Publicación y Ciclo de Vida de Fuentes (BN-06 y BN-12)",
    tag: "FUE-01..05, 10, 12 · CAT-01",
    icon: Database,
  },
  {
    id: "cambio-fuente",
    title: "Cambio, Suspensión o Extinción de Fuente",
    bnCode: "BN-12",
    subtitle: "Notificación de cambio de estructura, suspensión temporal/programada y baja definitiva de fuente",
    description: "1. Coordinador Proveedor → 2. Dirección Gestión → 3. Equipo Gestión → 4. Portal / Apigee (TI) → 5. Instituciones Consumidoras",
    section: "fuentes",
    tag: "FUE-06 a FUE-08 · FUE-11",
    icon: RefreshCw,
  },

  // ── CONSUMO POR API (BN-09: API-01 a API-06, PAR-07) ──
  {
    id: "consumo",
    title: "Consumo de Datos por API",
    bnCode: "BN-09",
    subtitle: "Pruebas (sandbox), consulta individual y masiva, saldo, alertas y programación masiva",
    description: "1. Aplicativo Institución (Coordinador) → 2. Apigee → 3. API Interoperabilidad DINARP → 4. Fuente de Datos → 5. Portal (Saldo y Alerta)",
    section: "interoperabilidad",
    tag: "API-01 a API-06 · PAR-07",
    icon: Layers,
  },

  // ── AMPLIACIONES DE ALCANCE O CUPO (BN-10: ADD-01 a ADD-07, ACC-08) ──
  {
    id: "ampliaciones",
    title: "Ampliar Alcance o Cupo de Consumo",
    bnCode: "BN-10",
    subtitle: "Ampliar campos o cupo mensual, revisión Gestión/DPI, adenda (2 firmas), pago y sincronización Apigee",
    description: "1. Coordinador SINARP → 2. Dirección Gestión → 3. Equipo Gestión → 4. DPI → 5. Jurídica / Máx. Autoridad → 6. Pasarela/Financiero → 7. Portal / Apigee",
    section: "interoperabilidad",
    tag: "ADD-01 a ADD-07 · ACC-08",
    icon: ArrowLeftRight,
  },

  // ── ENTREGA DIRECTA Y EXCEPCIONAL (BN-11: Res. 003-NG-DINARP-2023 · EXT-01 a EXT-08, PAR-17, PAR-04) ──
  {
    id: "excepcional",
    title: "Entrega Directa y Excepcional",
    bnCode: "BN-11",
    subtitle: "Solicitud, calificación, informes vinculantes (TI y DPI), autorización, lotes, descarga, renovación y control",
    description: "1. Coordinador SINARP → 2. Dirección Gestión → 3. Equipo Gestión → 4. TI → 5. DPI → 6. Máx. Autoridad → 7. Control y Evaluación",
    section: "interoperabilidad",
    tag: "EXT-01 a EXT-08 · PAR-17 · PAR-04",
    icon: ShieldCheck,
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
