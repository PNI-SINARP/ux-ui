"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";

export interface UserMenuProps {
  user?: {
    name?: string;
    role?: string;
    roleTitle?: string;
    email?: string;
    institution?: string;
    avatar?: string;
    initials?: string;
  };
  onRoleChange?: (role: any) => void;
  onLogout?: () => void;
}

export function UserMenu({ user: userProp, onRoleChange, onLogout }: UserMenuProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Read auth store if available for dynamic login session
  const { activeUser, logout: authLogout } = useAuthStore();
  const effectiveUser = userProp || activeUser;

  const isWireframe2 = pathname.startsWith("/");
  const isWireframe = pathname.startsWith("/wireframes");

  const name = effectiveUser?.name || "Carlos Mendoza";
  const initials = effectiveUser?.avatar && effectiveUser.avatar.length <= 3
    ? effectiveUser.avatar
    : (effectiveUser?.name ? effectiveUser.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() : "CM");
  const institution = effectiveUser?.institution || "DINARP";
  const roleName = effectiveUser?.roleTitle || (effectiveUser?.role ? effectiveUser.role.replace(/_/g, " ") : "Admin TIC");
  const subtitle = `${institution} · ${roleName}`;
  const email = effectiveUser?.email || "carlos.mendoza@mintel.gob.ec";

  const handleLogout = () => {
    setOpen(false);
    try {
      authLogout();
    } catch {}
    if (onLogout) {
      onLogout();
    }
    const target = isWireframe2 ? "/login" : (isWireframe ? "/wireframes/login" : "/login");
    router.push(target);
  };

  const TriggerButton = (
    <button
      type="button"
      className="group flex items-center gap-2 rounded-full outline-none pr-3 pl-1.5 py-1 hover:bg-muted/50 data-[state=open]:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border/60"
    >
      <Avatar className="size-8 cursor-pointer transition-all duration-200 border border-border group-hover:border-primary/30 group-hover:ring-2 group-hover:ring-primary/10">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-heading">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="hidden sm:flex items-center gap-1.5 transition-colors">
        <div className="flex flex-col items-start leading-tight text-left">
          <span className="text-xs font-bold text-foreground truncate max-w-[130px]">{name}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate max-w-[140px]">
            <span className="size-1.5 rounded-full bg-primary shrink-0" />
            <span className="truncate">{subtitle}</span>
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </div>
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
          <SheetTitle className="sr-only">Menú de usuario</SheetTitle>

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
              Cuenta institucional
            </span>
            <div className="size-8" />
          </div>

          <div className="px-4 sm:px-6 pb-6 pt-4 overflow-y-auto max-h-[85vh] space-y-4">
            {/* User Info Header */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden mb-2">
              <div className="absolute -right-8 -top-8 size-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <Avatar className="size-14 shrink-0 border-2 border-background shadow-sm ring-1 ring-primary/20 relative z-10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-primary-foreground text-lg font-bold font-heading">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 relative z-10">
                <span className="text-sm font-bold font-heading text-foreground truncate">
                  {name}
                </span>
                <span className="text-xs font-medium text-foreground/80 mt-0.5 truncate">
                  {subtitle}
                </span>
                <span className="text-[11px] text-muted-foreground/80 mt-0.5 truncate font-mono">
                  {email}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
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
          "w-[calc(100vw-1.5rem)] sm:w-[280px] max-w-[280px] rounded-2xl border border-border bg-card p-1.5 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]",
          "duration-150 ease-out"
        )}
      >
        <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl flex flex-col gap-3 relative overflow-hidden mb-1">
          {/* Decorative blur */}
          <div className="absolute -right-6 -top-6 size-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <Avatar className="size-11 shrink-0 border-2 border-background shadow-sm ring-1 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-primary-foreground text-sm font-bold font-heading">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold font-heading text-foreground truncate">
                {name}
              </span>
              <span className="text-xs font-medium text-foreground/80 truncate">
                {subtitle}
              </span>
              <span className="text-[10px] text-muted-foreground/80 font-mono truncate mt-0.5">
                {email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 pt-0.5">
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
        "group relative flex w-full select-none items-center justify-start gap-3 rounded-xl px-3.5 py-3 h-auto text-xs font-semibold outline-none transition-colors",
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
        "group relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors",
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
