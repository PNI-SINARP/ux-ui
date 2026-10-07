import { CatalogoAdministracionView } from "@/modules/catalogo-interoperabilidad/views/catalogo-administracion-view";

export const metadata = {
  title: "Administración de Incorporaciones | Portal DINARP",
  description: "Bandeja de administración e incorporación de fuentes y servicios.",
};

export default function IncorporacionesAdminPage() {
  return <CatalogoAdministracionView />;
}
