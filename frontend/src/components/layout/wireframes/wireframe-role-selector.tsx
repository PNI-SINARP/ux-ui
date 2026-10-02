"use client";

import React from "react";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { UserRole, ROLES_CONFIG } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

interface WireframeRoleSelectorProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function WireframeRoleSelector({ activeRole, onRoleChange }: WireframeRoleSelectorProps) {
  const roles: UserRole[] = ["ADMIN", "DIR_GESTION", "EQ_GESTION", "DIR_NORMATIVA", "EQ_NORMATIVA", "COORDINADOR_SINARP", "APROBADOR", "FACTURACION", "DGR", "DTD", "DPI"];
  const roleItems = roles.map((r) => ({
    value: r,
    label: ROLES_CONFIG[r]?.name || r,
  }));
  const currentItem = roleItems.find((i) => i.value === activeRole) || roleItems[0];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline-block">
        Visualizando como:
      </span>
      <Combobox
        items={roleItems}
        value={currentItem}
        onValueChange={(item) => {
          if (item) onRoleChange(item.value as UserRole);
        }}
      >
        <ComboboxSelectTrigger className="h-7 text-xs font-medium px-2.5 max-w-[280px] truncate" />
        <ComboboxContent align="end" className="min-w-[280px]">
          <ComboboxList>
            {roleItems.map((item) => (
              <ComboboxItem key={item.value} value={item} className="text-xs py-2 px-2.5">
                {item.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
