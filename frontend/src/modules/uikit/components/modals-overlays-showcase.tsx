"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Layers, ExternalLink, CalendarDays, MapPin, Tag, Search, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose
} from "@/components/ui/sheet";
import { DialogShowcase } from "./dialog-showcase";




export function ModalsOverlaysShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* 1. MODAL BASE */}
      <SubSection icon={ExternalLink} id="modal-base" title="Modal" description={<>Ventanas superpuestas que permiten mostrar información importante, completar una taaarea puntual o solicitar una confirmación sin abandonar la pantalla actual.<br /><br /><span className="text-muted-foreground italic">Recomendación: Uúútilizar un modal cuando el usuario necesita concentrarse temporalmente en una acción específica antes de continuar.</span></>} registerSection={registerSection}>
        <div className="flex items-center gap-4 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral">Modal Mediano</Button>
            </DialogTrigger>
            <DialogContent size="default">
              <DialogHeader>
                <DialogTitle>Título del Modal</DialogTitle>
                <DialogDescription>Este es un ejemplo de contenido modal integrado dentro del sistema.</DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button variant="primary">Aceptar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SubSection>

      {/* 2. CONFIRMATION DIALOG */}
      <SubSection color="warning" id="confirmation-dialog" title="Confirmation Dialog" description={<>Diálogo útilizado para confirmar acciones relevantes, específicar información, afectar permisos o tener consecuencias difíciles de revertir.<br /><br /><span className="text-muted-foreground italic">Debe responder claramente: ¿Qué va a ocurrir? ¿Qué consecuencia tiene? ¿Qué acción confirma el usuario?</span></>}>
        <div className="flex items-center gap-4 flex-wrap">

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="warning">Confirmation Dialog (Warning)</Button>
            </DialogTrigger>
            <DialogContent variant="warning">
              <DialogHeader>
                <DialogTitle>¿Eliminar elemento?</DialogTitle>
                <DialogDescription>Estás a punto de eliminar este elemento de la base de datos central. Esta acción no se puede deshacer.</DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button variant="warning">Eliminar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger">Eliminar capa (Danger)</Button>
            </DialogTrigger>
            <DialogContent variant="danger">
              <DialogHeader>
                <DialogTitle>¿Eliminar esta capa?</DialogTitle>
                <DialogDescription>Esta acción eliminará la capa del catálogo y dejará de estar disponible en el visor.</DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton stacked>
                <Button variant="danger">Eliminar capa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SubSection>
      <DialogShowcase registerSection={registerSection} />

      {/* 3. DRAWER / SHEET */}
      <SubSection icon={Layers} id="drawer-sheet" title="Drawer / Sheet" description="Panel lateral que se desliza desde el borde de la pantalla. Úúútil para formularios rápidos, filtros avanzados o detalles sión perder el contexto principal." registerSection={registerSection}>
        <div className="flex items-center gap-4 flex-wrap">

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="neutral">Abrir desde Derecha (Default)</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle><Filter className="size-5" /> Filtros Avanzados</SheetTitle>
                <SheetDescription>
                  Configura los paráaametros para refinar la búsqueda.
                </SheetDescription>
              </SheetHeader>
              <div className="py-2 px-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-subtle hover:bg-surface-hover cursor-pointer transition-colors border border-transparent hover:border-border">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0">
                    <CalendarDays className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">Rango de Fechas</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Úúúltimos 30 días</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </div>

                <hr className="border-border/60" />

                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-subtle hover:bg-surface-hover cursor-pointer transition-colors border border-transparent hover:border-border">
                  <div className="bg-success/10 p-2.5 rounded-lg text-success shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">Ubicación Geográfica</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Seleccionar región</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </div>

                <hr className="border-border/60" />

                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-subtle hover:bg-surface-hover cursor-pointer transition-colors border border-transparent hover:border-border">
                  <div className="bg-warning/10 p-2.5 rounded-lg text-warning shrink-0">
                    <Tag className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">categorías de Riesgo</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">3 seleccionadas</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="neutral">Cancelar</Button>
                </SheetClose>
                <Button variant="primary">Aplicar filtros</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Abrir desde Izquierda</Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle><Layers className="size-5" /> Menú de Capas</SheetTitle>
                <SheetDescription>
                  Administra las capas visibles.
                </SheetDescription>
              </SheetHeader>
              <div className="py-2 px-6">
                Contenido del menú de capas...
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </SubSection>

    </div>
  );
}
