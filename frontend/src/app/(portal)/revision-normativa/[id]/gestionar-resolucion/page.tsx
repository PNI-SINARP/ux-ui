import { GestionarResolucionView } from "@/modules/gestion-solicitudes/views/gestionar-resolucion-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GestionarResolucionPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <GestionarResolucionView
      id={id}
      basePath="/revision-normativa"
    />
  );
}
