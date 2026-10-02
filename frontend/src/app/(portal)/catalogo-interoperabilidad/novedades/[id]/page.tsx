import { notFound } from "next/navigation";
import { INITIAL_NOVEDADES } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { CatalogoNovedadDetailView } from "@/modules/catalogo-interoperabilidad/views/catalogo-novedad-detail-view";

export function generateStaticParams() {
  return INITIAL_NOVEDADES.map(nov => ({
    id: nov.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NovedadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialNovedad = INITIAL_NOVEDADES.find(n => n.id === id);

  if (!initialNovedad) {
    notFound();
  }

  return <CatalogoNovedadDetailView initialNovedad={initialNovedad} />;
}
