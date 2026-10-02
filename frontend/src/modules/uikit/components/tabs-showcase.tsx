import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Layout, User, Settings, Shield } from "lucide-react";

export function TabsShowcase() {
  return (
    <div className="space-y-12">

      <div className="space-y-12">
        {/* DEFAULT CAPSULE TABS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Esúútilo Cápsula (Default)
          </h3>
          <Tabs defaultValue="account" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="account">ACCOUNT</TabsTrigger>
              <TabsTrigger value="password">PASSWORD</TabsTrigger>
              <TabsTrigger value="settings">SETTINGS</TabsTrigger>
            </TabsList>
            <div className="py-6 bg-transparent">
              <TabsContent value="account">
                <p className="text-sm text-muted-foreground italic">
                  Configuración de la cuenta de usuario y perfil.
                </p>
              </TabsContent>
              <TabsContent value="password">
                <p className="text-sm text-muted-foreground italic">
                  Gestión de credenciales y seguridad de acceso.
                </p>
              </TabsContent>
              <TabsContent value="settings">
                <p className="text-sm text-muted-foreground italic">
                  Preferencias generales de la aplicación.
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* WITH ICONS */}
        <div className="space-y-4 pt-6 border-t border-border">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Con Iconos
          </h3>
          <Tabs defaultValue="profile" className="w-full max-w-lg">
            <TabsList>
              <TabsTrigger value="profile">
                <User className="size-3.5" />
                PROFILE
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="size-3.5" />
                SECURITY
              </TabsTrigger>
              <TabsTrigger value="config">
                <Settings className="size-3.5" />
                CONFIG
              </TabsTrigger>
            </TabsList>
            <div className="py-6 bg-transparent">
              <TabsContent value="profile" className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h4 className="text-sm font-bold mb-2">Información del Perfil</h4>
                <p className="text-xs text-muted-foreground">Detalles personales y avatar del usuario.</p>
              </TabsContent>
              <TabsContent value="security" className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h4 className="text-sm font-bold mb-2">Seguridad Avanzada</h4>
                <p className="text-xs text-muted-foreground">Autenticación de dos factores y sesiones activas.</p>
              </TabsContent>
              <TabsContent value="config" className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h4 className="text-sm font-bold mb-2">Configuración del Sistema</h4>
                <p className="text-xs text-muted-foreground">Ajustes técnicos y paráaametros globales.</p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* DESIGN NOTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-border pt-8">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Coherencia Visual
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Las Tabs útilizan el mismo contenedor de cápsula que los Breadcrumbs, manteniendo un lenguaje visual unificado en toda la plataforma.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Estados e Interacción
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            El estado activo se destaca con un fondo sólido en <code className="text-foreground">primary</code> y una sombra de resplandor, mientras que los inactivos muestran un subrayado sútil en hover.
          </p>
        </div>
      </div>
    </div>
  );
}
