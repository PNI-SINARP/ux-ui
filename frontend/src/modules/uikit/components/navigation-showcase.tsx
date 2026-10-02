"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Layout, ChevronLeft, ListTodo, User, UserCircle, Bell, Folder, Sidebar, FolderOpen } from "lucide-react";

import { HeaderShowcase } from "./header-showcase";
import { SidebarShowcase } from "./sidebar-showcase";
import { BreadcrumbShowcase } from "./breadcrumb-showcase";
import { TabsShowcase } from "./tabs-showcase";
import { PaginationShowcase } from "./pagination-showcase";
import { AvatarShowcase } from "./avatar-showcase";

import { StepperShowcase } from "./stepper-showcase";
import { UserMenuShowcase } from "./user-menu-showcase";
import { NotificationsMenuShowcase } from "./notifications-menu-showcase";

import { SubSection } from "./sub-section";

export function NavigationShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
        <SubSection
          icon={Layout} id="header"
          registerSection={registerSection}
          title="Encabezado (Header)"
          description="Permite acceder a las principales secciones del sistema y reúne elementos como el logo institucional, la navegación, las notificaciones y las opciones del usuario."
          isEditable={true}
        >
          <HeaderShowcase />
        </SubSection>

        <SubSection
          icon={Sidebar} id="sidebar-nav"
          registerSection={registerSection}
          title="Barra lateral (Sidebar)"
          description="Organiza los módulos y opciones principales del sistema en un menú lateral que puede mostrarse completo o reducido para aprovechar mejor el espacio disponible."
          isEditable={true}
        >
          <SidebarShowcase />
        </SubSection>

        <SubSection
          icon={FolderOpen} id="breadcrumb"
          registerSection={registerSection}
          title="Migas de pan (Breadcrumb)"
          description="Muestra la ubicación actual del usuario dentro del sistema y le permite regresar fácilmente a niveles anteriores de navegación."
        >
          <BreadcrumbShowcase />
        </SubSection>

        <SubSection
          icon={Folder} id="tabs"
          registerSection={registerSection}
          title="Pestañas (Tabs)"
          description="Permiten cambiar entre diferentes vistas o grupos de contenido relacionados sión salir de la pantalla actual."
        >
          <TabsShowcase />
        </SubSection>

        <SubSection
          icon={ChevronLeft} id="pagination"
          registerSection={registerSection}
          title="Paginación (Pagination)"
          description="Divide grandes cantidades de información en varias páginas y permite avanzar, retroceder o acceder directamente a una página específica."
        >
          <PaginationShowcase />
        </SubSection>

        <SubSection
          icon={ListTodo} id="stepper"
          registerSection={registerSection}
          title="Pasos (Stepper)"
          description="Muestra el avance del usuario dentro de un proceso compuesto por varios pasos e indica qué etapas ya completó, cuál está aarealizando y cuáles faltan."
        >
          <StepperShowcase />
        </SubSection>

        <SubSection
          icon={UserCircle} id="avatar"
          registerSection={registerSection}
          title="Avatar"
          description="Identifica visualmente a una persona mediante su fotografía o sus iniciales y puede útilizarse en perfiles, menús, listas y otras áaaaareas del sistema."
        >
          <AvatarShowcase />
        </SubSection>

        <SubSection
          icon={User} id="user-menu"
          registerSection={registerSection}
          title="Menú de usuario (User Menu)"
          description="Reúne las opciones relacionadas con la cuenta del usuario, como consultar su perfil, acceder a configuraciones o cerrar sesión."
        >
          <UserMenuShowcase registerSection={registerSection} />
        </SubSection>

        <SubSection
          icon={Bell} id="notifications-menu"
          registerSection={registerSection}
          title="Notifications Menu"
          description="Muestra avisos, alertas y actualizaciones relevantes para que el usuario pueda identificar rápidamente información que requiere su atención."
        >
          <NotificationsMenuShowcase registerSection={registerSection} />
        </SubSection>

    </div>
  );
}
