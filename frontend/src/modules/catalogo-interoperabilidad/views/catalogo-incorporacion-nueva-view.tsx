"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileText,
  Plus,
  Trash2,
  Upload,
  Info,
  CheckCircle2,
  Save,
  Send,
  AlertCircle,
  UserCheck,
  Check,
  FileCheck2,
  Layers,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardDecorativeIcon } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stepper, type Step } from "@/components/ui/stepper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import {
  INITIAL_INSTITUCIONES,
  ROLES_CONFIG,
  MOCK_USERS_BY_ROLE,
  type DocumentoSoporte,
  type UserRole
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function CatalogoIncorporacionNuevaView() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useSimulatedRole("COORDINADOR_SINARP");
  const [currentStep, setCurrentStep] = useState(1);

  const currentUser = MOCK_USERS_BY_ROLE[activeRole];

  // Datos principales de la fuente (HU-INT-03)
  const [selectedInstId, setSelectedInstId] = useState("INST-001");
  const [nombreFuente, setNombreFuente] = useState("");
  const [codigoSugerido, setCodigoSugerido] = useState("");
  const [descripcionFuente, setDescripcionFuente] = useState("");
  const [baseLegal, setBaseLegal] = useState("");
  const [tipoConsumo, setTipoConsumo] = useState("Servicio Web (REST/JSON)");

  // Documentos Soporte preliminares (Res. 004 Art. 12)
  const [documentos, setDocumentos] = useState<DocumentoSoporte[]>([
    {
      id: "doc-01",
      nombre: "Oficio formal de solicitud de alta de fuente",
      tipoRequerido: "PDF Firmado Electrónicamente",
      archivoNombre: "Oficio_Solicitud_Alta_RC_2026.pdf",
      archivoTamano: "1.4 MB",
      fechaCarga: new Date().toLocaleDateString("es-EC"),
      estadoRevision: "Pendiente",
      esReferencial: true
    },
    {
      id: "doc-02",
      nombre: "Diccionario técnico y especificación OpenAPI / WSDL",
      tipoRequerido: "JSON / YAML / PDF",
      archivoNombre: "Especificacion_Tecnica_Servicio.json",
      archivoTamano: "620 KB",
      fechaCarga: new Date().toLocaleDateString("es-EC"),
      estadoRevision: "Pendiente",
      esReferencial: true
    },
    {
      id: "doc-03",
      nombre: "Designación formal del Coordinador SINARP (Titular / Suplente)",
      tipoRequerido: "Acción de Personal / Resolución PDF",
      archivoNombre: "Resolucion_Designacion_Coordinador.pdf",
      archivoTamano: "890 KB",
      fechaCarga: new Date().toLocaleDateString("es-EC"),
      estadoRevision: "Pendiente",
      esReferencial: true
    }
  ]);

  // Campos Candidatos (Mínimo 1 requerido)
  const [campos, setCampos] = useState<Array<{ id: string; nombre: string; tipo: "Texto" | "Numérico" | "Fecha" | "Booleano" | "JSON" | "Alfanumérico"; descripcion: string }>>([
    { id: "c-01", nombre: "numeroIdentificacion", tipo: "Alfanumérico", descripcion: "Número único de cédula o documento de identificación" },
    { id: "c-02", nombre: "nombresCompletos", tipo: "Texto", descripcion: "Nombres y apellidos completos según acta registral" },
    { id: "c-03", nombre: "fechaNacimiento", tipo: "Fecha", descripcion: "Fecha de nacimiento registrada (AAAA-MM-DD)" }
  ]);

  // Estado del nuevo campo en modal o inline
  const [nuevoCampoNombre, setNuevoCampoNombre] = useState("");
  const [nuevoCampoTipo, setNuevoCampoTipo] = useState<"Texto" | "Numérico" | "Fecha" | "Booleano" | "JSON" | "Alfanumérico">("Texto");
  const [nuevoCampoDescripcion, setNuevoCampoDescripcion] = useState("");

  const handleAgregarCampo = () => {
    if (!nuevoCampoNombre.trim() || !nuevoCampoDescripcion.trim()) {
      alert("Ingrese nombre y descripción para el campo candidato.");
      return;
    }

    setCampos([
      ...campos,
      {
        id: `c-${Date.now()}`,
        nombre: nuevoCampoNombre.trim(),
        tipo: nuevoCampoTipo,
        descripcion: nuevoCampoDescripcion.trim()
      }
    ]);

    setNuevoCampoNombre("");
    setNuevoCampoDescripcion("");
    setNuevoCampoTipo("Texto");
  };

  const handleEliminarCampo = (id: string) => {
    if (campos.length <= 1) {
      alert("Debe existir al menos un campo candidato para radicar la integración.");
      return;
    }
    setCampos(campos.filter(c => c.id !== id));
  };

  const handleEnviarARevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole !== "COORDINADOR_SINARP") return;

    if (!nombreFuente.trim() || !descripcionFuente.trim()) {
      alert("Por favor complete los campos obligatorios de la fuente (Paso 1).");
      setCurrentStep(1);
      return;
    }

    if (campos.length === 0) {
      alert("Debe ingresar al menos un campo candidato (Paso 2).");
      setCurrentStep(2);
      return;
    }

    alert(
      "¡Integración enviada a revisión formal!\n\n" +
      "Estado asignado: EN REVISIÓN DGR\n" +
      "Responsable asignado: María Torres (DGR)\n" +
      "Referencia: HU-INT-03 / HU-INT-04"
    );

    router.push("/catalogo-interoperabilidad/administracion");
  };

  const isCoordinador = activeRole === "COORDINADOR_SINARP";

  const stepperSteps: Step[] = [
    {
      id: "1",
      title: "Datos de la fuente",
      description: "Institución y fuente",
      icon: Building2,
    },
    {
      id: "2",
      title: "Campos candidatos",
      description: "Estructura inicial",
      icon: Layers,
    },
    {
      id: "3",
      title: "Documentación soporte",
      description: "Resolución N° 004",
      icon: FileCheck2,
    },
  ];

  const currentInstitucion = INITIAL_INSTITUCIONES.find(i => i.id === selectedInstId) || INITIAL_INSTITUCIONES[0];

  return (
    <WireframeDashboardLayout
      activeMenu="catalogo-interoperabilidad"
      breadcrumbs={[
        { label: "Catálogo de interoperabilidad", href: "/catalogo-interoperabilidad/catalogo" },
        { label: "Administración", href: "/catalogo-interoperabilidad/administracion" },
        { label: "Nueva Integración" }
      ]}
      headerSlot={
        <div data-tour="tour-roles" className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Vista simulada
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 bg-muted/40 border-border hover:bg-muted text-xs shadow-xs text-foreground font-medium">
                <UserCheck className="size-3.5" />
                {ROLES_CONFIG[activeRole]?.shortName || activeRole}
                <ChevronDown className="size-3 opacity-60 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 mb-1 bg-muted/50 border-b border-border text-xs text-muted-foreground">
                Permite visualizar el prototipo según las responsabilidades de cada rol.
              </div>
              {(["COORDINADOR_SINARP", "DGR", "DTD", "DPI"] as UserRole[]).map(roleKey => {
                const r = ROLES_CONFIG[roleKey];
                return (
                  <DropdownMenuItem
                    key={roleKey}
                    onClick={() => setActiveRole(roleKey)}
                    className="text-xs cursor-pointer flex justify-between"
                  >
                    <span>{r.shortName}</span>
                    {activeRole === roleKey && <CheckCircle2 className="size-3.5 text-foreground" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Contenedor principal */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          {/* Volver a administración */}
          <div>
            <Link
              href="/catalogo-interoperabilidad/administracion"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Volver a administración del catálogo</span>
            </Link>
          </div>

          {/* Cabecera */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                Nueva Integración de Fuente
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Registra una nueva fuente de datos y sus campos candidatos para someterla a revisión formal ante DINARP.
              </p>
            </div>
            <Badge tone="neutral" appearance="outline" size="sm" className="text-xs shrink-0 self-start sm:self-auto">
              HU-INT-03: Registro de Fuente Candidata
            </Badge>
          </div>

          {!isCoordinador ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-surface shadow-xs">
              <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <AlertCircle className="size-6 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold font-heading mb-2 text-foreground">Acceso Restringido</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Esta acción corresponde únicamente al <strong>Coordinador SINARP</strong>.
                Por favor, cambia el rol de simulación en la parte superior derecha para continuar.
              </p>
            </div>
          ) : (
            <>
              {/* Stepper del UI kit */}
              <div id="stepper-container" className="pt-2 pb-4 border-b border-border">
                <Stepper
                  steps={stepperSteps}
                  activeStep={currentStep - 1}
                  onStepClick={(index) => setCurrentStep(index + 1)}
                  size="sm"
                />
              </div>

              {/* PASO 1: DATOS DE LA INSTITUCIÓN Y FUENTE */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <Building2 className="size-4 text-foreground" />
                    </CardDecorativeIcon>
                    <div>
                      <h2 className="text-base font-bold font-heading text-foreground">
                        1. Datos de la Institución y Fuente
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Información institucional y propósito de la fuente a incorporar
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Institución Emisora */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="institucion-select" className="text-xs font-semibold text-foreground">
                        Institución emisora <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="institucion-select"
                        value={selectedInstId}
                        onChange={e => setSelectedInstId(e.target.value)}
                        className="h-10 text-sm border border-border rounded-lg bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      >
                        {INITIAL_INSTITUCIONES.map(inst => (
                          <option key={inst.id} value={inst.id}>
                            {inst.nombre} ({inst.sigla}) — RUC: {inst.codigoInstitucion}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nombre de la fuente */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="nombre-fuente" className="text-xs font-semibold text-foreground">
                        Nombre oficial de la fuente de datos <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nombre-fuente"
                        placeholder="Ej: Registro de Defunciones y Causas de Fallecimiento"
                        value={nombreFuente}
                        onChange={e => setNombreFuente(e.target.value)}
                        className="h-10 text-sm"
                        required
                      />
                    </div>

                    {/* Código sugerido */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="codigo-sugerido" className="text-xs font-semibold text-foreground">
                        Código de fuente sugerido
                      </Label>
                      <Input
                        id="codigo-sugerido"
                        placeholder="Ej: SRV-RC-004"
                        value={codigoSugerido}
                        onChange={e => setCodigoSugerido(e.target.value)}
                        className="h-10 text-sm font-mono"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        Sujeto a validación y asignación técnica final por DTD.
                      </span>
                    </div>

                    {/* Tipo de Consumo */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="tipo-consumo" className="text-xs font-semibold text-foreground">
                        Tipo de consumo previsto
                      </Label>
                      <select
                        id="tipo-consumo"
                        value={tipoConsumo}
                        onChange={e => setTipoConsumo(e.target.value)}
                        className="h-10 text-sm border border-border rounded-lg bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      >
                        <option value="Servicio Web (REST/JSON)">Servicio Web (REST/JSON)</option>
                        <option value="Intercambio Masivo (Batch)">Intercambio Masivo (Batch)</option>
                        <option value="SOAP / XML">SOAP / XML</option>
                      </select>
                    </div>

                    {/* Descripción */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="descripcion-fuente" className="text-xs font-semibold text-foreground">
                        Descripción funcional de la fuente <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="descripcion-fuente"
                        placeholder="Detalla el alcance, contenido y finalidad de la fuente que se incorpora..."
                        value={descripcionFuente}
                        onChange={e => setDescripcionFuente(e.target.value)}
                        rows={3}
                        className="text-xs leading-relaxed"
                        required
                      />
                    </div>

                    {/* Base legal */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="base-legal" className="text-xs font-semibold text-foreground">
                        Base legal aplicable
                      </Label>
                      <Input
                        id="base-legal"
                        placeholder="Ej: Ley Orgánica de Gestión de la Identidad y Datos Civiles / Art. 12 Res. 004"
                        value={baseLegal}
                        onChange={e => setBaseLegal(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Acciones de pie de paso 1 */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      asChild
                      className="text-xs text-foreground"
                    >
                      <Link href="/catalogo-interoperabilidad/administracion">
                        Cancelar
                      </Link>
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      onClick={() => {
                        if (!nombreFuente.trim() || !descripcionFuente.trim()) {
                          alert("Por favor complete el nombre y la descripción de la fuente.");
                          return;
                        }
                        setCurrentStep(2);
                      }}
                      className="text-xs gap-2 font-semibold !text-white"
                    >
                      <span className="!text-white">Continuar a campos candidatos</span>
                      <ArrowRight className="size-4 text-white" />
                    </Button>
                  </div>
                </div>
              )}

              {/* PASO 2: CAMPOS CANDIDATOS */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardDecorativeIcon>
                        <Layers className="size-4 text-foreground" />
                      </CardDecorativeIcon>
                      <div>
                        <h2 className="text-base font-bold font-heading text-foreground">
                          2. Campos Candidatos a Publicación
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Estructura inicial de datos que conformarán la fuente de interoperabilidad
                        </p>
                      </div>
                    </div>
                    <Badge tone="neutral" appearance="soft" size="sm">
                      {campos.length} campos registrados
                    </Badge>
                  </div>

                  {/* Tabla de campos existentes */}
                  <div className="border border-border rounded-xl overflow-x-auto bg-surface">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="py-2.5 px-3">Nombre del campo</th>
                          <th className="py-2.5 px-3">Tipo de dato</th>
                          <th className="py-2.5 px-3">Descripción</th>
                          <th className="py-2.5 px-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {campos.map((campo) => (
                          <tr key={campo.id} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                              {campo.nombre}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                                {campo.tipo}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground max-w-sm">
                              {campo.descripcion}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEliminarCampo(campo.id)}
                                className="size-7 text-muted-foreground hover:text-destructive"
                                title="Eliminar campo"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Formulario Inline para agregar nuevo campo */}
                  <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col gap-3">
                    <span className="text-xs font-semibold text-foreground">
                      + Agregar nuevo campo candidato
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4 flex flex-col gap-1">
                        <Label htmlFor="new-campo-nombre" className="text-[11px] text-muted-foreground font-medium">
                          Nombre técnico del campo
                        </Label>
                        <Input
                          id="new-campo-nombre"
                          placeholder="Ej: lugarFallecimiento"
                          value={nuevoCampoNombre}
                          onChange={e => setNuevoCampoNombre(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-3 flex flex-col gap-1">
                        <Label htmlFor="new-campo-tipo" className="text-[11px] text-muted-foreground font-medium">
                          Tipo de dato
                        </Label>
                        <select
                          id="new-campo-tipo"
                          value={nuevoCampoTipo}
                          onChange={e => setNuevoCampoTipo(e.target.value as any)}
                          className="h-8 text-xs border border-border rounded-lg bg-background px-2 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                        >
                          <option value="Texto">Texto</option>
                          <option value="Alfanumérico">Alfanumérico</option>
                          <option value="Numérico">Numérico</option>
                          <option value="Fecha">Fecha</option>
                          <option value="Booleano">Booleano</option>
                          <option value="JSON">JSON</option>
                        </select>
                      </div>
                      <div className="sm:col-span-5 flex flex-col gap-1">
                        <Label htmlFor="new-campo-desc" className="text-[11px] text-muted-foreground font-medium">
                          Descripción del atributo
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="new-campo-desc"
                            placeholder="Descripción y propósito..."
                            value={nuevoCampoDescripcion}
                            onChange={e => setNuevoCampoDescripcion(e.target.value)}
                            className="h-8 text-xs flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAgregarCampo}
                            className="h-8 text-xs shrink-0 text-foreground font-medium bg-background"
                          >
                            <Plus className="size-3.5 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de pie de paso 2 */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs gap-1.5 text-foreground"
                    >
                      <ArrowLeft className="size-4" />
                      Anterior: Datos de fuente
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      onClick={() => {
                        if (campos.length === 0) {
                          alert("Debe existir al menos un campo candidato.");
                          return;
                        }
                        setCurrentStep(3);
                      }}
                      className="text-xs gap-2 font-semibold !text-white"
                    >
                      <span className="!text-white">Continuar a documentación</span>
                      <ArrowRight className="size-4 text-white" />
                    </Button>
                  </div>
                </div>
              )}

              {/* PASO 3: DOCUMENTACIÓN SOPORTE Y ENVÍO */}
              {currentStep === 3 && (
                <form onSubmit={handleEnviarARevision} className="flex flex-col gap-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardDecorativeIcon>
                        <FileCheck2 className="size-4 text-foreground" />
                      </CardDecorativeIcon>
                      <div>
                        <h2 className="text-base font-bold font-heading text-foreground">
                          3. Documentación Soporte y Confirmación
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Requisitos formales según Resolución N° 004 Art. 12
                        </p>
                      </div>
                    </div>
                    <Badge tone="neutral" appearance="soft" size="sm">
                      {documentos.length} documentos
                    </Badge>
                  </div>

                  {/* Anotación de diseño obligatoria */}
                  <div className="bg-muted/40 border border-border rounded-xl p-3.5 flex items-start gap-3">
                    <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Anotación de diseño (HU-INT-03):</strong> El listado exacto de documentos soporte y metadatos adicionales está <em>pendiente de definición con DINARP</em>. Se presenta la estructura base requerida por el procedimiento actual.
                    </div>
                  </div>

                  {/* Lista de documentos */}
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
                    {documentos.map((doc) => (
                      <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="size-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              {doc.nombre}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Requerido: {doc.tipoRequerido}
                            </span>
                            {doc.archivoNombre && (
                              <span className="text-[11px] text-muted-foreground/80 font-mono mt-0.5">
                                Archivo: {doc.archivoNombre} ({doc.archivoTamano || "1.2 MB"})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc.archivoNombre ? (
                            <Badge tone="success" appearance="soft" size="sm" className="gap-1">
                              <Check className="size-3" />
                              Cargado
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-foreground font-medium">
                              <Upload className="size-3.5" />
                              Cargar archivo
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tarjeta de Resumen Preliminar */}
                  <div className="p-4 bg-muted/20 border border-border rounded-xl flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Resumen del expediente a radicar
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Institución</span>
                        <strong className="text-foreground">{currentInstitucion.sigla}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Fuente</span>
                        <strong className="text-foreground truncate block">{nombreFuente || "(Sin nombre)"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Campos definidos</span>
                        <strong className="text-foreground">{campos.length} campos</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Documentos</span>
                        <strong className="text-foreground">{documentos.length} requisitos</strong>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción finales */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto text-xs gap-1.5 text-foreground"
                    >
                      <ArrowLeft className="size-4" />
                      Anterior: Campos
                    </Button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={() => {
                          alert("Borrador guardado localmente en el expediente.");
                        }}
                        className="w-full sm:w-auto text-xs gap-1.5 text-foreground"
                      >
                        <Save className="size-4" />
                        Guardar borrador
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="default"
                        className="w-full sm:w-auto text-xs gap-2 font-semibold !text-white"
                      >
                        <Send className="size-4 text-white" />
                        <span className="!text-white">Enviar a revisión DGR</span>
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </WireframeDashboardLayout>
  );
}
