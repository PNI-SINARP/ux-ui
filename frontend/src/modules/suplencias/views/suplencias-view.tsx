"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  Users,
  Building2,
  Clock,
  RotateCcw,
  UserCheck,
  User,
  Info,
  Calendar,
  AlertTriangle,
  History,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import type { MockUser, UserRole } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

import { useSuplenciasStore, type SuplenciaInstitucional } from "../data/suplencias-store";
import { CoordinacionInstitucionalCard } from "../components/coordinacion-institucional-card";
import { ProgramarInactividadDialog } from "../components/programar-inactividad-dialog";
import { ActivarSuplenciaAdminDialog } from "../components/activar-suplencia-admin-dialog";
import { DesactivarSuplenciaAdminDialog } from "../components/desactivar-suplencia-admin-dialog";
import { SuplenciasTrazabilidad } from "../components/suplencias-trazabilidad";
import { SimulacionAus03Banner } from "../components/simulacion-aus03-banner";
import { SuplenciasAdminTable } from "../components/suplencias-admin-table";

// Usuarios exactos requeridos por la especificación
export const USER_COORDINADOR_TITULAR: MockUser = {
  id: "1712345678",
  cedula: "1712345678",
  name: "Juan Pérez",
  role: "COORDINADOR_SINARP",
  roleTitle: "Coordinador Titular SINARP",
  email: "juan.perez@educacion.gob.ec",
  institution: "Ministerio de Educación",
  initials: "JP",
};

export const USER_ADMIN_DINARP: MockUser = {
  id: "1799999999",
  cedula: "1799999999",
  name: "Admin DINARP",
  role: "ADMIN",
  roleTitle: "Administrador DINARP",
  email: "admin.portal@dinarp.gob.ec",
  institution: "DINARP",
  initials: "AD",
};

export const USER_COORDINADOR_SUPLENTE: MockUser = {
  id: "1714443322",
  cedula: "1714443322",
  name: "Mariana Almeida",
  role: "COORDINADOR_SINARP",
  roleTitle: "Coordinador Suplente SINARP",
  email: "m.almeida@educacion.gob.ec",
  institution: "Ministerio de Educación",
  initials: "MA",
};

