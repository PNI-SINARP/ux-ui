import { CuentaInternaEditView } from "@/modules/cuentas-internas/views/cuenta-interna-edit-view";

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

export default async function EditarCuentaInternaPage({ params }: PageProps) {
  const { id } = await params;
  return <CuentaInternaEditView id={id} />;
}
