import { redirect } from "next/navigation";

const CUENTAS_INTERNAS_IDS = Array.from(
  { length: 60 },
  (_, i) => `USR-INT-${String(i + 1).padStart(3, "0")}`
);

export function generateStaticParams() {
  return CUENTAS_INTERNAS_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleCuentaInternaPage({ params }: PageProps) {
  const resolvedParams = await params;
  redirect(`/cuentas-internas?expediente=${resolvedParams.id}`);
}
