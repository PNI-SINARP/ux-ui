"use client"

import { SubSection } from "./sub-section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { MessageSquare, AlertTriangle, X, CheckCircle2, Info, Layers, FileQuestion, ArrowLeft, Home, SquareTerminal, User, Mail } from "lucide-react";




export function DialogShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);
  const [openWarning, setOpenWarning] = React.useState(false);
  const [openInfo, setOpenInfo] = React.useState(false);
  const [open404, setOpen404] = React.useState(false);

  return (
    <div className="space-y-10 w-full">
      {/* CONFIGURACIONES BÁSICAS Y COMPOSICIÓN */}
      <SubSection icon={SquareTerminal} id="dialog" title="Dialog & Composición Estándar" description={<>Estructura base útilizada para presentar contenido o acciones dentro de una ventana modal de forma clara, ordenada y consistente.<br /><br /><span className="text-muted-foreground italic">Generalmente incluye un título, una explicación breve, el contenido necesario para completar la taaarea y acciones para confirmar o cancelar.</span></>} registerSection={registerSection}>
        <div className="flex gap-7 items-center">
          {/* Standard Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral">Dialog con Doble Acción</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Acción</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas proceder con la sincronización de datos? Esta acción consumirá créditos de API.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <p className="text-sm text-left">Se detectaron 45 registros nuevos listos para ser procesados en el nodo central.</p>
              </div>
              <DialogFooter showCloseButton={true}>
                <Button variant="primary">Sincronizar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Single Action Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral">Dialog Acción Única</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notificación de Sistema</DialogTitle>
                <DialogDescription>
                  El mantenimiento programado comenzará en 15 minutos.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2">
                  <p className="text-sm text-left text-foreground">
                    <strong className="font-bold text-primary">Nota:</strong> Todos los servicios de geolocalización estarán en modo lectura durante la ventana de mantenimiento. Asegúrese de guardar los cambios antes de que inicie el proceso.
                  </p>
                </div>
              </div>
              <DialogFooter showCloseButton={false}>
                <Button variant="primary">Entendido</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SubSection>

      {/* TAMAÑOS Y DIMENSIONES */}
      <SubSection title="Tamaños del diálogo" description="El diálogo puede útilizar diferentes tamaños según la cantidad y complejidad de la información que necesita mostrar.">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground">Small</h4>
              <p className="text-xs text-muted-foreground mb-4">Adecuado para confirmaciones simples, mensajes breves o acciones que requieren poco contenido.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="neutral" size="sm">Pequeño</Button>
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>Compacto</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm py-2">Ideal para confirmaciones rápidas o alertas de sistema de baja complejidad.</p>
                  <DialogFooter showCloseButton={true}>
                    <Button variant="primary" size="sm">Aceptar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="mt-4"><span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">sm</span></div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground">Medium / Default</h4>
              <p className="text-xs text-muted-foreground mb-4">Tamaño estándar para formularios cortos, configuraciones y taaaaareas habituales del sistema.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="neutral">Mediano</Button>
                </DialogTrigger>
                <DialogContent size="default">
                  <DialogHeader>
                    <DialogTitle>Estándar</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm py-2">El tamaño por defecto para la mayoría de las interacciones en el dashboard.</p>
                  <DialogFooter showCloseButton={true}>
                    <Button variant="primary">Siguiente</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="mt-4"><span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">default</span></div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground">Large</h4>
              <p className="text-xs text-muted-foreground mb-4">Adecuado cuando el usuario necesita revisar o completar una mayor cantidad de información sin abandonar el contexto actual.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="neutral">Grande</Button>
                </DialogTrigger>
                <DialogContent size="xl">
                  <DialogHeader>
                    <DialogTitle>Extra Large</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="h-24 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center text-xs text-center p-2">Panel Lateral Izquierdo</div>
                    <div className="h-24 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center text-xs text-center p-2">Panel Central de Datos</div>
                    <div className="h-24 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center text-xs text-center p-2">Panel Lateral Derecho</div>
                  </div>
                  <DialogFooter showCloseButton={true}>
                    <Button variant="primary">Procesar Todo</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="mt-4"><span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">lg / xl</span></div>
            </div>
          </div>
          {/* Small */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral" size="sm">Pequeño (sm)</Button>
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Compacto</DialogTitle>
              </DialogHeader>
              <p className="text-sm py-2">Ideal para confirmaciones rápidas o alertas de sistema de baja complejidad.</p>
              <DialogFooter showCloseButton={true}>
                <Button variant="primary" size="sm">Aceptar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Medium (Default) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral">Mediano (Default)</Button>
            </DialogTrigger>
            <DialogContent size="default">
              <DialogHeader>
                <DialogTitle>Estándar</DialogTitle>
              </DialogHeader>
              <p className="text-sm py-2">El tamaño por defecto para la mayoría de las interacciones en el dashboard.</p>
              <DialogFooter showCloseButton={true}>
                <Button variant="primary">Siguiente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Extra Large */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral">Extra Grande (xl)</Button>
            </DialogTrigger>
            <DialogContent size="xl">
              <DialogHeader>
                <DialogTitle>Extra Large</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="h-24 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center text-xs text-center p-2">Panel Lateral Izquierdo</div>
                <div className="h-24 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center text-xs text-center p-2">Panel Central de Datos</div>
                <div className="h-24 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center text-xs text-center p-2">Panel Lateral Derecho</div>
              </div>
              <p className="text-sm text-muted-foreground">Este tamaño permite layouts de hasta 3 columnas o formularios complejos manteniendo la estética  .</p>
              <DialogFooter showCloseButton={true}>
                <Button variant="primary">Procesar Todo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SubSection>

      {/* COMPOSICIÓN SEMÁNTICA */}
      <SubSection title="Estados Críticos" description="Variantes del diálogo que útilizan color, iconografía y mensajes específicos para comunicar claramente el nivel de importancia o el resultado de una acción.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Success */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">Success</h4>
            <p className="text-xs text-muted-foreground mb-2">Confirma que una acción importante se completó correctamente.</p>
            <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
              <Button variant="success" onClick={() => setOpenSuccess(true)}>
                <CheckCircle2 className="size-4 mr-2" />
                Éxito
              </Button>
              <DialogContent variant="success">
                <DialogHeader>
                  <DialogTitle>Operación Completada</DialogTitle>
                  <DialogDescription>
                    Los datos han sido sincronizados correctamente con el servidor central de GLocation.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton={false}>
                  <Button variant="success" onClick={() => setOpenSuccess(false)}>Aceptar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Error */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">Error</h4>
            <p className="text-xs text-muted-foreground mb-2">Informa que una acción no pudo completarse y orienta al usuario sobre cómo continuar.</p>
            <Dialog open={openError} onOpenChange={setOpenError}>
              <Button variant="danger" onClick={() => setOpenError(true)}>
                <X className="size-4 mr-2" />
                Error
              </Button>
              <DialogContent variant="danger">
                <DialogHeader>
                  <DialogTitle>Acceso Denegado</DialogTitle>
                  <DialogDescription>
                    No tienes los permisos necesarios para modificar este recurso en el sector actual.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton={true}>
                  <Button variant="danger" onClick={() => setOpenError(false)}>Reintentar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Warning / Confirmación destructiva */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">Warning</h4>
            <p className="text-xs text-muted-foreground mb-2">Advierte sobre las consecuencias de una acción antes de ejecutarla.</p>
            <Dialog open={openWarning} onOpenChange={setOpenWarning}>
              <Button variant="warning" onClick={() => setOpenWarning(true)}>
                <AlertTriangle className="size-4 mr-2" />
                Advertencia
              </Button>
              <DialogContent variant="warning">
                <DialogHeader>
                  <DialogTitle>¿Eliminar elemento?</DialogTitle>
                  <DialogDescription>
                    Estás a punto de eliminar este elemento de la base de datos central. Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton={true} stacked={true}>
                  <Button variant="warning" onClick={() => setOpenWarning(false)}>Desactivar usuario</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">Info</h4>
            <p className="text-xs text-muted-foreground mb-2">Presenta información relevante que requiere atención del usuario, pero que no representa un error o riesgo inmediato.</p>
            <Dialog open={openInfo} onOpenChange={setOpenInfo}>
              <Button variant="info" onClick={() => setOpenInfo(true)}>
                <Info className="size-4 mr-2" />
                Información
              </Button>
              <DialogContent variant="info">
                <DialogHeader>
                  <DialogTitle>Análisis de Datos</DialogTitle>
                  <DialogDescription>
                    El escaneo de superficie muestra fluctuaciones energéticas inusuales en el sector 7G.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton={false}>
                  <Button variant="info" onClick={() => setOpenInfo(false)}>Entendido</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SubSection>



      {/* DESIGN NOTES */}
      {/* CASOS DE USO COMUNES */}
      <SubSection title="Casos de Uso Comunes" description="Ejemplos de modales estándar para taaaaareas frecuentes como ingreso de datos (formularios) o visualización de detalles (solo lectura), donde no se requiere la decoración visual expansiva de las alertas.">
        <div className="flex gap-7 items-center flex-wrap">
          {/* Form Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Modal de Formulario</Button>
            </DialogTrigger>
            <DialogContent variant="standard" size="lg">
              <DialogHeader>
                <DialogTitle className="text-left">Caarear Nuevo Usuario</DialogTitle>
                <DialogDescription className="text-left">
                  Completa los siguientes campos para registrar un usuario en el sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <InputGroup>
                    <InputGroupText>
                      <User className="size-4 text-muted-foreground" />
                    </InputGroupText>
                    <InputGroupInput id="name" placeholder="Ej. Laura Gómez" />
                  </InputGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <InputGroup>
                    <InputGroupText>
                      <Mail className="size-4 text-muted-foreground" />
                    </InputGroupText>
                    <InputGroupInput id="email" type="email" placeholder="laura@empresa.com" />
                  </InputGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Módulo asignado</Label>
                  <InputGroup>
                    <InputGroupText>
                      <Layers className="size-4 text-muted-foreground" />
                    </InputGroupText>
                    <InputGroupInput id="role" placeholder="Ej. Usuarios" />
                  </InputGroup>
                </div>
              </div>
              <DialogFooter showCloseButton={true}>
                <Button variant="primary">Guardar Usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Detail Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Modal de Detalles</Button>
            </DialogTrigger>
            <DialogContent variant="standard" size="default">
              <DialogHeader className="border-b border-border pb-4 mb-2">
                <DialogTitle className="text-left">Detalle del evento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2 text-sm">
                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                  <span className="font-semibold text-foreground">Fecha y hora:</span>
                  <span className="text-foreground/80">25 de agosto de 2026 · 16:30</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                  <span className="font-semibold text-foreground">Usuario:</span>
                  <span className="text-foreground/80">Laura Gómez</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                  <span className="font-semibold text-foreground">Módulo:</span>
                  <span className="text-foreground/80">Usuarios</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                  <span className="font-semibold text-foreground">Acción aarealizada:</span>
                  <span className="text-foreground/80">Editó usuario</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                  <span className="font-semibold text-foreground">Resultado:</span>
                  <span className="bg-success/10 text-success text-xs font-bold px-2 py-0.5 rounded-full w-fit">Exitoso</span>
                </div>

                <div className="mt-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 relative overflow-hidden flex gap-3 items-start shadow-xs">
                  <div className="w-1 self-stretch bg-primary rounded-full shrink-0 -ml-0.5 my-0.5" />
                  <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">Nota / Descripción</span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      Se actualizó la información del usuario <strong className="text-foreground font-semibold">Carlos Martínez</strong>. Campos modificados: <span className="text-primary-700 dark:text-primary-300 font-medium">correo electrónico</span>, <span className="text-primary-700 dark:text-primary-300 font-medium">roles asignados</span>.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter showCloseButton={true} className="border-t border-border pt-4 mt-2" />
            </DialogContent>
          </Dialog>
        </div>
      </SubSection>

      <SubSection title="Reglas de uso" description="Lineamientos para el uso correcto de ventanas modales en la plataforma.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-foreground tracking-widest">Cuándo útilizar un Modal</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Completar una taaarea puntual.</li>
              <li>Confirmar una acción importante.</li>
              <li>Editar información sin abandonar el contexto actual.</li>
              <li>Mostrar información que requiere atención inmediata.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-foreground tracking-widest">Evitar útilizarlo para:</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
              <li>Contenidos demasiado extensos.</li>
              <li>Navegación principal.</li>
              <li>Procesos con múltiples pasos complejos.</li>
              <li>Información que podría mostrarse directamente en la página.</li>
              <li>Encadenar varios modales uno encima de otro.</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-foreground tracking-widest">Jerarquía de acciones</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El modal debe tener una jerarquía clara entre las acciones. No útilizar dos botones con la misma jerarquía visual cuando una acción sea claramente la principal.<br /><br />
              Para acciones críticas: <code>Cancelar</code> (secundaria) — <code>Eliminar</code> (destructiva).
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-foreground tracking-widest">Redacción de botones</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Los botones deben útilizar verbos específicos. Evitar &quot;Aceptar&quot;, &quot;Sí&quot;, &quot;No&quot; o &quot;Continuar&quot; cuando sea posible indicar la acción exacta.<br /><br />
              Preferir: <i>Guardar usuario</i>, <i>Eliminar capa</i>, <i>Desactivar usuario</i>, <i>Reintentar carga</i>.
            </p>
          </div>
        </div>
      </SubSection>


    </div>
  );
}
