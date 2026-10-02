import { redirect } from "next/navigation";

const CUENTAS_INTERNAS_IDS = [
  "USR-INT-001",
  "USR-INT-002",
  "USR-INT-003",
  "USR-INT-004",
  "USR-INT-005",
  "USR-INT-006",
  "USR-INT-007",
  "USR-INT-008",
  "USR-INT-009",
  "USR-INT-010",
  "USR-INT-011",
  "USR-INT-012",
  "USR-INT-013",
  "USR-INT-014",
  "USR-INT-015",
  "USR-INT-016",
];

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
