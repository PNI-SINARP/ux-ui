import { Card, CardHeader, CardTitle, CardDescription, CardIcon, CardDecorativeIcon, CardBadge } from "@/components/ui/card";
import { CapacityCard } from "@/components/ui/capacity-card";
import {
    BarChart3,
    Users,
    MapPin,
    Settings,
    Zap,
    Activity,
    ShieldAlert,
    Clock,
    Globe,
    PenTool,
    Languages,
    Layers,
    BookOpen,
} from "lucide-react";

export function CardShowcase() {
    return (
        <section className="grid gap-8">
            <div className="space-y-2">
                <h2 className="text-h3 font-bold flex items-center gap-2">
                    <Zap className="size-5 text-primary" />
                    Contenedores: Cards
                </h2>
                <p className="text-sm text-muted-foreground">
                    Paneles modulares para agrupar información con soporte para efectos de glassmorphism y jerarquía visual mediante tamaños e iconos.
                </p>
            </div>

            <div className="space-y-12">
                {/* GRID DE TAMAÑOS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Matriz de Tamaños y Jerarquía
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        {/* Default Card */}
                        <Card glow="primary-info">
                            <CardIcon className="bg-primary/10 text-primary">
                                <BarChart3 />
                            </CardIcon>
                            <CardHeader>
                                <CardTitle>Dashboard Principal</CardTitle>
                                <CardDescription>Visualización de métricas críticas en tiempo aareal.</CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Small Card */}
                        <Card size="sm" glow="success-warning">
                            <CardIcon className="bg-secondary/10 text-secondary">
                                <Users />
                            </CardIcon>
                            <CardHeader>
                                <CardTitle>Usuarios Activos</CardTitle>
                                <CardDescription>Gestión de sesión y actividad.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* BORDES NEON GRADIENT */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Efectos de Borde Neon (Gradient)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primary-Info Combination */}
                        <Card glow="primary-info">
                            <CardHeader>
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                                    <Activity className="size-6 text-primary" />
                                </div>
                                <CardTitle>Gestión de Actividad</CardTitle>
                                <CardDescription>Combinación Primary e Info para monitoreo en tiempo aareal.</CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Success-Warning Combination */}
                        <Card glow="success-warning">
                            <CardHeader>
                                <div className="size-12 rounded-xl bg-success/10 flex items-center justify-center mb-2">
                                    <Zap className="size-6 text-success" />
                                </div>
                                <CardTitle>Rendimiento Óptimo</CardTitle>
                                <CardDescription>Success y Warning para indicadores de estado y alertas.</CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Danger-Secondary Combination */}
                        <Card glow="danger-secondary">
                            <CardHeader>
                                <div className="size-12 rounded-xl bg-error/10 flex items-center justify-center mb-2">
                                    <ShieldAlert className="size-6 text-error" />
                                </div>
                                <CardTitle>Seguridad Crítica</CardTitle>
                                <CardDescription>Danger y Secondary para sistemas de protección y fallos.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* MATRIZ DE ESTADOS E ICONOS CON GRADIENTE */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Matriz de Estados (Conceptuales)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Success State */}
                        <Card size="sm" glow="success-warning">
                            <CardIcon className="bg-gradient-to-br from-success/20 to-success/5 text-success">
                                <Globe />
                            </CardIcon>
                            <CardTitle className="text-base">Global</CardTitle>
                        </Card>

                        {/* Warning State */}
                        <Card size="sm" glow="success-warning">
                            <CardIcon className="bg-gradient-to-br from-warning/20 to-warning/5 text-warning">
                                <Clock />
                            </CardIcon>
                            <CardTitle className="text-base">Historial</CardTitle>
                        </Card>

                        {/* Info State */}
                        <Card size="sm" glow="primary-info">
                            <CardIcon className="bg-gradient-to-br from-info/20 to-info/5 text-info">
                                <MapPin />
                            </CardIcon>
                            <CardTitle className="text-base">Zonas</CardTitle>
                        </Card>

                        {/* Danger State */}
                        <Card size="sm" glow="danger-secondary">
                            <CardIcon className="bg-gradient-to-br from-danger/20 to-danger/5 text-danger">
                                <Settings />
                            </CardIcon>
                            <CardTitle className="text-base">Ajustes</CardTitle>
                        </Card>
                    </div>
                </div>

                {/* FEATURED VARIANT — Colorful cards with decorative icon */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                            Variante Featured (Ícono Decorativo)
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Cards horizontales con fondo de color semántico, badge de categoría y un ícono decorativo en la esquina inferior derecha.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Primary / Design */}
                        <Card variant="featured" className="bg-primary/10 hover:bg-primary/15 border border-primary/20 min-h-[160px]">
                            <CardBadge className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 mb-2">
                                Design
                            </CardBadge>
                            <CardTitle className="text-sm font-bold text-primary">Product Design</CardTitle>
                            <CardDescription className="text-xs">320 lecciones</CardDescription>
                            <CardDecorativeIcon>
                                <PenTool className="size-32 text-primary" />
                            </CardDecorativeIcon>
                        </Card>

                        {/* Secondary / Languages */}
                        <Card variant="featured" className="bg-secondary/10 hover:bg-secondary/15 border border-secondary/20 min-h-[160px]">
                            <CardBadge className="bg-secondary/20 text-secondary text-[10px] px-2 py-0.5 mb-2">
                                Languages
                            </CardBadge>
                            <CardTitle className="text-sm font-bold text-secondary">English for IT</CardTitle>
                            <CardDescription className="text-xs">PSTC lessons</CardDescription>
                            <CardDecorativeIcon>
                                <Languages className="size-32 text-secondary" />
                            </CardDecorativeIcon>
                        </Card>

                        {/* Info / App Design */}
                        <Card variant="featured" className="bg-info/10 hover:bg-info/15 border border-info/20 min-h-[160px]">
                            <CardBadge className="bg-info/20 text-info text-[10px] px-2 py-0.5 mb-2">
                                Design
                            </CardBadge>
                            <CardTitle className="text-sm font-bold text-info">App Design</CardTitle>
                            <CardDescription className="text-xs">250 lecciones</CardDescription>
                            <CardDecorativeIcon>
                                <Layers className="size-32 text-info" />
                            </CardDecorativeIcon>
                        </Card>

                        {/* Warning / Management */}
                        <Card variant="featured" className="bg-warning/10 hover:bg-warning/15 border border-warning/20 min-h-[160px]">
                            <CardBadge className="bg-warning/20 text-warning text-[10px] px-2 py-0.5 mb-2">
                                Design
                            </CardBadge>
                            <CardTitle className="text-sm font-bold text-warning">Design Management</CardTitle>
                            <CardDescription className="text-xs">220 lecciones</CardDescription>
                            <CardDecorativeIcon>
                                <BookOpen className="size-32 text-warning" />
                            </CardDecorativeIcon>
                        </Card>
                    </div>

                    {/* Code hint */}
                    <div className="rounded-lg border border-border px-4 py-3">
                        <p className="text-xs text-muted-foreground font-mono">
                            <span className="text-primary">&lt;Card</span> <span className="text-info">variant</span>=<span className="text-success">&quot;featured&quot;</span> <span className="text-info">className</span>=<span className="text-success">&quot;bg-primary/10 border-primary/20&quot;</span><span className="text-primary">&gt;</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-primary">&lt;CardBadge&gt;</span>Categoría<span className="text-primary">&lt;/CardBadge&gt;</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-primary">&lt;CardTitle&gt;</span>Título<span className="text-primary">&lt;/CardTitle&gt;</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-primary">&lt;CardDecorativeIcon&gt;</span>&lt;Icon /&gt;<span className="text-primary">&lt;/CardDecorativeIcon&gt;</span>
                            <br />
                            <span className="text-primary">&lt;/Card&gt;</span>
                        </p>
                    </div>
                </div>

            </div>

            {/* DESIGN NOTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-border pt-8">
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Glassmorphism Core
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Las cards útilizan <code className="text-foreground">backdrop-blur-sm</code> y fondos semitransparentes para integrarse suavemente con los gradientes del fondo de la aplicación, manteniendo la legibilidad.
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Jerarquía Visual
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        El tamaño <code className="text-foreground">sm</code> reduce el espaciado y tamaño de fuente para dashboards de alta densidad, mientras que el tamaño <code className="text-foreground">default</code> es ideal para secciones principales.
                    </p>
                </div>
            </div>
        </section>
    );
}
