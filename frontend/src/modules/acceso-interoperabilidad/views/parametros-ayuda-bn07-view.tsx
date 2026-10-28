"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Database,
  ExternalLink,
  FileText,
  History,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldAlert,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search as SearchInput } from "@/components/ui/search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { toast } from "sonner";
import {
  BloqueTextoAyudaBN07,
  ConfiguracionAyudaBN07,
  OverrideAyudaPorCampoBN07,
  useConfiguracionAyudaBN07,
} from "../data/ayuda-justificacion-store";
import { AyudaPermanenteCampoBN07 } from "../components/ayuda-permanente-campo-bn07";
import {
  INITIAL_INSTITUCIONES,
  applyCatalogoOverridesToInstituciones,
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function ParametrosAyudaBN07View({ embedded = false }: { embedded?: boolean }) {
  const { config, saveConfig, resetConfig } = useConfiguracionAyudaBN07();
  const [draft, setDraft] = useState<ConfiguracionAyudaBN07>(config);
  const [selectedCampoIdToAdd, setSelectedCampoIdToAdd] = useState<string>("");
  const [searchCampoQuery, setSearchCampoQuery] = useState<string>("");
  const [previewSampleText, setPreviewSampleText] = useState<string>(
    "Se consulta el campo dentro del proceso de validación en línea..."
  );

  React.useEffect(() => {
    setDraft(config);
  }, [config]);

  const allCatalogoCampos = useMemo(() => {
    const instituciones = applyCatalogoOverridesToInstituciones(INITIAL_INSTITUCIONES);
    const list: Array<{
      id: string;
      nombre: string;
      descripcion: string;
      clasificacion: "Accesible" | "Confidencial";
      esSensible?: boolean;
      servicioNombre: string;
      institucionNombre: string;
    }> = [];

    instituciones.forEach((inst) => {
      inst.fuentes.forEach((srv) => {
        srv.campos.forEach((c) => {
          list.push({
            id: c.id,
            nombre: c.nombre,
            descripcion: c.descripcion,
            clasificacion: c.clasificacion === "Confidencial" ? "Confidencial" : "Accesible",
            esSensible: c.esSensible,
            servicioNombre: srv.nombre,
            institucionNombre: inst.nombre,
          });
        });
      });
    });
    return list;
  }, []);

  const filteredOverrides = useMemo(() => {
    const entries = Object.values(draft.overridesPorCampo);
    if (!searchCampoQuery.trim()) return entries;
    const q = searchCampoQuery.toLowerCase();
    return entries.filter(
      (item) =>
        item.campoNombre.toLowerCase().includes(q) ||
        item.servicioNombre.toLowerCase().includes(q) ||
        item.institucionNombre.toLowerCase().includes(q)
    );
  }, [draft.overridesPorCampo, searchCampoQuery]);

  const updateBloque = (
    key: keyof ConfiguracionAyudaBN07["bloques"],
    patch: Partial<BloqueTextoAyudaBN07>
  ) => {
    setDraft((prev) => ({
      ...prev,
      bloques: {
        ...prev.bloques,
        [key]: {
          ...prev.bloques[key],
          ...patch,
        },
      },
    }));
  };

  const handleSaveAll = () => {
    saveConfig(
      draft,
      "Actualización de criterios de orientación y ejemplos por campo para el formulario BN-07 por DPI."
    );
    toast.success("Configuración de ayudas BN-07 guardada", {
      description:
        "Los textos de orientación y ejemplos por campo se actualizaron en el formulario de solicitud.",
    });
  };

  const handleResetDefaults = () => {
    const restored = resetConfig();
    setDraft(restored);
    toast.info("Textos provisionales restaurados", {
      description:
        "Se restablecieron los criterios y ejemplos por defecto pendientes de aprobación por DINARP.",
    });
  };

  const handleAddOverrideCampo = () => {
    if (!selectedCampoIdToAdd) return;
    const found = allCatalogoCampos.find((c) => c.id === selectedCampoIdToAdd);
    if (!found) return;

    const esConfidencial = found.clasificacion === "Confidencial";
    const esSensible = esConfidencial && Boolean(found.esSensible);

    const newOverride: OverrideAyudaPorCampoBN07 = {
      campoId: found.id,
      campoNombre: found.nombre,
      servicioNombre: found.servicioNombre,
      institucionNombre: found.institucionNombre,
      clasificacion: found.clasificacion,
      esSensible,
      criterioFinalidad: "Incluya: nombre del campo + proceso institucional + necesidad específica",
      instruccionFinalidad: `Explique en qué proceso institucional se utilizará el campo ${found.nombre} y cuál es la necesidad específica dentro del trámite.`,
      ejemploFinalidad: `Se consulta el campo ${found.nombre} en el proceso de validación de trámites institucionales para verificar los requisitos del solicitante.`,
      criterioJustificacion: esConfidencial
        ? esSensible
          ? "Incluya: excepción LOPDP (Art. 26) + norma habilitante + relación con el acceso solicitado"
          : "Incluya: norma legal vigente + artículo aplicable + relación con el acceso solicitado"
        : undefined,
      instruccionJustificacion: esConfidencial
        ? `Relacione la norma legal y artículo específico que facultan a su entidad para solicitar acceso al campo ${found.nombre}.`
        : undefined,
      ejemploJustificacion: esConfidencial
        ? `El Art. ${
            esSensible ? "26 numeral 2 de la LOPDP y la norma sectorial aplicable" : "14 de la Ley institucional vigente"
          } facultan a la entidad a consultar ${found.nombre} para resolver el expediente.`
        : undefined,
      esProvisional: true,
    };

    setDraft((prev) => ({
      ...prev,
      overridesPorCampo: {
        ...prev.overridesPorCampo,
        [found.id]: newOverride,
      },
    }));
    setSelectedCampoIdToAdd("");
    toast.success(`Configuración agregada para ${found.nombre}`);
  };

  const handleRemoveOverrideCampo = (campoId: string) => {
    setDraft((prev) => {
      const nextOverrides = { ...prev.overridesPorCampo };
      delete nextOverrides[campoId];
      return {
        ...prev,
        overridesPorCampo: nextOverrides,
      };
    });
  };

  const updateOverrideCampo = (
    campoId: string,
    patch: Partial<OverrideAyudaPorCampoBN07>
  ) => {
    setDraft((prev) => {
      const current = prev.overridesPorCampo[campoId];
      if (!current) return prev;
      return {
        ...prev,
        overridesPorCampo: {
          ...prev.overridesPorCampo,
          [campoId]: {
            ...current,
            ...patch,
          },
        },
      };
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
              <Settings2 className="size-6 text-primary shrink-0" />
              Configuración de Ayudas y Ejemplos — Solicitud de Acceso (BN-07)
            </h1>
            <Badge tone="neutral" appearance="soft" size="sm" className="gap-1.5 font-semibold">
              <BookOpen className="size-3.5 text-primary" />
              Ejemplos provisionales (Pendientes de aprobación DINARP)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-4xl">
            Permite a <strong className="text-foreground font-semibold">DPI</strong> configurar los criterios de orientación, textos breves y ejemplos concretos por campo para{" "}
            <strong className="text-foreground font-semibold">Finalidad de uso</strong> y{" "}
            <strong className="text-foreground font-semibold">Justificación jurídica</strong> sin modificar código.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button
            variant="neutral"
            size="sm"
            onClick={handleResetDefaults}
            className="gap-1.5"
          >
            <RotateCcw className="size-4" />
            Restaurar valores por defecto
          </Button>
          <Button variant="neutral" size="sm" asChild className="gap-1.5">
            <Link href="/acceso-interoperabilidad/solicitudes/nueva">
              <ExternalLink className="size-4" />
              Ver en formulario BN-07
            </Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            className="gap-1.5"
          >
            <Save className="size-4" />
            Guardar configuración
          </Button>
        </div>
      </div>

      {/* Nota discreta sobre ejemplos provisionales y control de visualización */}
      <Card className="p-4 bg-muted/20 border-border rounded-xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <BookOpen className="size-4.5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-semibold text-foreground">
                Orientación práctica integrada debajo de cada campo
              </p>
              <p className="text-muted-foreground leading-relaxed">
                La ayuda enseña a justificar el uso del dato indicando{" "}
                <strong className="text-foreground font-medium">nombre del campo + proceso institucional + necesidad específica</strong>, y en datos confidenciales relaciona la{" "}
                <strong className="text-foreground font-medium">norma aplicable con el acceso solicitado</strong>. Los ejemplos actuales son provisionales, pendientes de aprobación por DINARP.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-surface px-3.5 py-2 rounded-lg border border-border shrink-0 self-start sm:self-center">
            <Checkbox
              id="toggle-mostrar-ejemplos"
              checked={draft.mostrarEjemplosReferenciales}
              variant="primary"
              size="sm"
              onCheckedChange={(checked) =>
                setDraft((prev) => ({
                  ...prev,
                  mostrarEjemplosReferenciales: Boolean(checked),
                }))
              }
            />
            <label
              htmlFor="toggle-mostrar-ejemplos"
              className="text-xs font-semibold text-foreground cursor-pointer select-none"
            >
              Mostrar ejemplo concreto debajo del campo
            </label>
          </div>
        </div>
      </Card>

      {/* Tabs de parametrización */}
      <Tabs defaultValue="por-campo" className="w-full space-y-5">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 p-1 bg-muted/40 rounded-xl border border-border">
          <TabsTrigger value="por-campo" className="py-2 text-xs sm:text-sm font-semibold gap-2">
            <Database className="size-4" />
            1. Ejemplos y Criterios por Campo ({Object.keys(draft.overridesPorCampo).length})
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="py-2 text-xs sm:text-sm font-semibold gap-2">
            <FileText className="size-4" />
            2. Orientación General por Clasificación
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="py-2 text-xs sm:text-sm font-semibold gap-2">
            <History className="size-4" />
            3. Historial de Configuración
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: GUÍA ESPECÍFICA POR CAMPO DEL CATÁLOGO */}
        <TabsContent value="por-campo" className="space-y-5">
          <Card className="p-5 border-border bg-card shadow-xs rounded-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1 flex-1">
                <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Configuración de textos y ejemplos concretos según el campo
                </h2>
                <p className="text-xs text-muted-foreground">
                  Personalice la orientación y el ejemplo concreto que verá el coordinador debajo de cada campo seleccionado en el BN-07.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="w-full sm:w-64">
                  <SearchInput
                    placeholder="Buscar campo o servicio..."
                    value={searchCampoQuery}
                    onChange={(e) => setSearchCampoQuery(e.target.value)}
                    onClear={() => setSearchCampoQuery("")}
                  />
                </div>
                {allCatalogoCampos.some((c) => !draft.overridesPorCampo[c.id]) && (
                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Seleccionar campo del catálogo para agregar ayuda específica"
                      value={selectedCampoIdToAdd}
                      onChange={(e) => setSelectedCampoIdToAdd(e.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none min-w-[220px]"
                    >
                      <option value="">Otro campo del catálogo...</option>
                      {allCatalogoCampos
                        .filter((c) => !draft.overridesPorCampo[c.id])
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} — {c.servicioNombre}
                          </option>
                        ))}
                    </select>
                    <Button
                      variant="neutral"
                      size="sm"
                      disabled={!selectedCampoIdToAdd}
                      onClick={handleAddOverrideCampo}
                      className="gap-1.5 shrink-0"
                    >
                      <Plus className="size-4" />
                      Agregar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {filteredOverrides.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No se encontraron campos con ese criterio de búsqueda.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOverrides.map((override) => {
                  const esConfidencial = override.clasificacion === "Confidencial";
                  const esSensible = esConfidencial && Boolean(override.esSensible);

                  return (
                    <div
                      key={override.campoId}
                      className="border border-border rounded-xl p-4 bg-surface/40 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-border/60">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-foreground">
                            {override.campoNombre}
                          </span>
                          {!esConfidencial ? (
                            <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-semibold">
                              <Unlock className="size-3" /> ACCESIBLE
                            </Badge>
                          ) : esSensible ? (
                            <Badge tone="danger" appearance="solid" size="sm" className="gap-1 font-bold">
                              <ShieldAlert className="size-3" /> SENSIBLE · LOPDP
                            </Badge>
                          ) : (
                            <Badge tone="warning" appearance="soft" size="sm" className="gap-1 font-semibold">
                              <Lock className="size-3" /> CONFIDENCIAL
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {override.servicioNombre} · {override.institucionNombre}
                          </span>
                        </div>

                        <Button
                          variant="neutral"
                          size="sm"
                          onClick={() => handleRemoveOverrideCampo(override.campoId)}
                          className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          Restaurar plantilla general
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2.5">
                          <label className="text-xs font-semibold text-foreground block">
                            Orientación y ejemplo de Finalidad de uso
                          </label>
                          <Input
                            placeholder="Criterio (ej. Incluya: nombre del campo + proceso institucional + necesidad específica)"
                            value={override.criterioFinalidad || ""}
                            onChange={(e) =>
                              updateOverrideCampo(override.campoId, {
                                criterioFinalidad: e.target.value,
                              })
                            }
                            className="text-xs bg-background"
                          />
                          <Textarea
                            rows={2}
                            placeholder="Ejemplo concreto relacionado con este campo..."
                            value={override.ejemploFinalidad || ""}
                            onChange={(e) =>
                              updateOverrideCampo(override.campoId, {
                                ejemploFinalidad: e.target.value,
                              })
                            }
                            className="text-xs bg-background"
                          />
                        </div>

                        {esConfidencial && (
                          <div className="space-y-2.5">
                            <label className="text-xs font-semibold text-foreground block">
                              Orientación y ejemplo de Justificación jurídica
                            </label>
                            <Input
                              placeholder="Criterio (ej. Incluya: norma legal vigente + artículo aplicable + relación con el acceso)"
                              value={override.criterioJustificacion || ""}
                              onChange={(e) =>
                                updateOverrideCampo(override.campoId, {
                                  criterioJustificacion: e.target.value,
                                })
                              }
                              className="text-xs bg-background"
                            />
                            <Textarea
                              rows={2}
                              placeholder="Ejemplo concreto de justificación jurídica para este campo..."
                              value={override.ejemploJustificacion || ""}
                              onChange={(e) =>
                                updateOverrideCampo(override.campoId, {
                                  ejemploJustificacion: e.target.value,
                                })
                              }
                              className="text-xs bg-background"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB 2: PLANTILLAS POR CLASIFICACIÓN */}
        <TabsContent value="plantillas" className="space-y-6">
          {/* SECCIÓN FINALIDAD DE USO */}
          <Card className="border-border bg-card shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Orientación general para «Finalidad de uso»
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Define el criterio y texto breve que guía al coordinador a indicar el nombre del campo, el proceso institucional y la necesidad específica. Admite la variable <code className="font-mono text-foreground">{"{campo}"}</code>.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6 divide-y divide-border/70">
              {/* 1.1 Finalidad — Datos Accesibles */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-semibold">
                      <Unlock className="size-3" />
                      ACCESIBLE
                    </Badge>
                    <span className="text-xs font-bold text-foreground">
                      Finalidad de uso para Datos Accesibles
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Criterio de orientación (estructura de la respuesta)
                    </label>
                    <Input
                      value={draft.bloques.finalidadAccesible.criterioOrientacion}
                      onChange={(e) =>
                        updateBloque("finalidadAccesible", { criterioOrientacion: e.target.value })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Texto breve explicativo
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.finalidadAccesible.instruccion}
                      onChange={(e) =>
                        updateBloque("finalidadAccesible", { instruccion: e.target.value })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Ejemplo base (si el campo no tiene uno propio)
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.finalidadAccesible.ejemploReferencial}
                      onChange={(e) =>
                        updateBloque("finalidadAccesible", { ejemploReferencial: e.target.value })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface/60 border border-border rounded-xl p-4 space-y-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vista previa integrada debajo del campo
                  </span>
                  <Textarea
                    rows={2}
                    value={previewSampleText}
                    onChange={(e) => setPreviewSampleText(e.target.value)}
                    className="text-xs bg-background"
                  />
                  <AyudaPermanenteCampoBN07
                    tipoCampoFormulario="finalidad"
                    clasificacion="Accesible"
                    criterioOrientacion={draft.bloques.finalidadAccesible.criterioOrientacion}
                    instruccion={draft.bloques.finalidadAccesible.instruccion}
                    ejemploReferencial={draft.bloques.finalidadAccesible.ejemploReferencial.replace(
                      /\{campo\}/g,
                      "numeroIdentificacion"
                    )}
                    mostrarEjemplo={draft.mostrarEjemplosReferenciales}
                    campoNombre="numeroIdentificacion"
                  />
                </div>
              </div>

              {/* 1.2 Finalidad — Datos Confidenciales */}
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="warning" appearance="soft" size="sm" className="gap-1 font-semibold">
                      <Lock className="size-3" />
                      CONFIDENCIAL
                    </Badge>
                    <span className="text-xs font-bold text-foreground">
                      Finalidad de uso para Datos Confidenciales
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Criterio de orientación
                    </label>
                    <Input
                      value={draft.bloques.finalidadConfidencial.criterioOrientacion}
                      onChange={(e) =>
                        updateBloque("finalidadConfidencial", {
                          criterioOrientacion: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Texto breve explicativo
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.finalidadConfidencial.instruccion}
                      onChange={(e) =>
                        updateBloque("finalidadConfidencial", { instruccion: e.target.value })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Ejemplo base
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.finalidadConfidencial.ejemploReferencial}
                      onChange={(e) =>
                        updateBloque("finalidadConfidencial", {
                          ejemploReferencial: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface/60 border border-border rounded-xl p-4 space-y-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vista previa integrada debajo del campo
                  </span>
                  <Textarea
                    rows={2}
                    value={previewSampleText}
                    onChange={(e) => setPreviewSampleText(e.target.value)}
                    className="text-xs bg-background"
                  />
                  <AyudaPermanenteCampoBN07
                    tipoCampoFormulario="finalidad"
                    clasificacion="Confidencial"
                    esSensible={false}
                    criterioOrientacion={draft.bloques.finalidadConfidencial.criterioOrientacion}
                    instruccion={draft.bloques.finalidadConfidencial.instruccion}
                    ejemploReferencial={draft.bloques.finalidadConfidencial.ejemploReferencial.replace(
                      /\{campo\}/g,
                      "nombrePadre"
                    )}
                    mostrarEjemplo={draft.mostrarEjemplosReferenciales}
                    campoNombre="nombrePadre"
                  />
                </div>
              </div>

              {/* 1.3 Finalidad — Datos Confidenciales Sensibles */}
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="danger" appearance="solid" size="sm" className="gap-1 font-bold">
                      <ShieldAlert className="size-3" />
                      SENSIBLE · LOPDP
                    </Badge>
                    <span className="text-xs font-bold text-foreground">
                      Finalidad de uso para Datos Confidenciales Sensibles
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Criterio de orientación
                    </label>
                    <Input
                      value={draft.bloques.finalidadConfidencialSensible.criterioOrientacion}
                      onChange={(e) =>
                        updateBloque("finalidadConfidencialSensible", {
                          criterioOrientacion: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Texto breve explicativo
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.finalidadConfidencialSensible.instruccion}
                      onChange={(e) =>
                        updateBloque("finalidadConfidencialSensible", {
                          instruccion: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Ejemplo base
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.finalidadConfidencialSensible.ejemploReferencial}
                      onChange={(e) =>
                        updateBloque("finalidadConfidencialSensible", {
                          ejemploReferencial: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface/60 border border-border rounded-xl p-4 space-y-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vista previa integrada debajo del campo
                  </span>
                  <Textarea
                    rows={2}
                    value={previewSampleText}
                    onChange={(e) => setPreviewSampleText(e.target.value)}
                    className="text-xs bg-background"
                  />
                  <AyudaPermanenteCampoBN07
                    tipoCampoFormulario="finalidad"
                    clasificacion="Confidencial"
                    esSensible={true}
                    criterioOrientacion={
                      draft.bloques.finalidadConfidencialSensible.criterioOrientacion
                    }
                    instruccion={draft.bloques.finalidadConfidencialSensible.instruccion}
                    ejemploReferencial={draft.bloques.finalidadConfidencialSensible.ejemploReferencial.replace(
                      /\{campo\}/g,
                      "condicionDiscapacidad"
                    )}
                    mostrarEjemplo={draft.mostrarEjemplosReferenciales}
                    campoNombre="condicionDiscapacidad"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECCIÓN JUSTIFICACIÓN JURÍDICA */}
          <Card className="border-border bg-card shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Orientación general para «Justificación jurídica» (Revisión DPI)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Guía al coordinador para relacionar la norma aplicable y artículo habilitante con el acceso solicitado a datos confidenciales y sensibles LOPDP.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6 divide-y divide-border/70">
              {/* 2.1 Justificación jurídica — Datos Confidenciales Estándar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="warning" appearance="soft" size="sm" className="gap-1 font-semibold">
                      <Lock className="size-3" />
                      CONFIDENCIAL ESTÁNDAR
                    </Badge>
                    <span className="text-xs font-bold text-foreground">
                      Justificación jurídica para Datos Confidenciales
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Criterio de orientación
                    </label>
                    <Input
                      value={draft.bloques.justificacionConfidencial.criterioOrientacion}
                      onChange={(e) =>
                        updateBloque("justificacionConfidencial", {
                          criterioOrientacion: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Texto breve explicativo
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.justificacionConfidencial.instruccion}
                      onChange={(e) =>
                        updateBloque("justificacionConfidencial", { instruccion: e.target.value })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Ejemplo base
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.justificacionConfidencial.ejemploReferencial}
                      onChange={(e) =>
                        updateBloque("justificacionConfidencial", {
                          ejemploReferencial: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface/60 border border-border rounded-xl p-4 space-y-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vista previa integrada debajo del campo
                  </span>
                  <Textarea
                    rows={2}
                    value={previewSampleText}
                    onChange={(e) => setPreviewSampleText(e.target.value)}
                    className="text-xs bg-background border-warning/40"
                  />
                  <AyudaPermanenteCampoBN07
                    tipoCampoFormulario="justificacion"
                    clasificacion="Confidencial"
                    esSensible={false}
                    criterioOrientacion={draft.bloques.justificacionConfidencial.criterioOrientacion}
                    instruccion={draft.bloques.justificacionConfidencial.instruccion}
                    ejemploReferencial={draft.bloques.justificacionConfidencial.ejemploReferencial.replace(
                      /\{campo\}/g,
                      "nombrePadre"
                    )}
                    mostrarEjemplo={draft.mostrarEjemplosReferenciales}
                    campoNombre="nombrePadre"
                  />
                </div>
              </div>

              {/* 2.2 Justificación jurídica — Datos Confidenciales Sensibles (LOPDP) */}
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="danger" appearance="solid" size="sm" className="gap-1 font-bold">
                      <ShieldAlert className="size-3" />
                      SENSIBLE · LOPDP
                    </Badge>
                    <span className="text-xs font-bold text-foreground">
                      Justificación jurídica para Datos Confidenciales Sensibles
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Criterio de orientación
                    </label>
                    <Input
                      value={draft.bloques.justificacionConfidencialSensible.criterioOrientacion}
                      onChange={(e) =>
                        updateBloque("justificacionConfidencialSensible", {
                          criterioOrientacion: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Texto breve explicativo
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.justificacionConfidencialSensible.instruccion}
                      onChange={(e) =>
                        updateBloque("justificacionConfidencialSensible", {
                          instruccion: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Ejemplo base
                    </label>
                    <Textarea
                      rows={2}
                      value={draft.bloques.justificacionConfidencialSensible.ejemploReferencial}
                      onChange={(e) =>
                        updateBloque("justificacionConfidencialSensible", {
                          ejemploReferencial: e.target.value,
                        })
                      }
                      className="text-xs sm:text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface/60 border border-border rounded-xl p-4 space-y-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vista previa integrada debajo del campo
                  </span>
                  <Textarea
                    rows={2}
                    value={previewSampleText}
                    onChange={(e) => setPreviewSampleText(e.target.value)}
                    className="text-xs bg-background border-danger/40"
                  />
                  <AyudaPermanenteCampoBN07
                    tipoCampoFormulario="justificacion"
                    clasificacion="Confidencial"
                    esSensible={true}
                    criterioOrientacion={
                      draft.bloques.justificacionConfidencialSensible.criterioOrientacion
                    }
                    instruccion={draft.bloques.justificacionConfidencialSensible.instruccion}
                    ejemploReferencial={draft.bloques.justificacionConfidencialSensible.ejemploReferencial.replace(
                      /\{campo\}/g,
                      "condicionDiscapacidad"
                    )}
                    mostrarEjemplo={draft.mostrarEjemplosReferenciales}
                    campoNombre="condicionDiscapacidad"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: HISTORIAL Y AUDITORÍA */}
        <TabsContent value="auditoria">
          <Card className="border-border bg-card shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border pb-4">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <History className="size-4 text-primary" />
                Bitácora de versiones de textos de ayuda (BN-07)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Versión activa: <strong className="text-foreground font-mono">{config.version}</strong> · Última actualización: {config.ultimaActualizacion}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Fecha y hora</TableHead>
                    <TableHead className="text-xs">Versión</TableHead>
                    <TableHead className="text-xs">Responsable</TableHead>
                    <TableHead className="text-xs">Detalle del ajuste</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.historialCambios.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {item.fecha}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
                          {item.version}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {item.usuario}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.resumen}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <WireframeDashboardLayout>
      {content}
    </WireframeDashboardLayout>
  );
}
