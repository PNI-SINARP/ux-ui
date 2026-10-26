import { redirect } from "next/navigation";
import { CASOS_HOMOLOGACION_INICIALES } from "@/modules/fuentes/data/fuentes-data";

export function generateStaticParams() {
  return CASOS_HOMOLOGACION_INICIALES.map((caso) => ({
    id: caso.id_caso,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HomologacionDetailRedirectPage({
  params,
}: PageProps) {
  const { id } = await params;
  redirect(`/tecnologia/homologaciones/${id}`);
}
