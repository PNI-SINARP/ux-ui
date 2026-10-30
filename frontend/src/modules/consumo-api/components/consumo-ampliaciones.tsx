"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Eye,
  FileSignature,
  FileText,
  Filter,
  GitBranch,
  History,
  Layers,
  Lock,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Scale,
  Server,
  ShieldCheck,
  Stamp,
  User,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "@/components/ui/search";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { useActor } from "@/modules/entrega-excepcional/components/excepcional-ui";
import {
  PLAZO_SUBSANACION_DIAS,
  formatoFecha,
  numero,
  sumarDiasHabiles,
  ahoraIso,
  idOpaco,
  useConsumoStore,
  type AccesoApi,
  type Ampliacion,
  type EstadoAmpliacion,
} from "../data/consumo-store";

interface RevisorCatalogo {
  id: string;
  nombre: string;
  cargo: string;
  especialidad: string;
  area: "GESTION" | "DPI";
}

const CATALOGO_REVISORES_GESTION: RevisorCatalogo[] = [
  {
    id: "REV-GES-01",
    nombre: "Ana Torres",
    cargo: "Analista de Interoperabilidad",
    especialidad: "Fuentes Financieras, SRI y Biometría",
    area: "GESTION",
  },
  {
    id: "REV-GES-02",
    nombre: "Marcos Silva",
    cargo: "Especialista de Gestión SINARP",
    especialidad: "Identificación Civil, Salud y Seguridad Social",
    area: "GESTION",
  },
  {
    id: "REV-GES-03",
    nombre: "Elena Viteri",
    cargo: "Analista Senior de Catálogo",
    especialidad: "Registros Públicos, Mercantil y Propiedad",
    area: "GESTION",
  },
];

const CATALOGO_REVISORES_DPI: RevisorCatalogo[] = [
  {
    id: "REV-DPI-01",
    nombre: "Dr. Carlos Mendoza",
    cargo: "Especialista Legal de Protección de Datos",
    especialidad: "LOPDP y Datos Sensibles / Confidenciales",
    area: "DPI",
  },
  {
    id: "REV-DPI-02",
    nombre: "Abg. Sofía Intriago",
    cargo: "Analista de Normativa y Privacidad",
    especialidad: "Proporcionalidad y Base Legal Sectorial",
    area: "DPI",
  },
  {
    id: "REV-DPI-03",
    nombre: "Mgs. Roberto Gómez",
    cargo: "Consultor de Cumplimiento DPI",
    especialidad: "Dictámenes Vinculantes e Informes FirmaEC",
    area: "DPI",
  },
];

const REVISORES_GESTION = CATALOGO_REVISORES_GESTION.map((r) => r.nombre);
const REVISORES_DPI = CATALOGO_REVISORES_DPI.map((r) => r.nombre);

const TONO: Partial<
  Record<EstadoAmpliacion, "neutral" | "info" | "warning" | "success" | "danger" | "primary">
> = {
  Aplicada: "success",
  Cerrada: "neutral",
  Observada: "warning",
  "Pendiente de corrección": "danger",
  "En revisión de Gestión": "info",
  "En revisión de DPI": "info",
  "Pendiente de firmas": "primary",
  "Pendiente de pago": "warning",
  "Pendiente de aprobación": "primary",
};

const COLOR_CARD: Partial<
  Record<
    EstadoAmpliacion,
    "default" | "info" | "warning" | "success" | "danger" | "primary"
  >
> = {
  Aplicada: "success",
  Cerrada: "default",
  Observada: "warning",
  "Pendiente de corrección": "danger",
  "En revisión de Gestión": "info",
  "En revisión de DPI": "info",
  "Pendiente de firmas": "primary",
  "Pendiente de pago": "warning",
  "Pendiente de aprobación": "primary",
};

const ESTADOS_AMPLIACION_FILTRO: Array<"TODOS" | EstadoAmpliacion> = [
  "TODOS",
  "En revisión de Gestión",
  "En revisión de DPI",
  "Observada",
  "Pendiente de firmas",
  "Pendiente de pago",
  "Pendiente de aprobación",
  "Pendiente de corrección",
  "Aplicada",
  "Cerrada",
];

const EVENTO = {
  campos: "adenda_campos",
  cupo: "adenda_cupo",
  mixta: "adenda_mixta",
} as const;

const AREAS_CORRECCION = ["Jurídica", "Facturación", "Pagos"] as const;

type ModalAccionTipo =
  | "ASIGNAR_GESTION"
  | "REVISAR_GESTION"
  | "REVISAR_DPI"
  | "JURIDICA_ADENDA"
  | "PAGO_PASARELA"
  | "APROBAR_ACTUALIZACION"
  | "SUBSANAR_COORDINADOR"
  | "EXPEDIENTE";

