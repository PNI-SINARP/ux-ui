import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CASOS_MOCK_INICIALES } from "@/modules/gestion-recuperaciones/data/gestion-recuperaciones-mock-data";

export function generateStaticParams() {
  return CASOS_MOCK_INICIALES.map((caso) => ({
    id: caso.id,
  }));
}

export const metadata: Metadata = {
  title: "Detalle de Caso - Gestión de Recuperaciones | DINARP",
  description:
    "Detalle de la solicitud de recuperación asistida del segundo factor (2FA) e incidencias de identidad.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleRecuperacionPage({ params }: PageProps) {
  const resolvedParams = await params;
  redirect(`/gestion-recuperaciones?caso=${resolvedParams.id}`);
}
