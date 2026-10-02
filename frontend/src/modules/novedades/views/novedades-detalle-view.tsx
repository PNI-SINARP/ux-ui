"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Building2,
  Calendar,
  Database,
  History,
  FileCheck,
  Settings2,
  MailCheck,
  Ban
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stepper, type Step } from "@/components/ui/stepper";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";

const STEPS: Step[] = [
  { id: "radicacion", title: "Radicación", icon: FileText },
  { id: "validacion", title: "Validación legal y funcional", icon: FileCheck },
  { id: "aplicacion", title: "Aplicación en catálogo", icon: Settings2 },
  { id: "notificacion", title: "Notificación / cierre", icon: MailCheck },
];

export function NovedadesDetalleView() {
  const [activeTab, setActiveTab] = useState("resumen");
  const activeStepIndex = 3; // FINALIZADA

  return (
    <WireframeDashboardLayout>
      <div className="space-y-6">
        <WireframeBreadcrumbs 
          segments={[
            { label: "Inicio", href: "/" },
            { label: "Novedades del Catálogo", href: "/novedades" },
            { label: "NOV-2026-001", href: "/novedades/detalle" },
          ]}
        />

        <div className="flex items-center gap-4">
          <Link href="/novedades">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
              Caso NOV-2026-001
              <Badge tone="neutral" appearance="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 ml-2">
                <Ban className="h-3 w-3 mr-1" />
                SUPRESIÓN
              </Badge>
              <Badge tone="neutral" appearance="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                FINALIZADA
              </Badge>
            </h1>
          </div>
        </div>

        {/* Header del caso */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Organismo solicitante
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  Dirección General de Registro Civil
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Fecha de radicación
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  15 de Septiembre, 2026
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Database className="h-4 w-4" /> Fuente(s) afectada(s)
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  Registro de Defunciones (WS_DEF_01)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stepper */}
        <Card>
          <CardContent className="p-6">
            <Stepper 
              steps={STEPS} 
              activeStep={activeStepIndex} 
              completedSteps={[0, 1, 2, 3]} 
              orientation="horizontal"
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto md:h-12 w-full mb-6">
            <TabsTrigger value="resumen" className="py-2.5">Resumen</TabsTrigger>
            <TabsTrigger value="requerimiento" className="py-2.5">Requerimiento</TabsTrigger>
            <TabsTrigger value="validacion" className="py-2.5">Validación</TabsTrigger>
            <TabsTrigger value="aplicacion" className="py-2.5">Aplicación</TabsTrigger>
            <TabsTrigger value="historial" className="py-2.5">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-0 outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Caso</CardTitle>
                <CardDescription>Información general y síntesis de la novedad.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
                  <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2">Motivo de Supresión</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    La institución informa la obsolescencia de la fuente de consulta v1, la cual ha sido reemplazada en su totalidad por la fuente de Registro de Hechos Vitales v2. Se solicita dar de baja el endpoint antiguo para evitar consultas inconsistentes por parte de las entidades consumidoras.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requerimiento" className="mt-0 outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Requerimiento</CardTitle>
                <CardDescription>Detalle de la solicitud ingresada por la institución.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mb-4 text-slate-300" />
                  <p>Documentación adjunta y oficio de solicitud del requerimiento.</p>
                  <Button variant="outline" className="mt-4">Ver Documentos</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validacion" className="mt-0 outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Validación legal y funcional</CardTitle>
                <CardDescription>Revisión técnica y jurídica de la solicitud.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FileCheck className="h-12 w-12 mb-4 text-slate-300" />
                  <p>Informes de validación aprobados.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aplicacion" className="mt-0 outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Aplicación en catálogo</CardTitle>
                <CardDescription>Acciones técnicas ejecutadas en la plataforma.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Settings2 className="h-12 w-12 mb-4 text-slate-300" />
                  <p>La fuente WS_DEF_01 ha sido marcada como INACTIVA en la base de datos.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial" className="mt-0 outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Historial</CardTitle>
                <CardDescription>Bitácora de cambios y estados de la solicitud.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <History className="h-12 w-12 mb-4 text-slate-300" />
                  <p>Línea de tiempo de acciones (Trazabilidad).</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WireframeDashboardLayout>
  );
}
