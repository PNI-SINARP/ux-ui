import { notFound } from "next/navigation";
import { INITIAL_EXPEDIENTES } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { CatalogoIncorporacionDetailView } from "@/modules/catalogo-interoperabilidad/views/catalogo-incorporacion-detail-view";

export function generateStaticParams() {
  return INITIAL_EXPEDIENTES.map(exp => ({
    id: exp.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleExpedientePage({ params }: PageProps) {
  const { id } = await params;
  const initialExpediente = INITIAL_EXPEDIENTES.find(e => e.id === id);

  if (!initialExpediente) {
    notFound();
  }

  return <CatalogoIncorporacionDetailView initialExpediente={initialExpediente} />;
}
