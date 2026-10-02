import { CatalogoFuenteDetailView } from "@/modules/catalogo-interoperabilidad/views/catalogo-fuente-detail-view";
import { INITIAL_INSTITUCIONES } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function generateStaticParams() {
  const allFuentes = INITIAL_INSTITUCIONES.flatMap((inst) => inst.fuentes);
  return allFuentes.map((fuente) => ({
    id: fuente.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleFuenteAdminPage({ params }: PageProps) {
  const { id } = await params;
  return <CatalogoFuenteDetailView id={id} />;
}
