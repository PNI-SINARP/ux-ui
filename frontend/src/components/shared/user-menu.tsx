"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  ChevronDown,
  ChevronLeft,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  ROLES_CONFIG,
  MOCK_USERS_BY_ROLE,
  type UserRole,
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export interface UserMenuProps {
  user?: {
    name?: string;
    role?: string;
    roleTitle?: string;
    email?: string;
    institution?: string;
    avatar?: string;
    initials?: string;
    cedula?: string;
  };
  onRoleChange?: (role: UserRole) => void;
  onLogout?: () => void;
}

export function UserMenu({ user: userProp, onRoleChange, onLogout }: UserMenuProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Read auth store for reactive session state
  const { activeUser, logout: authLogout } = useAuthStore();
  const effectiveUser = userProp || activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;

  const isWireframe2 = pathname.startsWith("/");
  const isWireframe = pathname.startsWith("/wireframes");

  const name = effectiveUser?.name || "Andrea López";
  const initials =
    effectiveUser?.initials ||
    (effectiveUser?.avatar && effectiveUser.avatar.length <= 3
      ? effectiveUser.avatar
      : effectiveUser?.name
      ? effectiveUser.name
      .split(" ")
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
      : "AL");

  const institution = effectiveUser?.institution || "DINARP";
  const roleName =
    effectiveUser?.roleTitle ||
    (effectiveUser?.role && ROLES_CONFIG[effectiveUser.role as UserRole]?.name) ||
    (effectiveUser?.role ? effectiveUser.role.replace(/_/g, " ") : "Coordinador SINARP");

  const email = effectiveUser?.email || "coordinador@gmail.com";
  const cedula = effectiveUser?.cedula;

  const handleLogout = () => {
    setOpen(false);
    try {
      authLogout();
    } catch {}
    if (onLogout) {
      onLogout();
    }
    const target = isWireframe2 ? "/login" : isWireframe ? "/wireframes/login" : "/login";
    router.push(target);
  };

  const TriggerButton = (
    <button
      type="button"
      className="group flex items-center gap-2 rounded-full outline-none pr-3 pl-1.5 py-1 hover:bg-muted/60 data-[state=open]:bg-muted/60 transition-all cursor-pointer border border-transparent hover:border-border/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label="Perfil y rol del usuario"
    >
      <Avatar className="size-8.5 cursor-pointer transition-all duration-200 border border-border group-hover:border-primary/40 group-hover:ring-2 group-hover:ring-primary/10 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-heading">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Nombre y Rol destacados con jerarquía clara y visible */}
      <div className="flex flex-col items-start leading-tight text-left min-w-0">
        <span className="text-xs font-bold text-foreground truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px] md:max-w-[210px] lg:max-w-[240px]">
          {name}
        </span>
        <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px] md:max-w-[210px] lg:max-w-[240px]">
          <span className="size-1.5 rounded-full bg-primary shrink-0" />
          <span className="truncate text-foreground/80 font-medium">{roleName}</span>
        </span>
      </div>

      <ChevronDown
        className={cn(
          "size-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground shrink-0 ml-0.5",
          open && "rotate-180"
        )}
        strokeWidth={2}
      />
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>{TriggerButton}</div>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-[28px] p-0 border-border bg-background flex flex-col focus-visible:outline-none focus:outline-none"
        >
          <SheetTitle className="sr-only">Menú de usuario y roles</SheetTitle>

          {/* Header Móvil */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="-ml-2 rounded-full text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft className="size-5" strokeWidth={2} />
            </Button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Usuario Activo
            </span>
            <div className="size-8" />
          </div>

          <div className="px-4 sm:px-6 pb-6 pt-3 overflow-y-auto max-h-[85vh] space-y-4">
            {/* User Info Card */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
              <Avatar className="size-13 shrink-0 border-2 border-background shadow-sm ring-1 ring-primary/20 relative z-10">
                <AvatarFallback className="bg-primary text-white text-base font-bold font-heading">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 relative z-10 space-y-1">
                <span className="text-sm font-bold font-heading text-foreground truncate">
                  {name}
                </span>
                <div>
                  <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-[10px]">
                    {roleName}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <Building2 className="size-3 shrink-0" />
                  <span className="truncate">{institution}</span>
                </div>
                {cedula && (
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Cédula: <span className="text-foreground font-medium">{cedula}</span>
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground/80 font-mono truncate">
                  {email}
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-2 border-t border-border/60">
              <MobileMenuItem
                icon={LogOut}
                label="Cerrar sesión"
                isWarning
                onClick={handleLogout}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {TriggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        className={cn(
          "w-[calc(100vw-1.5rem)] sm:w-[320px] max-w-[320px] rounded-2xl border border-border bg-card p-2 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]",
          "duration-150 ease-out"
        )}
      >
        {/* User Card Header */}
        <div className="p-3 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl flex flex-col gap-2 relative overflow-hidden mb-1.5">
          <div className="flex items-start gap-3 relative z-10">
            <Avatar className="size-11 shrink-0 border-2 border-background shadow-xs ring-1 ring-primary/20">
              <AvatarFallback className="bg-primary text-white text-sm font-bold font-heading">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold font-heading text-foreground truncate">
                {name}
              </span>
              <div className="mt-0.5">
                <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-[10px]">
                  {roleName}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
                <Building2 className="size-3 shrink-0" />
                <span className="truncate">{institution}</span>
              </div>
              {cedula && (
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  C.I. <span className="text-foreground font-medium">{cedula}</span>
                </div>
              )}
              {email && (
                <div className="text-[10px] text-muted-foreground/80 font-mono truncate mt-0.5">
                  {email}
                </div>
              )}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        {/* Logout */}
        <div className="flex flex-col gap-0.5">
          <DesktopMenuItem
            icon={LogOut}
            label="Cerrar sesión"
            isWarning
            onClick={handleLogout}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  isActive?: boolean;
  isWarning?: boolean;
  badge?: string;
  onClick?: () => void;
}

function MobileMenuItem({
  icon: Icon,
  label,
  isActive,
  isWarning,
  badge,
  onClick,
}: MenuItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "group relative flex w-full select-none items-center justify-start gap-3 rounded-xl px-3.5 py-2.5 h-auto text-xs font-semibold outline-none transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : isWarning
          ? "text-danger hover:bg-danger/10 hover:text-danger"
          : "text-foreground hover:bg-muted/50"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive ? "text-foreground" : isWarning ? "text-danger" : "text-muted-foreground group-hover:text-foreground"
        )}
        strokeWidth={1.75}
      />

      <span className="flex-1 text-left">{label}</span>

      {badge && (
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground border border-border">
          {badge}
        </span>
      )}
    </Button>
  );
}

function DesktopMenuItem({
  icon: Icon,
  label,
  isActive,
  isWarning,
  badge,
  onClick,
}: MenuItemProps) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none transition-colors",
        isActive
          ? "bg-muted text-foreground font-semibold"
          : isWarning
          ? "text-danger hover:bg-danger/10 hover:text-danger focus:bg-danger/10 focus:text-danger"
          : "text-foreground focus:bg-muted/50 focus:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive ? "text-foreground" : isWarning ? "text-danger" : "text-muted-foreground group-focus:text-foreground"
        )}
      />

      <span className="flex-1 text-left">{label}</span>

      {badge && (
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground border border-border">
          {badge}
        </span>
      )}
    </DropdownMenuItem>
  );
}
