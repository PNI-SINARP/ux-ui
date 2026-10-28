import { AccesoSolicitudNuevaView } from "@/modules/acceso-interoperabilidad/views/acceso-solicitud-nueva-view";

const SOLICITUDES_IDS = Array.from(
  { length: 50 },
  (_, i) => `SOL-2026-${String(i + 1).padStart(3, "0")}`
);

export function generateStaticParams() {
  return SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ step?: string }>;
}

export default async function SolicitudCorregirPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialStep = resolvedSearchParams?.step ? parseInt(resolvedSearchParams.step, 10) : undefined;

  return (
    <AccesoSolicitudNuevaView
      initialSolicitudId={resolvedParams.id}
      isSubsanacion={true}
      initialStep={initialStep}
    />
  );
}
