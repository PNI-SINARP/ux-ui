import { CatalogoIncorporacionNuevaView } from "@/modules/catalogo-interoperabilidad/views/catalogo-incorporacion-nueva-view";

export const metadata = {
  title: "Nueva Integración de Interoperabilidad | Portal DINARP",
  description: "Formulario para registro de nuevas integraciones de fuentes en el catálogo.",
};

export default function NuevaIntegracionPage() {
  return <CatalogoIncorporacionNuevaView />;
}