function Tarjeta({
  am,
  a,
  onOpenModal,
}: {
  am: Ampliacion;
  a: AccesoApi;
  onOpenModal: (am: Ampliacion, tipo: ModalAccionTipo) => void;
}) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();
  const [obs, setObs] = useState("");
  const [revisorGestion, setRevisorGestion] = useState<string>(REVISORES_GESTION[0]);
  const [motivoReasigGestion, setMotivoReasigGestion] = useState("");
  const [revisorDpi, setRevisorDpi] = useState<string>(REVISORES_DPI[0]);
  const [criterioUso, setCriterioUso] = useState(
    am.informeDpiBorrador?.criterioUso ??
      "Favorable: la finalidad declarada guarda proporcionalidad funcional con el servicio institucional."
  );
  const [criterioJuridico, setCriterioJuridico] = useState(
    am.informeDpiBorrador?.criterioJuridico ??
      "Favorable: existe base legal suficiente y habilitación normativa conforme a la LOPDP."
  );
  const [subsanacionTexto, setSubsanacionTexto] = useState("");
  const [notaCorreccionArea, setNotaCorreccionArea] = useState("");
  const [area, setArea] = useState("Facturación");
  const [areaSearch, setAreaSearch] = useState("");
  const [motivo, setMotivo] = useState("");

  const tieneConfidencial = am.campos.some(
    (c) =>
      a.catalogoCampos.find((x) => x.campo === c)?.clasificacion ===
      "Confidencial"
  );
  const incluyeCampos = am.campos.length > 0;
  const camposConservados = am.camposConservados ?? a.camposAutorizados;
  const esGestion = rol === "DIR_GESTION" || rol === "EQ_GESTION";
  const esDpi = rol === "DIR_DPI" || rol === "EQ_DPI";

  const mut = (
    fn: (x: Ampliacion) => Ampliacion,
    accion: string,
    detalle?: string
  ) => st.mutarAmpliacion(am.id, fn, actor, accion, detalle);

  /**
   * Tras ADD-07 Aprobada (compuerta ¿Requiere adenda? en BPMN 10):
   * - Caso 1 (¿Requiere adenda? = No · Pública · ADD-05): Pasa a Dirección de Gestión → "Aprobar actualización" (estado "Pendiente de aprobación").
   * - Caso 2 (¿Requiere adenda? = Sí · Privada · ADD-04): Pasa a Jurídica → "Redactar adenda contractual" y "Gestionar firmas" (estado "Pendiente de firmas").
   */
  const aprobadaADD07 = () => {
    if (a.tipo === "Pública") {
      mut(
        (x) => ({
          ...x,
          pagoConfirmado: true,
          estado: "Pendiente de aprobación",
        }),
        "Compuerta ¿Requiere adenda? = No (Pública · ADD-05)",
        "Sin adenda contractual ni pago. Pasa al Director de Gestión para ejecutar 'Aprobar actualización' y sincronizar en Apigee (ACC-08)."
      );
      toast.success("Revisión aprobada → Pasa a Aprobar actualización (ADD-05)", {
        description:
          "Compuerta ¿Requiere adenda? = No (Institución Pública). Dirección de Gestión aprueba la actualización.",
      });
    } else {
      mut(
        (x) => ({ ...x, estado: "Pendiente de firmas" }),
        "Compuerta ¿Requiere adenda? = Sí → Pasa a Jurídica (ADD-04)",
        "Jurídica redacta la adenda contractual con plantilla PAR-02 y gestiona firmas en FirmaEC."
      );
      toast.success("Revisión de cambios aprobada (ADD-07)", {
        description:
          "Compuerta ¿Requiere adenda? = Sí (Privada). Pasa a Jurídica (ADD-04) para redactar adenda contractual y gestionar firmas.",
      });
    }
  };

  return (
    <InteractiveCard
      color={COLOR_CARD[am.estado] ?? "primary"}
      decorativeIcon={<PlusCircle className="size-full stroke-[0.8]" />}
      className="p-4 sm:p-5 space-y-4 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenModal(am, "EXPEDIENTE")}
            className="font-mono text-sm font-bold text-primary hover:underline cursor-pointer"
          >
            {am.id}
          </button>
          <Badge tone={TONO[am.estado] ?? "info"} appearance="soft" size="sm">
            {am.estado}
          </Badge>
          <Badge
            tone="neutral"
            appearance="outline"
            size="sm"
            className="font-mono"
          >
            {a.id} · {a.institucion} ({a.tipo}) · v{am.version}
          </Badge>
          <Badge
            tone={incluyeCampos ? "info" : "success"}
            appearance="soft"
            size="sm"
          >
            {incluyeCampos
              ? "Con revisión de cambios (ADD-07)"
              : "Solo cupo · Conserva campos → Directo a Jurídica (ADD-04)"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Eye className="size-3.5" />}
            onClick={() => onOpenModal(am, "EXPEDIENTE")}
          >
            Ver expediente
          </Button>
        </div>
      </div>

      {/* Resumen de alcance conservado vs cambios solicitados */}
      <div className="rounded-xl bg-surface-subtle/60 border border-border/60 p-3.5 space-y-2.5 leading-relaxed text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-foreground font-semibold">
            Campos autorizados vigentes que se conservan intactos ({camposConservados.length}):
          </p>
          <span className="font-mono text-[11px] text-muted-foreground">
            Fuente: {a.fuente}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {camposConservados.map((c) => (
            <Badge
              key={c}
              tone="neutral"
              appearance="outline"
              size="sm"
              className="font-mono"
            >
              {c} (conservado)
            </Badge>
          ))}
        </div>

        {incluyeCampos ? (
          <div className="pt-2 border-t border-border/60 space-y-2">
            <p className="text-foreground font-semibold">
              Campos adicionales solicitados para revisión ({am.campos.length}):
              {tieneConfidencial && (
                <span className="text-warning font-medium ml-1.5">
                  · Incluye confidenciales (requiere asignación e informe de DPI)
                </span>
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {am.campos.map((c) => {
                const infoCat = a.catalogoCampos.find((x) => x.campo === c);
                const just = am.justificacionesCampos?.[c];
                return (
                  <div
                    key={c}
                    className="rounded-lg border border-border bg-surface p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-foreground">
                        + {c}
                      </span>
                      <Badge
                        tone={
                          infoCat?.clasificacion === "Confidencial"
                            ? "danger"
                            : "info"
                        }
                        appearance="soft"
                        size="sm"
                      >
                        {infoCat?.clasificacion ?? "Accesible"}
                        {infoCat?.sensible ? " · sensible" : ""}
                      </Badge>
                    </div>
                    {just?.finalidad && (
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Finalidad:</strong>{" "}
                        {just.finalidad}
                      </p>
                    )}
                    {just?.justificacionJuridica && (
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Base legal:</strong>{" "}
                        {just.justificacionJuridica}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-foreground font-medium">
              No incluye campos nuevos (ADD-02 / ADD-03): se conservan exactamente los mismos campos, fuente y credencial vigentes; no requiere asignación ni revisión en Gestión o DPI.
            </p>
          </div>
        )}

        {am.cupoAdicional > 0 && (
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
            <p>
              Cupo adicional solicitado:{" "}
              <span className="font-mono font-bold text-primary">
                +{numero(am.cupoAdicional)} registros
              </span>{" "}
              <span className="text-[11px]">
                (Nuevo cupo al aplicar ACC-08:{" "}
                <strong className="font-mono text-foreground">
                  {numero(a.cupoAutorizado + am.cupoAdicional)}
                </strong>{" "}
                registros)
              </span>
            </p>
            {am.esRenovacionCupo && (
              <Badge tone="warning" appearance="soft" size="sm">
                Renovación de cupo (ADD-03)
              </Badge>
            )}
          </div>
        )}
      </div>

      {am.observaciones && (
        <Alert
          variant="warning"
          icon={<AlertCircle className="size-4" />}
          title="Observación registrada (ADD-07)"
          className="p-3.5 text-xs"
        >
          {am.observaciones}
          {am.fechaLimiteSubsanacion && (
            <span className="block mt-1 font-medium">
              Plazo de subsanación (PAR-13): antes de{" "}
              {formatoFecha(am.fechaLimiteSubsanacion)}
            </span>
          )}
        </Alert>
      )}

      {am.correccion && (
        <Alert
          variant="danger"
          icon={<AlertCircle className="size-4" />}
          title={`Pendiente de corrección en ${am.correccion.area} (ADD-06)`}
          className="p-3.5 text-xs"
        >
          {am.correccion.motivo}
        </Alert>
      )}

      {/* Acciones rápidas en tarjeta que abren los mismos Modales homologados */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/70">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            Revisor Gestión:{" "}
            <strong className="text-foreground">
              {am.asignacionGestion?.revisor ?? (incluyeCampos ? "Sin asignar" : "N/A (Solo cupo)")}
            </strong>
          </span>
          {tieneConfidencial && (
            <span>
              · Revisor DPI:{" "}
              <strong className="text-foreground">
                {am.asignacionDpi?.revisor ?? "Sin asignar"} ({am.informeDpiFirmas}/2)
              </strong>
            </span>
          )}
          {a.tipo === "Privada" && (
            <span>
              · Adenda: <strong className="text-foreground">{am.firmasAdenda}/2</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {am.estado === "En revisión de Gestión" && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                leftIcon={am.asignacionGestion ? <RotateCcw className="size-3.5" /> : <UserPlus className="size-3.5" />}
                onClick={() => onOpenModal(am, "ASIGNAR_GESTION")}
              >
                {am.asignacionGestion ? "Reasignar revisor" : "Asignar revisor Gestión"}
              </Button>
              {am.asignacionGestion && (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  leftIcon={<ClipboardCheck className="size-3.5" />}
                  onClick={() => onOpenModal(am, "REVISAR_GESTION")}
                >
                  Revisar cambios solicitados
                </Button>
              )}
            </>
          )}
          {am.estado === "En revisión de DPI" && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              leftIcon={<Scale className="size-3.5" />}
              onClick={() => onOpenModal(am, "REVISAR_DPI")}
            >
              Gestionar revisión DPI ({am.informeDpiFirmas}/2)
            </Button>
          )}
          {am.estado === "Pendiente de firmas" && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              leftIcon={<FileSignature className="size-3.5" />}
              onClick={() => onOpenModal(am, "JURIDICA_ADENDA")}
            >
              {am.adendaPreparada
                ? `Gestionar firmas adenda (${am.firmasAdenda}/2)`
                : "Redactar adenda contractual (Jurídica)"}
            </Button>
          )}
          {am.estado === "Pendiente de pago" && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              leftIcon={<CreditCard className="size-3.5" />}
              onClick={() => onOpenModal(am, "PAGO_PASARELA")}
            >
              Pagar factura / Procesar cobro
            </Button>
          )}
          {(am.estado === "Pendiente de aprobación" ||
            am.estado === "Pendiente de corrección") && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              leftIcon={<CheckCircle2 className="size-3.5" />}
              onClick={() => onOpenModal(am, "APROBAR_ACTUALIZACION")}
            >
              Aprobar actualización y Apigee
            </Button>
          )}
          {am.estado === "Observada" && (
            <Button
              type="button"
              size="sm"
              variant="warning"
              leftIcon={<RefreshCw className="size-3.5" />}
              onClick={() => onOpenModal(am, "SUBSANAR_COORDINADOR")}
            >
              Corregir cambios solicitados (PAR-13)
            </Button>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

export function AmpliacionesPanel({ a }: { a: AccesoApi }) {
  const st = useConsumoStore();
  const { rol, actor } = useActor();

  const esRolInterno =
    rol === "DIR_GESTION" ||
    rol === "EQ_GESTION" ||
    rol === "DIR_DPI" ||
    rol === "EQ_DPI" ||
    rol === "JURIDICA" ||
    rol === "FACTURACION" ||
    rol === "APROBADOR" ||
    rol === "ADMIN" ||
    rol === "DGR";

  const [modoEnvio, setModoEnvio] = useState<"con_campos" | "solo_cupo">("con_campos");
  const [campos, setCampos] = useState<string[]>([]);
  const [justificaciones, setJustificaciones] = useState<
    Record<string, { finalidad: string; justificacionJuridica?: string }>
  >({});
  const [cupo, setCupo] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [alcanceBandeja, setAlcanceBandeja] = useState<"TODAS" | "SOLICITUD">(
    esRolInterno ? "TODAS" : "TODAS"
  );
  const [busquedaAmp, setBusquedaAmp] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"TODOS" | EstadoAmpliacion>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [revisorFiltro, setRevisorFiltro] = useState<string>("TODOS");
  const [revisorSearch, setRevisorSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Estado de modales de acción
  const [modalActivo, setModalActivo] = useState<{
    amId: string;
    tipo: ModalAccionTipo;
  } | null>(null);

  // Estados internos de los modales
  const [revisorModalQuery, setRevisorModalQuery] = useState("");
  const [selectedRevisorGestionId, setSelectedRevisorGestionId] = useState("REV-GES-01");
  const [selectedRevisorDpiId, setSelectedRevisorDpiId] = useState("REV-DPI-01");
  const [observacionAsignacion, setObservacionAsignacion] = useState("");
  const [observacionRevision, setObservacionRevision] = useState("");
  const [criterioUsoModal, setCriterioUsoModal] = useState("");
  const [criterioJuridicoModal, setCriterioJuridicoModal] = useState("");
  const [clausulaAdendaModal, setClausulaAdendaModal] = useState("");
  const [referenciaPagoModal, setReferenciaPagoModal] = useState("TRX-PASARELA-2026-99421");
  const [areaCorreccionModal, setAreaCorreccionModal] = useState<string>("Facturación");
  const [motivoCorreccionModal, setMotivoCorreccionModal] = useState("");
  const [notaSubsanacionAreaModal, setNotaSubsanacionAreaModal] = useState("");
  const [subsanacionCoordinadorModal, setSubsanacionCoordinadorModal] = useState("");

  const abrirModal = (am: Ampliacion, tipo: ModalAccionTipo) => {
    setRevisorModalQuery("");
    setObservacionAsignacion(am.asignacionGestion?.motivoReasignacion ?? "");
    setObservacionRevision(am.observaciones ?? "");
    const matchGes = CATALOGO_REVISORES_GESTION.find(
      (r) => r.nombre === am.asignacionGestion?.revisor
    );
    setSelectedRevisorGestionId(matchGes?.id ?? "REV-GES-01");
    const matchDpi = CATALOGO_REVISORES_DPI.find(
      (r) => r.nombre === am.asignacionDpi?.revisor
    );
    setSelectedRevisorDpiId(matchDpi?.id ?? "REV-DPI-01");
    setCriterioUsoModal(
      am.informeDpiBorrador?.criterioUso ??
        "Favorable: la finalidad declarada guarda proporcionalidad funcional con el servicio institucional."
    );
    setCriterioJuridicoModal(
      am.informeDpiBorrador?.criterioJuridico ??
        "Favorable: existe base legal suficiente y habilitación normativa conforme a la LOPDP."
    );
    const accRef = st.accesos.find((x) => x.id === am.accesoId) ?? a;
    setClausulaAdendaModal(
      am.campos.length > 0
        ? `TERCERA (OBJETO DE LA ADENDA - ${EVENTO[am.tipo].toUpperCase()}): Por medio del presente instrumento (Plantilla PAR-02), se mantiene vigente el alcance autorizado (${(am.camposConservados ?? accRef.camposAutorizados).join(", ")}) y se incorpora el acceso a los campos (${am.campos.join(", ")}) sobre la fuente ${accRef.fuente}${am.cupoAdicional > 0 ? `, junto con un cupo adicional de +${numero(am.cupoAdicional)} registros` : ""}.`
        : `TERCERA (OBJETO DE LA ADENDA SOLO CUPO - ${EVENTO[am.tipo].toUpperCase()}): Por medio del presente instrumento (Plantilla PAR-02), las partes acuerdan conservar íntegramente los campos autorizados vigentes (${(am.camposConservados ?? accRef.camposAutorizados).join(", ")}), contrato y credencial sobre la fuente ${accRef.fuente}, ampliando únicamente el cupo en +${numero(am.cupoAdicional)} registros.`
    );
    setMotivoCorreccionModal(am.correccion?.motivo ?? "");
    setSubsanacionCoordinadorModal("");
    setModalActivo({ amId: am.id, tipo });
  };

  const cerrarModal = () => setModalActivo(null);

  const amModal = useMemo(
    () =>
      modalActivo
        ? st.ampliaciones.find((x) => x.id === modalActivo.amId) ?? null
        : null,
    [modalActivo, st.ampliaciones]
  );

  const accesoModal = useMemo(
    () =>
      amModal
        ? st.accesos.find((x) => x.id === amModal.accesoId) ?? a
        : a,
    [amModal, st.accesos, a]
  );

  const disponibles = a.catalogoCampos.filter(
    (c) => !a.camposAutorizados.includes(c.campo)
  );

  const listaBaseBandeja = useMemo(() => {
    const origen =
      alcanceBandeja === "TODAS"
        ? st.ampliaciones
        : st.ampliaciones.filter((x) => x.accesoId === a.id);
    return [...origen];
  }, [st.ampliaciones, alcanceBandeja, a.id]);

  // KPIs interactivos de la bandeja BN-10
  const kpis = useMemo(() => {
    const total = listaBaseBandeja.length;
    const enRevisionCambios = listaBaseBandeja.filter(
      (x) =>
        x.estado === "En revisión de Gestión" || x.estado === "En revisión de DPI"
    ).length;
    const sinAsignarGestion = listaBaseBandeja.filter(
      (x) => x.estado === "En revisión de Gestión" && !x.asignacionGestion
    ).length;
    const enJuridicaOPago = listaBaseBandeja.filter(
      (x) => x.estado === "Pendiente de firmas" || x.estado === "Pendiente de pago"
    ).length;
    const porAprobarOAplicadas = listaBaseBandeja.filter(
      (x) =>
        x.estado === "Pendiente de aprobación" ||
        x.estado === "Pendiente de corrección" ||
        x.estado === "Aplicada"
    ).length;
    const pendientesAprobar = listaBaseBandeja.filter(
      (x) =>
        x.estado === "Pendiente de aprobación" ||
        x.estado === "Pendiente de corrección"
    ).length;
    return {
      total,
      enRevisionCambios,
      sinAsignarGestion,
      enJuridicaOPago,
      porAprobarOAplicadas,
      pendientesAprobar,
    };
  }, [listaBaseBandeja]);

  const listaFiltrada = useMemo(() => {
    const q = busquedaAmp.trim().toLowerCase();
    return listaBaseBandeja
      .filter((am) => (estadoFiltro === "TODOS" ? true : am.estado === estadoFiltro))
      .filter((am) => {
        if (revisorFiltro === "TODOS") return true;
        if (revisorFiltro === "SIN_ASIGNAR") return !am.asignacionGestion && am.campos.length > 0;
        if (revisorFiltro === "SOLO_CUPO") return am.campos.length === 0;
        return (
          am.asignacionGestion?.revisor === revisorFiltro ||
          am.asignacionDpi?.revisor === revisorFiltro
        );
      })
      .filter((am) => {
        if (!q) return true;
        const acc = st.accesos.find((x) => x.id === am.accesoId);
        return (
          am.id.toLowerCase().includes(q) ||
          am.accesoId.toLowerCase().includes(q) ||
          (acc?.institucion.toLowerCase().includes(q) ?? false) ||
          (acc?.fuente.toLowerCase().includes(q) ?? false) ||
          am.tipo.toLowerCase().includes(q) ||
          am.estado.toLowerCase().includes(q) ||
          (am.asignacionGestion?.revisor.toLowerCase().includes(q) ?? false) ||
          (am.asignacionDpi?.revisor.toLowerCase().includes(q) ?? false) ||
          am.campos.some((c) => c.toLowerCase().includes(q))
        );
      });
  }, [listaBaseBandeja, busquedaAmp, estadoFiltro, revisorFiltro, st.accesos]);

  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / pageSize));
  const paginatedLista = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return listaFiltrada.slice(start, start + pageSize);
  }, [listaFiltrada, currentPage, pageSize]);

  const hayFiltros =
    busquedaAmp.trim() !== "" ||
    estadoFiltro !== "TODOS" ||
    revisorFiltro !== "TODOS";

  const toggleCampo = (campo: string, checked: boolean, esConfidencial: boolean) => {
    if (checked) {
      setCampos((prev) => [...prev, campo]);
      setJustificaciones((prev) => ({
        ...prev,
        [campo]: prev[campo] ?? {
          finalidad: `Verificación del dato ${campo} dentro del proceso institucional ${a.proyecto}.`,
          justificacionJuridica: esConfidencial
            ? "Habilitación legal expresa conforme a LOPDP y normativa sectorial vigente."
            : undefined,
        },
      }));
    } else {
      setCampos((prev) => prev.filter((x) => x !== campo));
    }
  };

  const enviar = (
    c: string[],
    q: number,
    esRenovacionCupo?: boolean
  ) => {
    const justPayload =
      c.length > 0
        ? Object.fromEntries(
            c.map((k) => [
              k,
              justificaciones[k] ?? {
                finalidad: `Integración del campo ${k} en el servicio ${a.proyecto}.`,
              },
            ])
          )
        : undefined;
    const r = st.crearAmpliacion(a.id, c, q, actor, {
      justificacionesCampos: justPayload,
      esRenovacionCupo,
    });
    (r.ok ? toast.success : toast.error)(r.mensaje);
    if (r.ok) {
      setCampos([]);
      setCupo("");
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {/* TARJETAS KPI INTERACTIVAS DEL FLUJO BPMN 10 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InteractiveCard
            color="primary"
            onClick={() => {
              setEstadoFiltro("TODOS");
              setEstadoSearch("");
              setRevisorFiltro("TODOS");
              setRevisorSearch("");
              setCurrentPage(1);
            }}
            decorativeIcon={<GitBranch className="size-full stroke-[0.8]" />}
            className={cn(
              "p-4 cursor-pointer",
              estadoFiltro === "TODOS" && revisorFiltro === "TODOS" && "ring-2 ring-primary/40"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total expedientes BN-10
                </p>
                <p className="text-2xl font-bold font-heading text-foreground">
                  {kpis.total}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Con revisión de cambios o solo cupo
                </p>
              </div>
              <Badge tone="primary" appearance="soft" size="sm">
                Bandeja activa
              </Badge>
            </div>
          </InteractiveCard>

          <InteractiveCard
            color="info"
            onClick={() => {
              setEstadoFiltro(
                rol === "DIR_DPI" || rol === "EQ_DPI"
                  ? "En revisión de DPI"
                  : "En revisión de Gestión"
              );
              setEstadoSearch(
                rol === "DIR_DPI" || rol === "EQ_DPI"
                  ? "En revisión de DPI"
                  : "En revisión de Gestión"
              );
              setCurrentPage(1);
            }}
            decorativeIcon={<UserCheck className="size-full stroke-[0.8]" />}
            className={cn(
              "p-4 cursor-pointer",
              (estadoFiltro === "En revisión de Gestión" ||
                estadoFiltro === "En revisión de DPI") &&
                "ring-2 ring-info/40"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Revisión de cambios (ADD-07)
                </p>
                <p className="text-2xl font-bold font-heading text-foreground">
                  {kpis.enRevisionCambios}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {kpis.sinAsignarGestion} sin asignar en Gestión · DPI activo
                </p>
              </div>
              <Badge tone="info" appearance="soft" size="sm">
                Gestión / DPI
              </Badge>
            </div>
          </InteractiveCard>

          <InteractiveCard
            color="warning"
            onClick={() => {
              setEstadoFiltro(
                rol === "FACTURACION" ? "Pendiente de pago" : "Pendiente de firmas"
              );
              setEstadoSearch(
                rol === "FACTURACION" ? "Pendiente de pago" : "Pendiente de firmas"
              );
              setCurrentPage(1);
            }}
            decorativeIcon={<FileSignature className="size-full stroke-[0.8]" />}
            className={cn(
              "p-4 cursor-pointer",
              (estadoFiltro === "Pendiente de firmas" ||
                estadoFiltro === "Pendiente de pago") &&
                "ring-2 ring-warning/40"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Adenda y cobro (ADD-04 / PAG)
                </p>
                <p className="text-2xl font-bold font-heading text-foreground">
                  {kpis.enJuridicaOPago}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Redactar adenda, firmas 2/2 y pasarela
                </p>
              </div>
              <Badge tone="warning" appearance="soft" size="sm">
                Jurídica / Pago
              </Badge>
            </div>
          </InteractiveCard>

          <InteractiveCard
            color="success"
            onClick={() => {
              setEstadoFiltro("Pendiente de aprobación");
              setEstadoSearch("Pendiente de aprobación");
              setCurrentPage(1);
            }}
            decorativeIcon={<Server className="size-full stroke-[0.8]" />}
            className={cn(
              "p-4 cursor-pointer",
              estadoFiltro === "Pendiente de aprobación" && "ring-2 ring-success/40"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Aprobar actualización (ACC-08)
                </p>
                <p className="text-2xl font-bold font-heading text-foreground">
                  {kpis.pendientesAprobar}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Pública (sin adenda) y Privada (pagada)
                </p>
              </div>
              <Badge tone="success" appearance="soft" size="sm">
                Apigee ({kpis.porAprobarOAplicadas})
              </Badge>
            </div>
          </InteractiveCard>
        </div>

        {/* FORMULARIO COORDINADOR SINARP: ENVIAR AMPLIACIÓN (CON CAMPOS VS SOLO CUPO) */}
        {rol === "COORDINADOR_SINARP" && (
          <section className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">
                  Solicitar ampliación de alcance o cupo (ADD-01, ADD-02, ADD-03, ADD-05)
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {a.tipo === "Privada"
                    ? "Si envías ampliación con nuevos campos, el Director de Gestión asigna la revisión a un miembro del Equipo de Gestión (ADD-07). Si envías solo cupo (ADD-02 / ADD-03), se conservan intactos los campos y demás parámetros vigentes y pasa directo a Jurídica (ADD-04)."
                    : "Una solicitud pública solo amplía campos de la misma fuente (ADD-05): se asigna revisión de cambios en Gestión (ADD-07) y, tras aprobarse (¿Requiere adenda? = No), Dirección de Gestión aprueba la actualización sin contrato ni pago."}
                </p>
              </div>
              {a.tipo === "Privada" && (
                <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant={modoEnvio === "con_campos" ? "primary" : "ghost"}
                    onClick={() => setModoEnvio("con_campos")}
                    className="text-xs"
                  >
                    Ampliar campos / Mixta (ADD-01)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={modoEnvio === "solo_cupo" ? "primary" : "ghost"}
                    onClick={() => {
                      setModoEnvio("solo_cupo");
                      setCampos([]);
                    }}
                    className="text-xs"
                  >
                    Solo cupo / Renovación (ADD-02 · ADD-03)
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-surface-subtle/60 border border-border/70 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">
                  Alcance vigente que se conserva en la solicitud {a.id} (v{a.versionAlcance}):
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Institución: {a.institucion} ({a.tipo}) · Fuente: {a.fuente} · Credencial: {a.credencial}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.camposAutorizados.map((c) => (
                  <Badge
                    key={c}
                    tone="neutral"
                    appearance="outline"
                    size="sm"
                    className="font-mono"
                  >
                    {c} (autorizado vigente)
                  </Badge>
                ))}
              </div>
            </div>

            {(modoEnvio === "con_campos" || a.tipo === "Pública") && (
              <>
                {disponibles.length === 0 ? (
                  <Alert
                    variant="info"
                    icon={<AlertCircle className="size-4" />}
                    title="No hay campos adicionales disponibles"
                    className="p-3.5 text-xs"
                  >
                    Ya tienes autorizados todos los campos publicados de esta fuente. Si requieres más registros, cambia a la opción «Solo cupo / Renovación (ADD-02 · ADD-03)».
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-foreground">
                      Selecciona los campos adicionales a incorporar (requieren asignar revisión de cambios en Gestión · ADD-07)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {disponibles.map((c) => {
                        const checked = campos.includes(c.campo);
                        return (
                          <label
                            key={c.campo}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-subtle/40 hover:bg-surface-subtle px-3.5 py-2.5 text-xs cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) =>
                                  toggleCampo(
                                    c.campo,
                                    v === true,
                                    c.clasificacion === "Confidencial"
                                  )
                                }
                              />
                              <span className="font-mono font-semibold text-foreground truncate">
                                {c.campo}
                              </span>
                            </div>
                            <Badge
                              tone={
                                c.clasificacion === "Confidencial"
                                  ? "danger"
                                  : "neutral"
                              }
                              appearance="soft"
                              size="sm"
                              className="shrink-0"
                            >
                              {c.clasificacion}
                              {c.sensible ? " · sensible" : ""}
                            </Badge>
                          </label>
                        );
                      })}
                    </div>

                    {campos.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-semibold text-foreground">
                          Finalidad de uso y justificación jurídica de los nuevos campos (SOL-02 · ADD-01 CA2):
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {campos.map((campo) => {
                            const meta = a.catalogoCampos.find(
                              (x) => x.campo === campo
                            );
                            const esConf = meta?.clasificacion === "Confidencial";
                            const val = justificaciones[campo] ?? {
                              finalidad: "",
                              justificacionJuridica: "",
                            };
                            return (
                              <div
                                key={campo}
                                className="rounded-xl border border-border bg-surface-subtle/40 p-3.5 space-y-2.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-xs font-bold text-primary">
                                    Campo: {campo}
                                  </span>
                                  <Badge
                                    tone={esConf ? "danger" : "info"}
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {meta?.clasificacion ?? "Accesible"}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[11px] font-semibold text-foreground">
                                    Finalidad de uso
                                  </Label>
                                  <Input
                                    value={val.finalidad}
                                    onChange={(e) =>
                                      setJustificaciones((prev) => ({
                                        ...prev,
                                        [campo]: {
                                          ...val,
                                          finalidad: e.target.value,
                                        },
                                      }))
                                    }
                                    placeholder="Describe la finalidad funcional..."
                                  />
                                </div>
                                {esConf && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-foreground">
                                      Justificación jurídica (campo Confidencial · revisa DPI)
                                    </Label>
                                    <Input
                                      value={val.justificacionJuridica ?? ""}
                                      onChange={(e) =>
                                        setJustificaciones((prev) => ({
                                          ...prev,
                                          [campo]: {
                                            ...val,
                                            justificacionJuridica: e.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="Base legal que habilita el acceso al campo confidencial..."
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {a.tipo === "Privada" && (
              <div className="space-y-2 max-w-md">
                <Label
                  htmlFor="cupo-ad"
                  className="text-xs font-semibold text-foreground"
                >
                  {modoEnvio === "solo_cupo"
                    ? "Cupo adicional a contratar (obligatorio en Solo cupo · registros)"
                    : "Cupo adicional opcional (si deseas ampliación mixta campos + cupo)"}
                </Label>
                <Input
                  id="cupo-ad"
                  type="number"
                  min={1}
                  placeholder="Ej. 100000"
                  value={cupo}
                  onChange={(e) => setCupo(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {modoEnvio === "solo_cupo" && a.tipo === "Privada" ? (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusCircle className="size-4" />}
                    disabled={!(parseInt(cupo) > 0)}
                    onClick={() => enviar([], parseInt(cupo) || 0, false)}
                  >
                    Enviar ampliación solo de cupo (ADD-02 · Directo a Jurídica)
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="size-4" />}
                    disabled={!(parseInt(cupo) > 0)}
                    onClick={() => enviar([], parseInt(cupo) || 0, true)}
                  >
                    Generar renovación de cupo (ADD-03 · Conserva campos)
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusCircle className="size-4" />}
                    disabled={campos.length === 0 && !(parseInt(cupo) > 0)}
                    onClick={() =>
                      enviar(
                        campos,
                        a.tipo === "Privada" ? parseInt(cupo) || 0 : 0,
                        false
                      )
                    }
                  >
                    {campos.length > 0
                      ? "Enviar ampliación (Asignar revisión de cambios · ADD-07)"
                      : "Enviar ampliación solo de cupo (Directo a Jurídica · ADD-04)"}
                  </Button>
                  {a.tipo === "Privada" && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<RefreshCw className="size-4" />}
                      disabled={!(parseInt(cupo) > 0)}
                      onClick={() => enviar([], parseInt(cupo) || 0, true)}
                    >
                      Generar renovación solo de cupo (ADD-03)
                    </Button>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* BANDEJA / TABLA PRINCIPAL DE AMPLIACIONES Y ADENDAS (HOMOLOGADA CON ENROLAMIENTO Y ACCESOS) */}
        <Card className="p-5 sm:p-6 space-y-4 border-border shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/70">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground">
                  Bandeja de Ampliaciones de Alcance y Cupo (Flujo BN-10)
                </h2>
                <Badge tone="primary" appearance="soft" size="sm">
                  {listaFiltrada.length}{" "}
                  {listaFiltrada.length === 1 ? "expediente" : "expedientes"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Director de Gestión asigna la revisión de cambios al Equipo de Gestión (`ADD-07`). El Equipo de Gestión revisa los nuevos campos (si hay confidenciales pasa a `DPI`). En la compuerta <strong>¿Requiere adenda?</strong>: si es <strong>Pública (No)</strong> pasa a Dirección de Gestión (`Aprobar actualización · ADD-05`); si es <strong>Privada (Sí)</strong> pasa a Jurídica (`Redactar adenda contractual` y `Gestionar firmas · ADD-04`) → Pago (`PAG-01/02`) → `Aprobar actualización` (`ADD-06`) y `Actualizar en Apigee` (`ACC-08`).
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border shrink-0 self-start">
              <Button
                type="button"
                size="sm"
                variant={alcanceBandeja === "TODAS" ? "primary" : "ghost"}
                onClick={() => {
                  setAlcanceBandeja("TODAS");
                  setCurrentPage(1);
                }}
                className="text-xs"
              >
                Todas las instituciones ({st.ampliaciones.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={alcanceBandeja === "SOLICITUD" ? "primary" : "ghost"}
                onClick={() => {
                  setAlcanceBandeja("SOLICITUD");
                  setCurrentPage(1);
                }}
                className="text-xs"
              >
                Solo {a.id} ({st.ampliaciones.filter((x) => x.accesoId === a.id).length})
              </Button>
            </div>
          </div>

          {/* Barra de búsqueda, filtros y ViewModeToggle */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="flex-1 min-w-[240px]">
                <Search
                  size="sm"
                  placeholder="Buscar por trámite AMP, institución, fuente, revisor o campo..."
                  value={busquedaAmp}
                  onChange={(e) => {
                    setBusquedaAmp(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setBusquedaAmp("");
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-full sm:w-[220px]">
                  <Combobox
                    value={estadoFiltro}
                    onValueChange={(val) => {
                      if (val) {
                        setEstadoFiltro(val as "TODOS" | EstadoAmpliacion);
                        setEstadoSearch(val === "TODOS" ? "Todos los estados" : val);
                        setCurrentPage(1);
                      }
                    }}
                    inputValue={
                      estadoSearch ||
                      (estadoFiltro === "TODOS" ? "Todos los estados" : estadoFiltro)
                    }
                    onInputValueChange={setEstadoSearch}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Estado..."
                      showTrigger={true}
                      showClear={false}
                      showSearchIcon={false}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[220px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                          {ESTADOS_AMPLIACION_FILTRO.map((est) => (
                            <ComboboxItem
                              key={est}
                              value={est}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {est === "TODOS" ? "Todos los estados" : est}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <div className="w-full sm:w-[220px]">
                  <Combobox
                    value={revisorFiltro}
                    onValueChange={(val) => {
                      if (val) {
                        setRevisorFiltro(val);
                        const label =
                          val === "TODOS"
                            ? "Todos los revisores"
                            : val === "SIN_ASIGNAR"
                            ? "Sin asignar en Gestión"
                            : val === "SOLO_CUPO"
                            ? "Solo cupo (Directo Jurídica)"
                            : val;
                        setRevisorSearch(label);
                        setCurrentPage(1);
                      }
                    }}
                    inputValue={
                      revisorSearch ||
                      (revisorFiltro === "TODOS"
                        ? "Todos los revisores"
                        : revisorFiltro === "SIN_ASIGNAR"
                        ? "Sin asignar en Gestión"
                        : revisorFiltro === "SOLO_CUPO"
                        ? "Solo cupo (Directo Jurídica)"
                        : revisorFiltro)
                    }
                    onInputValueChange={setRevisorSearch}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Revisor / Ruta..."
                      showTrigger={true}
                      showClear={false}
                      showSearchIcon={false}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[230px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Asignación / Ruta</ComboboxLabel>
                          <ComboboxItem value="TODOS" className="text-xs py-1.5 cursor-pointer">
                            Todos los revisores
                          </ComboboxItem>
                          <ComboboxItem value="SIN_ASIGNAR" className="text-xs py-1.5 cursor-pointer">
                            Sin asignar en Gestión
                          </ComboboxItem>
                          <ComboboxItem value="SOLO_CUPO" className="text-xs py-1.5 cursor-pointer">
                            Solo cupo (Directo Jurídica)
                          </ComboboxItem>
                          {REVISORES_GESTION.map((rev) => (
                            <ComboboxItem
                              key={rev}
                              value={rev}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {rev} (Gestión)
                            </ComboboxItem>
                          ))}
                          {REVISORES_DPI.map((rev) => (
                            <ComboboxItem
                              key={rev}
                              value={rev}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {rev} (DPI)
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {hayFiltros && (
              <div className="flex flex-wrap items-center gap-2 pt-1 animate-fade-in">
                <span className="text-xs font-medium text-muted-foreground mr-1">
                  Filtros activos:
                </span>
                {busquedaAmp.trim() !== "" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span>Búsqueda: &ldquo;{busquedaAmp}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBusquedaAmp("");
                        setCurrentPage(1);
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label="Quitar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {estadoFiltro !== "TODOS" && (
                  <Badge
                    tone="info"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span>Estado: {estadoFiltro}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEstadoFiltro("TODOS");
                        setEstadoSearch("");
                        setCurrentPage(1);
                      }}
                      className="hover:bg-info/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label="Quitar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {revisorFiltro !== "TODOS" && (
                  <Badge
                    tone="warning"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span>Asignación: {revisorFiltro}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRevisorFiltro("TODOS");
                        setRevisorSearch("");
                        setCurrentPage(1);
                      }}
                      className="hover:bg-warning/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label="Quitar filtro de revisor"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-danger gap-1"
                  onClick={() => {
                    setBusquedaAmp("");
                    setEstadoFiltro("TODOS");
                    setEstadoSearch("");
                    setRevisorFiltro("TODOS");
                    setRevisorSearch("");
                    setCurrentPage(1);
                  }}
                >
                  <X className="size-3" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* VISTA TABLA CON ACCIONES Y MODALES (HOMOLOGADA CON ASIGNACIÓN Y REVISIÓN DE ACCESOS) */}
          <div className={cn("w-full", viewMode === "table" ? "block" : "hidden")}>
            <Table
              className="w-full min-w-[1040px]"
              containerClassName="overflow-x-auto w-full"
            >
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="whitespace-nowrap text-left pl-4">
                    TRÁMITE / SOLICITUD
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    INSTITUCIÓN / ¿REQUIERE ADENDA?
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    ALCANCE (¿INCLUYE CAMPOS?)
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    REVISOR ASIGNADO / FORMALIZACIÓN
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    ESTADO BPMN 10
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-right pr-4">
                    ACCIONES
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLista.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <PlusCircle className="size-8 stroke-[1.5] text-muted-foreground/60" />
                        <p className="text-sm font-semibold text-foreground">
                          No se encontraron expedientes de ampliación
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajusta los filtros o cambia a &ldquo;Todas las instituciones&rdquo;.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLista.map((am) => {
                    const acc = st.accesos.find((x) => x.id === am.accesoId) ?? a;
                    const incluyeCampos = am.campos.length > 0;
                    const tieneConf = am.campos.some(
                      (c) =>
                        acc.catalogoCampos.find((x) => x.campo === c)
                          ?.clasificacion === "Confidencial"
                    );
                    const conservados = am.camposConservados ?? acc.camposAutorizados;

                    return (
                      <TableRow key={am.id}>
                        {/* 1. TRÁMITE / SOLICITUD */}
                        <TableCell className="pl-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => abrirModal(am, "EXPEDIENTE")}
                                className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                {am.id}
                              </button>
                              <Badge
                                tone="neutral"
                                appearance="outline"
                                size="sm"
                                className="font-mono text-[10px] h-4 px-1.5"
                              >
                                v{am.version}
                              </Badge>
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground block">
                              {acc.id} · Cred. {acc.credencial}
                            </span>
                          </div>
                        </TableCell>

                        {/* 2. INSTITUCIÓN / ¿REQUIERE ADENDA? */}
                        <TableCell className="py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">
                                {acc.institucion}
                              </span>
                              <Badge
                                tone={acc.tipo === "Privada" ? "primary" : "success"}
                                appearance="soft"
                                size="sm"
                                className="text-[10px] h-4 px-1.5"
                              >
                                {acc.tipo === "Privada"
                                  ? "Privada · Requiere adenda (ADD-04)"
                                  : "Pública · Sin adenda (ADD-05)"}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground block">
                              {acc.fuente}
                            </span>
                          </div>
                        </TableCell>

                        {/* 3. ALCANCE (¿INCLUYE CAMPOS?) */}
                        <TableCell className="py-3">
                          <div className="space-y-1 max-w-[290px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                tone={incluyeCampos ? "info" : "success"}
                                appearance="soft"
                                size="sm"
                                className="text-[10px] h-4 px-1.5"
                              >
                                {incluyeCampos
                                  ? "Incluye campos → Revisión (ADD-07)"
                                  : "Solo cupo → Conserva campos"}
                              </Badge>
                              {tieneConf && (
                                <Badge
                                  tone="danger"
                                  appearance="soft"
                                  size="sm"
                                  className="text-[10px] h-4 px-1.5"
                                >
                                  Confidencial (DPI)
                                </Badge>
                              )}
                              {am.cupoAdicional > 0 && (
                                <span className="font-mono text-[11px] font-bold text-primary">
                                  +{numero(am.cupoAdicional)} reg.
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {incluyeCampos ? (
                                <>
                                  Nuevos:{" "}
                                  <strong className="font-mono text-foreground">
                                    {am.campos.join(", ")}
                                  </strong>{" "}
                                  · Conserva {conservados.length}
                                </>
                              ) : (
                                <>
                                  Conserva {conservados.length} campos:{" "}
                                  <span className="font-mono">
                                    {conservados.join(", ")}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </TableCell>

                        {/* 4. REVISOR ASIGNADO / FORMALIZACIÓN */}
                        <TableCell className="py-3">
                          <div className="space-y-1 text-xs">
                            {incluyeCampos ? (
                              am.asignacionGestion ? (
                                <div className="flex items-center gap-2">
                                  <div className="size-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {am.asignacionGestion.revisor.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-foreground block leading-tight">
                                      {am.asignacionGestion.revisor}
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {am.asignacionGestion.idAsignacion}
                                      {tieneConf
                                        ? ` · DPI: ${am.asignacionDpi?.revisor ?? "Sin asignar"} (${am.informeDpiFirmas}/2)`
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <Badge tone="warning" appearance="soft" size="sm">
                                  Sin asignar en Gestión
                                </Badge>
                              )
                            ) : (
                              <span className="text-[11px] text-muted-foreground block">
                                Sin revisión Gestión/DPI (Solo cupo)
                              </span>
                            )}

                            {acc.tipo === "Privada" ? (
                              <span className="text-[10px] font-mono text-muted-foreground block">
                                Adenda:{" "}
                                <strong className="text-foreground">
                                  {am.adendaPreparada ? "Redactada" : "Por redactar"} ({am.firmasAdenda}/2)
                                </strong>{" "}
                                · Pago:{" "}
                                <strong className="text-foreground">
                                  {am.pagoConfirmado
                                    ? "Confirmado"
                                    : am.pagoIniciado
                                    ? "En pasarela"
                                    : "Pendiente"}
                                </strong>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-success block">
                                Pública: No requiere adenda ni factura (ADD-05)
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* 5. ESTADO BPMN 10 */}
                        <TableCell className="py-3">
                          <div className="space-y-1">
                            <Badge
                              tone={TONO[am.estado] ?? "info"}
                              appearance="soft"
                              size="sm"
                            >
                              {am.estado}
                            </Badge>
                            {am.reintentosApigee?.pendiente ? (
                              <span className="block text-[10px] font-mono text-warning">
                                Cola reintentos Apigee #{am.reintentosApigee.intentos}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>

                        {/* 6. ACCIONES (MODALES HOMOLOGADOS) */}
                        <TableCell className="pr-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Acción etapa 1: Asignar / Reasignar o Revisar en Gestión */}
                            {am.estado === "En revisión de Gestión" && (
                              <>
                                {(rol === "DIR_GESTION" || !am.asignacionGestion) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant={am.asignacionGestion ? "outline" : "primary"}
                                        leftIcon={
                                          am.asignacionGestion ? (
                                            <RotateCcw className="size-3.5" />
                                          ) : (
                                            <UserPlus className="size-3.5" />
                                          )
                                        }
                                        onClick={() => abrirModal(am, "ASIGNAR_GESTION")}
                                      >
                                        {am.asignacionGestion ? "Reasignar" : "Asignar"}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      {am.asignacionGestion
                                        ? "Reasignar revisor del Equipo de Gestión (ADD-07)"
                                        : "Asignar revisión de cambios al Equipo de Gestión (ADD-07)"}
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {am.asignacionGestion && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="primary"
                                        leftIcon={<ClipboardCheck className="size-3.5" />}
                                        onClick={() => abrirModal(am, "REVISAR_GESTION")}
                                      >
                                        Revisar cambios
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      Revisar cambios solicitados en Equipo de Gestión (ADD-07)
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </>
                            )}

                            {/* Acción etapa 2: Revisión DPI (Asignar revisor DPI, elaborar informe 1/2 y Visto Bueno 2/2) */}
                            {am.estado === "En revisión de DPI" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    leftIcon={<Scale className="size-3.5" />}
                                    onClick={() => abrirModal(am, "REVISAR_DPI")}
                                  >
                                    {!am.asignacionDpi
                                      ? "Asignar DPI"
                                      : am.informeDpiFirmas === 0
                                      ? "Informe DPI (1/2)"
                                      : "Firmar VoBo DPI (2/2)"}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Gestionar asignación, dictamen e informe vinculante en DPI (FirmaEC)
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Acción etapa 3: Jurídica (Redactar adenda contractual y Gestionar firmas 1/2 y 2/2) */}
                            {am.estado === "Pendiente de firmas" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    leftIcon={<FileSignature className="size-3.5" />}
                                    onClick={() => abrirModal(am, "JURIDICA_ADENDA")}
                                  >
                                    {!am.adendaPreparada
                                      ? "Redactar adenda"
                                      : `Gestionar firmas (${am.firmasAdenda}/2)`}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Jurídica: Redactar adenda contractual (PAR-02) y gestionar firmas en FirmaEC (ADD-04)
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Acción etapa 4: Facturación y Pasarela de pago */}
                            {am.estado === "Pendiente de pago" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    leftIcon={<CreditCard className="size-3.5" />}
                                    onClick={() => abrirModal(am, "PAGO_PASARELA")}
                                  >
                                    {am.pagoIniciado
                                      ? "Procesar cobro (PAG-02)"
                                      : "Pagar factura (PAG-01)"}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Pagar factura electrónica y confirmar cobro en pasarela
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Acción etapa 5: Dirección de Gestión -> Aprobar actualización (Caso Pública sin adenda o Caso Privada pagada) y Apigee */}
                            {(am.estado === "Pendiente de aprobación" ||
                              am.estado === "Pendiente de corrección") && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    leftIcon={<CheckCircle2 className="size-3.5" />}
                                    onClick={() => abrirModal(am, "APROBAR_ACTUALIZACION")}
                                  >
                                    {am.estado === "Pendiente de corrección"
                                      ? "Atender corrección"
                                      : "Aprobar actualización"}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Dirección de Gestión: Aprobar actualización (Pública ADD-05 / Privada ADD-06) y sincronizar Apigee (ACC-08)
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Acción etapa Observada: Corregir cambios solicitados (Coordinador SINARP) */}
                            {am.estado === "Observada" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="warning"
                                    leftIcon={<RefreshCw className="size-3.5" />}
                                    onClick={() => abrirModal(am, "SUBSANAR_COORDINADOR")}
                                  >
                                    Corregir cambios
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Subsanar observaciones dentro de 3 días hábiles (PAR-13)
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Botón Ver Expediente siempre disponible */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label={`Ver expediente ${am.id}`}
                                  onClick={() => abrirModal(am, "EXPEDIENTE")}
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <Eye className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                Ver expediente completo y trazabilidad
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista Tarjetas Interactivas (cuando viewMode === "cards") */}
          <div className={cn(viewMode === "cards" ? "space-y-4" : "hidden")}>
            {paginatedLista.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
                No hay ampliaciones registradas para los filtros seleccionados.
              </div>
            ) : (
              paginatedLista.map((am) => {
                const acc = st.accesos.find((x) => x.id === am.accesoId) ?? a;
                return (
                  <Tarjeta
                    key={am.id}
                    am={am}
                    a={acc}
                    onOpenModal={abrirModal}
                  />
                );
              })
            )}
          </div>

          {/* Footer de Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>
                Mostrando{" "}
                <strong className="font-semibold text-foreground">
                  {listaFiltrada.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </strong>{" "}
                a{" "}
                <strong className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, listaFiltrada.length)}
                </strong>{" "}
                de{" "}
                <strong className="font-semibold text-foreground">
                  {listaFiltrada.length}
                </strong>{" "}
                ampliaciones
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Filas:</span>
                <div className="inline-flex items-center rounded-lg border border-border bg-surface-subtle/60 p-0.5">
                  {[5, 8, 15].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setPageSize(sz);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                        pageSize === sz
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationFirst
                      href="#"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setCurrentPage(1);
                      }}
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(ev) => {
                            ev.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      href="#"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setCurrentPage(totalPages);
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </Card>

        {/* ========================================================================
            MODAL 1: ASIGNAR / REASIGNAR REVISOR — EQUIPO DE GESTIÓN (HOMOLOGADO)
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "ASIGNAR_GESTION" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-4xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (() => {
              const esReasignacion = Boolean(amModal.asignacionGestion);
              const selectedObj = CATALOGO_REVISORES_GESTION.find(
                (r) => r.id === selectedRevisorGestionId
              );
              const filtrados = CATALOGO_REVISORES_GESTION.filter((r) => {
                const q = revisorModalQuery.trim().toLowerCase();
                if (!q) return true;
                return (
                  r.nombre.toLowerCase().includes(q) ||
                  r.cargo.toLowerCase().includes(q) ||
                  r.especialidad.toLowerCase().includes(q)
                );
              });

              return (
                <div className="space-y-5 text-left">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 text-primary border-primary/20">
                        {esReasignacion ? (
                          <RotateCcw className="size-5 text-primary" />
                        ) : (
                          <UserPlus className="size-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                          {esReasignacion
                            ? "Reasignar Revisor — Equipo de Gestión (ADD-07)"
                            : "Asignar Revisión de Cambios — Equipo de Gestión (ADD-07)"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {esReasignacion
                            ? "Selecciona un nuevo funcionario del Equipo de Gestión y registra el motivo de la reasignación del expediente de ampliación."
                            : "Como la ampliación incluye nuevos campos solicitados, el Director de Gestión asigna el trámite a un miembro activo del Equipo de Gestión."}
                        </DialogDescription>
                      </div>
                    </div>
                  </div>

                  {esReasignacion && amModal.asignacionGestion && (
                    <div className="p-3.5 bg-info/10 border border-info/30 rounded-xl flex items-start gap-3 text-xs text-foreground">
                      <RotateCcw className="size-4 text-info shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="font-semibold block text-info font-heading">
                          Reasignación de trámite ({amModal.asignacionGestion.idAsignacion})
                        </strong>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          Revisor actual:{" "}
                          <strong className="text-foreground">
                            {amModal.asignacionGestion.revisor}
                          </strong>
                          . Al reasignar la ampliación se conserva íntegro el historial de acciones previas.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tarjeta informativa de la institución y alcance solicitado */}
                  <div className="p-3.5 bg-surface rounded-xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <Building2 className="size-4 text-primary shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        {accesoModal.institucion}
                      </span>
                      <Badge tone="primary" appearance="outline" size="sm" className="font-mono text-[10px]">
                        {amModal.id} · v{amModal.version} ({accesoModal.id})
                      </Badge>
                      <span className="text-muted-foreground truncate">
                        · {accesoModal.fuente}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground shrink-0 font-mono text-[11px]">
                      <span>Nuevos campos: {amModal.campos.join(", ")}</span>
                    </div>
                  </div>

                  {/* Tabla de Revisores disponibles (homologada con acceso-asignacion-gestion-view) */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Revisores disponibles — Equipo de Gestión
                      </span>
                      <div className="w-full sm:w-64">
                        <Search
                          size="sm"
                          value={revisorModalQuery}
                          onChange={(e) => setRevisorModalQuery(e.target.value)}
                          onClear={() => setRevisorModalQuery("")}
                          placeholder="Buscar funcionario..."
                          aria-label="Buscar funcionario"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="py-3 px-4 text-xs font-bold">
                              Revisor / Funcionario
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold">
                              Cargo y Especialidad
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold text-center w-28">
                              Estado
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold text-center w-24">
                              Acción
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtrados.map((rev) => {
                            const isSelected = selectedRevisorGestionId === rev.id;
                            const isCurrent =
                              rev.nombre === amModal.asignacionGestion?.revisor;
                            const inicial = rev.nombre.charAt(0).toUpperCase();

                            return (
                              <TableRow
                                key={rev.id}
                                data-state={isSelected ? "selected" : undefined}
                                onClick={() => setSelectedRevisorGestionId(rev.id)}
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  isSelected
                                    ? "bg-primary/15 font-semibold"
                                    : "hover:bg-primary/10"
                                )}
                              >
                                <TableCell className="py-2.5 px-4 h-auto">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        "size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                                        isSelected
                                          ? "bg-primary text-primary-foreground shadow-xs"
                                          : "bg-primary/10 text-primary border border-primary/20"
                                      )}
                                    >
                                      {inicial}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-foreground truncate">
                                          {rev.nombre}
                                        </span>
                                        {isCurrent && (
                                          <Badge
                                            tone="primary"
                                            appearance="soft"
                                            size="sm"
                                            className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider"
                                          >
                                            Actual
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2.5 px-4 h-auto text-xs text-muted-foreground">
                                  {rev.cargo} · {rev.especialidad}
                                </TableCell>
                                <TableCell className="py-2.5 px-4 h-auto text-center">
                                  <Badge
                                    tone="success"
                                    appearance="soft"
                                    size="sm"
                                    className="h-5 px-2 text-[10px] font-medium"
                                  >
                                    Activo
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2.5 h-auto text-center">
                                  <Button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRevisorGestionId(rev.id);
                                    }}
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Seleccionar a ${rev.nombre}`}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    {isSelected ? (
                                      <Check className="size-4 text-primary" />
                                    ) : (
                                      <UserPlus className="size-4" />
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Motivo / observaciones */}
                  <div className="space-y-1.5 pt-2">
                    <Label
                      htmlFor="motivo-asignacion-amp"
                      className="text-xs font-semibold text-foreground flex items-center justify-between"
                    >
                      <span>
                        {esReasignacion
                          ? "Motivo de la reasignación"
                          : "Observaciones de asignación"}
                        {esReasignacion && <span className="text-danger ml-1">*</span>}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {esReasignacion ? "Obligatorio (ADD-07 CA4)" : "Opcional"}
                      </span>
                    </Label>
                    <Textarea
                      id="motivo-asignacion-amp"
                      rows={2}
                      value={observacionAsignacion}
                      onChange={(e) => setObservacionAsignacion(e.target.value)}
                      placeholder={
                        esReasignacion
                          ? "Describe la razón por la cual se reasigna la revisión de cambios..."
                          : "Instrucciones u observaciones adicionales para el miembro del Equipo de Gestión..."
                      }
                      className="text-xs bg-surface border-border rounded-xl resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      Se registrará{" "}
                      <span className="font-mono font-semibold text-foreground">
                        id_asignacion
                      </span>{" "}
                      en el historial auditable.
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto justify-end">
                      <Button
                        type="button"
                        variant="neutral"
                        size="sm"
                        onClick={cerrarModal}
                        className="w-full sm:w-auto text-xs font-semibold h-10 px-6"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={
                          !selectedObj ||
                          (esReasignacion &&
                            (!observacionAsignacion.trim() ||
                              selectedObj.nombre ===
                                amModal.asignacionGestion?.revisor))
                        }
                        onClick={() => {
                          if (!selectedObj) return;
                          const idAsg = idOpaco("ASG-GES");
                          st.mutarAmpliacion(
                            amModal.id,
                            (x) => ({
                              ...x,
                              asignacionGestion: {
                                idAsignacion: idAsg,
                                asignador: actor.nombre,
                                revisor: selectedObj.nombre,
                                instante: ahoraIso(),
                                motivoReasignacion: esReasignacion
                                  ? observacionAsignacion.trim()
                                  : undefined,
                              },
                            }),
                            actor,
                            esReasignacion
                              ? "Revisión de cambios reasignada en Gestión (ADD-07)"
                              : "Revisión de cambios asignada en Gestión (ADD-07)",
                            `id_asignacion: ${idAsg} · Revisor: ${selectedObj.nombre}${
                              observacionAsignacion.trim()
                                ? ` · Nota: ${observacionAsignacion.trim()}`
                                : ""
                            }`
                          );
                          toast.success(
                            esReasignacion
                              ? `Revisión reasignada a ${selectedObj.nombre}`
                              : `Revisión asignada a ${selectedObj.nombre} (${idAsg})`
                          );
                          cerrarModal();
                        }}
                        className="w-full sm:w-auto text-xs font-semibold h-10 px-6 gap-2 shadow-xs"
                      >
                        {esReasignacion ? (
                          <RotateCcw className="size-4" />
                        ) : (
                          <UserPlus className="size-4" />
                        )}
                        <span>
                          {esReasignacion
                            ? `Reasignar a ${selectedObj?.nombre.split(" ")[0] ?? "revisor"}`
                            : `Asignar a ${selectedObj?.nombre.split(" ")[0] ?? "revisor"}`}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ========================================================================
            MODAL 2: REVISAR CAMBIOS SOLICITADOS — EQUIPO DE GESTIÓN (ADD-07)
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "REVISAR_GESTION" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-4xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (() => {
              const tieneConf = amModal.campos.some(
                (c) =>
                  accesoModal.catalogoCampos.find((x) => x.campo === c)
                    ?.clasificacion === "Confidencial"
              );
              const conservados =
                amModal.camposConservados ?? accesoModal.camposAutorizados;

              return (
                <div className="space-y-5 text-left">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 text-primary border-primary/20">
                        <ClipboardCheck className="size-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                          Revisar Cambios Solicitados — Equipo de Gestión (ADD-07)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          Valida únicamente los campos adicionales solicitados y su finalidad de uso. Los campos autorizados vigentes se conservan sin reevaluación.
                        </DialogDescription>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de expediente y revisor asignado */}
                  <div className="p-3.5 bg-surface rounded-xl border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="size-4 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">
                        {accesoModal.institucion}
                      </span>
                      <Badge
                        tone={accesoModal.tipo === "Privada" ? "primary" : "success"}
                        appearance="soft"
                        size="sm"
                      >
                        {accesoModal.tipo === "Privada"
                          ? "Privada · ¿Requiere adenda? = Sí (ADD-04)"
                          : "Pública · ¿Requiere adenda? = No (ADD-05)"}
                      </Badge>
                      <span className="font-mono text-muted-foreground">
                        {amModal.id} · v{amModal.version}
                      </span>
                    </div>
                    <Badge tone="info" appearance="outline" size="sm" className="font-mono">
                      Revisor: {amModal.asignacionGestion?.revisor ?? "Equipo de Gestión"}
                    </Badge>
                  </div>

                  {/* Campos que se conservan */}
                  <div className="rounded-xl bg-surface-subtle/60 border border-border p-3.5 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">
                      1. Alcance vigente que se conserva intacto ({conservados.length} campos):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {conservados.map((c) => (
                        <Badge
                          key={c}
                          tone="neutral"
                          appearance="outline"
                          size="sm"
                          className="font-mono"
                        >
                          {c} (autorizado vigente)
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tabla de nuevos campos solicitados para revisión */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        2. Nuevos campos solicitados sujetos a dictamen ({amModal.campos.length})
                      </p>
                      {amModal.cupoAdicional > 0 && (
                        <Badge tone="primary" appearance="soft" size="sm" className="font-mono">
                          + Cupo adicional: +{numero(amModal.cupoAdicional)} registros
                        </Badge>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">CAMPO NUEVO</TableHead>
                          <TableHead className="text-xs">CLASIFICACIÓN</TableHead>
                          <TableHead className="text-xs">FINALIDAD DE USO DECLARADA</TableHead>
                          <TableHead className="text-xs">JUSTIFICACIÓN JURÍDICA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {amModal.campos.map((c) => {
                          const cat = accesoModal.catalogoCampos.find(
                            (x) => x.campo === c
                          );
                          const just = amModal.justificacionesCampos?.[c];
                          const esConf = cat?.clasificacion === "Confidencial";
                          return (
                            <TableRow key={c}>
                              <TableCell className="font-mono text-xs font-bold text-primary">
                                + {c}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  tone={esConf ? "danger" : "info"}
                                  appearance="soft"
                                  size="sm"
                                >
                                  {cat?.clasificacion ?? "Accesible"}
                                  {cat?.sensible ? " · sensible" : ""}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-foreground">
                                {just?.finalidad ?? "Verificación funcional en el servicio."}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {just?.justificacionJuridica ??
                                  (esConf
                                    ? "Pendiente revisión de base legal en DPI"
                                    : "No aplica (campo accesible)")}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Explicación de la compuerta del BPMN 10 al aprobar */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs space-y-1">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <GitBranch className="size-4 text-primary" />
                      Ruta del Flujo BPMN 10 al aprobar en Equipo de Gestión:
                    </p>
                    {tieneConf ? (
                      <p className="text-muted-foreground">
                        • Compuerta <strong>¿Incluye campos confidenciales? = Sí</strong> → Se deriva al carril <strong>Área de DPI (`Revisar campos confidenciales y emitir informe vinculante`)</strong> con 2 firmas en FirmaEC.
                      </p>
                    ) : accesoModal.tipo === "Pública" ? (
                      <p className="text-muted-foreground">
                        • Compuerta <strong>¿Incluye campos confidenciales? = No</strong> → Compuerta <strong>¿Requiere adenda? = No (Institución Pública · ADD-05)</strong> → Pasa directo al carril <strong>Dirección de Gestión (`Aprobar actualización`)</strong> sin contrato ni factura.
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        • Compuerta <strong>¿Incluye campos confidenciales? = No</strong> → Compuerta <strong>¿Requiere adenda? = Sí (Institución Privada · ADD-04)</strong> → Pasa al carril <strong>Jurídica (`Redactar adenda contractual` y `Gestionar firmas`)</strong>.
                      </p>
                    )}
                  </div>

                  {/* Observaciones en caso de observar */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="obs-rev-gestion"
                      className="text-xs font-semibold text-foreground flex items-center justify-between"
                    >
                      <span>
                        Observaciones por campo o generales (obligatorias si observas · plazo PAR-13 de 3 días hábiles)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Requerido para Observar
                      </span>
                    </Label>
                    <Textarea
                      id="obs-rev-gestion"
                      rows={2}
                      value={observacionRevision}
                      onChange={(e) => setObservacionRevision(e.target.value)}
                      placeholder="Indica el detalle si requieres que el Coordinador SINARP corrija la finalidad de uso o justificación..."
                      className="text-xs bg-surface border-border rounded-xl resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={cerrarModal}
                    >
                      Cancelar
                    </Button>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        type="button"
                        variant="warning"
                        size="sm"
                        disabled={!observacionRevision.trim()}
                        onClick={() => {
                          st.mutarAmpliacion(
                            amModal.id,
                            (x) => ({
                              ...x,
                              decisionGestion: "Observada",
                              estado: "Observada",
                              observaciones: observacionRevision.trim(),
                              fechaLimiteSubsanacion: sumarDiasHabiles(
                                ahoraIso(),
                                PLAZO_SUBSANACION_DIAS
                              ),
                            }),
                            actor,
                            "Observada por Equipo de Gestión (ADD-07)",
                            observacionRevision.trim()
                          );
                          toast.warning(
                            "Ampliación observada con plazo de 3 días hábiles (PAR-13)"
                          );
                          cerrarModal();
                        }}
                      >
                        Observar cambios (3 días hábiles)
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="size-4" />}
                        onClick={() => {
                          if (tieneConf) {
                            st.mutarAmpliacion(
                              amModal.id,
                              (x) => ({
                                ...x,
                                decisionGestion: "Aprobada",
                                estado: "En revisión de DPI",
                              }),
                              actor,
                              "Equipo de Gestión aprueba cambios (ADD-07) → Pasa a DPI",
                              "¿Incluye campos confidenciales? = Sí. Pasa al Área de DPI para informe vinculante (2 firmas FirmaEC)."
                            );
                            toast.success("Cambios aprobados en Gestión → Derivado a DPI");
                          } else if (accesoModal.tipo === "Pública") {
                            st.mutarAmpliacion(
                              amModal.id,
                              (x) => ({
                                ...x,
                                decisionGestion: "Aprobada",
                                pagoConfirmado: true,
                                estado: "Pendiente de aprobación",
                              }),
                              actor,
                              "Equipo de Gestión aprueba cambios (ADD-07) → ¿Requiere adenda? = No (Pública · ADD-05)",
                              "Sin campos confidenciales ni adenda contractual. Pasa a Dirección de Gestión para ejecutar 'Aprobar actualización'."
                            );
                            toast.success(
                              "Cambios aprobados → Pasa a Dirección de Gestión (Aprobar actualización)"
                            );
                          } else {
                            st.mutarAmpliacion(
                              amModal.id,
                              (x) => ({
                                ...x,
                                decisionGestion: "Aprobada",
                                estado: "Pendiente de firmas",
                              }),
                              actor,
                              "Equipo de Gestión aprueba cambios (ADD-07) → ¿Requiere adenda? = Sí (Privada · ADD-04)",
                              "Pasa al carril Jurídica para 'Redactar adenda contractual' (PAR-02) y 'Gestionar firmas'."
                            );
                            toast.success(
                              "Cambios aprobados → Pasa a Jurídica (Redactar adenda contractual)"
                            );
                          }
                          cerrarModal();
                        }}
                      >
                        {tieneConf
                          ? "Aprobar y derivar a DPI"
                          : accesoModal.tipo === "Pública"
                          ? "Aprobar → Pasa a Aprobar actualización (Pública)"
                          : "Aprobar → Pasa a Jurídica (Redactar adenda)"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ========================================================================
            MODAL 3: REVISIÓN DE CAMPOS CONFIDENCIALES E INFORME VINCULANTE — DPI
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "REVISAR_DPI" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-4xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (() => {
              const selectedDpiObj = CATALOGO_REVISORES_DPI.find(
                (r) => r.id === selectedRevisorDpiId
              );
              const camposConf = amModal.campos.filter(
                (c) =>
                  accesoModal.catalogoCampos.find((x) => x.campo === c)
                    ?.clasificacion === "Confidencial"
              );

              return (
                <div className="space-y-5 text-left">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 text-primary border-primary/20">
                        <Scale className="size-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                          Área de DPI — Revisar Campos Confidenciales e Informe Vinculante (ADD-07)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          Asignación de Revisor DPI, evaluación normativa de campos confidenciales y suscripción del informe de recomendación con 2 firmas en FirmaEC ({amModal.informeDpiFirmas}/2).
                        </DialogDescription>
                      </div>
                    </div>
                  </div>

                  {/* Paso A: Tabla para Asignar / Reasignar Revisor de DPI */}
                  <div className="space-y-3 rounded-xl bg-surface-subtle/50 border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                          1. Asignación de Revisor del Equipo de DPI (Director DPI)
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {amModal.asignacionDpi
                            ? `Asignado actualmente a ${amModal.asignacionDpi.revisor} (${amModal.asignacionDpi.idAsignacion}).`
                            : "Selecciona al especialista de DPI responsable de elaborar el informe vinculante."}
                        </p>
                      </div>
                      <Badge
                        tone={amModal.asignacionDpi ? "success" : "warning"}
                        appearance="soft"
                        size="sm"
                      >
                        {amModal.asignacionDpi ? "Asignado en DPI" : "Pendiente asignar DPI"}
                      </Badge>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Especialista DPI</TableHead>
                          <TableHead className="text-xs">Cargo y Especialidad</TableHead>
                          <TableHead className="text-xs text-right">Selección</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {CATALOGO_REVISORES_DPI.map((rev) => {
                          const isSel = selectedRevisorDpiId === rev.id;
                          return (
                            <TableRow
                              key={rev.id}
                              onClick={() => setSelectedRevisorDpiId(rev.id)}
                              className={cn(
                                "cursor-pointer",
                                isSel ? "bg-primary/15 font-semibold" : "hover:bg-primary/5"
                              )}
                            >
                              <TableCell className="text-xs font-bold text-foreground">
                                {rev.nombre}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {rev.cargo} · {rev.especialidad}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isSel ? "primary" : "outline"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const idAsg = idOpaco("ASG-DPI");
                                    setSelectedRevisorDpiId(rev.id);
                                    st.mutarAmpliacion(
                                      amModal.id,
                                      (x) => ({
                                        ...x,
                                        asignacionDpi: {
                                          idAsignacion: idAsg,
                                          asignador: actor.nombre,
                                          revisor: rev.nombre,
                                          instante: ahoraIso(),
                                        },
                                      }),
                                      actor,
                                      "Revisión de campos confidenciales asignada en DPI (ADD-07)",
                                      `id_asignacion: ${idAsg} · Especialista DPI: ${rev.nombre}`
                                    );
                                    toast.success(`Asignado en DPI a ${rev.nombre}`);
                                  }}
                                >
                                  {amModal.asignacionDpi?.revisor === rev.nombre
                                    ? "Asignado actual"
                                    : "Asignar a este revisor"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paso B: Campos confidenciales evaluados e Informe con 2 firmas FirmaEC */}
                  <div className="space-y-3 rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                        2. Informe Vinculante de Recomendación DPI — Firmas FirmaEC: {amModal.informeDpiFirmas}/2
                      </p>
                      <div className="flex items-center gap-1.5">
                        {camposConf.map((c) => (
                          <Badge key={c} tone="danger" appearance="soft" size="sm" className="font-mono">
                            {c} (Confidencial)
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">
                          Criterio sobre finalidad de uso
                        </Label>
                        <Textarea
                          rows={2}
                          value={criterioUsoModal}
                          onChange={(e) => setCriterioUsoModal(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">
                          Criterio sobre justificación jurídica (LOPDP)
                        </Label>
                        <Textarea
                          rows={2}
                          value={criterioJuridicoModal}
                          onChange={(e) => setCriterioJuridicoModal(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-foreground">
                        Observaciones de DPI (solo si decides observar los campos confidenciales)
                      </Label>
                      <Input
                        value={observacionRevision}
                        onChange={(e) => setObservacionRevision(e.target.value)}
                        placeholder="Indica el motivo jurídico si observas la ampliación..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={cerrarModal}
                    >
                      Cerrar
                    </Button>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        type="button"
                        variant="warning"
                        size="sm"
                        disabled={!observacionRevision.trim()}
                        onClick={() => {
                          st.mutarAmpliacion(
                            amModal.id,
                            (x) => ({
                              ...x,
                              decisionDpi: "Observada",
                              estado: "Observada",
                              observaciones: observacionRevision.trim(),
                              fechaLimiteSubsanacion: sumarDiasHabiles(
                                ahoraIso(),
                                PLAZO_SUBSANACION_DIAS
                              ),
                            }),
                            actor,
                            "Observada por Área de DPI (ADD-07)",
                            observacionRevision.trim()
                          );
                          toast.warning("Ampliación observada por DPI (plazo 3 días hábiles)");
                          cerrarModal();
                        }}
                      >
                        Observar campos confidenciales
                      </Button>

                      {amModal.informeDpiFirmas === 0 && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          leftIcon={<FileSignature className="size-4" />}
                          onClick={() => {
                            const revNombre =
                              amModal.asignacionDpi?.revisor ??
                              selectedDpiObj?.nombre ??
                              "Dr. Carlos Mendoza";
                            st.mutarAmpliacion(
                              amModal.id,
                              (x) => ({
                                ...x,
                                asignacionDpi: x.asignacionDpi ?? {
                                  idAsignacion: idOpaco("ASG-DPI"),
                                  asignador: "Director de DPI",
                                  revisor: revNombre,
                                  instante: ahoraIso(),
                                },
                                decisionDpi: "Aprobada",
                                informeDpiBorrador: {
                                  criterioUso: criterioUsoModal.trim(),
                                  criterioJuridico: criterioJuridicoModal.trim(),
                                },
                                informeDpiFirmas: 1,
                              }),
                              actor,
                              "Revisor DPI aprobó e incorporó firma 1/2 en FirmaEC (ADD-07)",
                              "Borrador de informe vinculante listo para Visto Bueno y firma 2/2 del Director de DPI."
                            );
                            toast.success("Informe DPI firmado 1/2 en FirmaEC");
                          }}
                        >
                          1. Aprobar y firmar Informe Revisor DPI (1/2)
                        </Button>
                      )}

                      {amModal.informeDpiFirmas >= 1 && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          leftIcon={<Stamp className="size-4" />}
                          onClick={() => {
                            if (accesoModal.tipo === "Pública") {
                              st.mutarAmpliacion(
                                amModal.id,
                                (x) => ({
                                  ...x,
                                  informeDpiFirmas: 2,
                                  pagoConfirmado: true,
                                  estado: "Pendiente de aprobación",
                                }),
                                actor,
                                "Director DPI firmó Visto Bueno (2/2) → ¿Requiere adenda? = No (Pública · ADD-05)",
                                "Informe DPI completo (2/2). Por ser Institución Pública no requiere adenda; pasa a Dirección de Gestión para 'Aprobar actualización'."
                              );
                              toast.success(
                                "Informe DPI 2/2 completado → Pasa a Dirección de Gestión (Aprobar actualización)"
                              );
                            } else {
                              st.mutarAmpliacion(
                                amModal.id,
                                (x) => ({
                                  ...x,
                                  informeDpiFirmas: 2,
                                  estado: "Pendiente de firmas",
                                }),
                                actor,
                                "Director DPI firmó Visto Bueno (2/2) → ¿Requiere adenda? = Sí (Privada · ADD-04)",
                                "Informe DPI completo (2/2). Pasa a Jurídica para 'Redactar adenda contractual' y 'Gestionar firmas'."
                              );
                              toast.success(
                                "Informe DPI 2/2 completado → Pasa a Jurídica (Redactar adenda contractual)"
                              );
                            }
                            cerrarModal();
                          }}
                        >
                          2. Dar Visto Bueno Director DPI y firmar 2/2 →{" "}
                          {accesoModal.tipo === "Pública"
                            ? "Pasa a Aprobar actualización"
                            : "Pasa a Jurídica"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ========================================================================
            MODAL 4: JURÍDICA — COMPUERTA ¿REQUIERE ADENDA?, REDACTAR ADENDA Y GESTIONAR FIRMAS
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "JURIDICA_ADENDA" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-4xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (() => {
              const conservados =
                amModal.camposConservados ?? accesoModal.camposAutorizados;

              return (
                <div className="space-y-5 text-left">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 text-primary border-primary/20">
                        <FileSignature className="size-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                          Jurídica — Redactar Adenda Contractual y Gestionar Firmas (ADD-04 · Flujo BN-10)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          Formalización contractual de la ampliación privada mediante plantilla vigente (PAR-02) y recolección de 2 firmas electrónicas en FirmaEC.
                        </DialogDescription>
                      </div>
                    </div>
                  </div>

                  {/* Explicación visual de los 2 casos de la compuerta ¿Requiere adenda? en el BPMN 10 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div
                      className={cn(
                        "rounded-xl border p-3.5 space-y-1",
                        accesoModal.tipo === "Pública"
                          ? "border-success bg-success/10"
                          : "border-border bg-surface-subtle/50 opacity-75"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground">
                          Caso 1: ¿Requiere adenda? = No (Pública · ADD-05)
                        </span>
                        <Badge tone="success" appearance="soft" size="sm">
                          Sin adenda
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Cuando la institución es Pública, no se redacta adenda ni se emite factura; tras aprobar cambios pasa directo a <strong>Dirección de Gestión → Aprobar actualización</strong>.
                      </p>
                    </div>

                    <div
                      className={cn(
                        "rounded-xl border p-3.5 space-y-1",
                        accesoModal.tipo === "Privada"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface-subtle/50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground">
                          Caso 2: ¿Requiere adenda? = Sí (Privada · ADD-04)
                        </span>
                        <Badge tone="primary" appearance="soft" size="sm">
                          Caso activo · {EVENTO[amModal.tipo]}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Jurídica ejecuta <strong>1) Redactar adenda contractual (PAR-02)</strong> y <strong>2) Gestionar firmas (1/2 Coordinador SINARP y 2/2 Máxima Autoridad)</strong> → Emite factura `FAC-01`.
                      </p>
                    </div>
                  </div>

                  {/* Paso 1 de Jurídica: Redactar adenda contractual (PAR-02) */}
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          Paso 1 (Carril Jurídica): Redactar adenda contractual (Plantilla PAR-02)
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {amModal.campos.length === 0
                            ? "Ampliación Solo Cupo (ADD-02 / ADD-03): conserva intactos los campos autorizados y actualiza únicamente el cupo."
                            : "Ampliación con nuevos campos aprobados en ADD-07: consolida campos conservados + nuevos campos autorizados."}
                        </p>
                      </div>
                      <Badge
                        tone={amModal.adendaPreparada ? "success" : "warning"}
                        appearance="soft"
                        size="sm"
                      >
                        {amModal.adendaPreparada
                          ? "Adenda redactada (PAR-02)"
                          : "Pendiente redactar adenda"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-surface-subtle/60 p-3 rounded-lg border border-border/70">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          Evento facturable
                        </span>
                        <span className="font-mono font-bold text-primary">
                          {EVENTO[amModal.tipo]}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          Campos conservados ({conservados.length})
                        </span>
                        <span className="font-mono text-foreground">
                          {conservados.join(", ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          Cambios a formalizar
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {amModal.campos.length > 0
                            ? `+Campos: ${amModal.campos.join(", ")}`
                            : "Sin campos nuevos"}{" "}
                          {amModal.cupoAdicional > 0
                            ? `· +${numero(amModal.cupoAdicional)} reg.`
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-foreground">
                        Cláusula de alcance y cupo autocompletada (Plantilla PAR-02)
                      </Label>
                      <Textarea
                        rows={3}
                        value={clausulaAdendaModal}
                        onChange={(e) => setClausulaAdendaModal(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant={amModal.adendaPreparada ? "outline" : "primary"}
                        leftIcon={<FileText className="size-4" />}
                        onClick={() => {
                          st.mutarAmpliacion(
                            amModal.id,
                            (x) => ({ ...x, adendaPreparada: true }),
                            actor,
                            `Jurídica redactó adenda contractual con plantilla PAR-02 (${EVENTO[amModal.tipo]})`,
                            "Documento contractual generado y enviado a gestión de firmas en FirmaEC."
                          );
                          toast.success(
                            "Adenda contractual redactada con plantilla PAR-02"
                          );
                        }}
                      >
                        {amModal.adendaPreparada
                          ? "Actualizar redacción de adenda (PAR-02)"
                          : "1. Redactar adenda contractual (PAR-02)"}
                      </Button>
                    </div>
                  </div>

                  {/* Paso 2 de Jurídica y Coordinador / Máxima Autoridad: Gestionar firmas en FirmaEC */}
                  <div className="rounded-xl border border-border bg-surface-subtle/50 p-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          Paso 2 (Carriles Jurídica / Coordinador SINARP / Máxima Autoridad): Gestionar firmas ({amModal.firmasAdenda}/2 en FirmaEC)
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Al completarse la segunda firma (2/2), se emite automáticamente la factura (`FAC-01`) y pasa al carril de pago (`Pendiente de pago`).
                        </p>
                      </div>
                      <Badge
                        tone={amModal.firmasAdenda >= 2 ? "success" : "info"}
                        appearance="soft"
                        size="sm"
                      >
                        Firmas registradas: {amModal.firmasAdenda} de 2
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-surface p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground">
                            Firma 1/2 — Coordinador SINARP
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Tarea BPMN 10: «Firmar adenda contractual»
                          </p>
                        </div>
                        {amModal.firmasAdenda >= 1 ? (
                          <Badge tone="success" appearance="soft" size="sm">
                            Firmado 1/2
                          </Badge>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            disabled={!amModal.adendaPreparada}
                            onClick={() => {
                              st.mutarAmpliacion(
                                amModal.id,
                                (x) => ({
                                  ...x,
                                  adendaPreparada: true,
                                  firmasAdenda: 1,
                                }),
                                actor,
                                "Firma de adenda en FirmaEC: Coordinador SINARP (1/2)",
                                "Pendiente segunda firma de la Máxima Autoridad DINARP (2/2)."
                              );
                              toast.success(
                                "Firma 1/2 (Coordinador SINARP) registrada en FirmaEC"
                              );
                            }}
                          >
                            Firmar 1/2 (Coordinador)
                          </Button>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-surface p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground">
                            Firma 2/2 — Máxima Autoridad DINARP
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Cierra gestión de firmas y emite factura FAC-01
                          </p>
                        </div>
                        {amModal.firmasAdenda >= 2 ? (
                          <Badge tone="success" appearance="soft" size="sm">
                            Firmado 2/2
                          </Badge>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            disabled={amModal.firmasAdenda < 1}
                            onClick={() => {
                              const numFac =
                                amModal.facturaId ??
                                `FAC-2026-00${890 + amModal.version}`;
                              st.mutarAmpliacion(
                                amModal.id,
                                (x) => ({
                                  ...x,
                                  adendaPreparada: true,
                                  firmasAdenda: 2,
                                  facturaId: numFac,
                                  estado: "Pendiente de pago",
                                }),
                                actor,
                                "Firma de adenda en FirmaEC: Máxima Autoridad DINARP (2/2)",
                                `Adenda perfeccionada (2/2). Se emite automáticamente la factura ${numFac} (FAC-01) y pasa a Pendiente de pago (PAG-01 / PAG-02).`
                              );
                              toast.success(
                                `Adenda firmada (2/2) y factura ${numFac} emitida`
                              );
                              cerrarModal();
                            }}
                          >
                            Firmar 2/2 y emitir factura
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-border">
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={cerrarModal}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ========================================================================
            MODAL 5: PAGAR FACTURA Y PROCESAR COBRO EN PASARELA (FAC-01 / PAG-01 / PAG-02)
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "PAGO_PASARELA" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-3xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (
              <div className="space-y-5 text-left">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 text-primary border-primary/20">
                      <CreditCard className="size-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                        Pagar Factura y Procesar Cobro en Pasarela (FAC-01 · PAG-01 · PAG-02)
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        El Coordinador SINARP ejecuta «Pagar factura» (PAG-01) y la Pasarela de Pago / Facturación ejecuta «Procesar cobro de factura» (PAG-02). Si ¿Pago confirmado? = Sí, pasa a Dirección de Gestión (Aprobar actualización · ADD-06).
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-subtle/60 p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">
                        Factura emitida (FAC-01)
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {amModal.facturaId ?? "FAC-2026-00890"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">
                        Institución / Evento
                      </span>
                      <span className="font-semibold text-foreground">
                        {accesoModal.institucion} ({EVENTO[amModal.tipo]})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">
                        Compuerta ¿Pago confirmado?
                      </span>
                      <Badge
                        tone={
                          amModal.pagoConfirmado
                            ? "success"
                            : amModal.pagoIniciado
                            ? "info"
                            : "warning"
                        }
                        appearance="soft"
                        size="sm"
                      >
                        {amModal.pagoConfirmado
                          ? "Sí · Pago confirmado"
                          : amModal.pagoIniciado
                          ? "Orden enviada a pasarela"
                          : "Pendiente iniciar pago"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">
                      Referencia de transacción en Pasarela de Pago
                    </Label>
                    <Input
                      value={referenciaPagoModal}
                      onChange={(e) => setReferenciaPagoModal(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={cerrarModal}
                  >
                    Cerrar
                  </Button>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {!amModal.pagoIniciado && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={<CreditCard className="size-4" />}
                        onClick={() => {
                          st.mutarAmpliacion(
                            amModal.id,
                            (x) => ({ ...x, pagoIniciado: true }),
                            actor,
                            "Coordinador SINARP: Pagar factura en pasarela (PAG-01)",
                            `Orden de pago enviada para factura ${amModal.facturaId ?? "FAC-2026-00890"} · Ref: ${referenciaPagoModal}`
                          );
                          toast.success(
                            "Pago electrónico iniciado en pasarela (PAG-01)"
                          );
                        }}
                      >
                        1. Pagar factura (Coordinador SINARP · PAG-01)
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="size-4" />}
                      onClick={() => {
                        st.mutarAmpliacion(
                          amModal.id,
                          (x) => ({
                            ...x,
                            pagoIniciado: true,
                            pagoConfirmado: true,
                            estado: "Pendiente de aprobación",
                          }),
                          actor,
                          "Pasarela de Pago / Facturación: Procesar cobro de factura (PAG-02)",
                          `¿Pago confirmado? = Sí (${referenciaPagoModal}). Pasa al carril Dirección de Gestión para ejecutar 'Aprobar actualización' (ADD-06).`
                        );
                        toast.success(
                          "Cobro confirmado (PAG-02) → Pasa a Dirección de Gestión (Aprobar actualización)"
                        );
                        cerrarModal();
                      }}
                    >
                      2. Procesar cobro y confirmar pago (PAG-02 → Aprobar actualización)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================
            MODAL 6: DIRECCIÓN DE GESTIÓN — APROBAR ACTUALIZACIÓN Y SINCRONIZAR EN APIGEE
            (ATIENDE CASO 1 PÚBLICA SIN ADENDA ADD-05 Y CASO 2 PRIVADA PAGADA ADD-06 -> ACC-08)
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "APROBAR_ACTUALIZACION" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-4xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (() => {
              const conservados =
                amModal.camposConservados ?? accesoModal.camposAutorizados;
              const esPublica = accesoModal.tipo === "Pública";

              return (
                <div className="space-y-5 text-left">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 text-primary border-primary/20">
                        <Server className="size-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                          Dirección de Gestión — Aprobar Actualización y Sincronizar en Apigee (ACC-08)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {esPublica
                            ? "Caso 1 (Institución Pública · ¿Requiere adenda? = No · ADD-05): Aprueba la actualización de alcance sin contrato ni pago y actualiza en Apigee (ACC-08)."
                            : "Caso 2 (Institución Privada · ¿Requiere adenda? = Sí + ¿Pago confirmado? = Sí · ADD-06): Verifica adenda firmada 2/2 y pago confirmado para actualizar alcance/cupo en Apigee (ACC-08), o solicita corrección."}
                        </DialogDescription>
                      </div>
                    </div>
                  </div>

                  {/* Checklist de verificación según el caso del BPMN 10 */}
                  <div className="rounded-xl border border-border bg-surface-subtle/60 p-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-foreground">
                        Verificación previa en el carril Dirección de Gestión («Aprobar actualización»):
                      </span>
                      <Badge
                        tone={esPublica ? "success" : "primary"}
                        appearance="soft"
                        size="sm"
                      >
                        {esPublica
                          ? "Rama Pública · Sin adenda (ADD-05)"
                          : `Rama Privada · Con adenda ${EVENTO[amModal.tipo]} (ADD-06)`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-surface p-3 border border-border">
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          1. Revisión de cambios (ADD-07)
                        </span>
                        <span className="font-semibold text-foreground">
                          {amModal.campos.length > 0
                            ? `Aprobada (${amModal.campos.join(", ")})`
                            : "Solo cupo · Conserva campos vigentes"}
                        </span>
                      </div>
                      <div className="rounded-lg bg-surface p-3 border border-border">
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          2. Compuerta ¿Requiere adenda?
                        </span>
                        <span className="font-semibold text-foreground">
                          {esPublica
                            ? "No (Institución Pública · ADD-05)"
                            : `Sí · Firmas FirmaEC: ${amModal.firmasAdenda}/2`}
                        </span>
                      </div>
                      <div className="rounded-lg bg-surface p-3 border border-border">
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          3. Cobro / Pasarela y Apigee
                        </span>
                        <span className="font-semibold text-foreground">
                          {esPublica
                            ? "Exento de factura y pago"
                            : `Factura ${amModal.facturaId ?? "FAC-01"} · Pago confirmado`}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Al ejecutar <strong>«Aprobar actualización y aplicar en Apigee (ACC-08)»</strong>, se conservan los {conservados.length} campos vigentes ({conservados.join(", ")}), se incorporan los cambios autorizados sobre la misma credencial <span className="font-mono font-semibold text-foreground">{accesoModal.credencial}</span> (nueva versión <span className="font-mono font-semibold text-foreground">v{accesoModal.versionAlcance + 1}</span>) y se ejecuta <strong>«Notificar actualización aplicada»</strong>.
                    </p>
                  </div>

                  {/* Si está en Pendiente de corrección, permitir al área subsanar y devolver */}
                  {amModal.estado === "Pendiente de corrección" && (
                    <div className="rounded-xl border border-danger/40 bg-danger/5 p-4 space-y-3 text-xs">
                      <p className="font-bold text-danger">
                        Trámite en «Pendiente de corrección» para el área: {amModal.correccion?.area} — Motivo: {amModal.correccion?.motivo}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <Input
                          value={notaSubsanacionAreaModal}
                          onChange={(e) => setNotaSubsanacionAreaModal(e.target.value)}
                          placeholder="Describe la corrección realizada por el área sobre el mismo id_ampliacion..."
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            st.mutarAmpliacion(
                              amModal.id,
                              (x) => ({
                                ...x,
                                estado: "Pendiente de aprobación",
                                correccion: undefined,
                              }),
                              actor,
                              `Corrección atendida por ${amModal.correccion?.area ?? actor.nombre} (ADD-06)`,
                              notaSubsanacionAreaModal.trim() ||
                                "Se corrigió la observación manteniendo el mismo id_ampliacion y vuelve a Pendiente de aprobación."
                            );
                            setNotaSubsanacionAreaModal("");
                            toast.success(
                              "Corrección registrada; listo para Aprobar actualización"
                            );
                          }}
                        >
                          Registrar corrección y devolver a Gestión
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Opción de Solicitar corrección (ADD-06 CA3) */}
                  {!esPublica && (
                    <div className="rounded-xl border border-border p-4 space-y-3 text-xs">
                      <p className="font-bold text-foreground">
                        ¿Detectaste inconsistencia en adenda, factura o pago? Solicitar corrección a área interna (ADD-06):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-3 space-y-1">
                          <Label className="text-xs font-semibold">Área destino</Label>
                          <div className="flex flex-wrap gap-1">
                            {AREAS_CORRECCION.map((ar) => (
                              <Button
                                key={ar}
                                type="button"
                                size="sm"
                                variant={areaCorreccionModal === ar ? "primary" : "outline"}
                                onClick={() => setAreaCorreccionModal(ar)}
                                className="text-[11px]"
                              >
                                {ar}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-6 space-y-1">
                          <Label className="text-xs font-semibold">
                            Motivo de corrección
                          </Label>
                          <Input
                            value={motivoCorreccionModal}
                            onChange={(e) => setMotivoCorreccionModal(e.target.value)}
                            placeholder="Ej. Verificar glosa de evento facturable o anexo de firmas..."
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="warning"
                            className="w-full"
                            disabled={!motivoCorreccionModal.trim()}
                            onClick={() => {
                              st.mutarAmpliacion(
                                amModal.id,
                                (x) => ({
                                  ...x,
                                  estado: "Pendiente de corrección",
                                  correccion: {
                                    area: areaCorreccionModal,
                                    motivo: motivoCorreccionModal.trim(),
                                  },
                                }),
                                actor,
                                `Dirección de Gestión solicitó corrección a ${areaCorreccionModal} (ADD-06)`,
                                motivoCorreccionModal.trim()
                              );
                              toast.warning(
                                `Enviado a Pendiente de corrección (${areaCorreccionModal})`
                              );
                            }}
                          >
                            Solicitar corrección
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones finales del carril Portal / Apigee (ACC-08: ¿Actualización aplicada? Sí vs No -> Encolar reintentos) */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={cerrarModal}
                    >
                      Cerrar
                    </Button>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={<RefreshCw className="size-4" />}
                        onClick={() => {
                          const nIntentos = (amModal.reintentosApigee?.intentos ?? 0) + 1;
                          st.mutarAmpliacion(
                            amModal.id,
                            (x) => ({
                              ...x,
                              reintentosApigee: {
                                pendiente: true,
                                idOperacion: idOpaco("OP-APG"),
                                motivo: "Timeout transitorio de sincronización de atributos en Apigee.",
                                intentos: nIntentos,
                              },
                            }),
                            actor,
                            "Compuerta ¿Actualización aplicada? = No → Encolar reintentos en Apigee (ACC-08)",
                            `Fallo transitorio simulado en Apigee. Se mantiene vigente el alcance anterior v${accesoModal.versionAlcance} y se encola reintento #${nIntentos}.`
                          );
                          toast.warning(
                            "Simulado fallo en Apigee → Encolado en cola de reintentos (ACC-08)"
                          );
                        }}
                      >
                        Simular fallo Apigee (Encolar reintentos)
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="size-4" />}
                        onClick={() => {
                          st.aplicarAmpliacion(amModal.id, actor);
                          toast.success(
                            "Actualización aprobada y sincronizada en Apigee (ACC-08)",
                            {
                              description:
                                "¿Actualización aplicada? = Sí → Notificar actualización aplicada al Coordinador SINARP.",
                            }
                          );
                          cerrarModal();
                        }}
                      >
                        Aprobar actualización y sincronizar Apigee (ACC-08)
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ========================================================================
            MODAL 7: CORREGIR CAMBIOS SOLICITADOS (COORDINADOR SINARP · PAR-13)
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "SUBSANAR_COORDINADOR" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-3xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (
              <div className="space-y-5 text-left">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-warning/10 text-warning border-warning/20">
                      <RefreshCw className="size-5 text-warning" />
                    </div>
                    <div>
                      <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                        Corregir Cambios Solicitados (Subsanación dentro de 3 días hábiles · PAR-13)
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        En el Flujo BPMN 10, si el Coordinador SINARP corrige dentro del plazo (`¿Corrigió dentro del plazo? = Sí`), el trámite incrementa su versión y vuelve a «Asignar revisión de cambios». Si vence el plazo (`No`), finaliza la solicitud conservando el alcance previo.
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                {amModal.observaciones && (
                  <Alert
                    variant="warning"
                    icon={<AlertCircle className="size-4" />}
                    title="Observación registrada por el revisor (ADD-07)"
                    className="p-3.5 text-xs"
                  >
                    {amModal.observaciones}
                    {amModal.fechaLimiteSubsanacion && (
                      <span className="block mt-1 font-semibold">
                        Fecha límite (PAR-13 · 3 días hábiles):{" "}
                        {formatoFecha(amModal.fechaLimiteSubsanacion)}
                      </span>
                    )}
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Detalle de corrección / subsanación de finalidad y base legal
                  </Label>
                  <Textarea
                    rows={3}
                    value={subsanacionCoordinadorModal}
                    onChange={(e) => setSubsanacionCoordinadorModal(e.target.value)}
                    placeholder="Precisa la base legal, proporcionalidad funcional y alcance de los campos observados..."
                    className="text-xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={() => {
                      st.mutarAmpliacion(
                        amModal.id,
                        (x) => ({ ...x, estado: "Cerrada" }),
                        actor,
                        "Compuerta ¿Corrigió dentro del plazo? = No → Fin de solicitud (PAR-13)",
                        "Venció el plazo de 3 días hábiles sin subsanación; la solicitud conserva su alcance original."
                      );
                      toast.warning("Plazo vencido simulado → Ampliación Cerrada");
                      cerrarModal();
                    }}
                  >
                    Simular vencimiento de plazo (Cerrar)
                  </Button>

                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cerrarModal}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="size-4" />}
                      onClick={() => {
                        const nota =
                          subsanacionCoordinadorModal.trim() ||
                          "Finalidad funcional y justificación normativa corregidas dentro del plazo PAR-13.";
                        st.mutarAmpliacion(
                          amModal.id,
                          (x) => ({
                            ...x,
                            estado: "En revisión de Gestión",
                            version: x.version + 1,
                            observaciones: undefined,
                            fechaLimiteSubsanacion: undefined,
                            asignacionGestion: undefined,
                            decisionGestion: undefined,
                            asignacionDpi: undefined,
                            decisionDpi: undefined,
                            informeDpiFirmas: 0,
                          }),
                          actor,
                          `Coordinador SINARP corrigió cambios solicitados (v${amModal.version + 1})`,
                          `${nota} — Compuerta ¿Corrigió dentro del plazo? = Sí → Vuelve al Director de Gestión para asignar revisión de cambios.`
                        );
                        toast.success(
                          `Cambios corregidos y reenviados (v${amModal.version + 1})`
                        );
                        cerrarModal();
                      }}
                    >
                      Corregir y reenviar a Gestión (v{amModal.version + 1})
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================
            MODAL 8: EXPEDIENTE TÉCNICO Y TRAZABILIDAD DE LA AMPLIACIÓN (EYE)
           ======================================================================== */}
        <Dialog
          open={modalActivo?.tipo === "EXPEDIENTE" && !!amModal}
          onOpenChange={(open) => {
            if (!open) cerrarModal();
          }}
        >
          <DialogContent className="max-w-4xl w-full p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
            {amModal && (() => {
              const conservados =
                amModal.camposConservados ?? accesoModal.camposAutorizados;
              const incluyeCampos = amModal.campos.length > 0;

              return (
                <div className="space-y-5 text-left">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border pr-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 text-primary border-primary/20">
                        <Eye className="size-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
                          Expediente de Ampliación {amModal.id} (v{amModal.version}) — {accesoModal.institucion}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          Solicitud padre: {accesoModal.id} · Fuente: {accesoModal.fuente} · Credencial: {accesoModal.credencial}
                        </DialogDescription>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="resumen" className="space-y-4">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="resumen" className="text-xs">
                        1. Estado y Compuertas BPMN 10
                      </TabsTrigger>
                      <TabsTrigger value="alcance" className="text-xs">
                        2. Campos Conservados vs Solicitados
                      </TabsTrigger>
                      <TabsTrigger value="auditoria" className="text-xs">
                        3. Historial Auditable ({amModal.historial.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumen" className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1">
                          <span className="text-[10px] uppercase text-muted-foreground block">
                            Compuerta 1: ¿Incluye campos?
                          </span>
                          <p className="font-bold text-foreground">
                            {incluyeCampos
                              ? "Sí → Asignar revisión de cambios (ADD-07)"
                              : "No (Solo cupo) → Directo a Jurídica (ADD-04)"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1">
                          <span className="text-[10px] uppercase text-muted-foreground block">
                            Compuerta 2: ¿Requiere adenda?
                          </span>
                          <p className="font-bold text-foreground">
                            {accesoModal.tipo === "Privada"
                              ? `Sí (Privada · ${EVENTO[amModal.tipo]})`
                              : "No (Pública · ADD-05 sin adenda ni pago)"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1">
                          <span className="text-[10px] uppercase text-muted-foreground block">
                            Estado actual
                          </span>
                          <Badge
                            tone={TONO[amModal.estado] ?? "info"}
                            appearance="soft"
                            size="sm"
                          >
                            {amModal.estado}
                          </Badge>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-surface-subtle/60 p-4 space-y-2">
                        <p className="font-bold text-foreground">
                          Asignaciones y formalización registradas:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                          <p>
                            • Revisor Equipo de Gestión:{" "}
                            <strong className="text-foreground">
                              {amModal.asignacionGestion
                                ? `${amModal.asignacionGestion.revisor} (${amModal.asignacionGestion.idAsignacion})`
                                : incluyeCampos
                                ? "Pendiente de asignar"
                                : "No aplica (Solo cupo)"}
                            </strong>
                          </p>
                          <p>
                            • Revisor Equipo de DPI:{" "}
                            <strong className="text-foreground">
                              {amModal.asignacionDpi
                                ? `${amModal.asignacionDpi.revisor} (${amModal.asignacionDpi.idAsignacion}) · Firmas ${amModal.informeDpiFirmas}/2`
                                : "No requerido / Sin asignar"}
                            </strong>
                          </p>
                          <p>
                            • Adenda contractual (PAR-02):{" "}
                            <strong className="text-foreground">
                              {accesoModal.tipo === "Pública"
                                ? "No aplica (Institución Pública)"
                                : `${amModal.adendaPreparada ? "Redactada" : "Pendiente"} · Firmas FirmaEC: ${amModal.firmasAdenda}/2`}
                            </strong>
                          </p>
                          <p>
                            • Factura y Pasarela:{" "}
                            <strong className="text-foreground">
                              {accesoModal.tipo === "Pública"
                                ? "No aplica (Gratuidad interinstitucional)"
                                : `${amModal.facturaId ?? "Sin emitir"} · ${
                                    amModal.pagoConfirmado
                                      ? "Pago confirmado (PAG-02)"
                                      : amModal.pagoIniciado
                                      ? "En pasarela (PAG-01)"
                                      : "Pendiente"
                                  }`}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="alcance" className="space-y-3 text-xs">
                      <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                        <p className="font-bold text-foreground">
                          Campos autorizados vigentes que se conservan intactos ({conservados.length}):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {conservados.map((c) => (
                            <Badge
                              key={c}
                              tone="neutral"
                              appearance="outline"
                              size="sm"
                              className="font-mono"
                            >
                              {c} (conservado)
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {incluyeCampos ? (
                        <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                          <p className="font-bold text-foreground">
                            Nuevos campos solicitados en esta ampliación ({amModal.campos.length}):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {amModal.campos.map((c) => {
                              const cat = accesoModal.catalogoCampos.find(
                                (x) => x.campo === c
                              );
                              const just = amModal.justificacionesCampos?.[c];
                              return (
                                <div
                                  key={c}
                                  className="rounded-lg border border-border bg-surface-subtle/50 p-3 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-primary">
                                      + {c}
                                    </span>
                                    <Badge
                                      tone={
                                        cat?.clasificacion === "Confidencial"
                                          ? "danger"
                                          : "info"
                                      }
                                      appearance="soft"
                                      size="sm"
                                    >
                                      {cat?.clasificacion ?? "Accesible"}
                                    </Badge>
                                  </div>
                                  {just?.finalidad && (
                                    <p className="text-[11px] text-muted-foreground">
                                      <strong className="text-foreground">Finalidad:</strong>{" "}
                                      {just.finalidad}
                                    </p>
                                  )}
                                  {just?.justificacionJuridica && (
                                    <p className="text-[11px] text-muted-foreground">
                                      <strong className="text-foreground">Base legal:</strong>{" "}
                                      {just.justificacionJuridica}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <Alert
                          variant="info"
                          icon={<AlertCircle className="size-4" />}
                          title="Ampliación Solo de Cupo (ADD-02 / ADD-03)"
                          className="p-3.5 text-xs"
                        >
                          No modifica campos ni fuente. Conserva exactamente los {conservados.length} campos autorizados vigentes y amplía el cupo en +{numero(amModal.cupoAdicional)} registros.
                        </Alert>
                      )}
                    </TabsContent>

                    <TabsContent value="auditoria" className="space-y-2 text-xs">
                      <div className="rounded-xl border border-border bg-surface p-4 space-y-2.5">
                        {[...amModal.historial].reverse().map((h, i) => (
                          <div
                            key={i}
                            className="pb-2.5 border-b border-border/60 last:border-b-0 last:pb-0"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <strong className="text-foreground font-semibold">
                                {h.accion}
                              </strong>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {formatoFecha(h.instante)} · {h.actor}
                              </span>
                            </div>
                            {h.detalle && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {h.detalle}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={cerrarModal}
                    >
                      Cerrar expediente
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