export function SuplenciasView() {
  const { activeUser, login } = useAuthStore();
  const {
    suplencias,
    getSuplenciaMineduc,
    programarInactividad,
    cancelarProgramacion,
    simularInicioSuplenciaProgramada,
    simularFinSuplenciaProgramada,
    activarSuplenciaAdministrativa,
    desactivarSuplenciaAdministrativa,
    resetearSimulacion,
  } = useSuplenciasStore();

  // Estado del usuario activo local (por defecto Juan Pérez para probar AUS-01 primero)
  const [currentUser, setCurrentUser] = useState<MockUser>(USER_COORDINADOR_TITULAR);

  // Modales
  const [openProgramarModal, setOpenProgramarModal] = useState(false);
  const [institucionParaActivar, setInstitucionParaActivar] = useState<SuplenciaInstitucional | null>(null);
  const [institucionParaDesactivar, setInstitucionParaDesactivar] = useState<SuplenciaInstitucional | null>(null);

  // Sincronización con el store global de autenticación si existe
  useEffect(() => {
    if (activeUser) {
      if (activeUser.role === "ADMIN") {
        setCurrentUser(USER_ADMIN_DINARP);
      } else if (activeUser.cedula === "1714443322") {
        setCurrentUser(USER_COORDINADOR_SUPLENTE);
      } else {
        setCurrentUser(USER_COORDINADOR_TITULAR);
      }
    }
  }, [activeUser]);

  // Suplencia de la institución de Juan Pérez (Ministerio de Educación)
  const suplenciaMineduc = getSuplenciaMineduc();

  // Función para conmutar de rol rápidamente en la misma pantalla
  const handleCambiarRol = (rolTarget: "TITULAR" | "ADMIN" | "SUPLENTE") => {
    let nuevoUsuario = USER_COORDINADOR_TITULAR;
    if (rolTarget === "ADMIN") {
      nuevoUsuario = USER_ADMIN_DINARP;
    } else if (rolTarget === "SUPLENTE") {
      nuevoUsuario = USER_COORDINADOR_SUPLENTE;
    }

    setCurrentUser(nuevoUsuario);
    login(nuevoUsuario.cedula || nuevoUsuario.id);
  };

  const isAdmin = currentUser.role === "ADMIN";
  const isTitular = currentUser.role === "COORDINADOR_SINARP" && currentUser.cedula === "1712345678";
  const isSuplente = currentUser.role === "COORDINADOR_SINARP" && currentUser.cedula === "1714443322";

  // Breadcrumbs según el rol
  const breadcrumbs = [
    { label: "Inicio", href: "#" },
    { label: isAdmin ? "Gestión de suplencias" : "Gestión de suplencia" },
  ];

  return (
    <WireframeDashboardLayout
      activeMenu="suplencias"
      breadcrumbs={breadcrumbs}
      currentUser={currentUser}
      currentRole={currentUser.role}
      onRoleChange={(role: UserRole) => {
        if (role === "ADMIN") {
          handleCambiarRol("ADMIN");
        } else {
          handleCambiarRol("TITULAR");
        }
      }}
    >
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
        {/* Banner selector de rol rápido para revisión y pruebas integrales */}
        <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <User className="size-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Simulación de Sesión Activa (BN-04)
              </span>
              <p className="text-xs font-semibold text-foreground">
                Conectado como:{" "}
                <strong className="text-primary">{currentUser.name}</strong> ({currentUser.roleTitle || currentUser.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium mr-1">Cambiar vista:</span>
            <Button
              variant={isTitular ? "primary" : "outline"}
              size="sm"
              onClick={() => handleCambiarRol("TITULAR")}
              className="text-xs font-bold gap-1.5 h-8 px-3"
            >
              <ShieldCheck className="size-3.5" />
              <span>Coordinador Titular</span>
            </Button>
            <Button
              variant={isAdmin ? "primary" : "outline"}
              size="sm"
              onClick={() => handleCambiarRol("ADMIN")}
              className="text-xs font-bold gap-1.5 h-8 px-3"
            >
              <ShieldAlert className="size-3.5" />
              <span>Administrador</span>
            </Button>
            <Button
              variant={isSuplente ? "primary" : "outline"}
              size="sm"
              onClick={() => handleCambiarRol("SUPLENTE")}
              className="text-xs font-semibold gap-1.5 h-8 px-2.5 text-muted-foreground"
              title="El suplente no realiza acciones directas en este flujo"
            >
              <Users className="size-3.5" />
              <span>Suplente (Lectura)</span>
            </Button>
          </div>
        </div>

        {/* =========================================================================
            EXPERIENCIA 1: COORDINADOR SINARP TITULAR (Juan Pérez - AUS-01)
           ========================================================================= */}
        {isTitular && (
          <div className="space-y-6">
            {/* Encabezado y Descripción oficial AUS-01 */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-primary tracking-tight">
                Gestión de suplencia
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Programa un periodo de inactividad para delegar temporalmente tus funciones al coordinador suplente de la institución.
              </p>
            </div>

            {/* Tarjeta de Coordinación Institucional */}
            <CoordinacionInstitucionalCard
              suplencia={suplenciaMineduc}
              onOpenProgramar={() => setOpenProgramarModal(true)}
              onCancelarProgramacion={() => cancelarProgramacion(suplenciaMineduc.idInstitucion)}
            />

            {/* Simulador interactivo de conmutación automática AUS-03 */}
            <SimulacionAus03Banner
              suplencia={suplenciaMineduc}
              onSimularInicioAUS03={() => simularInicioSuplenciaProgramada(suplenciaMineduc.idInstitucion)}
              onSimularFinAUS03={() => simularFinSuplenciaProgramada(suplenciaMineduc.idInstitucion)}
              onResetearDemo={() => resetearSimulacion(suplenciaMineduc.idInstitucion)}
            />

            {/* Trazabilidad Institucional Reutilizable */}
            <Card
              className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden"
              innerClassName="p-5 sm:p-7"
            >
              <SuplenciasTrazabilidad eventos={suplenciaMineduc.trazabilidad} />
            </Card>

            {/* Modal de Programar Inactividad (AUS-01) */}
            <ProgramarInactividadDialog
              open={openProgramarModal}
              onOpenChange={setOpenProgramarModal}
              suplencia={suplenciaMineduc}
              onConfirm={(fechaIni, fechaFin) =>
                programarInactividad(suplenciaMineduc.idInstitucion, fechaIni, fechaFin)
              }
            />
          </div>
        )}

        {/* =========================================================================
            EXPERIENCIA 2: ADMINISTRADOR (Admin DINARP - AUS-02)
           ========================================================================= */}
        {isAdmin && (
          <div className="space-y-6">
            {/* Encabezado y Descripción oficial AUS-02 */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-primary tracking-tight">
                Gestión de suplencias
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Consulta las suplencias institucionales y activa una suplencia administrativa cuando el coordinador titular no pueda realizar la programación.
              </p>
            </div>

            {/* Resumen de Métricas de Suplencias */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-surface rounded-xl border border-border p-4 shadow-2xs" innerClassName="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Instituciones totales</span>
                <p className="text-xl sm:text-2xl font-bold font-heading text-foreground">{suplencias.length}</p>
                <span className="text-[10px] text-muted-foreground">Catálogo activo DINARP</span>
              </Card>

              <Card className="bg-surface rounded-xl border border-border p-4 shadow-2xs" innerClassName="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Programadas (AUS-01)</span>
                <p className="text-xl sm:text-2xl font-bold font-heading text-primary">
                  {suplencias.filter((s) => s.estado === "PROGRAMADA").length}
                </p>
                <span className="text-[10px] text-muted-foreground">A la espera de fecha</span>
              </Card>

              <Card className="bg-surface rounded-xl border border-border p-4 shadow-2xs" innerClassName="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Suplencias activas</span>
                <p className="text-xl sm:text-2xl font-bold font-heading text-warning">
                  {suplencias.filter((s) => s.estado === "ACTIVA").length}
                </p>
                <span className="text-[10px] text-muted-foreground">Suplentes en funciones</span>
              </Card>

              <Card className="bg-surface rounded-xl border border-border p-4 shadow-2xs" innerClassName="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Restituidas / Finalizadas</span>
                <p className="text-xl sm:text-2xl font-bold font-heading text-success">
                  {suplencias.filter((s) => s.estado === "FINALIZADA" || s.estado === "DESACTIVADA_ADMINISTRATIVAMENTE").length}
                </p>
                <span className="text-[10px] text-muted-foreground">Titulares restaurados</span>
              </Card>
            </div>

            {/* Simulador de eventos automáticos AUS-03 para MinEduc desde vista Admin */}
            <SimulacionAus03Banner
              suplencia={suplenciaMineduc}
              onSimularInicioAUS03={() => simularInicioSuplenciaProgramada(suplenciaMineduc.idInstitucion)}
              onSimularFinAUS03={() => simularFinSuplenciaProgramada(suplenciaMineduc.idInstitucion)}
              onResetearDemo={() => resetearSimulacion()}
            />

            {/* Tabla Principal de Suplencias Institucionales */}
            <SuplenciasAdminTable
              suplencias={suplencias}
              onActivarSuplencia={(item) => setInstitucionParaActivar(item)}
              onDesactivarSuplencia={(item) => setInstitucionParaDesactivar(item)}
            />

            {/* Dialog de Activación Administrativa (AUS-02) */}
            <ActivarSuplenciaAdminDialog
              open={Boolean(institucionParaActivar)}
              onOpenChange={(open) => !open && setInstitucionParaActivar(null)}
              suplencia={institucionParaActivar}
              onConfirm={(idInst, motivo) => activarSuplenciaAdministrativa(idInst, motivo)}
            />

            {/* Dialog de Desactivación Administrativa (AUS-02) */}
            <DesactivarSuplenciaAdminDialog
              open={Boolean(institucionParaDesactivar)}
              onOpenChange={(open) => !open && setInstitucionParaDesactivar(null)}
              suplencia={institucionParaDesactivar}
              onConfirm={(idInst, motivo) => desactivarSuplenciaAdministrativa(idInst, motivo)}
            />
          </div>
        )}

        {/* =========================================================================
            EXPERIENCIA 3: COORDINADOR SUPLENTE (Mariana Almeida - Modo Pasivo)
           ========================================================================= */}
        {isSuplente && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-primary tracking-tight">
                Gestión de suplencia institucional
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Consulta el estado de suplencia de tu institución como Coordinador Suplente enrolado.
              </p>
            </div>

            <Alert variant="info" icon={<Info />}>
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-xs sm:text-sm">
                  Rol institucional de contingencia (Suplente)
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El Coordinador Suplente no posee acciones directas de autogestión de suplencia. Tu cuenta se encuentra
                  enrolada y con Anexo B aprobado. Tus credenciales operativas se habilitarán de manera automática cuando el
                  Coordinador Titular o el Administrador activen una suplencia para el Ministerio de Educación.
                </p>
              </div>
            </Alert>

            {/* Card en modo lectura */}
            <CoordinacionInstitucionalCard
              suplencia={suplenciaMineduc}
              onOpenProgramar={() => {}}
              onCancelarProgramacion={() => {}}
            />

            {/* Trazabilidad institucional */}
            <Card
              className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden"
              innerClassName="p-5 sm:p-7"
            >
              <SuplenciasTrazabilidad eventos={suplenciaMineduc.trazabilidad} />
            </Card>
          </div>
        )}
      </div>
    </WireframeDashboardLayout>
  );
}
