"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type MockUser, type UserRole, ROLES_CONFIG } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

interface WireframeUserMenuProps {
  user: MockUser;
  onRoleChange?: (role: UserRole) => void;
}

export function WireframeUserMenu({ user, onRoleChange }: WireframeUserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setOpen(false);
    router.push("/login");
  };

  const roleName = user.roleTitle || ROLES_CONFIG[user.role]?.name || user.role.replace(/_/g, " ");

  const getEmail = (name: string, inst: string) => {
    const slug = name.toLowerCase().replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u").replace(/\s+/g, ".");
    const domain = inst.toLowerCase().includes("registro") ? "registrocivil.gob.ec" : "dinarp.gob.ec";
    return `${slug}@${domain}`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 rounded-full outline-none pr-3 pl-1.5 py-1 hover:bg-muted/60 data-[state=open]:bg-muted/60 transition-all cursor-pointer border border-transparent hover:border-border/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Perfil de usuario"
        >
          <Avatar className="size-8.5 cursor-pointer transition-all duration-200 border border-border group-hover:border-primary/40 group-hover:ring-2 group-hover:ring-primary/10 shrink-0">
            <AvatarFallback className="bg-primary text-white text-xs font-bold font-heading">
              {user.initials || "AL"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start leading-tight text-left min-w-0">
            <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[220px]">
              {user.name}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[220px]">
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              <span className="truncate text-foreground/85 font-medium">{roleName}</span>
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
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 p-2 border-border bg-popover text-popover-foreground shadow-lg rounded-xl"
      >
        {/* Encabezado del Perfil */}
        <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl flex flex-col gap-3 relative overflow-hidden mb-1">
          {/* Decorative blur */}
          <div className="absolute -right-8 -top-8 size-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <Avatar className="size-12 border-2 border-background shadow-sm ring-1 ring-primary/20 shrink-0">
              <AvatarFallback className="bg-primary text-white text-base font-bold font-heading">
                {user.initials || "AL"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold font-heading text-foreground truncate">{user.name}</span>
              <span className="text-xs text-foreground/70 truncate">{user.email || getEmail(user.name, user.institution)}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-border/60 flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-foreground/70 font-medium">Rol:</span>
              <Badge tone="primary" appearance="soft" size="sm" className="font-bold border-primary/20">
                {roleName}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/70 font-medium">Institución:</span>
              <span className="font-bold text-foreground truncate max-w-[150px] text-right">
                {user.institution}
              </span>
            </div>
            {user.cedula && (
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-muted-foreground">C.I.:</span>
                <span className="font-bold text-foreground">{user.cedula}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-0.5">
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-danger hover:bg-danger/10 hover:text-danger focus:bg-danger/10 focus:text-danger rounded-lg cursor-pointer transition-colors"
          >
            <LogOut className="size-4 shrink-0 text-danger" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
