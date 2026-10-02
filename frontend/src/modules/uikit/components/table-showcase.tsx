"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const USERS = [
  {
    id: "798",
    name: "Devon Lane",
    avatar: "https://i.pravatar.cc/150?u=798",
    balance: "$630.44",
    level: "MEDIO",
    status: "BANEADO",
    created: "23/12/2023 12:00",
  },
  {
    id: "492",
    name: "Wade Warren",
    avatar: "https://i.pravatar.cc/150?u=492",
    balance: "$202.87",
    level: "JUNIOR",
    status: "ACTIVO",
    created: "04/12/2023 17:22",
  },
  {
    id: "740",
    name: "Robert Fox",
    avatar: "https://i.pravatar.cc/150?u=740",
    balance: "$293.01",
    level: "SENIOR",
    status: "VERIFICACIÓN",
    created: "09/12/2023 08:00",
  },
  {
    id: "429",
    name: "Ronald Richards",
    avatar: "https://i.pravatar.cc/150?u=429",
    balance: "$406.27",
    level: "MEDIO",
    status: "VERIFICACIÓN",
    created: "27/12/2023 08:23",
  },
  {
    id: "738",
    name: "Dianne Russell",
    avatar: "https://i.pravatar.cc/150?u=738",
    balance: "$275.43",
    level: "SENIOR",
    status: "EN PROGRESO",
    created: "07/12/2023 16:35",
  },
  {
    id: "816",
    name: "Kristin Watson",
    avatar: "https://i.pravatar.cc/150?u=816",
    balance: "$767.50",
    level: "JUNIOR",
    status: "VERIFICACIÓN",
    created: "15/12/2023 21:54",
  },
  {
    id: "647",
    name: "Theresa Webb",
    avatar: "https://i.pravatar.cc/150?u=647",
    balance: "$450.54",
    level: "MEDIO",
    status: "ELIMINADO",
    created: "08/12/2023 11:15",
  },
  {
    id: "556",
    name: "Jenny Wilson",
    avatar: "https://i.pravatar.cc/150?u=556",
    balance: "$105.55",
    level: "SENIOR",
    status: "ELIMINADO",
    created: "14/12/2023 10:09",
  },
  {
    id: "177",
    name: "Marvin McKinney",
    avatar: "https://i.pravatar.cc/150?u=177",
    balance: "$473.85",
    level: "JUNIOR",
    status: "EN PROGRESO",
    created: "09/12/2023 15:33",
  },
  {
    id: "447",
    name: "Darlene Robertson",
    avatar: "https://i.pravatar.cc/150?u=447",
    balance: "$854.08",
    level: "JUNIOR",
    status: "ACTIVO",
    created: "20/12/2023 09:20",
  },
];

const getLevelBadge = (level: string) => {
  switch (level) {
    case "SENIOR":
      return (
        <Badge
          className="bg-primary/10 text-primary border-transparent"
          tone="secondary"
        >
          SENIOR
        </Badge>
      );
    case "MEDIO":
      return (
        <Badge
          className="bg-info/10 text-info border-transparent"
          tone="secondary"
        >
          MEDIO
        </Badge>
      );
    case "JUNIOR":
      return (
        <Badge
          className="bg-success/10 text-success border-transparent"
          tone="secondary"
        >
          JUNIOR
        </Badge>
      );
    default:
      return <Badge tone="secondary">{level}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVO":
      return (
        <Badge
          className="bg-success/10 text-success border-transparent"
          tone="secondary"
        >
          ACTIVO
        </Badge>
      );
    case "BANEADO":
      return (
        <Badge
          className="bg-danger/10 text-danger border-transparent"
          tone="secondary"
        >
          BANEADO
        </Badge>
      );
    case "VERIFICACIÓN":
      return (
        <Badge
          className="bg-warning/10 text-warning border-transparent"
          tone="secondary"
        >
          VERIFICACIÓN
        </Badge>
      );
    case "EN PROGRESO":
      return (
        <Badge
          className="bg-info/10 text-info border-transparent"
          tone="secondary"
        >
          EN PROGRESO
        </Badge>
      );
    case "ELIMINADO":
      return (
        <Badge
          className="bg-muted text-muted-foreground border-transparent"
          tone="secondary"
        >
          ELIMINADO
        </Badge>
      );
    default:
      return <Badge tone="secondary">{status}</Badge>;
  }
};

import { Card } from "@/components/ui/card";
import { TableProperties } from "lucide-react";




export function TableShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <Card innerClassName="items-start text-left" className="p-8 rounded-xl shadow-lg border-border overflow-hidden space-y-10">
      {/* Section Header */}
      <div className="flex items-start gap-3.5 text-left pb-6 border-b border-border/60">
        <TableProperties className="w-7 h-7 text-primary flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-h2 font-heading font-bold text-primary-500">Table</h2>
          <p className="text-muted-foreground text-sm mt-1">Componente de visualización de datos tabulares estructurados con soporte para acciones y estados.</p>
        </div>
      </div>

      <div className="space-y-10">
        <SubSection title="Tabla de Gestión" description="Visualización tabular con paginación integrada y acciones sobre registros.">
          <div className="space-y-6">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-0 bg-primary/5">
                    <TableHead className="w-[80px] font-bold">ID</TableHead>
                    <TableHead className="min-w-[200px] font-bold">Usuario</TableHead>
                    <TableHead className="font-bold">Saldo</TableHead>
                    <TableHead className="font-bold">Nivel</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold">Fecha de caareación</TableHead>
                    <TableHead className="w-[100px] text-center font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {USERS.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {user.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="size-8 rounded-full object-cover border border-border"
                          />
                          <span className="font-semibold text-foreground">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{user.balance}</TableCell>
                      <TableCell>{getLevelBadge(user.level)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {user.created}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10"
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar usuario</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-danger hover:bg-danger/10"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar usuario</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination — fuera del contenedor de la tabla */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </SubSection>
      </div>
    </Card>
  );
}

