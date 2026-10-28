import { AccesoSolicitudNuevaView } from "@/modules/acceso-interoperabilidad/views/acceso-solicitud-nueva-view";

export const dynamicParams = false;

const SOLICITUDES_IDS = Array.from(
  { length: 50 },
  (_, i) => `SOL-2026-${String(i + 1).padStart(3, "0")}`
);

export function generateStaticParams() {
  return SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudCorregirPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <AccesoSolicitudNuevaView
      initialSolicitudId={resolvedParams.id}
      isSubsanacion={true}
    />
  );
}
